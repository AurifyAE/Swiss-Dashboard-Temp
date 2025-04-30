import React, { useState, useEffect } from "react";
import axios from "../../axios/axios";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import OrderManagement from "./orderHistory";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";

const ProfilePage = () => {
  const title = "Customer Profile Details";
  const description = "Get the customer's detailed information";

  const navigate = useNavigate();

  // Extract userId from URL
  const { userId } = useParams();

  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for cash and gold inputs
  const [cashInput, setCashInput] = useState("");
  const [goldInput, setGoldInput] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");

  // State for displaying current balances
  const [cashBalance, setCashBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);

  // State for calculation results
  const [calculatedGoldValue, setCalculatedGoldValue] = useState(0);

  // Purity options for gold
  const purityOptions = [
    { value: 99999, label: "9999" },
    { value: 999, label: "999" },
    { value: 995, label: "995" },
    { value: 916, label: "916" },
    { value: 920, label: "920" },
    { value: 875, label: "875" },
    { value: 750, label: "750" },
  ];

  // Helper function to format balance with sign
  const formatBalance = (balance, type = "cash") => {
    // console.log(balance);
    // Determine sign and absolute value
    const sign = balance >= 0 ? "+" : "-";
    const absBalance = Math.abs(balance);

    // Formatting for cash vs gold
    if (type === "cash") {
      return (
        <span
          className={`font-bold ${
            balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {sign} {absBalance.toLocaleString()}
        </span>
      );
    } else {
      // Gold formatting with 3 decimal places
      return (
        <span
          className={`font-bold ${
            balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {sign} {absBalance.toFixed(3)} gm
        </span>
      );
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("User ID is missing");
        }

        const response = await axios.get(`/get-profile/${userId}`);

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch user profile"
          );
        }

        if (!response.data.users || response.data.users.length === 0) {
          throw new Error("No user data found");
        }

        const userData = response.data.users[0];
        setUserProfile(userData);

        // Set initial balances with strict type conversion and fallback
        setCashBalance(Number(userData.cashBalance));
        setGoldBalance(Number(userData.goldBalance));
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        setError(error.message || "An unexpected error occurred");
        toast.error(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const calculatePurityPower = (purityInput) => {
    if (!purityInput || isNaN(purityInput)) return 1;
    return purityInput / Math.pow(10, purityInput.toString().length);
  };

  // Calculate gold value based on weight and purity
  const calculateGoldValue = () => {
    try {
      if (!weight || !purity) {
        setCalculatedGoldValue(0);
        return;
      }

      const weightNum = parseFloat(weight);
      const selectedPurity = purityOptions.find(
        (p) => p.value.toString() === purity
      );

      if (!selectedPurity || isNaN(weightNum) || weightNum <= 0) {
        setCalculatedGoldValue(0);
        return;
      }

      // Calculate pure gold value
      const pureGoldValue =
        calculatePurityPower(selectedPurity.value) * weightNum;
      const roundedValue = parseFloat(pureGoldValue.toFixed(3));

      setCalculatedGoldValue(roundedValue);
      setGoldInput(roundedValue.toString());
    } catch (error) {
      console.error("Gold Value Calculation Error:", error);
      setCalculatedGoldValue(0);
    }
  };

  // Recalculate when weight or purity changes
  useEffect(() => {
    calculateGoldValue();
  }, [weight, purity]);

  // Handler for cash received
  const handleCashReceived = async () => {
    try {
      // Validate cash input with more robust parsing
      const cashAmount = parseFloat(cashInput.trim());

      if (isNaN(cashAmount) || cashAmount === 0) {
        toast.error("Please enter a valid non-zero cash amount");
        return;
      }

      const response = await axios.patch(`/receive-cash/${userId}`, {
        amount: cashAmount,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Cash receive failed");
      }

      // Update cash balance with the new value
      const newBalance = Number(response.data.data.newBalance) || 0;
      setCashBalance(newBalance);
      toast.success(`Successfully received ${cashAmount.toLocaleString()}`);
      setCashInput(""); // Reset input
    } catch (error) {
      console.error("Cash Receive Error:", error);
      toast.error(error.message || "Failed to process cash received");
    }
  };

  // Handler for gold received
  const handleGoldReceived = async () => {
    try {
      // Comprehensive validation
      if (!weight || !purity) {
        toast.error("Please enter both weight and purity");
        return;
      }

      const goldAmount = parseFloat(calculatedGoldValue);

      if (isNaN(goldAmount) || goldAmount <= 0) {
        toast.error("Invalid gold amount. Please check weight and purity.");
        return;
      }

      const response = await axios.patch(`/receive-gold/${userId}`, {
        amount: goldAmount,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Gold receive failed");
      }

      // Safely update gold balance
      const newBalance = Math.max(
        0,
        Number(response.data.data.newBalance) || 0
      );
      setGoldBalance(newBalance);

      // Show success toast
      toast.success(
        `Successfully received ${goldAmount.toFixed(3)} gm of gold`
      );

      // Reset inputs
      setWeight("");
      setPurity("");
      setCalculatedGoldValue(0);
    } catch (error) {
      console.error("Gold Receive Error:", error);
      toast.error(error.message || "Failed to process gold received");
    }
  };

  const handleViewSpotrate = (user) => {
    console.log(user);
    const spotRateId = user.userSpotRateId ?? "null";
    const userId = user._id;
    navigate(`/user-spot-rate/${spotRateId}/user/${userId}/product`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-red-600 ">
          Error: {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9]">
      {/* Add Toaster component */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#4BB543",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#FF0000",
              color: "white",
            },
          },
        }}
      />

      <Header title={title} description={description} />
      <div className="overflow-hidden px-16">
        {/* Personal Information Section */}
        <div className="p-6">
          <section className="space-y-6">
            <div className="flex max-md:flex-col gap-6">
              <div className="flex-1 flex items-center">
                <label className="w-24 text-neutral-600 font-medium">
                  Name
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.name}
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <label className="w-24 text-neutral-600 font-medium">
                  Email Id
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.email}
                </div>
              </div>
            </div>

            <div className="flex max-md:flex-col gap-6">
              <div className="flex-1 flex items-center">
                <label className="w-24 text-neutral-600 font-medium">
                  Phone
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.contact}
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <label className="w-24 text-neutral-600 font-medium">
                  Address
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.address}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-neutral-600 mr-4 font-medium">
                  Assigned Rate
                </label>
                <div className="flex items-center px-3.5 py-2 rounded-md bg-gradient-to-b from-[#156AEF] to-[#35A4D3] text-white">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M9.00023 2.25C13.0443 2.25 16.4088 5.15982 17.1142 9C16.4088 12.8401 13.0443 15.75 9.00023 15.75C4.95609 15.75 1.59161 12.8401 0.88623 9C1.59161 5.15982 4.95609 2.25 9.00023 2.25ZM9.00023 14.25C12.1769 14.25 14.8952 12.039 15.5833 9C14.8952 5.96102 12.1769 3.75 9.00023 3.75C5.82345 3.75 3.10517 5.96102 2.41709 9C3.10517 12.039 5.82345 14.25 9.00023 14.25ZM9.00023 12.375C7.13624 12.375 5.6252 10.864 5.6252 9C5.6252 7.13604 7.13624 5.625 9.00023 5.625C10.8641 5.625 12.3752 7.13604 12.3752 9C12.3752 10.864 10.8641 12.375 9.00023 12.375ZM9.00023 10.875C10.0358 10.875 10.8752 10.0355 10.8752 9C10.8752 7.96448 10.0358 7.125 9.00023 7.125C7.9647 7.125 7.1252 7.96448 7.1252 9C7.1252 10.0355 7.9647 10.875 9.00023 10.875Z"
                      fill="white"
                    />
                  </svg>
                  <span
                    className="text-sm"
                    onClick={() => handleViewSpotrate(userProfile)}
                  >
                    User Spotrate
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-dashed border-gray-300"></div>

          {/* Account Balance Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Account Balance</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cash Section */}
              <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E6F2FF] p-5 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#156AEF]">
                    Cash Balance
                  </h3>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                      placeholder="Enter Cash Amount"
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                    <button
                      onClick={handleCashReceived}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Receive
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Received</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatBalance(parseFloat(cashInput) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatBalance(cashBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gold Section */}
              <div className="bg-gradient-to-br from-[#FFF7E6] to-[#FFF0D4] p-5 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-700">
                    Gold Balance
                  </h3>
                </div>

                {/* Weight and Purity Inputs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">
                      Weight (gms)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter Weight"
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Purity</label>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                    >
                      <option value="" disabled>
                        Select Purity
                      </option>
                      {purityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Result */}
                {calculatedGoldValue > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-700">
                        Pure Gold Value:
                      </span>
                      <span className="font-bold text-yellow-800">
                        {calculatedGoldValue.toFixed(3)} gm
                      </span>
                    </div>
                  </div>
                )}

                {/* Receive Button */}
                <button
                  onClick={handleGoldReceived}
                  disabled={!weight || !purity}
                  className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Receive Gold
                </button>

                {/* Balance Display */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Received</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculatedGoldValue > 0
                        ? formatBalance(calculatedGoldValue, "gold")
                        : "+ 0.000 gm"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {goldBalance?.toFixed(3)} gm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="my-12 border-t border-dashed border-gray-300"></div>
          <div>
            <h2 className="text-xl font-bold -mt-7 mb-5 ml-5">Order History</h2>
            <div>
              <OrderManagement userId={userId} />
            </div>
            <div className="my-12 border-t border-dashed border-gray-300"></div>
            <h2 className="text-xl font-bold -mt-7 mb-5 ml-5">
              Transaction History
            </h2>
            <div>
              <TransactionHistory userId={userId} />
            </div>
          </div>
        </div>

        {/* Divider */}
      </div>
    </div>
  );
};

export default ProfilePage;
