import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Button,
  Card,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Modal,
  IconButton,
  Grid,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  AddCircle as AddCircleIcon,
  LocalOffer as LocalOfferIcon,
  Percent as PercentIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axiosInstance from "../../axios/axios";
import useMarketData from "../../components/MarketData";

// Styled Components
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: "linear-gradient(to right, #32B4DB, #156AEF)",
  "& .MuiTableCell-root": {
    color: "white",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
}));

const GradientCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  borderRadius: 16,
  boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

const ProductImage = styled("img")({
  width: 45,
  height: 45,
  objectFit: "cover",
  borderRadius: 12,
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxWidth: "90%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(4),
}));

const ProductModalImage = styled("img")({
  width: 120,
  height: 120,
  objectFit: "cover",
  borderRadius: 12,
  marginBottom: 16,
  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiTab-root": {
    fontWeight: "bold",
    fontSize: "1rem",
    textTransform: "none",
    minWidth: 120,
    borderRadius: "20px 20px 0 0",
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      backgroundColor: "rgba(33, 150, 243, 0.08)",
    },
  },
  "& .MuiTabs-indicator": {
    height: 3,
    borderRadius: 1.5,
  },
}));

export default function ProductManagement() {
  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [filteredAssignedProducts, setFilteredAssignedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [userSpotRateId, setUserSpotRateId] = useState("");

  // Market Data
  const { marketData } = useMarketData(["GOLD"]);

  // Charge States
  const [markingChargeType, setMarkingChargeType] = useState("");
  const [markingChargeValue, setMarkingChargeValue] = useState("");
  const [premiumDiscountType, setPremiumDiscountType] = useState("");
  const [premiumDiscountValue, setPremiumDiscountValue] = useState("");

  // Product Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productMarkingChargeType, setProductMarkingChargeType] = useState("");
  const [productMarkingChargeValue, setProductMarkingChargeValue] =
    useState("");
  const [productPremiumDiscountType, setProductPremiumDiscountType] =
    useState("");
  const [productPremiumDiscountValue, setProductPremiumDiscountValue] =
    useState("");

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const { userId } = useParams();

  // Notification State
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination Configuration
  const productsPerPage = 6;

  // Tab Change Handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    setSearchTerm("");
  };

  // Fetch assigned products from user-spot-rates endpoint
  const fetchAssignedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user-spot-rates/${userId}`);

      if (response.data.success) {
        // Get the user spot rate ID for future updates
        if (response.data.userSpotRates.length > 0) {
          const userSpotRate = response.data.userSpotRates[0];
          setUserSpotRateId(userSpotRate._id);

          // Extract the products from the response
          const userProducts = userSpotRate.products.map(
            (productAssociation) => ({
              ...productAssociation,
              associationId: productAssociation._id, // The user-product association ID
              _id: productAssociation.product._id, // The actual product ID
              productDetails: productAssociation.product, // The full product object
              title: productAssociation.product.title,
              description: productAssociation.product.description,
              images: productAssociation.product.images,
              price: productAssociation.product.price,
              weight: productAssociation.product.weight,
              purity: productAssociation.product.purity,
              stock: productAssociation.product.stock,
              sku: productAssociation.product.sku,
              markingChargeValue: productAssociation.markingCharge,
              premiumDiscountType: productAssociation.pricingType.toLowerCase(),
              premiumDiscountValue: Math.abs(productAssociation.value),
              isSelected: false,
            })
          );

          setAssignedProducts(userProducts);
          setFilteredAssignedProducts(userProducts);
        } else {
          setAssignedProducts([]);
          setFilteredAssignedProducts([]);
        }
      } else {
        throw new Error("Failed to fetch assigned products");
      }
    } catch (error) {
      handleNotification(
        "Error fetching assigned products: " +
          (error.message || "Unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch All Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const adminId =
        localStorage.getItem("adminId") || "67c1a8978399ea3181f5cad9";
      const response = await axiosInstance.get(`/get-all-product/${adminId}`);

      if (response.data.success) {
        const productsWithSelection = response.data.data.map((product) => ({
          ...product,
          isSelected: false,
        }));

        setProducts(productsWithSelection);
        setFilteredProducts(productsWithSelection);

        // After fetching all products, fetch the assigned products
        await fetchAssignedProducts();
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      handleNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [fetchAssignedProducts]);

  // Modal Handlers for Product Details
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setProductMarkingChargeType("markup"); // Default value
    setProductMarkingChargeValue(product.markingChargeValue || "");
    setProductPremiumDiscountType(product.premiumDiscountType || "premium");
    setProductPremiumDiscountValue(product.premiumDiscountValue || "");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  // Modal Handlers for Delete Confirmation
  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Helper function to calculate purity power
  const calculatePurityPower = (purityInput) => {
    if (!purityInput || isNaN(purityInput)) return 1;
    return purityInput / Math.pow(10, purityInput.toString().length);
  };

  // Calculate Price
  const priceCalculation = (product) => {
    if (
      !product ||
      !marketData?.bid ||
      !product.purity ||
      !product.weight
    ) {
      return 0;
    }
  
    const troyOunceToGram = 31.103;
    const conversionFactor = 3.674;
  
    // Adjust bid price based on premiumDiscountValue
    let adjustedBid = marketData.bid;
    if (product.premiumDiscountValue !== undefined && product.premiumDiscountValue !== null) {
      if (product.premiumDiscountValue > 0) {
        adjustedBid += product.premiumDiscountValue;
      } else {
        adjustedBid -= Math.abs(product.premiumDiscountValue);
      }
    }
  
    // Calculate base price
    let price =
      (adjustedBid / troyOunceToGram) *
      conversionFactor *
      calculatePurityPower(product.purity) *
      product.weight;
  
    // Add markingCharge if available
    if (product.markingCharge) {
      price += product.markingCharge;
    }
  
    return price.toFixed(0);
  };
  
  // Update Product Charges
  const handleUpdateProductCharges = async () => {
    try {
      // Validation checks
      if (!productPremiumDiscountType) {
        handleNotification("Please select Premium/Discount type", "error");
        return;
      }

      if (!userSpotRateId) {
        handleNotification("User spot rate ID not found", "error");
        return;
      }

      // Calculate the actual value based on pricing type
      let valueToSend = parseFloat(productPremiumDiscountValue) || 0;
      if (productPremiumDiscountType === "discount") {
        valueToSend = -valueToSend; // Make it negative for discount
      }

      // Prepare the request body
      const requestBody = {
        markingCharge: parseFloat(productMarkingChargeValue) || 0,
        pricingType:
          productPremiumDiscountType.charAt(0).toUpperCase() +
          productPremiumDiscountType.slice(1), // Capitalize first letter
        value: valueToSend,
        isActive: true,
      };

      console.log("Update request body:", requestBody);

      // Make the PUT request to update the product charges
      const response = await axiosInstance.put(
        `/user-spot-rate/${userSpotRateId}/products/${selectedProduct.associationId}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Refresh the product lists after successful update
        fetchAssignedProducts();
        handleCloseModal();
        handleNotification("Product charges updated successfully");
      } else {
        throw new Error(
          response.data.message || "Failed to update product charges"
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      handleNotification(
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // Save Product Charges
  const handleSaveProductCharges = async () => {
    try {
      // Validation checks
      if (!productPremiumDiscountType) {
        handleNotification("Please select Premium/Discount type", "error");
        return;
      }

      // Calculate the actual value based on pricing type
      let valueToSend = parseFloat(productPremiumDiscountValue) || 0;
      if (productPremiumDiscountType === "discount") {
        valueToSend = -valueToSend; // Make it negative for discount
      }

      // Log the exact request for debugging
      const requestBody = {
        productId: selectedProduct._id,
        markingCharge: parseFloat(productMarkingChargeValue) || 0,
        pricingType:
          productPremiumDiscountType.charAt(0).toUpperCase() +
          productPremiumDiscountType.slice(1), // Capitalize first letter
        value: valueToSend,
        isActive: true,
      };

      console.log("Request body:", requestBody);

      // Use the userSpotRateId if available, otherwise create a new user spot rate
      let response;
      if (userSpotRateId) {
        response = await axiosInstance.patch(
          `/user-spot-rate/${userSpotRateId}/user/${userId}/product`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // If no userSpotRateId exists, create a new user spot rate
        response = await axiosInstance.post(
          `/user-spot-rates/${userId}/product`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // Save the new userSpotRateId
        if (response.data.success && response.data.userSpotRate) {
          setUserSpotRateId(response.data.userSpotRate._id);
        }
      }

      if (response.data.success) {
        // Refresh the product lists
        fetchProducts();
        fetchAssignedProducts();
        handleCloseModal();
        handleNotification("Product charges updated successfully");
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      handleNotification(
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // Function to handle spot rate deletion for products
  const handleDeleteProductSpotRate = async () => {
    try {
      if (!productToDelete || !userSpotRateId) {
        throw new Error("Invalid product or user spot rate ID");
      }

      // Make DELETE request to remove the product's spot rate
      const response = await axiosInstance.delete(
        `/user-spot-rate/${userSpotRateId}/products/${productToDelete.associationId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Refresh the product lists after successful deletion
        fetchAssignedProducts();
        handleCloseDeleteModal();
        handleNotification("Product spot rate removed successfully");
      } else {
        throw new Error(
          response.data.message || "Failed to remove product spot rate"
        );
      }
    } catch (error) {
      console.error("Delete spot rate error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      handleNotification(
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // Notification Handler
  const handleNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close Notification
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Search Handler
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setPage(1);

    if (tabValue === 0) {
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(value) ||
          product.price.toString().includes(value) ||
          product.weight.toString().includes(value)
      );
      setFilteredProducts(filtered);
    } else {
      const filtered = assignedProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(value) ||
          product.price.toString().includes(value) ||
          product.weight.toString().includes(value)
      );
      setFilteredAssignedProducts(filtered);
    }
  };

  // Pagination Handler
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Product Selection Handler
  const handleProductSelect = (productId) => {
    if (tabValue === 0) {
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, isSelected: !product.isSelected }
            : product
        )
      );
    } else {
      setFilteredAssignedProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, isSelected: !product.isSelected }
            : product
        )
      );
    }

    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((id) => id === productId);
      return existingIndex > -1
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
    });
  };

  // Lifecycle
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pagination Logic
  const getCurrentProducts = () => {
    const currentProducts =
      tabValue === 0 ? filteredProducts : filteredAssignedProducts;
    return currentProducts.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage
    );
  };

  const paginatedProducts = getCurrentProducts();

  // Total Pages
  const totalPages = Math.ceil(
    (tabValue === 0
      ? filteredProducts.length
      : filteredAssignedProducts.length) / productsPerPage
  );

  // Render Loading State
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <div className="px-10 h-[100vh]">
      <Box p={4}>
        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="All Products" />
            <Tab label={`Assigned Products (${assignedProducts.length})`} />
          </StyledTabs>
        </Box>

        {/* Search Box */}
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              height: "45px",
              borderRadius: "30px",
              border: "2px solid #2196f3",
              backgroundColor: "#fff",
              transition: "border-color 0.3s, box-shadow 0.3s",
              paddingLeft: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // Hide default border
              },
            },
          }}
        />

        {/* Product Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Weight</TableCell>
                <TableCell align="right">Purity</TableCell>
                {tabValue === 1 && (
                  <>
                    <TableCell align="right">Marking Charge</TableCell>
                    <TableCell align="right">Premium/Discount</TableCell>
                  </>
                )}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product._id}
                    hover
                    selected={product.isSelected}
                    onClick={() => handleOpenModal(product)}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "background-color 0.3s",
                      cursor: "pointer",
                    }}
                  >
                    <TableCell>
                      <ProductImage
                        src={
                          (product.images && product.images[0]?.url) ||
                          "/placeholder-image.png"
                        }
                        alt={product.title}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {product.title}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        fontWeight="bold"
                      >
                        AED {priceCalculation(product)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {product.weight} g
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color:
                            product.purity >= 90
                              ? "success.main"
                              : "text.secondary",
                        }}
                      >
                        {product.purity}
                      </Typography>
                    </TableCell>
                    {tabValue === 1 && (
                      <>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            fontSize="16px"
                          >
                            {product.markingChargeValue
                              ? `${parseFloat(
                                  product.markingChargeValue
                                ).toFixed(2)}`
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            fontSize="16px"
                            color={
                              product.premiumDiscountType === "discount"
                                ? "error.main"
                                : "success.main"
                            }
                          >
                            {product.premiumDiscountValue
                              ? `${
                                  product.premiumDiscountType === "premium"
                                    ? "+"
                                    : "-"
                                }${parseFloat(
                                  product.premiumDiscountValue
                                ).toFixed(2)}`
                              : "N/A"}
                          </Typography>
                        </TableCell>
                      </>
                    )}
                    <TableCell
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="subtitle1"
                        color="primary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(product);
                        }}
                        sx={{
                          borderRadius: "20px",
                          boxShadow: 2,
                          backgroundImage:
                            "linear-gradient(to right, #E9FAFF, #EEF3F9)",
                        }}
                      >
                        {tabValue === 0 ? "Add Charges" : "Edit Charges"}
                      </Button>
                      {tabValue === 1 && (
                        <Button
                          variant="contained"
                          color="error"
                          size="medium"
                          startIcon={<DeleteIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(product);
                          }}
                          sx={{
                            borderRadius: "20px",
                            boxShadow: 2,
                            marginLeft: "15px",
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tabValue === 0 ? 6 : 8} align="center">
                    <Typography variant="subtitle1" py={4}>
                      {tabValue === 0
                        ? "No products found"
                        : "No assigned products found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}

        {/* Product Detail Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="product-modal-title"
        >
          <ModalContent>
            {selectedProduct && (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    id="product-modal-title"
                    variant="h5"
                    component="h2"
                    fontWeight="bold"
                  >
                    Product Details
                  </Typography>
                  <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="row" gap={3} mb={3}>
                  <ProductModalImage
                    src={
                      (selectedProduct.images &&
                        selectedProduct.images[0]?.url) ||
                      "/placeholder-image.png"
                    }
                    alt={selectedProduct.title}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {selectedProduct.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Price:{" "}
                      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                        AED {priceCalculation(selectedProduct)}
                      </span>
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Weight:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {selectedProduct.weight} g
                      </span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Purity:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            selectedProduct.purity >= 90
                              ? "#2e7d32"
                              : "inherit",
                        }}
                      >
                        {selectedProduct.purity}
                      </span>
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Set Charge Values
                </Typography>

                <Grid container spacing={3}>
                  {/* Making Charge */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Making Charge"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={productMarkingChargeValue}
                      onChange={(e) =>
                        setProductMarkingChargeValue(e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                          },
                        },
                        "& input[type=number]": {
                          "-moz-appearance": "textfield",
                        },
                        "& input[type=number]::-webkit-outer-spin-button": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                        "& input[type=number]::-webkit-inner-spin-button": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                      }}
                    />
                  </Grid>

                  {/* Premium/Discount */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Premium/Discount Type</InputLabel>
                      <Select
                        value={productPremiumDiscountType}
                        onChange={(e) =>
                          setProductPremiumDiscountType(e.target.value)
                        }
                        label="Premium/Discount Type"
                      >
                        <MenuItem value="premium">Premium</MenuItem>
                        <MenuItem value="discount">Discount</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Premium/Discount Value"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={productPremiumDiscountValue}
                      onChange={(e) =>
                        setProductPremiumDiscountValue(e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                          },
                        },
                        "& input[type=number]": {
                          "-moz-appearance": "textfield",
                        },
                        "& input[type=number]::-webkit-outer-spin-button": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                        "& input[type=number]::-webkit-inner-spin-button": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" mt={4}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCloseModal}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  {tabValue === 0 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProductCharges}
                      sx={{
                        background:
                          "linear-gradient(to right, #4338ca, #3730a3)",
                      }}
                    >
                      Apply Charges
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateProductCharges}
                      sx={{
                        background:
                          "linear-gradient(to right, #4338ca, #3730a3)",
                      }}
                    >
                      Apply Charges
                    </Button>
                  )}
                </Box>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          aria-labelledby="delete-modal-title"
        >
          <ModalContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                id="delete-modal-title"
                variant="h5"
                component="h2"
                fontWeight="bold"
              >
                Confirm Deletion
              </Typography>
              <IconButton onClick={handleCloseDeleteModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" color="text.secondary" mb={3}>
              Are you sure you want to remove the spot rate configuration for{" "}
              <strong>{productToDelete?.title}</strong>? This action cannot be
              undone.
            </Typography>

            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCloseDeleteModal}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteProductSpotRate}
              >
                Confirm
              </Button>
            </Box>
          </ModalContent>
        </Modal>
      </Box>
    </div>
  );
}
