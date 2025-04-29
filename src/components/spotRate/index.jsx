import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Edit, Check, X, RefreshCw } from "lucide-react";
import useMarketData from "../../components/MarketData";
import axiosInstance from "../../axios/axios";
import { toast } from "react-hot-toast";

export default function FinancialDataDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminId, setAdminId] = useState("");

  // Get market data from the hook
  const { marketData } = useMarketData(["GOLD"]);
  // console.log(marketData?.bid)

  const [data, setData] = useState({
    bid: {
      value: 0,
      spread: 0,
      price: 0,
    },
    ask: {
      value: 0,
      spread: 0,
      price: 0,
    },
    range: {
      lowValue: 0,
      lowMargin: 0,
      lowNewValue: 0,
      highValue: 0,
      highMargin: 0,
      highNewValue: 0,
    },
  });

  const [editMode, setEditMode] = useState({
    bidSpread: false,
    askSpread: false,
    lowMargin: false,
    highMargin: false,
  });

  const [editValues, setEditValues] = useState({
    bidSpread: 0,
    askSpread: 0,
    lowMargin: 0,
    highMargin: 0,
  });

  // Get adminId from localStorage
  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    if (storedAdminId) {
      setAdminId(storedAdminId);
    } else {
      toast.error("Admin ID not found. Please login again.");
    }
  }, []);

  // Fetch spot rates on component mount and when adminId changes
  useEffect(() => {
    if (adminId) {
      fetchSpotRates();
    }
  }, [adminId]);

  // Update calculations when market data or spread values change
  useEffect(() => {
    if (marketData && marketData?.bid) {
      updateCalculations();
    }
  }, [marketData, editValues]);

  // Format numbers to always show 2 decimal places
  const formatNumber = (num) => {
    return typeof num === "number" ? num.toFixed(2) : "0.00";
  };

  // Determine if value is positive, negative or zero
  const getValueColor = (val) => {
    if (val > 0) return "text-green-500";
    if (val < 0) return "text-red-500";
    return "text-gray-600";
  };

  // Determine arrow direction based on value
  const getValueIndicator = (val) => {
    if (val > 0) return <ArrowUp className="w-4 h-4" />;
    if (val < 0) return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  // Update calculations based on market data and spread values
  const updateCalculations = () => {
    if (!marketData || !marketData?.bid) return;

    const bidValue = parseFloat(marketData?.bid) || 0;
    const bidSpread = data.bid.spread;
    const askSpread = data.ask.spread;

    // Calculate prices based on your formula
    // bid + spread = bidding Price
    // bidding Price + Spread + 0.5 = Asking Price
    const biddingPrice = bidValue + (bidSpread || 0);
    const askingPrice = biddingPrice + (askSpread || 0) + 0.5;

    // Calculate high and low ranges (20% variation from bid price)
    const lowValue = parseFloat(marketData?.low) || 0; // 10% lower than bid
    const highValue = parseFloat(marketData?.high) || 0; // 10% higher than bid

    setData((prevData) => ({
      bid: {
        value: bidValue,
        spread: prevData.bid.spread || 0,
        price: biddingPrice,
      },
      ask: {
        value: biddingPrice,
        spread: prevData.ask.spread || 0,
        price: askingPrice,
      },
      range: {
        lowValue: lowValue,
        lowMargin: prevData.range.lowMargin || 0,
        lowNewValue: lowValue + (prevData.range.lowMargin || 0),
        highValue: highValue,
        highMargin: prevData.range.highMargin || 0,
        highNewValue: highValue + (prevData.range.highMargin || 0),
      },
    }));
  };

  // Fetch spot rates from the API
  const fetchSpotRates = async () => {
    if (!adminId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/spotrates/${adminId}`);
      const spotData = response.data;

      // Update spread values from API
      setData((prevData) => ({
        bid: {
          ...prevData.bid,
          spread: spotData.goldBidSpread,
        },
        ask: {
          ...prevData.ask,
          spread: spotData.goldAskSpread,
        },
        range: {
          ...prevData.range,
          lowMargin: spotData.goldLowMargin,
          highMargin: spotData.goldHighMargin,
        },
      }));

      // Initialize edit values
      setEditValues({
        bidSpread: spotData.goldBidSpread,
        askSpread: spotData.goldAskSpread,
        lowMargin: spotData.goldLowMargin,
        highMargin: spotData.goldHighMargin,
      });

      // Update calculations after fetching data
      updateCalculations();
    } catch (err) {
      console.error("Error fetching spot rates:", err);
      setError("Failed to load spot rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update spot rates with correct type parameter
  const updateSpotRates = async (updatedData) => {
    if (!adminId) {
      toast.error("Admin ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    // Determine the type parameter based on what's being updated
    let type = "";
    let value = 0;

    if (updatedData.goldBidSpread !== undefined) {
      type = "bid";
      value = updatedData.goldBidSpread;
    } else if (updatedData.goldAskSpread !== undefined) {
      type = "ask";
      value = updatedData.goldAskSpread;
    } else if (updatedData.goldHighMargin !== undefined) {
      type = "high";
      value = updatedData.goldHighMargin;
    } else if (updatedData.goldLowMargin !== undefined) {
      type = "low";
      value = updatedData.goldLowMargin;
    }

    try {
      await axiosInstance.post(`/update-spread/${adminId}`, {
        metal: "Gold",
        type: type,
        value: value,
      });

      toast.success("Spread updated successfully!");

      // Refresh data after update
      fetchSpotRates();
    } catch (err) {
      console.error("Error updating spot rates:", err);
      setError("Failed to update. Please try again.");
      toast.error("Failed to update spread. Please try again.");
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const toggleEditMode = (field) => {
    setEditMode({
      ...editMode,
      [field]: !editMode[field],
    });

    // Reset to original value if canceling
    if (editMode[field]) {
      let originalValue;

      if (field === "bidSpread") originalValue = data.bid.spread;
      else if (field === "askSpread") originalValue = data.ask.spread;
      else if (field === "lowMargin") originalValue = data.range.lowMargin;
      else if (field === "highMargin") originalValue = data.range.highMargin;

      setEditValues({
        ...editValues,
        [field]: originalValue,
      });
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    const parsedValue = parseFloat(value) || 0;

    setEditValues((prevValues) => ({
      ...prevValues,
      [field]: parsedValue,
    }));
  };

  // Save edited value
  const saveEditedValue = (field) => {
    // Update the corresponding value in data
    if (field === "bidSpread") {
      // Update data locally
      setData((prevData) => ({
        ...prevData,
        bid: {
          ...prevData.bid,
          spread: editValues.bidSpread,
        },
      }));

      // Send update to API
      updateSpotRates({
        goldBidSpread: editValues.bidSpread,
      });
    } else if (field === "askSpread") {
      // Update data locally
      setData((prevData) => ({
        ...prevData,
        ask: {
          ...prevData.ask,
          spread: editValues.askSpread,
        },
      }));

      // Send update to API
      updateSpotRates({
        goldAskSpread: editValues.askSpread,
      });
    } else if (field === "lowMargin") {
      // Update data locally
      setData((prevData) => ({
        ...prevData,
        range: {
          ...prevData.range,
          lowMargin: editValues.lowMargin,
        },
      }));

      // Send update to API
      updateSpotRates({
        goldLowMargin: editValues.lowMargin,
      });
    } else if (field === "highMargin") {
      // Update data locally
      setData((prevData) => ({
        ...prevData,
        range: {
          ...prevData.range,
          highMargin: editValues.highMargin,
        },
      }));

      // Send update to API
      updateSpotRates({
        goldHighMargin: editValues.highMargin,
      });
    }

    // Exit edit mode
    toggleEditMode(field);

    // Update calculations after saving
    updateCalculations();
  };

  // Editable field component
  const EditableField = ({ field, value, label }) => {
    const isEditing = editMode[field];
    const editValue = editValues[field];

    return (
      <div className="flex flex-col p-2">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className="flex items-center">
          {isEditing ? (
            <div className="flex items-center w-full">
              <input
                type="number"
                value={editValue}
                onChange={(e) => handleInputChange(field, e.target.value)}
                step="0.1"
                className="w-20 p-1 border border-gray-300 rounded text-lg"
              />
              <button
                onClick={() => saveEditedValue(field)}
                className="ml-2 text-green-500 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleEditMode(field)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <span className={`text-lg font-semibold ${getValueColor(value)}`}>
                {value}
              </span>
              {getValueIndicator(value)}
              <button
                onClick={() => toggleEditMode(field)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Show loading state when market data is not yet available or we're loading spot rates
  if ((loading && !data.bid.spread) || !marketData || !marketData?.bid) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin mr-2">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p>Loading market data and spot rates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchSpotRates}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-full mx-auto px-16 py-10 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg">
          <span className="font-medium">Current Gold Price: </span>
          <span className="font-bold">
            ${formatNumber(marketData?.bid || 0)}
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchSpotRates}
            className="flex items-center bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-8">
        <div className="flex flex-col w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg mb-4">
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Bid
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.bid.value)}
                    </span>
                  </div>
                </div>

                <EditableField
                  field="bidSpread"
                  value={data.bid.spread}
                  label="Spread"
                />

                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Bidding Price
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.bid.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg mb-4">
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Ask
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.ask.value)}
                    </span>
                  </div>
                </div>

                <EditableField
                  field="askSpread"
                  value={data.ask.spread}
                  label="Spread"
                />

                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Asking Price
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.ask.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-col w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg mb-4">
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Low
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.range.lowValue)}
                    </span>
                  </div>
                </div>

                <EditableField
                  field="lowMargin"
                  value={data.range.lowMargin}
                  label="Margin"
                />

                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Low New Value
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.range.lowNewValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg mb-4">
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    High
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.range.highValue)}
                    </span>
                  </div>
                </div>

                <EditableField
                  field="highMargin"
                  value={data.range.highMargin}
                  label="Margin"
                />

                <div className="flex flex-col p-2">
                  <span className="text-sm text-gray-500 font-medium">
                    High New Value
                  </span>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      {formatNumber(data.range.highNewValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
