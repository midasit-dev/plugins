/**
 * @fileoverview
 * 시스템 스타일 설정을 위한 패널 컴포넌트.
 * 표시 스타일(Default, Fixed 등)과 소수점 자릿수를 설정할 수 있는
 * UI를 제공합니다. moaui의 Panel 컴포넌트를 기반으로 구현되었으며,
 * 사용자 정의 드롭다운과 숫자 입력 필드를 포함합니다.
 */

import { Panel } from "@midasit-dev/moaui";
import CustomDropList from "../components/CustomDropList";
import { useEffect, useState } from "react";
import CustomNumberField from "../components/CustomNumberField";
import { SystemStyleSettings } from "../types/category";

// 컴포넌트 props 인터페이스
interface SystemStyleProps {
  value?: SystemStyleSettings; // 현재 스타일 설정 값
  onChange: (newSettings: SystemStyleSettings) => void; // 설정 변경 핸들러
}

const SystemStyle: React.FC<SystemStyleProps> = ({
  value = { style: "Default", decimalPlaces: 0 }, // 기본값 설정
  onChange,
}) => {
  // 로컬 상태 관리
  const [style, setStyle] = useState(value.style);
  const [decimalPlaces, setDecimalPlaces] = useState(value.decimalPlaces);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setStyle(value.style);
    setDecimalPlaces(value.decimalPlaces);
  }, [value]);

  // 스타일 변경 핸들러
  const handleStyleChange = (e: any) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    onChange({
      style: newStyle,
      decimalPlaces,
    });
  };

  // 소수점 자릿수 변경 핸들러
  const handleDecimalPlacesChange = (e: any) => {
    const newDecimalPlaces = parseInt(e.target.value) || 0;
    setDecimalPlaces(newDecimalPlaces);
    onChange({
      style,
      decimalPlaces: newDecimalPlaces,
    });
  };

  // 스타일 선택 옵션 정의
  const itemListStyle: Array<[string, string | number]> = [
    ["Default", "Default"],
    ["Fixed", "Fixed"],
    ["Scientific", "Scientific"],
    ["General", "General"],
  ];

  return (
    <Panel>
      <CustomDropList
        width={150}
        droplistWidth={100}
        label="Style"
        value={style}
        itemList={itemListStyle}
        onChange={handleStyleChange}
      />
      <CustomNumberField
        width={150}
        label="Decimal Places"
        value={decimalPlaces.toString()}
        onChange={handleDecimalPlacesChange}
      />
    </Panel>
  );
};

export default SystemStyle;
