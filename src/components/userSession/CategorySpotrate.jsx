import React, { useReducer, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axiosInstance from "../../axios/axios";
import useMarketData from "../../components/MarketData";
import debounce from "lodash/debounce";

// Styled Components
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: "linear-gradient(to right, #32B4DB, #156AEF)",
  "& .MuiTableCell-root": {
    color: "white",
    fontWeight: "bold",
    textTransform: "uppercase",
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

// State Management with useReducer
const initialState = {
  products: [],
  filteredProducts: [],
  assignedProducts: [],
  filteredAssignedProducts: [],
  loading: false,
  searchTerm: "",
  page: 1,
  selectedProductIds: [],
  tabValue: 0,
  categoryData: null,
  spotRates: { goldBidSpread: 0, goldAskSpread: 0 },
  modal: {
    isOpen: false,
    product: null,
    makingChargeValue: "",
    premiumDiscountType: "premium",
    premiumDiscountValue: "",
  },
  deleteModal: {
    isOpen: false,
    product: null,
  },
  notification: {
    isOpen: false,
    message: "",
    severity: "success",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        products: action.payload.products,
        filteredProducts: action.payload.products,
        assignedProducts: action.payload.assignedProducts,
        filteredAssignedProducts: action.payload.assignedProducts,
        categoryData: action.payload.categoryData,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "TOGGLE_PRODUCT_SELECTION":
      return {
        ...state,
        filteredProducts: state.filteredProducts.map((p) =>
          p._id === action.payload
            ? { ...p, isSelected: !p.isSelected }
            : p
        ),
        filteredAssignedProducts: state.filteredAssignedProducts.map((p) =>
          p._id === action.payload
            ? { ...p, isSelected: !p.isSelected }
            : p
        ),
        selectedProductIds: state.selectedProductIds.includes(action.payload)
          ? state.selectedProductIds.filter((id) => id !== action.payload)
          : [...state.selectedProductIds, action.payload],
      };
    case "SET_TAB_VALUE":
      return { ...state, tabValue: action.payload, page: 1, searchTerm: "" };
    case "SET_SPOT_RATES":
      return { ...state, spotRates: action.payload };
    case "OPEN_MODAL":
      return {
        ...state,
        modal: {
          isOpen: true,
          product: action.payload,
          makingChargeValue: action.payload.makingChargeValue || "",
          premiumDiscountType: action.payload.premiumDiscountType || "premium",
          premiumDiscountValue: action.payload.premiumDiscountValue || "",
        },
      };
    case "CLOSE_MODAL":
      return { ...state, modal: initialState.modal };
    case "UPDATE_MODAL_FIELD":
      return {
        ...state,
        modal: { ...state.modal, [action.field]: action.value },
      };
    case "OPEN_DELETE_MODAL":
      return { ...state, deleteModal: { isOpen: true, product: action.payload } };
    case "CLOSE_DELETE_MODAL":
      return { ...state, deleteModal: initialState.deleteModal };
    case "SHOW_NOTIFICATION":
      return {
        ...state,
        notification: {
          isOpen: true,
          message: action.payload.message,
          severity: action.payload.severity || "success",
        },
      };
    case "HIDE_NOTIFICATION":
      return { ...state, notification: { ...state.notification, isOpen: false } };
    case "FILTER_PRODUCTS":
      return {
        ...state,
        filteredProducts: state.products.filter(
          (p) =>
            p.title.toLowerCase().includes(action.payload) ||
            p.price.toString().includes(action.payload) ||
            p.weight.toString().includes(action.payload)
        ),
        filteredAssignedProducts: state.assignedProducts.filter(
          (p) =>
            p.title.toLowerCase().includes(action.payload) ||
            p.price.toString().includes(action.payload) ||
            p.weight.toString().includes(action.payload)
        ),
      };
    default:
      return state;
  }
};

// Main Component
export default function ProductManagement() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "N/A";
  const userId = searchParams.get("userId") || "Unknown";
  const { marketData } = useMarketData(["GOLD"]);
  const productsPerPage = 6;

  // Fetch Spot Rates
  const fetchSpotRates = useCallback(async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await axiosInstance.get(`/spotrates/${adminId}`);
      dispatch({
        type: "SET_SPOT_RATES",
        payload: {
          goldBidSpread: response.data.goldBidSpread || 0,
          goldAskSpread: response.data.goldAskSpread || 0,
        },
      });
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Failed to load spot rates", severity: "error" },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Fetch Category Products
  const fetchCategoryProducts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const adminId = localStorage.getItem("adminId") || "67c1a8978399ea3181f5cad9";
      const [allProductsResponse, categoryResponse] = await Promise.all([
        axiosInstance.get(`/get-all-product/${adminId}`),
        axiosInstance.get(`/categories/${categoryId}`),
      ]);

      let allProducts = [];
      if (allProductsResponse.data.success) {
        allProducts = allProductsResponse.data.data.map((product) => ({
          ...product,
          isSelected: false,
        }));
      }

      if (categoryResponse.data.success) {
        const categoryData = categoryResponse.data.data;
        const categoryProducts = categoryData.products || [];
        const assignedProductsMap = new Map();
        categoryProducts.forEach((item) => {
          assignedProductsMap.set(item.productId, {
            _id: item._id,
            makingCharge: item.makingCharge,
            pricingType: item.pricingType,
            value: item.value,
            details: item.details,
          });
        });

        const productsWithCharges = allProducts.map((product) => {
          const assignedInfo = assignedProductsMap.get(product._id);
          return {
            ...product,
            categoryProductId: assignedInfo ? assignedInfo._id : null,
            makingChargeType: "markup",
            makingChargeValue: assignedInfo ? assignedInfo.makingCharge : null,
            premiumDiscountType: assignedInfo ? assignedInfo.pricingType.toLowerCase() : "premium",
            premiumDiscountValue: assignedInfo ? assignedInfo.value : null,
          };
        });

        const assigned = productsWithCharges.filter(
          (product) =>
            product.makingChargeValue !== null ||
            product.premiumDiscountValue !== null
        );

        dispatch({
          type: "SET_DATA",
          payload: {
            products: productsWithCharges,
            assignedProducts: assigned,
            categoryData,
          },
        });
      } else {
        throw new Error("Failed to fetch category products");
      }
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: error.message || "Failed to fetch category products",
          severity: "error",
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [categoryId]);

  // Price Calculation
  const calculatePurityPower = useCallback((purityInput) => {
    if (!purityInput || isNaN(purityInput)) return 1;
    return purityInput / Math.pow(10, purityInput.toString().length);
  }, []);

  const priceCalculation = useCallback(
    (product) => {
      if (!product || !marketData?.bid || !product.purity || !product.weight) return 0;

      const troyOunceToGram = 31.103;
      const conversionFactor = 3.674;
      let biddingPrice =
        marketData.bid +
        (state.spotRates.goldBidSpread || 0) +
        (state.spotRates.goldAskSpread || 0) +
        0.5;
      let adjustedBid = biddingPrice;

      if (product.premiumDiscountValue !== undefined && product.premiumDiscountValue !== null) {
        adjustedBid +=
          product.premiumDiscountType === "discount"
            ? -Math.abs(product.premiumDiscountValue)
            : product.premiumDiscountValue;
      }

      const pricePerGram = adjustedBid / troyOunceToGram;
      const finalPrice =
        pricePerGram *
        product.weight *
        calculatePurityPower(product.purity) *
        conversionFactor +
        (product.makingChargeValue || 0);

      return finalPrice.toFixed(0);
    },
    [marketData, state.spotRates, calculatePurityPower]
  );

  // Handlers
  const handleTabChange = useCallback((event, newValue) => {
    dispatch({ type: "SET_TAB_VALUE", payload: newValue });
  }, []);

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch({ type: "SET_SEARCH_TERM", payload: value });
        dispatch({ type: "FILTER_PRODUCTS", payload: value.toLowerCase() });
      }, 300),
    []
  );

  const handlePageChange = useCallback((event, value) => {
    dispatch({ type: "SET_PAGE", payload: value });
  }, []);

  const handleProductSelect = useCallback((productId) => {
    dispatch({ type: "TOGGLE_PRODUCT_SELECTION", payload: productId });
  }, []);

  const handleOpenModal = useCallback((product) => {
    dispatch({ type: "OPEN_MODAL", payload: product });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const handleOpenDeleteModal = useCallback((product) => {
    dispatch({ type: "OPEN_DELETE_MODAL", payload: product });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    dispatch({ type: "CLOSE_DELETE_MODAL" });
  }, []);

  const handleUpdateProductCharges = useCallback(async () => {
    if (!state.modal.premiumDiscountType) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Please select Premium/Discount type", severity: "error" },
      });
      return;
    }

    if (!categoryId || categoryId === "N/A") {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Category ID not found", severity: "error" },
      });
      return;
    }

    try {
      const requestBody = {
        markingCharge: parseFloat(state.modal.makingChargeValue) || 0,
        pricingType:
          state.modal.premiumDiscountType.charAt(0).toUpperCase() +
          state.modal.premiumDiscountType.slice(1),
        value: parseFloat(state.modal.premiumDiscountValue) || 0,
        isActive: true,
      };

      const response = await axiosInstance.patch(
        `/categories/${categoryId}/products/${state.modal.product.categoryProductId}`,
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        await fetchCategoryProducts();
        handleCloseModal();
        dispatch({
          type: "SHOW_NOTIFICATION",
          payload: { message: "Product charges updated successfully" },
        });
      } else {
        throw new Error(response.data.message || "Failed to update product charges");
      }
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: error.response?.data?.message || error.message,
          severity: "error",
        },
      });
    }
  }, [categoryId, state.modal, fetchCategoryProducts, handleCloseModal]);

  const handleSaveProductCharges = useCallback(async () => {
    const { makingChargeValue, premiumDiscountType, premiumDiscountValue } = state.modal;

    if (!makingChargeValue && makingChargeValue !== 0) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Making charge is required", severity: "error" },
      });
      return;
    }

    if (isNaN(parseFloat(makingChargeValue))) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Making charge must be a valid number", severity: "error" },
      });
      return;
    }

    if (!premiumDiscountType) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Please select Premium/Discount type", severity: "error" },
      });
      return;
    }

    if (!premiumDiscountValue && premiumDiscountValue !== 0) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Premium/Discount value is required", severity: "error" },
      });
      return;
    }

    if (isNaN(parseFloat(premiumDiscountValue))) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: "Premium/Discount value must be a valid number",
          severity: "error",
        },
      });
      return;
    }

    if (parseFloat(premiumDiscountValue) < 0) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: "Premium/Discount value cannot be negative",
          severity: "error",
        },
      });
      return;
    }

    try {
      const requestBody = {
        productId: state.modal.product._id,
        makingCharge: parseFloat(makingChargeValue) || 0,
        pricingType:
          premiumDiscountType.charAt(0).toUpperCase() + premiumDiscountType.slice(1),
        value: parseFloat(premiumDiscountValue) || 0,
        isActive: true,
      };

      const response = await axiosInstance.patch(
        `/products/${categoryId}`,
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        await fetchCategoryProducts();
        handleCloseModal();
        dispatch({
          type: "SHOW_NOTIFICATION",
          payload: { message: "Product charges updated successfully" },
        });
      }
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: error.response?.data?.message || error.message,
          severity: "error",
        },
      });
    }
  }, [state.modal, categoryId, fetchCategoryProducts, handleCloseModal]);

  const handleDeleteProductFromCategory = useCallback(async () => {
    if (!state.deleteModal.product || !state.deleteModal.product.categoryProductId) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "Invalid product or category product ID", severity: "error" },
      });
      return;
    }

    try {
      const response = await axiosInstance.delete(
        `/categories/${categoryId}/products/${state.deleteModal.product.categoryProductId}`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        await fetchCategoryProducts();
        handleCloseDeleteModal();
        dispatch({
          type: "SHOW_NOTIFICATION",
          payload: { message: "Product removed from category successfully" },
        });
      } else {
        throw new Error(response.data.message || "Failed to remove product from category");
      }
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: error.response?.data?.message || error.message,
          severity: "error",
        },
      });
    }
  }, [categoryId, state.deleteModal, fetchCategoryProducts, handleCloseDeleteModal]);

  const handleCloseNotification = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    dispatch({ type: "HIDE_NOTIFICATION" });
  }, []);

  // Lifecycle
  useEffect(() => {
    fetchCategoryProducts();
    fetchSpotRates();
  }, [fetchCategoryProducts, fetchSpotRates]);

  // Pagination Logic
  const paginatedProducts = useMemo(() => {
    const currentProducts =
      state.tabValue === 0 ? state.filteredProducts : state.filteredAssignedProducts;
    return currentProducts.slice(
      (state.page - 1) * productsPerPage,
      state.page * productsPerPage
    );
  }, [state.tabValue, state.filteredProducts, state.filteredAssignedProducts, state.page]);

  const totalPages = useMemo(
    () =>
      Math.ceil(
        (state.tabValue === 0
          ? state.filteredProducts.length
          : state.filteredAssignedProducts.length) / productsPerPage
      ),
    [state.tabValue, state.filteredProducts.length, state.filteredAssignedProducts.length]
  );

  // Render
  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <div className="px-10 h-[100vh]">
      <Box p={4}>
        {/* Category Title */}
        {state.categoryData && (
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Selected Category: {state.categoryData.name}
          </Typography>
        )}

        {/* Notification */}
        <Snackbar
          open={state.notification.isOpen}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={state.notification.severity}
            sx={{ width: "100%" }}
          >
            {state.notification.message}
          </Alert>
        </Snackbar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <StyledTabs
            value={state.tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="All Products" />
            <Tab label={`Assigned Products (${state.assignedProducts.length})`} />
          </StyledTabs>
        </Box>

        {/* Search Box */}
        <TextField
          placeholder="Search products..."
          value={state.searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
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
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
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
                {state.tabValue === 1 && (
                  <>
                    <TableCell align="right">Making Charge</TableCell>
                    <TableCell align="right">Premium/Discount</TableCell>
                  </>
                )}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const isAssigned = state.assignedProducts.some(
                    (assigned) => assigned._id === product._id
                  );

                  return (
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
                          src={product.images[0]?.url || "/placeholder-image.png"}
                          alt={product.title}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {product.title}
                          </Typography>
                          {isAssigned && state.tabValue === 0 && (
                            <CheckCircleIcon
                              color="success"
                              fontSize="small"
                              titleAccess="Assigned"
                            />
                          )}
                        </Box>
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
                        <Typography variant="body2" sx={{ fontSize: "16px", fontWeight: "bold" }}>
                          {product.weight} g
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: product.purity >= 90 ? "success.main" : "text.secondary",
                          }}
                        >
                          {product.purity}
                        </Typography>
                      </TableCell>
                      {state.tabValue === 1 && (
                        <>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" fontSize="16px">
                              {product.makingChargeValue !== null
                                ? `${parseFloat(product.makingChargeValue).toFixed(2)}`
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
                              {product.premiumDiscountValue !== null
                                ? `${
                                    product.premiumDiscountType === "premium" ? "+" : "-"
                                  }${parseFloat(product.premiumDiscountValue).toFixed(2)}`
                                : "N/A"}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
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
                            backgroundImage: "linear-gradient(to right, #E9FAFF, #EEF3F9)",
                          }}
                        >
                          {state.tabValue === 0 ? "Add Charges" : "Edit Charges"}
                        </Button>
                        {state.tabValue === 1 && (
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={state.tabValue === 0 ? 6 : 8} align="center">
                    <Typography variant="subtitle1" py={4}>
                      {state.tabValue === 0 ? "No products found" : "No assigned products found"}
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
              page={state.page}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}

        {/* Product Detail Modal */}
        <Modal open={state.modal.isOpen} onClose={handleCloseModal} aria-labelledby="product-modal-title">
          <ModalContent>
            {state.modal.product && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography id="product-modal-title" variant="h5" component="h2" fontWeight="bold">
                    Product Details
                  </Typography>
                  <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="row" gap={3} mb={3}>
                  <ProductModalImage
                    src={state.modal.product.images[0]?.url || "/placeholder-image.png"}
                    alt={state.modal.product.title}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {state.modal.product.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Price:{" "}
                      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                        AED {priceCalculation(state.modal.product)}
                      </span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Weight:{" "}
                      <span style={{ fontWeight: "bold" }}>{state.modal.product.weight} g</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Purity:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          color: state.modal.product.purity >= 90 ? "#2e7d32" : "inherit",
                        }}
                      >
                        {state.modal.product.purity}
                      </span>
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Set Charge Values
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Making Charge"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={state.modal.makingChargeValue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_MODAL_FIELD",
                          field: "makingChargeValue",
                          value: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                          "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                        },
                        "& input[type=number]": { "-moz-appearance": "textfield" },
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
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Premium/Discount Type</InputLabel>
                      <Select
                        value={state.modal.premiumDiscountType}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_MODAL_FIELD",
                            field: "premiumDiscountType",
                            value: e.target.value,
                          })
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
                      value={state.modal.premiumDiscountValue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_MODAL_FIELD",
                          field: "premiumDiscountValue",
                          value: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                          "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                        },
                        "& input[type=number]": { "-moz-appearance": "textfield" },
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
                  <Button variant="outlined" color="inherit" onClick={handleCloseModal} sx={{ mr: 2 }}>
                    Cancel
                  </Button>
                  {state.tabValue === 0 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProductCharges}
                      sx={{ background: "linear-gradient(to right, #4338ca, #3730a3)" }}
                    >
                      Apply Charges
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateProductCharges}
                      sx={{ background: "linear-gradient(to right, #4338ca, #3730a3)" }}
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
          open={state.deleteModal.isOpen}
          onClose={handleCloseDeleteModal}
          aria-labelledby="delete-modal-title"
        >
          <ModalContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography id="delete-modal-title" variant="h5" component="h2" fontWeight="bold">
                Confirm Deletion
              </Typography>
              <IconButton onClick={handleCloseDeleteModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" color="text.secondary" mb={3}>
              Are you sure you want to remove{" "}
              <strong>{state.deleteModal.product?.title}</strong> from the category? This
              action cannot be undone.
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
                onClick={handleDeleteProductFromCategory}
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