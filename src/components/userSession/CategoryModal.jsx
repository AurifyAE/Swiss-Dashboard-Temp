import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
  
  const initialFormState = {
    name: "",
  };
  
  const CategoryModal = ({ open, onClose, onSubmit, category }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      if (category) {
        setFormData(category);
      } else {
        setFormData(initialFormState);
      }
    }, [category, open]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };
  
    const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        onSubmit(formData);
        if (!category) {
          // Reset form only when adding a new category
          setFormData(initialFormState);
          setErrors({});
        }
      }
    };
  
    return (
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            onClose();
          }
        }}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {category ? "Update Category" : "Add Category"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };
  
  export default CategoryModal;
  