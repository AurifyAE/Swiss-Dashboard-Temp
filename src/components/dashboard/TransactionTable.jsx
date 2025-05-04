"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import axiosInstance from "../../axios/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Chevron Icon Component
const ChevronIcon = ({ expanded }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={`transition-transform duration-200 ${
      expanded ? "rotate-180" : ""
    }`}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="#4628A7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Download Single Transaction PDF
const downloadSingleTransactionPDF = async (transaction, products) => {
  const toastId = toast.loading("Generating PDF...");
  try {
    const blob = await pdf(
      <Document>
        <Page size="A4" wrap={false}>
          <TransactionPDF transaction={transaction} products={products} />
        </Page>
      </Document>
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Transaction_${transaction.id}_Details.pdf`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("PDF downloaded successfully", { id: toastId });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF", { id: toastId });
  }
};

// Transaction Header Component
const TransactionHeader = ({ sortConfig, onSort, className = "" }) => {
  const headers = [
    { key: "id", label: "Transaction ID" },
    { key: "date", label: "Delivery Date" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "status", label: "Status" },
    { key: "totalWeight", label: "Total Weight" },
    { key: "amount", label: "Total Amount" },
  ];

  return (
    <header
      className={`grid grid-cols-7 items-center px-12 py-4 bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-md font-semibold text-white ${className}`}
    >
      {headers.map((header) => (
        <div
          key={header.key}
          className="flex items-center cursor-pointer gap-2"
          onClick={() => onSort(header.key)}
        >
          {header.label}
          {sortConfig.key === header.key &&
            (sortConfig.direction === "asc" ? (
              <ChevronUpIcon size={16} />
            ) : (
              <ChevronDownIcon size={16} />
            ))}
        </div>
      ))}
      <div>Customers</div>
    </header>
  );
};

// PDF Generation Component
const TransactionPDF = ({ transaction, products }) => {
  const styles = StyleSheet.create({
    page: { padding: 0, margin: 0, position: "relative" },
    container: { padding: 40, height: "100%", flexDirection: "column" },
    watermarkContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-45deg)",
      opacity: 0.04,
      zIndex: -1,
    },
    watermarkText: {
      fontSize: 100,
      color: "#000000",
      textAlign: "center",
      fontWeight: "bold",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 40,
      borderBottom: 2,
      borderBottomColor: "#e2e8f0",
      paddingBottom: 20,
    },
    headerContent: { flex: 1 },
    companyName: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1e3a8a",
      marginBottom: 10,
    },
    companyDetails: { fontSize: 9, color: "#64748b", lineHeight: 1.6 },
    invoiceDetails: { alignItems: "flex-end" },
    invoiceTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#1e3a8a",
      marginBottom: 10,
    },
    invoiceNumber: { fontSize: 12, color: "#64748b" },
    invoiceDate: { fontSize: 10, color: "#64748b", marginTop: 5 },
    billingSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    billingBox: {
      width: "48%",
      padding: 15,
      backgroundColor: "#f8fafc",
      borderRadius: 5,
    },
    billingTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#1e3a8a",
      marginBottom: 10,
    },
    billingInfo: { fontSize: 9, color: "#64748b", lineHeight: 1.6 },
    table: { marginBottom: 30 },
    productImage: { width: 40, height: 40, objectFit: "contain" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#1e3a8a",
      padding: 10,
      color: "#ffffff",
    },
    tableCellHeader: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      padding: 10,
    },
    tableCell: { fontSize: 9, color: "#334155" },
    productName: { fontSize: 10, fontWeight: "bold", marginBottom: 4 },
    productDetails: { fontSize: 8, color: "#64748b" },
    termsSection: {
      marginBottom: 30,
      padding: 15,
      backgroundColor: "#f8fafc",
      borderRadius: 5,
    },
    termsTitle: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#1e3a8a",
      marginBottom: 10,
    },
    termsText: { fontSize: 8, color: "#64748b", lineHeight: 1.6 },
    footer: {
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
      paddingTop: 20,
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      color: "#1e3a8a",
      fontWeight: "bold",
      marginBottom: 5,
    },
    footerContact: { fontSize: 9, color: "#64748b" },
  });

  const customerData = transaction.customer || {};
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })
      : "N/A";

  return (
    <Document>
      <View style={styles.container}>
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>
            {transaction.status?.toUpperCase() || "PROCESSING"}
          </Text>
        </View>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.companyName}>The Swiss Gold</Text>
            <Text style={styles.companyName}>Gold Refinery</Text>
            <Text style={styles.companyDetails}>
              The Gold Center - Gold Souq - Zone 2 - Floor 2 - Office Number 35
              - Al Khor St - Deira - Al Ras - Dubai{"\n"}
              Tel: 048814702{"\n"}
              Email: info@theswissgold.com{"\n"}
            </Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceTitle}>Delivery Note</Text>
            <Text style={styles.invoiceNumber}>#{transaction.id || "N/A"}</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(transaction.date)}
            </Text>
          </View>
        </View>
        <View style={styles.billingSection}>
          <View style={styles.billingBox}>
            <Text style={styles.billingTitle}>Bill To:</Text>
            <Text style={styles.billingInfo}>
              {customerData.name || "N/A"}
              {"\n"}
              {customerData.address || "N/A"}
              {"\n"}
              {customerData.contact || customerData.phone || "N/A"}
              {"\n"}
              {customerData.email || "N/A"}
            </Text>
          </View>
          <View style={styles.billingBox}>
            <Text style={styles.billingTitle}>Payment Details:</Text>
            <Text style={styles.billingInfo}>
              Method: {transaction.paymentMethod || "N/A"}
              {"\n"}
              Delivery Date: {formatDate(transaction.date)}
              {"\n"}
              Transaction ID: {transaction.id || "N/A"}
              {"\n"}
              Status: {transaction.status || "N/A"}
              {"\n"}
              Gold Balance: {customerData.goldBalance?.toFixed(2) || "N/A"}
              {"\n"}
              Cash Balance: {customerData.cashBalance?.toFixed(2) || "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { flex: 2.5 }]}>
              Item Description
            </Text>
            <Text style={[styles.tableCellHeader, { flex: 0.5 }]}>Qty</Text>
            <Text style={[styles.tableCellHeader, { flex: 1 }]}>Purity</Text>
            <Text style={[styles.tableCellHeader, { flex: 1 }]}>Amount</Text>
          </View>
          {products?.length > 0 ? (
            products.map((product, index) => (
              <View
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff" },
                ]}
                key={index}
              >
                <View style={[styles.tableCell, { flex: 2.5 }]}>
                  <Text style={styles.productName}>
                    {product.name || "Gold Product"}
                  </Text>
                  <Text style={styles.productDetails}>
                    Weight: {product.weight || "N/A"}g
                  </Text>
                </View>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>
                  {product.quantity || "1"}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {product.purity || "N/A"}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  AED {product.amount || "0"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 5 }]}>
                No products available
              </Text>
            </View>
          )}
        </View>
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions:</Text>
          <Text style={styles.termsText}>
            • All prices are in AED{"\n"}• Payment is due upon receipt of
            delivery{"\n"}• Goods once sold cannot be returned{"\n"}• This is a
            computer-generated delivery note and requires no signature
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerContact}>
            For any queries, please contact: support@goldtrading.com
          </Text>
        </View>
      </View>
    </Document>
  );
};

// Status Badge Component
const getStatusBadge = (status) => {
  const statusStyles = {
    approved: "bg-green-100 text-green-800",
    successful: "bg-emerald-100 text-emerald-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    "user approval pending": "bg-sky-100 text-sky-800",
    rejected: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  const normalizedStatus = status?.toLowerCase() || "default";
  const badgeClass = statusStyles[normalizedStatus] || statusStyles.default;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
    >
      {status || "N/A"}
    </span>
  );
};

// Transaction Row Component
const TransactionRow = ({
  transaction,
  expanded,
  onToggleExpand,
  dashboard = false,
}) => {
  const {
    orderId,
    id,
    date,
    paymentMethod,
    status,
    amount,
    totalWeight,
    customer,
    products,
  } = transaction;
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState({ type: null, data: null });
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const statusButtonRef = useRef(null);

  const statusStyles = {
    Approved: "bg-green-100 text-green-800",
    Success: "bg-emerald-100 text-emerald-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-blue-100 text-blue-800",
    Rejected: "bg-red-100 text-red-800",
    "User Approval Pending": "bg-blue-100 text-[#0790E6]",
    "Approval Pending": "bg-blue-100 text-[#0790E6]",
  };

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (newStatus === "Rejected") {
        setModal({ type: "remark", data: { orderId } });
        return;
      }

      const toastId = toast.loading("Updating status...");
      setSelectedStatus(newStatus);
      setShowDropdown(false);

      try {
        await axiosInstance.put(`/update-order/${orderId}`, {
          orderStatus: newStatus,
        });
        toast.success("Status updated successfully", { id: toastId });
      } catch (error) {
        console.error("Error updating status:", error);
        setSelectedStatus(status);
        toast.error("Failed to update status", { id: toastId });
      }
    },
    [orderId, status]
  );

  const handleRemarkSubmit = useCallback(async () => {
    if (!remark.trim()) {
      setError("Please enter a remark");
      return;
    }

    const toastId = toast.loading("Submitting remark...");
    try {
      await axiosInstance.put(`/update-order-reject/${modal.data.orderId}`, {
        orderStatus: "Rejected",
        remark,
      });
      setSelectedStatus("Rejected");
      setModal({ type: null, data: null });
      setRemark("");
      setError("");
      toast.success("Order rejected", { id: toastId });
    } catch (error) {
      console.error("Error submitting remark:", error);
      toast.error("Failed to submit remark", { id: toastId });
      setError("Failed to submit remark");
    }
  }, [modal.data, remark]);

  const handleApproval = useCallback(
    async (product) => {
      if (product.quantity > 1) {
        setModal({ type: "quantity", data: { orderId, product } });
        setQuantity(product.quantity);
        return;
      }

      const toastId = toast.loading("Processing approval...");
      try {
        await axiosInstance.put(`/update-order-quantity/${orderId}`, {
          itemStatus: "Approved",
          itemId: product.itemId,
          fixedPrice: product.amount,
          quantity: product.quantity,
        });
        toast.success("Order approved", { id: toastId });
      } catch (error) {
        console.error("Error approving order:", error);
        toast.error("Failed to approve order", { id: toastId });
        setError("Failed to approve order");
      }
    },
    [orderId]
  );

  const handleProductRejection = useCallback(
    (product) => {
      setModal({ type: "remark", data: { orderId, product } });
    },
    [orderId]
  );

  const handleQuantitySubmit = useCallback(async () => {
    const { orderId, product } = modal.data;
    const toastId = toast.loading("Updating quantity...");
    try {
      await axiosInstance.put(`/update-order-quantity/${orderId}`, {
        itemStatus: "UserApprovalPending",
        itemId: product.itemId,
        fixedPrice: product.amount,
        quantity,
      });
      setModal({ type: null, data: null });
      toast.success("Quantity updated", { id: toastId });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity", { id: toastId });
      setError("Failed to update quantity");
    }
  }, [modal.data, quantity]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        statusButtonRef.current &&
        !statusButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleViewProfile = useCallback(() => {
    navigate(`/profile/${customer.id}`);
  }, [navigate, customer.id]);

  const shouldShowRejectButton = (productStatus) =>
    productStatus &&
    !["approved", "rejected"].includes(productStatus.toLowerCase());

  return (
    <div className="last:border-b-0 bg-white relative">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 items-center px-4 md:px-6 lg:px-12 py-4 hover:bg-[#F1FCFF] transition-colors">
        <div className="flex items-center col-span-2 md:col-span-1">
          <button
            onClick={onToggleExpand}
            className="mr-2 text-gray-500 hover:text-blue-600"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            <ChevronIcon expanded={expanded} />
          </button>
          <span className="truncate">{id}</span>
        </div>
        <div className="hidden md:block truncate">{date}</div>
        <div className="hidden md:block truncate">{paymentMethod}</div>
        <div className="relative" style={{ zIndex: showDropdown ? 40 : 20 }}>
          {dashboard ? (
            <div
              className={`flex items-center justify-between px-3 py-1 rounded-md text-sm font-semibold w-max ${
                statusStyles[selectedStatus] || "bg-gray-100 text-gray-500"
              }`}
            >
              <span>{selectedStatus}</span>
            </div>
          ) : (
            <>
              <button
                ref={statusButtonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center justify-between px-3 py-1 rounded-md text-sm font-semibold w-max ${
                  statusStyles[selectedStatus] || "bg-gray-100 text-gray-500"
                }`}
                aria-haspopup="true"
                aria-expanded={showDropdown}
              >
                <span>{selectedStatus}</span>
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showDropdown && (
                <ul
                  ref={dropdownRef}
                  className="absolute left-0 mt-1 w-40 bg-white shadow-lg border rounded-md text-sm z-50 overflow-visible"
                  role="menu"
                >
                  {[
                    "Processing",
                    "Approved",
                    "UserApprovalPending",
                    "Success",
                    "Rejected",
                  ].map((statusOption) => (
                    <li
                      key={statusOption}
                      onClick={() => handleStatusChange(statusOption)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        statusOption === selectedStatus
                          ? "bg-gray-50 font-medium"
                          : ""
                      }`}
                      role="menuitem"
                    >
                      {statusOption}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <div className="hidden lg:block truncate">{totalWeight} g</div>
        <div className="font-semibold hidden md:block">
          AED {typeof amount === "number" ? amount.toLocaleString() : amount}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleViewProfile}
            className="px-6 py-2 bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            View
          </button>
          {!dashboard && (
            <button
              onClick={() =>
                downloadSingleTransactionPDF(transaction, products)
              }
              className="p-2 bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded-md transition-colors"
              aria-label="Download PDF"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-2 md:hidden bg-gray-50">
        <div className="text-sm text-gray-600">
          Date: <span className="text-gray-900">{date}</span>
        </div>
        <div className="text-sm text-gray-600">
          Amount:{" "}
          <span className="text-gray-900">
            AED {typeof amount === "number" ? amount.toLocaleString() : amount}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Payment: <span className="text-gray-900">{paymentMethod}</span>
        </div>
      </div>

      {expanded && (
        <div className="bg-[#F1FCFF] py-3 md:py-5 px-4 md:px-8 w-full">
          <div className="bg-white rounded-xl border-2 border-sky-400 shadow-[0_4px_4px_rgba(50,180,219,0.24)] w-full overflow-x-auto">
            <div className="min-w-[800px] flex px-0 py-4 text-sm text-black bg-zinc-300 rounded-[9px_9px_0_0]">
              <div className="pl-4 md:pl-7 text-left flex-shrink-0 w-[130px]">
                Product Image
              </div>
              <div className="text-center flex-1 min-w-[120px]">Name</div>
              <div className="text-center flex-shrink-0 w-[100px]">Weight</div>
              <div className="text-center flex-shrink-0 w-[100px]">Purity</div>
              <div className="text-center flex-shrink-0 w-[100px]">
                Quantity
              </div>
              <div className="text-center flex-shrink-0 w-[120px]">Status</div>
              <div className="text-center flex-shrink-0 w-[100px]">Amount</div>
              {!dashboard && (
                <div className="text-center flex-shrink-0 w-[130px]">
                  Actions
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <div
                    key={index}
                    className="min-w-[800px] flex items-center px-4 py-5 border-b border-solid border-b-zinc-100"
                  >
                    <div className="pl-2 md:pl-7 text-sm text-center text-black flex-shrink-0 w-[130px]">
                      <div className="flex justify-center items-center bg-white h-[60px] shadow-[0_1px_2px_rgba(0,0,0,0.09)] w-[50px]">
                        {product.image && (
                          <img
                            src={product.image}
                            alt="Gold bar"
                            className="w-8 h-[50px] object-contain"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-center text-black flex-1 min-w-[120px] px-2">
                      {product.name}
                    </div>
                    <div className="text-sm text-center text-black flex-shrink-0 w-[100px]">
                      {product.weight}
                    </div>
                    <div className="text-sm text-center text-black flex-shrink-0 w-[100px]">
                      {product.purity}
                    </div>
                    <div className="text-sm text-center text-black flex-shrink-0 w-[100px]">
                      {product.quantity}
                    </div>
                    <div
                      className={`text-sm text-center flex-shrink-0 w-[120px] px-2 py-1 mx-2 rounded ${
                        statusStyles[product.status] ||
                        "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.status}
                    </div>
                    <div className="text-sm text-center text-black flex-shrink-0 w-[100px]">
                      {product.amount}
                    </div>
                    {!dashboard && (
                      <div className="text-sm text-center text-black flex-shrink-0 w-[130px] flex justify-center space-x-2">
                        {product.status === "Approval Pending" && (
                          <button
                            onClick={() => handleApproval(product)}
                            className="bg-blue-100 text-[#0790E6] px-3 py-1 rounded-md shadow-lg hover:bg-blue-200 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {shouldShowRejectButton(product.status) && (
                          <button
                            onClick={() => handleProductRejection(product)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md shadow-lg hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No products found for this transaction
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modal.type === "remark" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {modal.data.product ? "Reject Product" : "Reject Order"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows="4"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter reason for rejection"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded"
                onClick={() => {
                  setModal({ type: null, data: null });
                  setRemark("");
                  setError("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleRemarkSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "quantity" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Update Quantity</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded p-2"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded"
                onClick={() => {
                  setModal({ type: null, data: null });
                  setError("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#32B4DB] to-[#156AEF] text-white rounded ml-2"
                onClick={handleQuantitySubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Pagination Controls Component
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalItems,
}) => {
  const rowsPerPageOptions = [5, 10, 20, 50];
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(startItem + rowsPerPage - 1, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-100 gap-4 rounded-b-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border rounded-md px-2 py-1 bg-white"
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Transaction Table Component
const TransactionTable = ({
  timeFilter = "This Week",
  statusFilter = null,
  searchQuery = "",
  className = "",
  dashboard = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const adminId =
    typeof window !== "undefined" ? localStorage.getItem("adminId") : null;

  const fetchOrders = useCallback(async () => {
    if (!adminId) {
      setError("Admin ID not found. Please log in again.");
      return;
    }

    const toastId = toast.loading("Fetching orders...");
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/booking/${adminId}`);
      const newOrders = response.data.orderDetails;

      const transformedOrders = newOrders.map((order) => {
        const customerData = {
          id: order.customer?.id || order.userId || "N/A",
          name: order.customer?.name || order.userName || "N/A",
          email: order.customer?.email || order.userEmail || "N/A",
          contact: String(
            order.customer?.contact || order.userPhone || order.phone || "N/A"
          ),
          address:
            order.customer?.address ||
            order.userAddress ||
            order.address ||
            "N/A",
          goldBalance: order.customer?.goldBalance || "N/A",
          cashBalance: order.customer?.cashBalance || "N/A",
        };

        const orderProducts =
          order.items?.map((item) => {
            const productData = item.product || {};
            return {
              image: productData.images?.[0]?.url || "",
              name: productData.title || "Gold Product",
              weight: productData.weight ? `${productData.weight}` : "N/A",
              purity: productData.purity || "9999",
              quantity: item.quantity || 1,
              amount: item.fixedPrice || productData.price || 0,
              productId:
                productData.id ||
                item._id ||
                `product-${Math.random().toString(36).substr(2, 9)}`,
              status: item.itemStatus || "N/A",
              itemId: item._id,
              type: productData.type || "GOLD",
              sku: productData.sku || "N/A",
            };
          }) || [];

        return {
          orderId: order._id,
          id:
            order.transactionId ||
            order._id ||
            `tx-${Math.random().toString(36).substr(2, 9)}`,
          date: order.orderDate
            ? new Date(order.orderDate).toLocaleDateString()
            : "N/A",
          paymentMethod: order.paymentMethod || "N/A",
          status: order.orderStatus || "N/A",
          pricingOption: order.pricingScheme || "N/A",
          amount: order.totalPrice || 0,
          totalWeight: order.totalWeight || 0,
          customer: customerData,
          products: orderProducts,
        };
      });

      setOrders(transformedOrders);
      toast.success("Orders loaded successfully", { id: toastId });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders", { id: toastId });
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredTransactions = useMemo(() => {
    return orders.filter((transaction) => {
      const isTimeMatch =
        timeFilter === "This Week" ||
        (timeFilter === "This Month" &&
          new Date(transaction.date).getMonth() === new Date().getMonth()) ||
        (timeFilter === "This Year" &&
          new Date(transaction.date).getFullYear() ===
            new Date().getFullYear());

      const isStatusMatch =
        !statusFilter ||
        transaction.status.toLowerCase() === statusFilter.toLowerCase() ||
        statusFilter === "All Orders";

      const isSearchMatch =
        !searchQuery ||
        String(transaction.id)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.paymentMethod)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.status)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.pricingOption)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.amount).includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.name)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.email)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.contact)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.address)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.cashBalance)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(transaction.customer?.goldBalance)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return isTimeMatch && isStatusMatch && isSearchMatch;
    });
  }, [orders, timeFilter, statusFilter, searchQuery]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortConfig]);

  const totalItems = sortedTransactions.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const handleExportAllToPDF = useCallback(async () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const pages = filteredTransactions.map((transaction) => (
        <Page key={transaction.id} size="A4" wrap={false}>
          <TransactionPDF
            transaction={transaction}
            products={transaction.products}
          />
        </Page>
      ));

      const doc = <Document>{pages}</Document>;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "All_Transactions.pdf";
      link.click();

      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  }, [filteredTransactions]);

  TransactionTable.exportAllToPDF = handleExportAllToPDF;

  return (
    <div className="w-full relative z-0">
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <TransactionHeader
        sortConfig={sortConfig}
        onSort={handleSort}
        className={className}
      />
      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading orders...</div>
      ) : paginatedTransactions.length > 0 ? (
        paginatedTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            expanded={expandedRowId === transaction.id}
            onToggleExpand={() =>
              setExpandedRowId((prev) =>
                prev === transaction.id ? null : transaction.id
              )
            }
            dashboard={dashboard}
          />
        ))
      ) : (
        <div className="p-6 text-center text-gray-500">
          No transactions found
        </div>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages || 1}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;
