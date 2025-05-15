import React from "react";
import { Checkbox, CheckboxProps, styled } from "@mui/material";

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  "& .MuiSvgIcon-root": {
    width: 16,
    height: 16,
  },

  color: "#999999",

  "&.Mui-checked": {
    color: "#343A3F",
  },

  "&.Mui-disabled": {
    color: "#e0e0e0",
  },

  "&.Mui-indeterminate": {
    color: "#343A3F",
  },

  "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium[data-testid='IndeterminateCheckBoxIcon']":
    {
      color: "#343A3F",
    },

  "& .MuiSvgIcon-root.MuiSvgIcon-fontSizeSmall[data-testid='IndeterminateCheckBoxIcon']":
    {
      color: "#343A3F",
    },

  "&:hover": {
    backgroundColor: "rgba(0, 120, 212, 0.04)",
  },

  "& .MuiTouchRipple-root": {
    color: "rgba(0, 120, 212, 0.2)",
  },
}));

const CustomCheckBox = (props: CheckboxProps) => {
  return <StyledCheckbox {...props} />;
};

export default CustomCheckBox;
