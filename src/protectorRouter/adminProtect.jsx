import { useEffect, useState } from "react";
import { useNavigate, Outlet, Navigate } from "react-router-dom";
import axiosInstance from "../axios/axios";

function AdminProtect() {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isLoading: true
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuthState({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const res = await axiosInstance.post("/verify-token", { token });
        
        if (res.data.admin) {
          setAuthState({ isAuthenticated: true, isLoading: false });
        } else {
          // Not an admin user
          setAuthState({ isAuthenticated: false, isLoading: false });
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication error:", error.message);
        setAuthState({ isAuthenticated: false, isLoading: false });
        
        // Handle token validation errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear invalid token
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    verifyToken();
  }, [navigate, token]);

  // Show nothing while loading
  if (authState.isLoading) return null;
  
  // Redirect to home if not authenticated
  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
}

export default AdminProtect;