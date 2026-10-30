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

  // 입력 중인 문자열을 그대로 보관한다.
  // 부모 상태는 숫자이므로 "-" 나 "" (Delete로 지운 상태) 같은 중간 입력을 표현할 수 없고,
  // value prop을 그대로 바인딩하면 React가 즉시 이전 값으로 되돌려 음수 입력/삭제가 불가능했다.
  const [draft, setDraft] = React.useState<string>(value);
  const isFocusedRef = React.useRef(false);

  // 외부에서 값이 바뀐 경우(파일 읽기, 행 선택 등)에는 표시값을 동기화. 입력 중에는 건드리지 않음
  React.useEffect(() => {
    if (!isFocusedRef.current) setDraft(value);
  }, [value]);

  const handleFocus = () => {
    isFocusedRef.current = true;
    onFocus?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    onChange?.(e);
  };

  // 포커스 해제 시 확정된 값으로 표시를 맞춤 (빈 칸으로 두면 마지막 유효값으로 복원)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    setDraft(value);
    onBlur?.(e);
  };

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
        value={draft}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
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
