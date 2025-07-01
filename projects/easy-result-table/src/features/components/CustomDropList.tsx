/**
 * @fileoverview
 * 커스텀 드롭다운 리스트 컴포넌트.
 * MIDAS IT의 moaui DropList 컴포넌트를 기반으로 레이블과 함께
 * 사용할 수 있도록 커스터마이징된 드롭다운 컴포넌트입니다.
 * GuideBox를 사용하여 레이블과 드롭다운을 함께 표시합니다.
 */

import React from "react";
import { Typography, DropList, GuideBox } from "@midasit-dev/moaui";

// 컴포넌트 Props 인터페이스
interface CustomDropListProps {
  width?: number | string; // 전체 컴포넌트의 너비
  height?: number | string; // 전체 컴포넌트의 높이
  droplistWidth?: number | string; // 드롭다운 리스트의 너비
  label?: string; // 레이블 텍스트
  value: string | number; // 선택된 값
  itemList: Array<[string, string | number]> | Map<string, string | number>; // 드롭다운 아이템 목록
  onChange: (e: any) => void; // 값 변경 핸들러
  disabled?: boolean; // 비활성화 상태
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
  // 배열을 Map으로 변환하여 DropList 컴포넌트에서 사용
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
