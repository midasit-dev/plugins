import React from "react";
import { GuideBox, Typography, DropList } from "@midasit-dev/moaui";

interface CustomDropListProps {
  width?: number | string;
  height?: number | string;
  droplistWidth?: number | string;
  label?: string;
  value: string | number;
  itemList: Array<[string, string | number]> | Map<string, string | number>;
  onChange: (e: any) => void;
  disabled?: boolean;
}

const CustomDropList: React.FC<CustomDropListProps> = ({
  width = "100%",
  height = "auto",
  droplistWidth = "100%",
  label = "",
  value,
  itemList = [],
  onChange,
  disabled = false,
}) => {
  const itemListMap = new Map(itemList);
  return (
    <GuideBox width={width} height={height} row verCenter horSpaceBetween>
      {label && <Typography variant="body1">{label}</Typography>}
      <DropList
        itemList={itemListMap}
        value={value}
        onChange={onChange}
        disabled={disabled}
        width={droplistWidth}
      />
    </GuideBox>
  );
};

export default CustomDropList;
