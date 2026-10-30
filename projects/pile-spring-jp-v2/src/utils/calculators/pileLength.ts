/**
 * @fileoverview 말뚝 전체 길이(pileLength) 산출.
 * pileLength는 사용자가 직접 입력하지 않는 파생값(체크된 단면 길이의 합)이므로,
 * 저장/불러오기/계산 시점마다 단면 데이터로부터 다시 계산해 일관성을 유지합니다.
 */

import { PileDataItem, PileSection } from "../../types/typePileDomain";

// 체크된 단면 길이의 합 (부동소수 오차 제거)
export const calcTotalPileLength = (sections: PileSection[]): number => {
  const total = sections
    .filter((section) => section.checked)
    .reduce((acc, section) => acc + Number(section.length || 0), 0);
  return Number(total.toFixed(6));
};

// 말뚝 데이터 항목의 initSetData.pileLength를 단면 기준으로 보정
export const syncPileLength = (item: PileDataItem): PileDataItem => ({
  ...item,
  initSetData: {
    ...item.initSetData,
    pileLength: calcTotalPileLength(item.sectionData),
  },
});
