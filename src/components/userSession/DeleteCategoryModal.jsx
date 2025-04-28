import { Warning as WarningIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

const DeleteCategoryModal = ({ open, onClose, onConfirm, categoryName }) => {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onClose();
        }
      }}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        style: {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WarningIcon color="error" style={{ marginRight: "8px" }} />
          <Typography variant="h6">Confirm Deletion</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the category{" "}
          <strong>"{categoryName}"</strong>?
          <br />
          <Typography color="error" style={{ marginTop: "8px" }}>
            This action cannot be undone.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<WarningIcon />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryModal;
