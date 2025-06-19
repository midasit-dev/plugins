import React from "react";
import { SnackbarContent, CustomContentProps, closeSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningOutlinedIcon from "@mui/icons-material/WarningOutlined";

const NOTIFICATION_ICONS = {
  success: CheckCircleOutlineIcon,
  error: ErrorOutlineIcon,
  info: InfoOutlinedIcon,
  warning: WarningOutlinedIcon,
};

const NOTIFICATION_CONFIG = {
  success: {
    backgroundColor: "#EFFFEF",
    color: "#06C406",
  },
  error: {
    backgroundColor: "#FFECEA",
    color: "#FF5C4E",
  },
  info: {
    backgroundColor: "#E6F7FF",
    color: "#0099FF",
  },
  warning: {
    backgroundColor: "#FFF3CD",
    color: "#FFAA00",
  },
};

const ICON_STYLE = {
  width: "16px",
  height: "16px",
  padding: "2px",
};

const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>(
  ({ id, message, variant = "default" }, ref) => {
    const IconComponent =
      NOTIFICATION_ICONS[variant as keyof typeof NOTIFICATION_ICONS];
    const config =
      NOTIFICATION_CONFIG[variant as keyof typeof NOTIFICATION_CONFIG];

    return (
      <SnackbarContent ref={ref}>
        <div
          style={{
            backgroundColor: config.backgroundColor,
            color: config.color,
            border: `1px solid ${config.color}`,
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: "150px",
            maxWidth: "300px",
            width: "100%",
            margin: "0 12px",
          }}
        >
          <IconComponent style={{ ...ICON_STYLE, color: config.color }} />
          <span
            style={{
              color: config.color,
              fontSize: "12px",
              fontWeight: "400",
              fontStyle: "normal",
              fontFamily: "Pretendard",
              lineHeight: "18px",
              letterSpacing: "-0.24px",
              width: "100%",
              margin: "0 12px",
            }}
          >
            {message}
          </span>
          <IconButton
            onClick={() => closeSnackbar(id)}
            style={{ color: config.color, width: "16px", height: "16px" }}
          >
            <CloseIcon style={ICON_STYLE} />
          </IconButton>
        </div>
      </SnackbarContent>
    );
  }
);

export default CustomSnackbar;
