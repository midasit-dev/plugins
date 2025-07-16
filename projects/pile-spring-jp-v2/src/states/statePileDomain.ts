/**
 * @fileoverview 말뚝 도메인의 상태 관리를 위한 Recoil atoms와 selectors
 *
 * 이 파일은 말뚝 관련 데이터의 중앙 상태 관리를 담당합니다.
 * 주요 사용처:
 * - usePileDomain.ts: 메인 훅에서 상태 관리
 * - usePileViewer.tsx: 말뚝 뷰어에서 데이터 표시
 * - DataExport.tsx: 데이터 내보내기
 * - OpeMain.tsx: 메인 운영 화면
 */

import { atom, selector } from "recoil";

import { PileDomainState } from "../types/typePileDomain";
import { defaultPileDomainState } from "../constants/pile/defaults";

// 메인 말뚝 도메인 상태 atom
export const pileDomainState = atom<PileDomainState>({
  key: "pileDomainState",
  default: defaultPileDomainState,
});

// 선택된 말뚝 데이터를 반환하는 selector
export const selectedPileDataSelector = selector({
  key: "selectedPileDataSelector",
  get: ({ get }) => {
    const pileDomain = get(pileDomainState);
    const { selectedPileDataId, pileDataList } = pileDomain;
    if (selectedPileDataId === null) return null;
    return pileDataList.find((item) => item.id === selectedPileDataId) || null;
  },
});

// 말뚝 요약 목록을 반환하는 selector
export const pileSummaryListSelector = selector({
  key: "pileSummaryListSelector",
  get: ({ get }) => {
    const pileDomain = get(pileDomainState);
    const { pileDataList } = pileDomain;
    return pileDataList.map((item) => ({
      id: item.id,
      pileName: item.pileName,
      pileType: item.sectionData[0]?.pileType || "",
      constructionMethod: item.initSetData.constructionMethod,
      pileNumber: item.pileNumber,
    }));
  },
});

// 말뚝 데이터 목록만 반환하는 selector
export const pileDataListState = selector({
  key: "pileDataListState",
  get: ({ get }) => {
    const pileDomain = get(pileDomainState);
    return pileDomain.pileDataList;
  },
});

// 선택된 말뚝 데이터 ID를 반환하는 selector
export const selectedPileDataIdState = selector({
  key: "selectedPileDataIdState",
  get: ({ get }) => {
    const pileDomain = get(pileDomainState);
    return pileDomain.selectedPileDataId;
  },
});

// 기초 제원 정보만 반환하는 selector
export const pileBasicDimState = selector({
  key: "pileBasicDimState",
  get: ({ get }) => {
    const pileDomain = get(pileDomainState);
    return pileDomain.basicDim;
  },
});
