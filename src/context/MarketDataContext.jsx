import React, { createContext, useState, useContext } from 'react';

const MarketDataContext = createContext();

export const MarketDataProvider = ({ children }) => {
  const [marketData, setMarketData] = useState({});
  const [spreadMarginData, setSpreadMarginData] = useState({});

  return (
    <MarketDataContext.Provider value={{ marketData, setMarketData, spreadMarginData, setSpreadMarginData }}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => useContext(MarketDataContext);