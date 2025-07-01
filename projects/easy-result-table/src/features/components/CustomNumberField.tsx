/**
 * @fileoverview
 * 커스텀 숫자 입력 필드 컴포넌트.
 * Material-UI의 TextField를 기반으로 숫자 입력에 특화된 기능을 제공합니다.
 * 최소/최대값, 스텝, 정수 제한 등의 숫자 관련 옵션을 지원하며,
 * MIDAS IT의 디자인 시스템에 맞게 스타일링되어 있습니다.
 */

import React from "react";
import { Typography, TextField } from "@mui/material";
import { GuideBox } from "@midasit-dev/moaui";

// 숫자 입력 필드의 제한 옵션 인터페이스
interface NumberOptions {
  min?: number; // 최소값
  max?: number; // 최대값
  step?: number; // 증감 단위
  onlyInteger?: boolean; // 정수만 입력 가능 여부
  condition?: {
    // 값 범위 조건
    min?: "greater" | "greaterEqual"; // 최소값 포함/미포함
    max?: "less" | "lessEqual"; // 최대값 포함/미포함
  };
}

// 컴포넌트 Props 인터페이스
interface CustomNumberFieldProps {
  width?: number | string; // 전체 컴포넌트의 너비
  height?: number | string; // 전체 컴포넌트의 높이
  numberFieldWidth?: number; // 숫자 입력 필드의 너비
  label?: string; // 레이블 텍스트
  variant?: "body1" | "body2" | "h1"; // 레이블 타이포그래피 변형
  value?: string; // 입력 필드 값
  onFocus?: () => void; // 포커스 이벤트 핸들러
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // 값 변경 핸들러
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // 블러 이벤트 핸들러
  placeholder?: string; // 플레이스홀더 텍스트
  disabled?: boolean; // 비활성화 상태
  numberOptions?: NumberOptions; // 숫자 입력 제한 옵션
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
}) => {
  // 숫자 입력 제한 옵션 추출
  const { min, max, step } = numberOptions || {};

  return (
    <GuideBox width={width} height={height} row verCenter horSpaceBetween>
      {label && <Typography variant={variant}>{label}</Typography>}
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

export default CustomNumberField;
