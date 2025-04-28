// MetalPricesContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import io from 'socket.io-client';

const MetalPricesContext = createContext();

export const useMetalPrices = () => useContext(MetalPricesContext);

export const MetalPricesProvider = ({ children }) => {
  const [marketData, setMarketData] = useState({});

  const getSpreadFromLocalStorage = (metal, type) => {
    const savedSpread = localStorage.getItem(`spread_${metal}_${type}`);
    return savedSpread !== null ? parseFloat(savedSpread) : 0;
  };

  const fetchMarketData = useCallback((symbols, serverURL) => {
    const socket = io(serverURL, {
      query: { secret: "aurify@123" },
    });

    socket.on("connect", () => {
      socket.emit("request-data", symbols);
    });

    socket.on("market-data", (data) => {
      if (data && data.symbol) {
        setMarketData(prevData => ({
          ...prevData,
          [data.symbol]: {
            ...prevData[data.symbol],
            ...data,
            bidChanged: prevData[data.symbol] && data.bid !== prevData[data.symbol].bid 
              ? (data.bid > prevData[data.symbol].bid ? 'up' : 'down') 
              : null,
          }
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const value = {
    marketData,
    fetchMarketData,
    getSpreadFromLocalStorage,
  };

  return (
    <MetalPricesContext.Provider value={value}>
      {children}
    </MetalPricesContext.Provider>
  );
};