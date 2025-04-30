import React, { useState, useEffect } from "react";
import axios from "../../axios/axios";
import toast from "react-hot-toast";

const TransactionHistory = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    gold: { totalCredits: 0, totalDebits: 0, netFlow: 0 },
    cash: { totalCredits: 0, totalDebits: 0, netFlow: 0 },
  });
  const [balanceInfo, setBalanceInfo] = useState({
    totalGoldBalance: 0,
    cashBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("User ID is missing");
        }

        const response = await axios.get(`/fetch-transtion/${userId}`);
        console.log(response)

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to fetch transaction history"
          );
        }

        const { transactions, summary, balanceInfo, pagination } =
          response.data.data;

        setTransactions(transactions || []);
        setSummary(summary || {});
        setBalanceInfo(balanceInfo || {});
        setPagination(pagination || {});
      } catch (error) {
        console.error("Transaction Fetch Error:", error);
        setError(error.message || "An unexpected error occurred");
        toast.error(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount based on balance type
  const formatAmount = (amount, balanceType) => {
    if (balanceType === "GOLD") {
      return `${Math.abs(amount).toFixed(3)} gm`;
    }
    return `${Math.abs(amount).toLocaleString()}`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-xl text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-10 bg-red-50">
        <div className="text-red-600">
          Error: {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">Transaction History</h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Cash Summary */}
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
              Cash Summary
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Credits:</span>
              <span className="font-bold text-green-600">
                {summary.cash.totalCredits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Debits:</span>
              <span className="font-bold text-red-600">
                {summary.cash.totalDebits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Flow:</span>
              <span
                className={`font-bold ${
                  summary.cash.netFlow >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.cash.netFlow >= 0 ? "+" : ""}
                {summary.cash.netFlow.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Balance:</span>
              <span
                className={`font-bold ${
                  balanceInfo.cashBalance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {balanceInfo.cashBalance >= 0 ? "+" : ""}
                {balanceInfo.cashBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Gold Summary */}
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
              Gold Summary
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Credits:</span>
              <span className="font-bold text-green-600">
                {summary.gold.totalCredits.toFixed(3)} gm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Debits:</span>
              <span className="font-bold text-red-600">
                {summary.gold.totalDebits.toFixed(3)} gm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Net Flow:</span>
              <span
                className={`font-bold ${
                  summary.gold.netFlow >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.gold.netFlow >= 0 ? "+" : ""}
                {summary.gold.netFlow.toFixed(3)} gm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Balance:</span>
              <span
                className={`font-bold ${
                  balanceInfo.totalGoldBalance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {balanceInfo.totalGoldBalance >= 0 ? "+" : ""}
                {balanceInfo.totalGoldBalance.toFixed(3)} gm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance After
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === "CREDIT"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.type === "CREDIT" ? "+" : "-"}
                    {formatAmount(transaction.amount, transaction.balanceType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.balanceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.balanceType === "GOLD"
                      ? `${transaction.balanceAfter.toFixed(3)} gm`
                      : transaction.balanceAfter.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.orderId?._id || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} transactions
          </p>
          <div className="flex space-x-2">
            <button
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
            >
              Previous
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;