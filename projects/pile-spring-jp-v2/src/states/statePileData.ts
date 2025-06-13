import { atom, selector } from "recoil";
import { PileInitSetData } from "./statePileInitSet";
import { PileLocationRowData } from "./statePileLocation";
import { PileReinforcedRowData } from "./statePileReinforced";
import { PileRowData } from "./statePileSection";
import { pileInitSetState } from "./statePileInitSet";
import { pileSectionState } from "./statePileSection";
import { useTranslation } from "react-i18next";

// 모든 데이터를 포함하는 통합 인터페이스
export interface PileDataItem {
  id: number;
  pileName: string;

  // 각 패널의 데이터
  initSetData: PileInitSetData;
  locationData: PileLocationRowData[];
  reinforcedData: PileReinforcedRowData[];
  sectionData: PileRowData[];
}

// 데이터 그리드에 표시될 요약 정보
export interface PileDataSummary {
  id: number;
  pileName: string;
  pileType: string;
  constructionMethod: string;
  pileNumber: string;
}

// 선택된 아이템 ID를 관리하는 atom
export const selectedPileDataIdState = atom<number | null>({
  key: "selectedPileDataIdState",
  default: null,
});

// 전체 파일 데이터 목록을 관리하는 atom
export const pileDataListState = atom<PileDataItem[]>({
  key: "pileDataListState",
  default: [],
});

// 데이터 요약 목록을 생성하는 selector
export const pileSummaryListState = selector<PileDataSummary[]>({
  key: "pileSummaryListState",
  get: ({ get }) => {
    const pileDataList = get(pileDataListState);

    return pileDataList.map((item) => ({
      id: item.id,
      pileName: item.initSetData.pileName, // 각 아이템의 고유한 데이터 사용
      pileType: item.sectionData[0].pileType, // 각 아이템의 고유한 데이터 사용
      constructionMethod: item.initSetData.constructionMethod, // 각 아이템의 고유한 데이터 사용
      pileNumber: "4", // 이 부분도 item의 데이터에서 계산하거나 가져와야 함
    }));
  },
});
