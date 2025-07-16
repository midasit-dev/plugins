import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  width?: string | number;
  actions?: React.ReactNode;
  disableBackdropClick?: boolean;
}

interface StyledDialogProps {
  dialogWidth?: string | number;
}

const StyledDialog = styled(Dialog)<StyledDialogProps>(
  ({ theme, dialogWidth }) => ({
    "& .MuiDialog-paper": {
      width: dialogWidth || "600px",
      maxHeight: "90vh",
    },
    "& .MuiDialogContent-root": {
      padding: "10px",
      borderBottom: "none",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    "& .MuiDialogActions-root": {
      padding: theme.spacing(1),
    },
  })
);

const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  onClose,
  title,
  children,
  width = "600px",
  actions,
  disableBackdropClick = false,
}) => {
  const handleClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (disableBackdropClick && reason === "backdropClick") {
      return;
    }
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} dialogWidth={width}>
      {title && (
        <DialogTitle
          sx={{
            height: "40px",
            backgroundColor: "#E6E6E6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ErrorOutlineIcon sx={{ width: "16px", height: "16px" }} />
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "Pretendard",
              }}
            >
              {title}
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              width: "20px",
              height: "20px",
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon sx={{ width: "16px", height: "16px" }} />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </StyledDialog>
  );
};

export default CustomDialog;
