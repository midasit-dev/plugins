import { DeadLoadItem } from "../states/stateFloorLoad";

/**
 * DeadLoadItem의 실제 하중값을 계산하는 함수
 * @param item - DeadLoadItem 객체
 * @returns 계산된 하중값 (kN/m²)
 */
export const calculateLoad = (item: DeadLoadItem): number => {
  if (item.type === "load") {
    return item.load;
  } else if (item.type === "thickness") {
    return (item.unit_weight * item.thickness) / 1000;
  }
  return 0;
};
