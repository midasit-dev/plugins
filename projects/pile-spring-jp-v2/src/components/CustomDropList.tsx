/**
 * @fileoverview 커스텀 드롭다운 리스트 컴포넌트
 */

import React from "react";
import { Select, MenuItem, FormControl } from "@mui/material";
import { Typography } from "@midasit-dev/moaui";
import { CustomBox } from ".";

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
    </CustomBox>
  );
};

export default CustomDropList;
