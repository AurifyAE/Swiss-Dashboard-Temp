import React, { useState, useEffect, useCallback } from "react";
import axios from "../../axios/axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Typography,
  Collapse,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Container,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  DeleteOutline,
  ShoppingCartOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";

// Status color mapping utility
const getStatusColor = (status) => {
  const statusColorMap = {
    Success: "success",
    Approved: "success",
    Rejected: "error",
    Processing: "warning",
    "User Approval Pending": "warning",
    Pending: "warning",
    Cancelled: "error",
  };
  return statusColorMap[status] || "default";
};

const OrderManagement = ({ userId }) => {
  const navigate = useNavigate();

  // State Management
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [error, setError] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin ID from localStorage
  const adminId = localStorage.getItem("adminId") || "67c1a8978399ea3181f5cad9";

  // Fetch Orders Callback
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const loadingToastId = toast.loading("Fetching orders...");

    try {
      const response = await axios.get(`/fetch-order/${adminId}/${userId}`);
      const newOrders = response.data.data || [];

      setOrders((prevOrders) => {
        const hasChanges =
          JSON.stringify(prevOrders) !== JSON.stringify(newOrders);

        if (hasChanges && prevOrders.length > 0) {
          toast.success("Orders updated!", {
            id: loadingToastId,
            duration: 3000,
          });
        } else {
          toast.dismiss(loadingToastId);
        }

        return newOrders;
      });

      setError("");
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders", { id: loadingToastId });
      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [adminId, userId]);

  // Initial and Periodic Order Fetching
  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // Delete Order Handler
  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      await axios.delete(`/delete-order/${deleteOrderId}`);

      // Remove the deleted order from the list
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== deleteOrderId)
      );

      // Show success toast
      toast.success("Order deleted successfully!");

      // Close the confirmation dialog
      setDeleteOrderId(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  // Order Expansion and Interaction Handlers
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const openDeleteConfirmation = (orderId) => {
    setDeleteOrderId(orderId);
  };

  const closeDeleteConfirmation = () => {
    setDeleteOrderId(null);
  };

  // Date Formatting Utility
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }, []);

  // No Orders Rendering
  const renderNoOrders = () => (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 4 }}>
      <Stack spacing={3} alignItems="center" justifyContent="center">
        <ShoppingCartOutlined
          sx={{
            fontSize: 50,
            color: "text.secondary",
            opacity: 0.5,
          }}
        />
        <Typography variant="h4" color="text.secondary">
          No Order History
        </Typography>
        <Typography variant="body1" color="text.disabled" sx={{ mb: 2 }}>
          You haven't placed any orders yet. Start exploring our products and
          make your first purchase!
        </Typography>
      </Stack>
    </Container>
  );

  // Loading State Rendering
  const renderLoading = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading your order history...
        </Typography>
      </Stack>
    </Box>
  );

  // Error State Rendering
  const renderError = () => (
    <Container maxWidth="sm" sx={{ textAlign: "center", py: 4 }}>
      <Stack spacing={3} alignItems="center">
        <RefreshOutlined
          sx={{
            fontSize: 50,
            color: "error.main",
            opacity: 0.7,
          }}
        />
        <Typography variant="h5" color="error">
          Error Loading Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error || "Unable to fetch order history"}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={fetchOrders}
          startIcon={<RefreshOutlined />}
        >
          Retry
        </Button>
      </Stack>
    </Container>
  );

  // Main Render Logic
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        margin: "auto",
        padding: 2,
      }}
    >
      {isLoading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : orders.length === 0 ? (
        renderNoOrders()
      ) : (
        // Existing Orders Table Rendering (Previous Implementation)
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(to right, #32B4DB, #156AEF)",
                }}
              >
                <TableCell></TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Transaction ID</TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Delivery Date</TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Payment Method</TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Status</TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Total Amount </TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Total Weight </TableCell>
                <TableCell sx={{ color: "#FFFFFF" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? orders.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : orders
              ).map((order) => (
                <React.Fragment key={order._id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleOrderExpansion(order._id)}
                      >
                        {expandedOrders[order._id] ? (
                          <KeyboardArrowDown />
                        ) : (
                          <KeyboardArrowRight />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{order.transactionId}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.totalPrice || "Nil"}</TableCell>
                    <TableCell>{order.totalWeight || "Nil"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          onClick={() => openDeleteConfirmation(order._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{
                        paddingBottom: 0,
                        paddingTop: 0,
                      }}
                    >
                      <Collapse
                        in={expandedOrders[order._id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 2 }}>
                          {order.items && order.items.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product Image</TableCell>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Weight</TableCell>
                                  <TableCell>Purity</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Quantity</TableCell>
                                  <TableCell>Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.items.map((item) => (
                                  <TableRow key={item._id}>
                                    <TableCell>
                                      <Avatar
                                        variant="rounded"
                                        alt={item.product.title}
                                        src={item.product.images[0].url}
                                        sx={{
                                          width: 60,
                                          height: 60,
                                          borderRadius: "10px",
                                          border: "none",
                                          boxShadow: "none",
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>{item.product?.title}</TableCell>
                                    <TableCell>
                                      {item.product?.weight}g
                                    </TableCell>
                                    <TableCell>
                                      {item.product?.purity}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={item.itemStatus}
                                        color={getStatusColor(item.itemStatus)}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.product.price}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              align="center"
                            >
                              No items in this order
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{backgroundColor: "#F3F4F6"}}
          />
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteOrderId}
        onClose={closeDeleteConfirmation}
        aria-labelledby="delete-order-dialog-title"
        aria-describedby="delete-order-dialog-description"
      >
        <DialogTitle id="delete-order-dialog-title">Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-order-dialog-description">
            Are you sure you want to delete this order? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteOrder} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;
