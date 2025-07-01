/**
 * @fileoverview
 * 커스텀 텍스트 필드 컴포넌트.
 * Material-UI의 TextField를 기반으로 MIDAS IT의 디자인 시스템에 맞게
 * 커스터마이징된 텍스트 입력 컴포넌트입니다. GuideBox를 사용하여
 * 레이블과 입력 필드를 함께 표시합니다.
 */

import React from "react";
import { GuideBox, Typography } from "@midasit-dev/moaui";
import { TextField } from "@mui/material";

// 컴포넌트 Props 인터페이스
interface CustomTextFieldProps {
  width?: number | string; // 전체 컴포넌트의 너비
  height?: number | string; // 전체 컴포넌트의 높이
  textFieldWidth?: number; // 입력 필드의 너비
  label?: string; // 레이블 텍스트
  variant?: "body1" | "body2" | "body3" | "h1"; // 레이블 타이포그래피 변형
  value?: string; // 입력 필드 값
  onChange?: (e: any) => void; // 값 변경 핸들러
  placeholder?: string; // 플레이스홀더 텍스트
  disabled?: boolean; // 비활성화 상태
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
          // MIDAS IT 디자인 시스템에 맞는 스타일 적용
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
