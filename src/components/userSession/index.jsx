import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axios";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import UserModal from "./UserModal";
const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3", // Adjusted to match the blue in the UI
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
        contained: {
          backgroundColor: "#2196f3",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

//Edit functionalities are commanded for Future use
//category manegement section
const CategoryManagement = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewCategory = (category) => {
    console.log(category);
    // navigate(`/user-spot-rate/${user.userSpotRateId}/user/${user._id}/product`);
    navigate(`/users-category?categoryId=${category._id}&userId=${category.createdBy}`)
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCategory(null);
  };

  const handleOpenDeleteModal = (category) => {
    setCategoryToDelete(category);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleAddOrEditCategory = (categoryData) => {
    if (editingCategory) {
      onEditCategory(editingCategory._id, categoryData);
    } else {
      onAddCategory(categoryData);
    }
    handleCloseModal();
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete._id);
    }
    handleCloseDeleteModal();
  };

  const columns = [
    { id: "Category Name", label: "Category Name", minWidth: 170 },
    { id: "Assigned Rates", label: "Assigned Rates", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100 },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <div className="flex gap-2">
        <Typography variant="h6" gutterBottom>
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ mb: 2 }}
        >
          Add Category
        </Button>
      </div>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className="font-bold text-gray-700"
                  sx={{
                    backgroundColor: "#f1f5f9",
                    fontWeight: "bold",
                    color: "#475569",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
                <TableRow hover key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewCategory(category)}
                      size="small"
                    >
                      SpotRate
                    </Button>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal(category)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDeleteModal(category)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={categories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <CategoryModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddOrEditCategory}
        category={editingCategory}
      />
      <DeleteCategoryModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCategory}
        categoryName={categoryToDelete?.name}
      />
    </Paper>
  );
};

const UserDataTable = ({
  userData,
  categories,
  onAddUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  console.log(userData)

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleViewCategory = (user) => {
    const spotRateId = user.userSpotRateId ?? "null";
    const userId = user._id;
    // console.log(user)
    navigate(`/user-spot-rate/${spotRateId}/user/${userId}/product`);
  };
  
  // `/users-category?categoryId=${user.categoryId}&userId=${user._id}`

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleAddOrEditUser = (userData) => {
    if (editingUser) {
      onEditUser(editingUser._id, userData);
    } else {
      onAddUser(userData);
    }
    handleCloseModal();
  };
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  const columns = [
    { id: "name", label: "Customer Name" },
    { id: "contact", label: "Contact" },
    { id: "email", label: "Email Id" },
    { id: "spotrate", label: "SpotRate" },
    { id: "address", label: "Address" },
    { id: "password", label: "Password" },
    { id: "actions", label: "Actions" },
  ];

  return (
    <Paper elevation={0} sx={{ width: "100%", overflow: "hidden" }}>
      <div className="flex  mb-4 px-4 pt-4 gap-3">
        <Typography variant="h5" className="font-bold">
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Add Customer
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className="font-bold text-gray-700"
                  sx={{
                    backgroundColor: "#f1f5f9",
                    fontWeight: "bold",
                    color: "#475569",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {userData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => handleViewProfile(user._id)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-2 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <PersonIcon fontSize="small" />
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                        {user.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      className="text-blue-500 border-blue-500"
                      onClick={() => handleViewCategory(user)}
                    >
                      User Spotrate
                    </Button>
                  </TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.decryptedPassword}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(user)}
                        className="text-blue-500 mr-2"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteUser(user._id)}
                        className="text-red-500"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={userData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="mt-2"
      />
      <UserModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddOrEditUser}
        user={editingUser}
        categories={categories}
      />
    </Paper>
  );
};

const UserList = () => {
  const userName = localStorage.getItem("userName") || "test5";
  const [userData, setUserData] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userName) return;
      try {
        const response = await axiosInstance.get(`/data/${userName}`);
        setAdminId(response.data.data._id);
      } catch (err) {
        console.error("Failed to fetch user data: " + err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchUserData();
      fetchCategories();
    }
  }, [adminId]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(`/get-users/${adminId}`);
      if (response.data.success) {
        setUserData(response.data.users);
        // console.log(response.data.users, adminId)
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`/getCategories/${adminId}`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      const response = await axiosInstance.post(
        `/addCategory/${adminId}`,
        categoryData
      );
      if (response.data.success) {
        setCategories([...categories, response.data.category]);
        setShowNotification(true);
        setNotificationMessage("Category added successfully");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async (categoryId, categoryData) => {
    try {
      const response = await axiosInstance.put(
        `/editCategory/${categoryId}/${adminId}`,
        categoryData
      );
      if (response.data.success) {
        setCategories(
          categories.map((cat) =>
            cat._id === categoryId ? response.data.category : cat
          )
        );
        setShowNotification(true);
        setNotificationMessage("Category updated successfully");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.delete(
        `/deleteCategory/${categoryId}/${adminId}`
      );
      if (response.data.success) {
        setCategories(categories.filter((cat) => cat._id !== categoryId));
        setShowNotification(true);
        setNotificationMessage("Category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const newUser = {
        name: userData.name,
        email: userData.email, // Added email field
        contact: userData.contact,
        address: userData.address,
        categoryId: userData.categoryId,
        password: userData.password,
      };

      const response = await axiosInstance.post(
        `/add-users/${adminId}`,
        newUser
      );
      if (response.data.success) {
        setUserData((prevUserData) => [...prevUserData, response.data.user]);
        setShowNotification(true);
        await fetchUserData();
        setNotificationMessage("User added successfully");
        await fetchUserData(); // Refresh the user list after adding
      }
    } catch (error) {
      console.error(
        "Error adding user:",
        error.response?.data || error.message
      );
      setShowNotification(true);
      setNotificationMessage(
        "Error adding user: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEditUser = async (userId, updatedUserData) => {
    try {
      const response = await axiosInstance.put(
        `/edit-users/${userId}/${adminId}`,
        updatedUserData
      );
      if (response.data.success) {
        setUserData((prevUserData) =>
          prevUserData.map((user) =>
            user._id === userId ? { ...user, ...response.data.user } : user
          )
        );
        setShowNotification(true);
        await fetchUserData();
        setNotificationMessage("User updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setShowNotification(true);
      setNotificationMessage(
        "Error updating user: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleOpenDeleteModal = (userId) => {
    setUserToDelete(userId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        const response = await axiosInstance.delete(
          `/delete-users/${userToDelete}/${adminId}`
        );
        if (response.data.success) {
          setUserData(userData.filter((user) => user._id !== userToDelete));
          setShowNotification(true);
          await fetchUserData();
          setNotificationMessage("User deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
    handleCloseDeleteModal();
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", py: 4 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CategoryManagement
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </Grid>
            <Grid item xs={12}>
              <UserDataTable
                userData={userData}
                categories={categories}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleOpenDeleteModal}
              />
            </Grid>
          </Grid>
        </Container>

        <Snackbar
          open={showNotification}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={
              notificationMessage.toLowerCase().includes("error")
                ? "error"
                : "success"
            }
            sx={{ width: "100%" }}
          >
            {notificationMessage}
          </Alert>
        </Snackbar>

        <Dialog
          open={openDeleteModal}
          onClose={(event, reason) => {
            if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
              handleCloseDeleteModal();
            }
          }}
          maxWidth="xs"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button
              onClick={handleDeleteUser}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default UserList;
