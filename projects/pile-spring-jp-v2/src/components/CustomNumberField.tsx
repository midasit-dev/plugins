import React from "react";
import { GuideBox, Typography, TextFieldV2 } from "@midasit-dev/moaui";

interface NumberOptions {
  min?: number;
  max?: number;
  step?: number | undefined;
  onlyInteger?: boolean | undefined;
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
  variant?: "body1" | "body2" | "body3" | "h1";
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  numberOptions?: NumberOptions;
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  width = "100%",
  height = "auto",
  numberFieldWidth = 120,
  label = "",
  variant = "body1",
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
  numberOptions,
}) => {
  return (
    <GuideBox width={width} height={height} row verCenter horSpaceBetween>
      {label && <Typography variant={variant}>{label}</Typography>}
      <TextFieldV2
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        height="100%"
        width={numberFieldWidth}
        type="number"
        numberOptions={numberOptions}
      />
    </GuideBox>
  );
};

export default CustomNumberField;
