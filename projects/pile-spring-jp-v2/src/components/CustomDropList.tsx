import React from "react";
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  SxProps,
  Theme,
} from "@mui/material";

interface CustomDropListProps {
  width?: number | string;
  height?: number | string;
  droplistWidth?: number | string;
  label?: string;
  value: string | number;
  itemList: Array<[string, string | number]> | Map<string, string | number>;
  onChange: (e: any) => void;
  disabled?: boolean;
  labelColor?: string;
  hideBorder?: boolean;
  textAlign?: "left" | "center" | "right";
}

const CustomDropList: React.FC<CustomDropListProps> = ({
  width = "100%",
  height = "auto",
  droplistWidth = "100%",
  label = "",
  value,
  itemList = [],
  labelColor = "inherit",
  onChange,
  disabled = false,
  hideBorder = false,
  textAlign = "left",
}) => {
  const itemListMap = new Map(itemList);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {label && (
        <Typography variant="body1" color={labelColor}>
          {label}
        </Typography>
      )}
      <FormControl sx={{ width: droplistWidth }}>
        <Select
          value={value}
          onChange={onChange}
          disabled={disabled}
          size="small"
          sx={{
            height: "28px",
            "& .MuiSelect-select": {
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "10px",
              textAlign: textAlign,
            },
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
          }}
        >
          {Array.from(itemListMap.entries()).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomDropList;
