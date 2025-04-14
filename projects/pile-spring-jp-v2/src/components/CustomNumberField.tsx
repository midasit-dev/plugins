// import React from "react";
// import { GuideBox, Typography, TextFieldV2 } from "@midasit-dev/moaui";

// interface NumberOptions {
//   min?: number;
//   max?: number;
//   step?: number | undefined;
//   onlyInteger?: boolean | undefined;
//   condition?: {
//     min?: "greater" | "greaterEqual";
//     max?: "less" | "lessEqual";
//   };
// }

// interface CustomNumberFieldProps {
//   id?: string;
//   width?: number | string;
//   height?: number | string;
//   numberFieldWidth?: number;
//   label?: string;
//   variant?: "body1" | "body2" | "body3" | "h1";
//   value?: string;
//   onChange?: (e: any) => void;
//   onFocus?: () => void;
//   placeholder?: string;
//   disabled?: boolean;
//   numberOptions?: NumberOptions;
// }

// const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
//   id,
//   width = "100%",
//   height = "auto",
//   numberFieldWidth = 120,
//   label = "",
//   variant = "body1",
//   value = "",
//   onChange,
//   onFocus,
//   placeholder = "",
//   disabled = false,
//   numberOptions,
// }) => {
//   return (
//     <GuideBox width={width} height={height} row verCenter horSpaceBetween>
//       {label && <Typography variant={variant}>{label}</Typography>}
//       <TextFieldV2
//         value={value}
//         onChange={onChange}
//         onFocus={onFocus}
//         placeholder={placeholder}
//         disabled={disabled}
//         height="100%"
//         width={numberFieldWidth}
//         type="number"
//         numberOptions={numberOptions}
//       />
//     </GuideBox>
//   );
// };

// export default CustomNumberField;

import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import { GuideBox } from "@midasit-dev/moaui";

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
