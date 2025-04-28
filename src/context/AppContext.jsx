"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserData } from "../api/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentTime, setCurrentTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    userName: localStorage.getItem("userName") || "",
    userRole: "Admin", // Default role
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await getUserData(userData.userName);
      if (response.data?.success) {
        // Merge API response with existing userData to preserve userRole
        setUserData((prev) => ({
          ...prev,
          ...response.data.data,
          // Ensure userRole is maintained if not in response
          userRole: response.data.data.userRole || prev.userRole,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const [date, time] = formattedDate.split(", ");
      setCurrentTime(`${date} - ${time}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{ currentTime, userData, setUserData, isLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
