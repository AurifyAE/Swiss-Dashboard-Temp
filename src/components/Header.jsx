"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ title, description }) => {
  const { currentTime, userData } = useAppContext();
  const [notificationCount, setNotificationCount] = useState(3);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const notificationRef = useRef(null);
  const userProfileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Function to update the date and time every second
  //   const interval = setInterval(() => {
  //     const now = new Date();
  //     const formattedDate = now.toLocaleString("en-GB", {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       second: "2-digit",
  //     });

  //     // Adding "-" after the date
  //     const [date, time] = formattedDate.split(", ");
  //     const formattedDateWithDash = `${date} - ${time}`;

  //     setCurrentTime(formattedDateWithDash);
  //   }, 1000);

  //   // Clear the interval when the component is unmounted
  //   return () => clearInterval(interval);
  // }, []);

  // Logout handler function
  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default navigation

    // Show logout in progress toast
    toast.info("Logging out...", {
      position: "top-right",
      autoClose: 1500,
    });

    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("adminId");
    localStorage.removeItem("rememberMe");

    // Add small delay for visual feedback
    setTimeout(() => {
      // Show success message
      toast.success("Logged out successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      // Navigate to login page
      navigate("/");
    }, 800);
  };

  // Handle clicks outside the dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      // Close notifications if clicked outside
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest("[data-notification-trigger]")
      ) {
        setIsNotificationsOpen(false);
      }

      // Close user profile if clicked outside
      if (
        userProfileRef.current &&
        !userProfileRef.current.contains(event.target) &&
        !event.target.closest("[data-profile-trigger]")
      ) {
        setIsUserProfileOpen(false);
      }
    }

    // Add click listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, userProfileRef]);

  // Toggle functions instead of mouse enter/leave
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) setIsUserProfileOpen(false); // Close other dropdown
  };

  const toggleUserProfile = () => {
    setIsUserProfileOpen(!isUserProfileOpen);
    if (!isUserProfileOpen) setIsNotificationsOpen(false); // Close other dropdown
  };

  return (
    <div className="flex flex-col w-full">
      <header className="flex justify-between items-start px-16 py-7 max-md:px-10 max-sm:px-5">
        {/* Dashboard Title */}
        <div className="flex flex-col">
          <h1 className="mb-1 text-3xl font-bold text-black">{title}</h1>
          <p className="text-sm text-neutral-500 text-[16px]">{description}</p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-5 items-center">
          {/* Date and Time with - symbol */}
          <div
            className="flex items-center gap-2 bg-white rounded-md border border-sky-400 text-center p-4 py-1"
            role="status"
            aria-label="Current Date and Time"
          >
            <span className="text-sm font-semibold text-[#156AEF]">
              {currentTime}
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              data-notification-trigger
              onClick={toggleNotifications}
              aria-label={`Notifications - ${notificationCount} unread`}
              className="relative"
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[25px] h-[25px]"
              >
                <path
                  d="M22.9167 20.8333H2.08337V18.75H3.12504V11.491C3.12504 6.29529 7.32237 2.08334 12.5 2.08334C17.6777 2.08334 21.875 6.29529 21.875 11.491V18.75H22.9167V20.8333ZM5.20837 18.75H19.7917V11.491C19.7917 7.4459 16.5271 4.16667 12.5 4.16667C8.47297 4.16667 5.20837 7.4459 5.20837 11.491V18.75ZM9.89587 21.875H15.1042C15.1042 23.3132 13.9383 24.4792 12.5 24.4792C11.0618 24.4792 9.89587 23.3132 9.89587 21.875Z"
                  fill="url(#paint0_linear_12_1012)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_12_1012"
                    x1="12.5"
                    y1="2.08334"
                    x2="12.5"
                    y2="24.4792"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#32B4DB" />
                    <stop offset="1" stopColor="#156AEF" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Notification Count Badge */}
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-normal rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationCount}
                </div>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div
                ref={notificationRef}
                className="absolute top-10 right-0 mt-2 w-64 bg-white shadow-lg rounded-md border border-sky-400 p-3 transition-transform duration-300 ease-in-out transform opacity-100 z-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm">Notifications</p>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {notificationCount} New
                  </span>
                </div>
                <ul className="text-sm text-gray-600 mt-2 space-y-2">
                  <li className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>New message received</span>
                  </li>
                  <li className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>System update available</span>
                  </li>
                  <li className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Reminder: Meeting at 3 PM</span>
                  </li>
                </ul>
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <a
                    href="/notifications"
                    className="text-blue-500 text-xs hover:underline block text-center"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="gradient-border">
            <div className="gradient-border-inner">
              <img src={userData.logo} alt="" className="rounded-[30px] p-2"/>
            </div>
          </div>
          <div className="relative">
            <button
              data-profile-trigger
              onClick={toggleUserProfile}
              className="flex gap-4 items-center"
              aria-label="User profile"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-black">
                  {userData.companyName}
                </span>
                <span className="text-xs text-black">{userData.userRole}</span>
              </div>
              <div
                className="flex relative justify-center items-center w-5 h-5"
                role="button"
                tabIndex={0}
                aria-label="Input design control"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-0 top-0 w-full h-full"
                  role="img"
                  aria-label="Triangle indicator"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="13"
                    height="13"
                    rx="1.5"
                    fill="white"
                    stroke="#F7F7F7"
                  />
                  <path
                    d={
                      isUserProfileOpen
                        ? "M7 5L10.4641 11H3.5359L7 5Z"
                        : "M7 11L3.5359 5L10.4641 5L7 11Z"
                    }
                    fill="#D9D9D9"
                  />
                </svg>
              </div>
            </button>

            {/* User Profile Dropdown */}
            {isUserProfileOpen && (
              <div
                ref={userProfileRef}
                className="absolute top-10 right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100 p-3 transition-all duration-300 ease-in-out transform opacity-100 z-50"
              >
                <div className="flex flex-col space-y-3">
                  {/* Profile Section */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white">
                      {/* User initial or avatar placeholder */}
                      <img src={userData.logo} alt="logo" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {userData.companyName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userData.userRole}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <a
                    href="/profile"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-500 transition-colors duration-200 group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm">Profile</span>
                  </a>

                  <a
                    href="/help-center"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-500 transition-colors duration-200 group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm">Help</span>
                  </a>

                  {/* Logout Button */}
                  <button className="flex items-center space-x-3 text-red-500 hover:text-red-600 transition-colors duration-200 group mt-3 pt-3 border-t border-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <button
                      className="text-sm font-medium"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
