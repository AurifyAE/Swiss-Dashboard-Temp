import React, { createContext, useContext, useState } from 'react';

// Create the context
const CurrencyContext = createContext();

// Create a provider component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('AED');

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the CurrencyContext
export const useCurrency = () => {
  return useContext(CurrencyContext);
};