import React, { useState } from "react";
import Header from "../components/Header";
import { Search, Download } from "lucide-react";
import TransactionTable from "../components/dashboard/TransactionTable";

function Orders() {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const title = "Order Management";
  const description =
    "Track, manage, and update your orders effortlessly in one place";

  const customStyle = "rounded-t-2xl";

  const handleExportToPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await TransactionTable.exportAllToPDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] h-screen">
      <Header title={title} description={description} />
      <div className="flex flex-col justify-between">
        <div className="flex flex-row gap-3 py-6 px-16">
          {[
            "All Orders",
            "Processing",
            "Approved",
            "User Approval Pending",
            "Success",
            "Rejected",
          ].map((status) => (
            <button
              key={status}
              className={`text-[15px] font-semibold px-8 py-2 rounded-md bg-white ${
                selectedStatus === status ? "shadow-xl" : ""
              }`}
              style={{
                color:
                  status === "Processing"
                    ? "#FF8C00"
                    : status === "Approved"
                    ? "#8107E6"
                    : status === "User Approval Pending"
                    ? "#0790E6"
                    : status === "Success"
                    ? "#11AA0E"
                    : status === "Rejected"
                    ? "#FF0000"
                    : "#3C78BC",
              }}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex flex-row justify-end gap-8 relative w-full mt-5 px-16">
          <div className="w-[220px] relative">
            <input
              type="text"
              placeholder="Search Transactions"
              className="w-full pl-12 pr-4 py-2 bg-white rounded-[30px] focus:outline-none focus:ring-0 border-2 border-sky-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#32B4DB]">
              <Search size={20} />
            </div>
          </div>
          <div>
            <button
              className={`flex flex-row bg-gradient-to-r from-[#32B4DB] to-[#156AEF] py-2 px-5 text-white rounded-md ${
                isGeneratingPDF ? "opacity-50" : ""
              }`}
              onClick={handleExportToPDF}
              disabled={isGeneratingPDF}
            >
              <Download size={20} className="mr-2" />
              {isGeneratingPDF ? "Generating..." : "Export to PDF"}
            </button>
          </div>
        </div>
      </div>
      <div className="px-16 mt-8">
        <TransactionTable
          statusFilter={selectedStatus}
          searchQuery={searchQuery}
          className={customStyle}
        />
      </div>
    </div>
  );
}

export default Orders;
