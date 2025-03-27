import React from "react";
import { GuideBox, Typography, TextField } from "@midasit-dev/moaui";

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
  textFieldWidth = 120,
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
        height="100%"
        width={textFieldWidth}
      />
    </GuideBox>
  );
};

export default CustomTextField;
