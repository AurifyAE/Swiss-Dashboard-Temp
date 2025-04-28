import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImage from "../assets/logo.jpg";
import axiosInstance from "../axios/axios";
import { requestFCMToken } from "../utils/firebaseUtils";
import { registerServiceWorker } from "../utils/serviceWorkerRegistration";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";

const LoginPage = ({ onLoginSuccess })=> {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fcmToken, setFcmToken] = useState("");
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const maxAttempts = 3;
    let attempts = 0;

    const fetchFcmToken = async () => {
      setIsTokenLoading(true);
      try {
        await registerServiceWorker();
        const token = await requestFCMToken();
        setFcmToken(token);
        setIsTokenLoading(false);
      } catch (error) {
        console.log(error)
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(fetchFcmToken, 2000);
        } else {
          toast.info('Having trouble securing your login. Refreshing the page...', {
            position: "top-center",
            autoClose: 3000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
    };
    fetchFcmToken();
    // Check for existing token and auto-login
    const checkExistingToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify the token with the backend
          const response = await axiosInstance.post("/verify-token", { token });
          if (response.data.serviceExpired) {
            // Handle expired service
            toast.error(
              "Your service has expired. Please renew your subscription."
            );
          } else {
            // Token is valid, navigate to dashboard
            navigate("/dashboard");
          }
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          localStorage.removeItem("adminId");
          localStorage.removeItem("rememberMe");
        }
      }
    };
    checkExistingToken();
  }, [navigate]);



  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(password);
  };

  const fetchFeatures = async (userName) => {
    try {
      const response = await axiosInstance.get("/features", {
        params: { userName },
      });
      if (response.data.success) {
        setFeatures(response.data.data.features);
        return response.data.data.features;
      } else {
        console.error("Failed to fetch features: Unexpected response format");
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch features:", err);
      return [];
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isTokenLoading) {
      toast.warning('Please wait while we secure your login...', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const values = {
      userName,
      password,
      fcmToken,
      rememberMe,
    };
    setUserNameError("");
    setPasswordError("");

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must contain at least 1 capital letter, 1 small letter, 1 number, and 1 symbol"
      );
      return;
    }

    try {
      const response = await axiosInstance.post("/login", values);
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", userName);
        localStorage.setItem("adminId",response.data.adminId );
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        const fetchedFeatures = await fetchFeatures(userName);
        toast.success("Login Successful", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        if (onLoginSuccess) onLoginSuccess(fetchedFeatures);
        setTimeout(() => {
          navigate("/dashboard", { state: { features: fetchedFeatures } });
        }, 1000);
      } else {
        setPasswordError(response.data.message || "Login failed");
      }
    } catch (err) {
      if (err.response && err.response.status === 500) {
        navigate('/500'); // Redirect to 500 page
      }
      else if (err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError("Login failed. Please try again.");
      }
    }
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width:"100%",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <ToastContainer />
      <div
        style={{
          width: "50%",
          display: "flex",
          alignItems: "center",
        
        }}
      >
        <div style={{ width: "100%", maxWidth: "20rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              background: "linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome back
          </h2>
          <p className="text-[#718096] mb-5 w-full">
            Enter your username and password to sign In
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="userName"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#4a5568",
                  marginBottom: "0.5rem",
                }}
              >
                UserName
              </label>
              <input
                type="userName"
                id="userName"
                name="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d2d6dc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  color: "#2d3748",
                }}
                placeholder="test@gmail.com"
              />
              {userNameError && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {userNameError}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#4a5568",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    paddingRight: "2.5rem",
                    border: "1px solid #d2d6dc",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                    color: "#2d3748",
                  }}
                  placeholder="••••••"
                />
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </div>
              {passwordError && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {passwordError}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <Switch
                checked={rememberMe}
                onChange={handleRememberMeChange}
                inputProps={{ "aria-label": "controlled" }}
                style={{ color: "#2152ff" }}
              />
              <label
                htmlFor="rememberMe"
                style={{ fontSize: "0.875rem", color: "#718096" }}
              >
                Trust the device
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                background: "linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Gold Image */}
      <div
        style={{
          position: "relative",
          width: "50%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0",
            height: "110%",
            width: "100%",
            right:"50px",
            left: "auto",
            transform: "skewX(-10deg)",
            overflow: "hidden",
            borderBottomLeftRadius: "1rem",
            backgroundImage: `url(${loginImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoginPage;