import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  HelpCircle,
  LogOut,
  Shield,
  Wallet,
  LineChart,
} from "lucide-react"; // Added the relevant icons from lucide-react

import logo from "../assets/logo.jpg";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col p-5 h-screen fixed">
      {/* Logo Section */}
      <div className="flex items-center gap-3 -mt-14">
        <img src={logo} alt="Aurify Logo" className="h-40" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-3 -mt-10">
        <SidebarItem
          icon={
            <LayoutDashboard
              strokeWidth={1.5}
              size={22}
              className="text-white"
            />
          }
          text="Dashboard"
          to="/dashboard"
          active={location.pathname === "/dashboard"}
        />
        <SidebarItem
          icon={
            <ShoppingCart strokeWidth={1.5} size={22} className="text-white" />
          }
          text="Shop"
          to="/shop"
          active={location.pathname === "/shop"}
        />
        <SidebarItem
          icon={<Users strokeWidth={1.5} size={22} className="text-white" />}
          text="Customers"
          to="/customers"
          active={location.pathname === "/customers"}
        />
        <SidebarItem
          icon={<FileText strokeWidth={1.5} size={22} className="text-white" />}
          text="Orders"
          to="/orders"
          active={location.pathname === "/orders"}
        />
        <SidebarItem
          icon={<FileText strokeWidth={1.5} size={22} className="text-white" />}
          text="Banner"
          to="/banner"
          active={location.pathname === "/banner"}
        />
      </nav>

      <nav className="flex flex-col space-y-2 mt-8">
        {/* Company Pages Section */}
        <div className="text-[#1A3C70] text-sm font-medium ml-3 mb-3">
          COMPANY PAGES
        </div>
        <SidebarItem
          icon={<Shield strokeWidth={1.5} size={22} className="text-white" />}
          text="Company Profile"
          to="/profile"
          active={location.pathname === "/profile"}
        />
        <SidebarItem
          icon={<Wallet strokeWidth={1.5} size={22} className="text-white" />}
          text="Bank Details"
          to="/bank"
          active={location.pathname === "/bank"}
        />
      </nav>

      <nav className="flex flex-col space-y-2 mt-8">
        {/* Help & Logout */}
        <div className="mt-auto">
          <SidebarItem
            icon={
              <HelpCircle strokeWidth={1.5} size={22} className="text-white" />
            }
            text="Help Center"
            to="/help-center"
            active={location.pathname === "/help-center"}
          />
          {/* Special logout item with onClick handler */}
          <div onClick={handleLogout} className="no-underline">
            <div
              className={`flex relative items-center gap-3 p-3 w-64 rounded-xl cursor-pointer transition-all 
              text-slate-700 hover:bg-slate-100 mt-3`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="bg-gradient-to-r from-[#156AEF] to-[#32B4DB] p-2 rounded-md w-[38px] text-white"
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
              <span className="font-medium">Log Out</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Add ToastContainer for notifications */}
      <ToastContainer />
    </div>
  );
};

const SidebarItem = ({ icon, text, to, active }) => {
  return (
    <Link to={to} className="no-underline">
      <div
        className={`flex relative items-center gap-3 p-3 w-64 rounded-xl cursor-pointer transition-all
            ${
              active
                ? "bg-white text-[#1A3C70] font-bold rounded-md shadow-lg shadow-[rgba(21,106,239,0.2)]" // Regular shadow
                : "text-[#737272] hover:bg-slate-100"
            }`}
      >
        <div
          className={`flex justify-center items-center absolute right-0 top-0 h-full w-1  rounded-r-lg ${
            active ? "bg-gradient-to-r from-[#156AEF] to-[#32B4DB]" : ""
          }`}
        ></div>

        <div className="flex items-center justify-center bg-gradient-to-r from-[#156AEF] to-[#32B4DB] p-2 rounded-md">
          {icon}
        </div>
        <span>{text}</span>
      </div>
    </Link>
  );
};

export default Sidebar;
