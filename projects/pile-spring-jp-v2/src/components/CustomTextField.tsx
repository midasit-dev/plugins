import React from "react";
import { GuideBox, Typography } from "@midasit-dev/moaui";
import { TextField } from "@mui/material";

interface CustomTextFieldProps {
  width?: number | string;
  height?: number | string;
  textFieldWidth?: number;
  label?: string;
  variant?: "body1" | "body2" | "body3" | "h1";
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  width = "100%",
  height = "auto",
  textFieldWidth = "100%",
  label = "",
  variant = "body1",
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
}) => {
  return (
    <GuideBox width={width} height={height} row verCenter horSpaceBetween>
      {label && <Typography variant={variant}>{label}</Typography>}
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        sx={{
          height: "100%",
          width: textFieldWidth,
          "& .MuiInputBase-input": {
            padding: 0,
            fontFamily: "Pretendard",
            fontSize: "12px",
          },
          "& .MuiInputBase-root": {
            height: "28px",
            padding: "0.375rem 0.375rem 0.375rem 0.625rem",
          },
        }}
      />
    </GuideBox>
  );
};

export default CustomTextField;
