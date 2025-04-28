import React, { createContext, useCallback, useContext, useState } from "react";
import axiosInstance from "../axios/axios";

const SpotRateContext = createContext();

export const SpotRateProvider = ({ children }) => {
  const [marketData, setMarketData] = useState({});
  const [commodities, setCommodities] = useState([]);
  const [spreadMarginData, setSpreadMarginData] = useState({});
  const [categoryId, setCategoryId] = useState(null);
  const [adminId, setAdminId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bidAskPrices, setBidAskPrices] = useState({});

  const fetchData = useCallback(async () => {
    if (!categoryId || !adminId) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/spotrates/${adminId}/${categoryId}`
      );

      if (response.data) {
        setSpreadMarginData(response.data);
        if (response.data.commodities) {
          setCommodities(response.data.commodities);
        }
        if (response.data.marketData) {
          setMarketData(response.data.marketData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, adminId]);

  const updateMarketData = useCallback((newMarketData) => {
    setMarketData((prevData) => ({
      ...prevData,
      ...newMarketData,
    }));
  }, []);

  const updateBidAskPrices = useCallback((metal, bid, ask) => {
    setBidAskPrices((prevPrices) => ({
      ...prevPrices,
      [metal]: { bid, ask },
    }));
  }, []);

  const getSpreadOrMarginFromDB = useCallback(
    (metal, type) => {
      const lowerMetal = metal.toLowerCase();
      const key = `${lowerMetal}${
        type.charAt(0).toUpperCase() + type.slice(1)
      }${type === "low" || type === "high" ? "Margin" : "Spread"}`;
      return spreadMarginData[key] || 0;
    },
    [spreadMarginData]
  );

  const setAdminIdAndFetchData = useCallback(
    (id) => {
      setAdminId(id);
      if (categoryId) {
        fetchData();
      }
    },
    [categoryId, fetchData]
  );

  const setCategoryIdAndFetchData = useCallback(
    (id) => {
      setCategoryId(id);
      if (adminId) {
        fetchData();
      }
    },
    [adminId, fetchData]
  );

  const value = {
    marketData,
    updateMarketData,
    commodities,
    spreadMarginData,
    getSpreadOrMarginFromDB,
    categoryId,
    setCategoryId: setCategoryIdAndFetchData,
    adminId,
    setAdminId: setAdminIdAndFetchData,
    isLoading,
    fetchData,
    bidAskPrices,
    updateBidAskPrices,
  };

  return (
    <SpotRateContext.Provider value={value}>
      {children}
    </SpotRateContext.Provider>
  );
};

export const useSpotRate = () => useContext(SpotRateContext);