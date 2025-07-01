import React, { useState, useEffect, useCallback } from "react";
import axios from "../../axios/axios";
import toast from "react-hot-toast";

const TransactionHistory = ({ userId, onNewTransaction }) => {
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
    totalItems: 0,
  });
  const [pendingTransaction, setPendingTransaction] = useState(null);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error("User ID is missing");
      }

      const response = await axios.get(`/fetch-transaction/${userId}`);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch transaction history"
        );
      }

      const { transactions, summary, balanceInfo, pagination } =
        response.data.data;

      setTransactions(transactions || []);
      setSummary(summary || { gold: { totalCredits: 0, totalDebits: 0, netFlow: 0 }, cash: { totalCredits: 0, totalDebits: 0, netFlow: 0 } });
      setBalanceInfo(balanceInfo || { totalGoldBalance: 0, cashBalance: 0 });
      setPagination(pagination || { currentPage: 1, totalPages: 1, itemsPerPage: 10, totalItems: 0 });
    } catch (error) {
      console.error("Transaction Fetch Error:", error);
      setError(error.message || "An unexpected error occurred");
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle new transaction optimistically
  useEffect(() => {
    if (onNewTransaction) {
      // Optimistic update
      setPendingTransaction(onNewTransaction);
      setTransactions((prev) => [onNewTransaction, ...prev.slice(0, pagination.itemsPerPage - 1)]);

      // Update summary and balanceInfo
      setSummary((prev) => {
        const balanceType = onNewTransaction.balanceType.toLowerCase();
        const isCredit = onNewTransaction.type === "CREDIT";
        const amount = onNewTransaction.amount;

        return {
          ...prev,
          [balanceType]: {
            ...prev[balanceType],
            totalCredits: isCredit
              ? prev[balanceType].totalCredits + amount
              : prev[balanceType].totalCredits,
            totalDebits: isCredit
              ? prev[balanceType].totalDebits
              : prev[balanceType].totalDebits + amount,
            netFlow: prev[balanceType].netFlow + (isCredit ? amount : -amount),
          },
        };
      });

      setBalanceInfo((prev) => ({
        ...prev,
        [onNewTransaction.balanceType === "GOLD" ? "totalGoldBalance" : "cashBalance"]:
          onNewTransaction.balanceAfter,
      }));

      // Update pagination
      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / prev.itemsPerPage),
      }));
    }
  }, [onNewTransaction, pagination.itemsPerPage]);

  // Revert optimistic update if needed (called from ProfilePage on failure)
  const revertTransaction = useCallback(() => {
    if (pendingTransaction) {
      setTransactions((prev) => prev.filter((t) => t._id !== pendingTransaction._id));
      setSummary((prev) => {
        const balanceType = pendingTransaction.balanceType.toLowerCase();
        const isCredit = pendingTransaction.type === "CREDIT";
        const amount = pendingTransaction.amount;

        return {
          ...prev,
          [balanceType]: {
            ...prev[balanceType],
            totalCredits: isCredit
              ? prev[balanceType].totalCredits - amount
              : prev[balanceType].totalCredits,
            totalDebits: isCredit
              ? prev[balanceType].totalDebits
              : prev[balanceType].totalDebits - amount,
            netFlow: prev[balanceType].netFlow - (isCredit ? amount : -amount),
          },
        };
      });

      setBalanceInfo((prev) => ({
        ...prev,
        [pendingTransaction.balanceType === "GOLD" ? "totalGoldBalance" : "cashBalance"]:
          prev[pendingTransaction.balanceType === "GOLD" ? "totalGoldBalance" : "cashBalance"] -
          (pendingTransaction.type === "CREDIT" ? pendingTransaction.amount : -pendingTransaction.amount),
      }));

      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems - 1,
        totalPages: Math.ceil((prev.totalItems - 1) / prev.itemsPerPage),
      }));

      setPendingTransaction(null);
    }
  }, [pendingTransaction, pagination.itemsPerPage]);

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
      <div className="flex items-center justify-center py-10">
        <div className="text-xl text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-10 bg-red-50">
        <div className="text-red-600">
          No Transactions Found for this User
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-xl font-bold">Transaction History</h2>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Cash Summary */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E6F2FF] p-5 rounded-lg shadow-sm">
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
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Balance Type
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Balance After
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
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
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {transaction.type === "CREDIT" ? "+" : "-"}
                    {formatAmount(transaction.amount, transaction.balanceType)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {transaction.balanceType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {transaction.balanceType === "GOLD"
                      ? `${transaction.balanceAfter.toFixed(3)} gm`
                      : transaction.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
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
              className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:opacity-50 hover:bg-blue-600"
            >
              Previous
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:opacity-50 hover:bg-blue-600"
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