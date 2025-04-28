// src/App.js
import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Layout from "./components/layout/index";
import { CurrencyProvider } from "./context/CurrencyContext";
import { MarketDataProvider } from "./context/MarketDataContext";
import { SpotRateProvider } from "./context/SpotRateContext";
import { AppProvider } from "./context/AppContext";
import RouterConfig from "./router";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

const AppContent = () => {
  const location = useLocation();
  const isRootPath = location.pathname === "/";

  return (
    <div className="flex">
      {!isRootPath && <Layout />}
      <div className="flex-1 ml-60">
        <RouterConfig />
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <CurrencyProvider>
        <MarketDataProvider>
          <SpotRateProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </SpotRateProvider>
        </MarketDataProvider>
      </CurrencyProvider>
    </Router>
  );
};

export default App;
