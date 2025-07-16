/**
 * @fileoverview 커스텀 텍스트 필드 컴포넌트
 */

import React from "react";
import { Typography } from "@midasit-dev/moaui";
import { TextField } from "@mui/material";
import { CustomBox } from ".";

interface CustomTextFieldProps {
  width?: number | string;
  height?: number | string;
  textFieldWidth?: number;
  label?: string;
  variant?: "body1" | "body2" | "body3" | "h1";
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  hideBorder?: boolean;
  textAlign?: "left" | "center" | "right";
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  width = "100%",
  height = "auto",
  textFieldWidth = "100%",
  label = "",
  variant = "body1",
  value = "",
  onChange,
  onBlur,
  placeholder = "",
  disabled = false,
  hideBorder = false,
  textAlign = "left",
}) => {
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
      {label && <Typography variant={variant}>{label}</Typography>}
      <TextField
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        sx={{
          height: "100%",
          width: textFieldWidth,
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

export default CustomTextField;
