import React, { useReducer, useEffect, useCallback, useMemo } from "react";
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
  Chip,
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
  userSpotRateId: "",
  spotRates: { goldBidSpread: 0, goldAskSpread: 0 },
  modal: {
    isOpen: false,
    product: null,
    markingChargeValue: "",
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
    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
        filteredProducts: action.payload,
      };
    case "SET_ASSIGNED_PRODUCTS":
      return {
        ...state,
        assignedProducts: action.payload.products,
        filteredAssignedProducts: action.payload.products,
        userSpotRateId: action.payload.userSpotRateId || state.userSpotRateId,
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
          p._id === action.payload ? { ...p, isSelected: !p.isSelected } : p
        ),
        filteredAssignedProducts: state.filteredAssignedProducts.map((p) =>
          p._id === action.payload ? { ...p, isSelected: !p.isSelected } : p
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
          markingChargeValue: action.payload.markingChargeValue || "",
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
      return {
        ...state,
        deleteModal: { isOpen: true, product: action.payload },
      };
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
      return {
        ...state,
        notification: { ...state.notification, isOpen: false },
      };
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
  const { userId } = useParams();
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

  // Fetch All Products and Assigned Products
  const fetchData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const adminId =
        localStorage.getItem("adminId") || "67c1a8978399ea3181f5cad9";
      const [productsResponse, assignedResponse] = await Promise.all([
        axiosInstance.get(`/get-all-product/${adminId}`),
        axiosInstance.get(`/user-spot-rates/${userId}`),
      ]);

      if (productsResponse.data.success) {
        const productsWithSelection = productsResponse.data.data.map(
          (product) => ({
            ...product,
            isSelected: false,
          })
        );
        dispatch({ type: "SET_PRODUCTS", payload: productsWithSelection });
      }

      if (
        assignedResponse.data.success &&
        assignedResponse.data.userSpotRates.length > 0
      ) {
        const userSpotRate = assignedResponse.data.userSpotRates[0];
        const userProducts = userSpotRate.products.map(
          (productAssociation) => ({
            ...productAssociation,
            associationId: productAssociation._id,
            _id: productAssociation.product._id,
            productDetails: productAssociation.product,
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
        dispatch({
          type: "SET_ASSIGNED_PRODUCTS",
          payload: { products: userProducts, userSpotRateId: userSpotRate._id },
        });
      } else {
        dispatch({
          type: "SET_ASSIGNED_PRODUCTS",
          payload: { products: [], userSpotRateId: state.userSpotRateId },
        });
      }
    } catch (error) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: error.message || "Failed to fetch data",
          severity: "error",
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [userId, state.userSpotRateId]);

  // Price Calculation
  const calculatePurityPower = useCallback((purityInput) => {
    if (!purityInput || isNaN(purityInput)) return 1;
    return purityInput / Math.pow(10, purityInput.toString().length);
  }, []);

  // Total Stock Count
  const totalStockCount = useMemo(() => {
    const currentProducts =
      state.tabValue === 0
        ? state.filteredProducts
        : state.filteredAssignedProducts;
    return currentProducts.filter((product) => product.stock === true).length;
  }, [state.tabValue, state.filteredProducts, state.filteredAssignedProducts]);

  // Live Price Calculation
  const priceCalculation = useCallback(
    (product) => {
      if (!product || !marketData?.bid || !product.purity || !product.weight)
        return 0;

      const troyOunceToGram = 31.103;
      const conversionFactor = 3.674;
      let biddingPrice =
        marketData.bid +
        (state.spotRates.goldBidSpread || 0) +
        (state.spotRates.goldAskSpread || 0) +
        0.5;
      let adjustedBid = biddingPrice;

      if (
        product.premiumDiscountValue !== undefined &&
        product.premiumDiscountValue !== null
      ) {
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
        (product.markingChargeValue || 0);

      // console.log("..........................................................");
      // console.log("Asking Price : ", biddingPrice);
      // console.log("Premium/Discount : ", product.premiumDiscountValue);
      // console.log("Asking Price with Premium/Discount : ", adjustedBid);
      // console.log("1 Gram USD : ", adjustedBid / troyOunceToGram);
      // console.log("1 Gram AED : ", pricePerGram * 3.674);
      // console.log("Weight : ", product.weight);
      // console.log("Purity : ", calculatePurityPower(product.purity));
      // console.log("Price With Weight and purity : ", finalPrice);
      // console.log("Making Charge : ", product.makingChargeValue);
      // console.log("Price With Making Charge : ",(finalPrice + product.makingChargeValue));
      // console.log("..........................................................");

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
        payload: {
          message: "Please select Premium/Discount type",
          severity: "error",
        },
      });
      return;
    }

    if (!state.userSpotRateId) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: { message: "User spot rate ID not found", severity: "error" },
      });
      return;
    }

    try {
      const valueToSend =
        state.modal.premiumDiscountType === "discount"
          ? -parseFloat(state.modal.premiumDiscountValue || 0)
          : parseFloat(state.modal.premiumDiscountValue || 0);

      const requestBody = {
        markingCharge: parseFloat(state.modal.markingChargeValue) || 0,
        pricingType:
          state.modal.premiumDiscountType.charAt(0).toUpperCase() +
          state.modal.premiumDiscountType.slice(1),
        value: valueToSend,
        isActive: true,
      };

      const response = await axiosInstance.put(
        `/user-spot-rate/${state.userSpotRateId}/products/${state.modal.product.associationId}`,
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        await fetchData();
        handleCloseModal();
        dispatch({
          type: "SHOW_NOTIFICATION",
          payload: { message: "Product charges updated successfully" },
        });
      } else {
        throw new Error(
          responseIFrame.setAttribute(
            "src",
            response.data.message || "Failed to update product charges"
          )
        );
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
  }, [state.userSpotRateId, state.modal, fetchData, handleCloseModal]);

  const handleSaveProductCharges = useCallback(async () => {
    if (!state.modal.premiumDiscountType) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: "Please select Premium/Discount type",
          severity: "error",
        },
      });
      return;
    }

    try {
      const valueToSend =
        state.modal.premiumDiscountType === "discount"
          ? -parseFloat(state.modal.premiumDiscountValue || 0)
          : parseFloat(state.modal.premiumDiscountValue || 0);

      const requestBody = {
        productId: state.modal.product._id,
        markingCharge: parseFloat(state.modal.markingChargeValue) || 0,
        pricingType:
          state.modal.premiumDiscountType.charAt(0).toUpperCase() +
          state.modal.premiumDiscountType.slice(1),
        value: valueToSend,
        isActive: true,
      };

      const spotRateIdParam = state.userSpotRateId || "null";
      const response = await axiosInstance.patch(
        `/user-spot-rate/${spotRateIdParam}/user/${userId}/product`,
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        if (response.data.userSpotRate && !state.userSpotRateId) {
          dispatch({
            type: "SET_ASSIGNED_PRODUCTS",
            payload: {
              products: state.assignedProducts,
              userSpotRateId: response.data.userSpotRate._id,
            },
          });
        }
        await fetchData();
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
  }, [state.modal, state.userSpotRateId, userId, fetchData, handleCloseModal]);

  const handleDeleteProductSpotRate = useCallback(async () => {
    if (!state.deleteModal.product || !state.userSpotRateId) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        payload: {
          message: "Invalid product or user spot rate ID",
          severity: "error",
        },
      });
      return;
    }

    try {
      const response = await axiosInstance.delete(
        `/user-spot-rate/${state.userSpotRateId}/products/${state.deleteModal.product.associationId}`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        await fetchData();
        handleCloseDeleteModal();
        dispatch({
          type: "SHOW_NOTIFICATION",
          payload: { message: "Product spot rate removed successfully" },
        });
      } else {
        throw new Error(
          response.data.message || "Failed to remove product spot rate"
        );
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
  }, [
    state.userSpotRateId,
    state.deleteModal,
    fetchData,
    handleCloseDeleteModal,
  ]);

  const handleCloseNotification = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    dispatch({ type: "HIDE_NOTIFICATION" });
  }, []);

  // Lifecycle
  useEffect(() => {
    fetchData();
    fetchSpotRates();
  }, [fetchData, fetchSpotRates]);

  // Pagination Logic
  const paginatedProducts = useMemo(() => {
    const currentProducts =
      state.tabValue === 0
        ? state.filteredProducts
        : state.filteredAssignedProducts;
    return currentProducts.slice(
      (state.page - 1) * productsPerPage,
      state.page * productsPerPage
    );
  }, [
    state.tabValue,
    state.filteredProducts,
    state.filteredAssignedProducts,
    state.page,
  ]);

  const totalPages = useMemo(
    () =>
      Math.ceil(
        (state.tabValue === 0
          ? state.filteredProducts.length
          : state.filteredAssignedProducts.length) / productsPerPage
      ),
    [
      state.tabValue,
      state.filteredProducts.length,
      state.filteredAssignedProducts.length,
    ]
  );

  // Render
  if (state.loading) {
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
            <Tab
              label={`Assigned Products (${state.assignedProducts.length})`}
            />
          </StyledTabs>
        </Box>

        <Box className="flex flex-row justify-between">
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

          {/* Total Stock Count */}
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 3, fontWeight: "600" }}
          >
            Total Products In Stock: <strong>{totalStockCount}</strong>
          </Typography>
        </Box>

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
                    <TableCell align="right">Marking Charge</TableCell>
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
                          src={
                            (product.images && product.images[0]?.url) ||
                            "/placeholder-image.png"
                          }
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
                          <Chip
                            label={product.stock ? "In Stock" : "Out of Stock"}
                            color={product.stock ? "success" : "error"}
                            size="small"
                            variant="outlined"
                          />
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
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "16px", fontWeight: "bold" }}
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
                      {state.tabValue === 1 && (
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
                          {state.tabValue === 0
                            ? "Add Charges"
                            : "Edit Charges"}
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
                  <TableCell
                    colSpan={state.tabValue === 0 ? 6 : 8}
                    align="center"
                  >
                    <Typography variant="subtitle1" py={4}>
                      {state.tabValue === 0
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
              page={state.page}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}

        {/* Product Detail Modal */}
        <Modal
          open={state.modal.isOpen}
          onClose={handleCloseModal}
          aria-labelledby="product-modal-title"
        >
          <ModalContent>
            {state.modal.product && (
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
                      (state.modal.product.images &&
                        state.modal.product.images[0]?.url) ||
                      "/placeholder-image.png"
                    }
                    alt={state.modal.product.title}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {state.modal.product.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Price:{" "}
                      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                        AED {priceCalculation(state.modal.product)}
                      </span>
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Weight:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {state.modal.product.weight} g
                      </span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Purity:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            state.modal.product.purity >= 90
                              ? "#2e7d32"
                              : "inherit",
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
                      value={state.modal.markingChargeValue}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_MODAL_FIELD",
                          field: "markingChargeValue",
                          value: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
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
                  {state.tabValue === 0 ? (
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
          open={state.deleteModal.isOpen}
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
              <strong>{state.deleteModal.product?.title}</strong>? This action
              cannot be undone.
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
