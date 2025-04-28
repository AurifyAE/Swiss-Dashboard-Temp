import React from "react";
import Sidebar from "../Sidebar"; 
import Header from "../Header";

const Layout = ({ children }) => {

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        {/* <Header /> */}

        {/* Main Components */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
