/**
 * @fileoverview
 * 시스템 단위 설정을 위한 패널 컴포넌트.
 * 힘(Force)과 거리(Distance) 단위를 설정할 수 있는 UI를 제공합니다.
 * moaui의 Panel 컴포넌트를 기반으로 구현되었으며,
 * 각 단위 설정에 대한 드롭다운 리스트를 포함합니다.
 */

import { Panel } from "@midasit-dev/moaui";
import CustomDropList from "../components/CustomDropList";
import { useEffect, useState } from "react";
import { SystemUnitSettings } from "../types/category";

// 컴포넌트 Props 인터페이스
interface SystemUnitProps {
  value?: SystemUnitSettings; // 현재 단위 설정 값
  onChange: (newSettings: SystemUnitSettings) => void; // 설정 변경 핸들러
}

const SystemUnit: React.FC<SystemUnitProps> = ({
  value = { force: "kN", distance: "mm" }, // 기본값 설정
  onChange,
}) => {
  // 로컬 상태 관리
  const [force, setForce] = useState(value.force);
  const [distance, setDistance] = useState(value.distance);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setForce(value.force);
    setDistance(value.distance);
  }, [value]);

  // 힘 단위 변경 핸들러
  const handleForceChange = (e: any) => {
    const newForce = e.target.value;
    setForce(newForce);
    onChange({
      force: newForce,
      distance,
    });
  };

  // 거리 단위 변경 핸들러
  const handleDistanceChange = (e: any) => {
    const newDistance = e.target.value;
    setDistance(newDistance);
    onChange({
      force,
      distance: newDistance,
    });
  };

  // 거리 단위 선택 옵션
  const itemListDistance: Array<[string, string | number]> = [
    ["mm", "mm"],
    ["cm", "cm"],
    ["m", "m"],
    ["km", "km"],
  ];

  // 힘 단위 선택 옵션
  const itemListForce: Array<[string, string | number]> = [
    ["kN", "kN"],
    ["N", "N"],
  ];

  return (
    <Panel>
      {/* 힘 단위 설정 드롭다운 */}
      <CustomDropList
        width={150}
        droplistWidth={100}
        label="Force"
        value={force}
        itemList={itemListForce}
        onChange={handleForceChange}
      />
      {/* 거리 단위 설정 드롭다운 */}
      <CustomDropList
        width={150}
        droplistWidth={100}
        label="Distance"
        value={distance}
        itemList={itemListDistance}
        onChange={handleDistanceChange}
      />
    </Panel>
  );
};

export default SystemUnit;
