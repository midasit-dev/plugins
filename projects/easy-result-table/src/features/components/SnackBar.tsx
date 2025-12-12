import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { SnackbarState } from "../hooks/useSnackbarMessage";

interface SnackBarProps {
  snackbar: SnackbarState;
  handleCloseSnackbar?: () => void;
}

const SnackBar = ({ snackbar, handleCloseSnackbar }: SnackBarProps) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBar;
