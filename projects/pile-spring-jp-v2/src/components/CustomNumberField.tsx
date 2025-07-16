/**
 * @fileoverview 커스텀 숫자 필드 컴포넌트
 */

import React from "react";
import { Typography, TextField } from "@mui/material";
import { CustomBox } from ".";

interface NumberOptions {
  min?: number;
  max?: number;
  step?: number;
  onlyInteger?: boolean;
  condition?: {
    min?: "greater" | "greaterEqual";
    max?: "less" | "lessEqual";
  };
}

interface CustomNumberFieldProps {
  width?: number | string;
  height?: number | string;
  numberFieldWidth?: number;
  label?: string;
  variant?: "body1" | "body2" | "h1";
  value?: string;
  onFocus?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  numberOptions?: NumberOptions;
  labelColor?: string;
  hideBorder?: boolean;
  textAlign?: "left" | "center" | "right";
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  width = "100%",
  height = "auto",
  numberFieldWidth = 120,
  label = "",
  variant = "body1",
  value = "",
  onFocus,
  onChange,
  onBlur,
  placeholder = "",
  disabled = false,
  numberOptions,
  labelColor = "inherit",
  hideBorder = false,
  textAlign = "left",
}) => {
  const { min, max, step } = numberOptions || {};

  return (
    <CustomBox
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: width,
        height: height,
        paddingLeft: label ? 4 : 0,
      }}
    >
      {label && (
        <Typography variant={variant} color={labelColor}>
          {label}
        </Typography>
      )}
      <TextField
        type="number"
        value={value}
        onFocus={onFocus}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        inputProps={{
          min,
          max,
          step,
        }}
        sx={{
          width: numberFieldWidth,
          "& .MuiInputBase-input": {
            padding: 0,
            fontFamily: "Pretendard",
            fontSize: "12px",
            textAlign: textAlign,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          "& .MuiInputBase-root": {
            height: "28px",
            padding: "0.375rem 0.375rem 0.375rem 0.625rem",
            ...(hideBorder && {
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "1px solid rgba(0, 0, 0, 0.23)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "2px solid #1976d2",
              },
            }),
          },
        }}
      />
    </CustomBox>
  );
};

export default CustomNumberField;
