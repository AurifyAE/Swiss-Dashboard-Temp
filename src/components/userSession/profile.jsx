import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "../../axios/axios";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import OrderManagement from "./orderHistory";
import Header from "../../components/Header";
import TransactionHistory from "./TransactionHistory";
import debounce from "lodash/debounce";

const ProfilePage = () => {
  const title = "Customer Profile Details";
  const description = "Get the customer's detailed information";

  const navigate = useNavigate();
  const { userId } = useParams();

  // Centralized state for user profile and balances
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Input states
  const [cashInput, setCashInput] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");

  // Balance states
  const [cashBalance, setCashBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);
  const [calculatedGoldValue, setCalculatedGoldValue] = useState(0);

  // Loading states for API calls
  const [isCashLoading, setIsCashLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);

  // Track pending updates for optimistic UI
  const [pendingCashUpdate, setPendingCashUpdate] = useState(0);
  const [pendingGoldUpdate, setPendingGoldUpdate] = useState(0);
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const purityOptions = useMemo(
    () => [
      { value: 99999, label: "9999" },
      { value: 999, label: "999" },
      { value: 995, label: "995" },
      { value: 916, label: "916" },
      { value: 920, label: "920" },
      { value: 875, label: "875" },
      { value: 750, label: "750" },
      { value: 1, label: "1" },
    ],
    []
  );

  // Format balance with CR/DR
  const formatBalance = useCallback((balance, type = "cash") => {
    const absBalance = Math.abs(balance);
    const suffix = balance >= 0 ? " CR" : " DR";
    return (
      <span
        className={`font-bold ${
          balance >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {type === "cash" ? absBalance.toLocaleString() : absBalance.toFixed(3)}{" "}
        {type === "gold" ? "gm" : ""}
        {suffix}
      </span>
    );
  }, []);

  // Retry logic for API calls
  const withRetry = useCallback(async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) throw new Error("User ID is missing");

      const response = await withRetry(() =>
        axios.get(`/get-profile/${userId}`)
      );
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
      setCashBalance(Number(userData.cashBalance) || 0);
      setGoldBalance(Number(userData.goldBalance) || 0);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      setError(error.message || "An unexpected error occurred");
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId, withRetry]);

  // Initial fetch
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Calculate gold value (debounced)
  const calculatePurityPower = useCallback((purityInput) => {
    if (!purityInput || isNaN(purityInput)) return 1;
    if (purityInput === 1) return 1; // 1 means 100% purity 
    return purityInput / Math.pow(10, purityInput.toString().length);
  }, []);

  const calculateGoldValue = useCallback(
    debounce(() => {
      try {
        if (!weight || !purity) {
          setCalculatedGoldValue(0);
          return;
        }

        const weightNum = parseFloat(weight);
        const selectedPurity = purityOptions.find(
          (p) => p.value.toString() === purity
        );

        if (
          !selectedPurity ||
          isNaN(weightNum) ||
          weightNum === 0 
        ) {
          setCalculatedGoldValue(0);
          return;
        }

        const pureGoldValue =
          calculatePurityPower(selectedPurity.value) * weightNum;
        const roundedValue = parseFloat(pureGoldValue.toFixed(3));
        setCalculatedGoldValue(roundedValue);
      } catch (error) {
        console.error("Gold Value Calculation Error:", error);
        setCalculatedGoldValue(0);
      }
    }, 200),
    [weight, purity, purityOptions, calculatePurityPower]
  );

  useEffect(() => {
    calculateGoldValue();
  }, [weight, purity, calculateGoldValue]);

  // Handler for cash received with optimistic update and negative balance check
  const handleCashReceived = useCallback(async () => {
    try {
      setIsCashLoading(true);
      const cashAmount = parseFloat(cashInput.trim());
      if (isNaN(cashAmount) || cashAmount === 0) {
        toast.error("Please enter a valid cash amount");
        return;
      }

      // Optimistic update
      setPendingCashUpdate(cashAmount);
      const newBalance = cashBalance + cashAmount;
      setCashBalance(newBalance);

      // Create transaction object
      const transaction = {
        _id: `temp-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        type: cashAmount > 0 ? "CREDIT" : "DEBIT",
        method: "RECEIVED",
        amount: Math.abs(cashAmount),
        balanceType: "CASH",
        balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      };
      setPendingTransaction(transaction);

      const response = await withRetry(() =>
        axios.patch(`/receive-cash/${userId}`, { amount: cashAmount })
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Cash receive failed");
      }

      // Confirm update from server
      const newServerBalance = Number(response.data.data.newBalance) || 0;
      setCashBalance(newServerBalance);
      setPendingCashUpdate(0);
      setPendingTransaction(null);
      toast.success(
        `Successfully ${cashAmount > 0 ? "received" : "debited"} ${Math.abs(
          cashAmount
        ).toLocaleString()}`
      );
      setCashInput("");
    } catch (error) {
      console.error("Cash Receive Error:", error);
      setCashBalance((prev) => prev - pendingCashUpdate);
      setPendingCashUpdate(0);
      setPendingTransaction(null);
      toast.error(error.message || "Failed to process cash transaction");
    } finally {
      setIsCashLoading(false);
    }
  }, [cashInput, userId, cashBalance, pendingCashUpdate, withRetry]);

  // Handler for gold received with optimistic update and negative balance check
  const handleGoldReceived = useCallback(async () => {
    try {
      setIsGoldLoading(true);
      if (!weight || !purity) {
        toast.error("Please enter both weight and purity");
        return;
      }

      const goldAmount = parseFloat(calculatedGoldValue);
      console.log(goldAmount)
      if (isNaN(goldAmount) || goldAmount === 0) {
        toast.error("Invalid gold amount. Please check weight and purity.");
        return;
      }
      
      // Optimistic update
      setPendingGoldUpdate(goldAmount);
      const newBalance = goldBalance + goldAmount;
      setGoldBalance(newBalance);

      // Create transaction object
      const transaction = {
        _id: `temp-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        type: goldAmount > 0 ? "CREDIT" : "DEBIT",
        method: "RECEIVED",
        amount: Math.abs(goldAmount),
        balanceType: "GOLD",
        balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      };
      setPendingTransaction(transaction);

      const response = await withRetry(() =>
        axios.patch(`/receive-gold/${userId}`, { amount: goldAmount })
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Gold receive failed");
      }

      // Confirm update from server
      const newServerBalance = Number(response.data.data.newBalance) || 0;
      setGoldBalance(newServerBalance);
      setPendingGoldUpdate(0);
      setPendingTransaction(null);
      toast.success(
        `Successfully ${goldAmount > 0 ? "received" : "debited"} ${Math.abs(
          goldAmount
        ).toFixed(3)} gm of gold`
      );
      setWeight("");
      setPurity("");
      setCalculatedGoldValue(0);
    } catch (error) {
      console.error("Gold Receive Error:", error);
      setGoldBalance((prev) => prev - pendingGoldUpdate);
      setPendingGoldUpdate(0);
      setPendingTransaction(null);
      toast.error(error.message || "Failed to process gold transaction");
    } finally {
      setIsGoldLoading(false);
    }
  }, [
    weight,
    purity,
    calculatedGoldValue,
    userId,
    goldBalance,
    pendingGoldUpdate,
    withRetry,
  ]);

  const handleViewSpotrate = useCallback(
    (user) => {
      const spotRateId = user.userSpotRateId ?? "null";
      navigate(`/user-spot-rate/${spotRateId}/user/${user._id}/product`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-red-600">
          Error: {error}
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 ml-4 text-white bg-red-500 rounded"
            aria-label="Retry loading profile"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9]">
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: "#4BB543", color: "white" } },
          error: { style: { background: "#FF0000", color: "white" } },
        }}
      />
      <Header title={title} description={description} />
      <div className="px-16 overflow-hidden">
        <div className="p-6">
          <section className="space-y-6">
            <div className="flex gap-6 max-md:flex-col">
              <div className="flex items-center flex-1">
                <label className="w-24 font-medium text-neutral-600">
                  Name
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.name}
                </div>
              </div>
              <div className="flex items-center flex-1">
                <label className="w-24 font-medium text-neutral-600">
                  Email
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.email}
                </div>
              </div>
            </div>
            <div className="flex gap-6 max-md:flex-col">
              <div className="flex items-center flex-1">
                <label className="w-24 font-medium text-neutral-600">
                  Phone
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.contact}
                </div>
              </div>
              <div className="flex items-center flex-1">
                <label className="w-24 font-medium text-neutral-600">
                  Address
                </label>
                <div className="flex-1 px-5 h-12 border border-zinc-200 rounded-md flex items-center bg-gray-50 text-[#333]">
                  {userProfile.address}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="mr-4 font-medium text-neutral-600">
                  Assigned Rate
                </label>
                <div
                  className="flex items-center px-3.5 py-2 rounded-md bg-gradient-to-b from-[#156AEF] to-[#35A4D3] text-white cursor-pointer"
                  onClick={() => handleViewSpotrate(userProfile)}
                  aria-label="View user spot rate"
                >
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
                  <span className="text-sm">User Spotrate</span>
                </div>
              </div>
            </div>
          </section>

          <div className="my-8 border-t border-gray-300 border-dashed"></div>

          <section className="space-y-6">
            <h2 className="mb-6 text-xl font-bold">Account Balance</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-5 rounded-lg shadow-sm bg-gradient-to-br from-[#F0F9FF] to-[#E6F2FF]">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 mr-4 bg-blue-100 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-blue-500"
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
                      placeholder="Enter Cash Amount (+/-)"
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      disabled={isCashLoading}
                      aria-label="Enter cash amount, positive or negative"
                    />
                    <button
                      onClick={handleCashReceived}
                      disabled={isCashLoading}
                      className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Receive cash transaction"
                    >
                      {isCashLoading ? "Processing..." : "Receive"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
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

              <div className="p-5 rounded-lg shadow-sm bg-gradient-to-br from-[#FFF7E6] to-[#FFF0D4]">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 mr-4 bg-yellow-100 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-yellow-600"
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">
                      Weight (gms)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter Weight (+/-)"
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                      disabled={isGoldLoading}
                      aria-label="Enter gold weight, positive or negative"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-600">Purity</label>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                      disabled={isGoldLoading}
                      aria-label="Select gold purity"
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
                {calculatedGoldValue !== 0 && (
                  <div className="p-3 mb-4 rounded-md bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">
                        Pure Gold Value:
                      </span>
                      <span className="font-bold text-yellow-800">
                        {formatBalance(calculatedGoldValue, "gold")}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleGoldReceived}
                  disabled={!weight || !purity || isGoldLoading}
                  className="w-full py-2 text-white transition-colors bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Receive gold transaction"
                >
                  {isGoldLoading ? "Processing..." : "Receive Gold"}
                </button>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Received</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calculatedGoldValue !== 0
                        ? formatBalance(calculatedGoldValue, "gold")
                        : "0.000 gm CR"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {formatBalance(goldBalance, "gold")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="my-12 border-t border-gray-300 border-dashed"></div>
          <div>
            <h2 className="mb-5 ml-5 text-xl font-bold -mt-7">Order History</h2>
            <OrderManagement userId={userId} />
            <div className="my-12 border-t border-gray-300 border-dashed"></div>
            <h2 className="mb-5 ml-5 text-xl font-bold -mt-7">
              Transaction History
            </h2>
            <TransactionHistory
              userId={userId}
              onNewTransaction={pendingTransaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
