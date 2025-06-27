/**
 * @fileoverview 말뚝 도메인(설계/데이터 관리) 상태와 조작 함수 제공
 */

import { useRecoilState, useRecoilValue } from "recoil";

import {
  defaultPileInitSet,
  defaultPileLocation,
  defaultPileReinforced,
  createDefaultPileSections,
} from "../../constants/pile/defaults";
import {
  pileDomainState,
  selectedPileDataSelector,
  pileSummaryListSelector,
} from "../../states/statePileDomain";
import {
  PileInitSet,
  PileSection,
  PileLocation,
  PileReinforced,
  PileDomainState,
  PileDataItem,
} from "../../types/typePileDomain";

// 말뚝 도메인(설계/데이터 관리) 상태와 조작 함수 제공
export const usePileDomain = () => {
  const [pileDomain, setPileDomain] = useRecoilState(pileDomainState);
  // 선택된 말뚝 데이터(객체)를 반환 (Recoil selector)
  const selectedPile = useRecoilValue(selectedPileDataSelector);

  // 새 말뚝 데이터의 고유 ID를 생성 (목록에서 최대값+1)
  const generateNewID = (): number => {
    return pileDomain.pileDataList.length > 0
      ? Math.max(...pileDomain.pileDataList.map((item) => item.id)) + 1
      : 1;
  };

  // 말뚝 데이터 항목을 선택 (id로)
  const selectItem = (id: number): boolean => {
    const item = pileDomain.pileDataList.find((item) => item.id === id);
    if (!item) return false;
    setPileDomain((prev) => ({
      ...prev,
      selectedPileDataId: id,
    }));
    return true;
  };

  // 말뚝 데이터 선택 해제 및 currentPile 초기화
  const deselectItem = () => {
    setPileDomain((prev) => ({
      ...prev,
      selectedPileDataId: null,
      currentPile: {
        initSet: defaultPileInitSet,
        sections: createDefaultPileSections(),
        locations: defaultPileLocation,
        reinforced: defaultPileReinforced,
      },
    }));
  };

  // 현재 편집 중인 말뚝 데이터를 새로 저장 (목록에 추가)
  const saveData = () => {
    const newID = generateNewID();
    const newItem: PileDataItem = {
      id: newID,
      pileName: pileDomain.currentPile.initSet.pileName,
      pileNumber: pileDomain.currentPile.locations[0].space.length + 1,
      initSetData: pileDomain.currentPile.initSet,
      locationData: pileDomain.currentPile.locations,
      reinforcedData: pileDomain.currentPile.reinforced,
      sectionData: pileDomain.currentPile.sections,
    };
    setPileDomain((prev) => ({
      ...prev,
      pileDataList: [...prev.pileDataList, newItem],
      selectedPileDataId: newID,
    }));
    return newID;
  };

  // 기존 말뚝 데이터를 수정 (id로 찾아서 갱신)
  const updateData = (id: number) => {
    if (id === null) return false;
    const itemExists = pileDomain.pileDataList.some((item) => item.id === id);
    if (!itemExists) return false;
    setPileDomain((prev) => ({
      ...prev,
      pileDataList: prev.pileDataList.map((item) =>
        item.id === id
          ? {
              ...item,
              pileName: prev.currentPile.initSet.pileName,
              pileNumber: prev.currentPile.locations[0].space.length + 1,
              initSetData: prev.currentPile.initSet,
              locationData: prev.currentPile.locations,
              reinforcedData: prev.currentPile.reinforced,
              sectionData: prev.currentPile.sections,
            }
          : item
      ),
    }));
    return true;
  };

  // 말뚝 데이터 삭제 (id로 찾아서 삭제, ID 재정렬)
  const deleteData = (id: number) => {
    const itemExists = pileDomain.pileDataList.some((item) => item.id === id);
    if (!itemExists) return false;
    // 현재 선택된 ID 저장
    const currentSelectedId = pileDomain.selectedPileDataId;
    setPileDomain((prev) => {
      // 항목 삭제
      const filteredList = prev.pileDataList.filter((item) => item.id !== id);
      // 삭제 후 ID 재정렬
      const reorderedList = filteredList.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      // 선택된 항목 처리
      let newSelectedId = prev.selectedPileDataId;
      if (currentSelectedId === id) {
        // 삭제되는 항목이 선택됐다면 선택 해제
        newSelectedId = null;
      } else if (currentSelectedId !== null && currentSelectedId > id) {
        // 삭제된 항목 이후에 있던 항목이 선택되어 있었다면 ID 조정
        newSelectedId = currentSelectedId - 1;
      }
      return {
        ...prev,
        pileDataList: reorderedList,
        selectedPileDataId: newSelectedId,
      };
    });
    return true;
  };

  // 말뚝 데이터 불러오기 (id로 찾아 currentPile에 반영)
  const loadData = (id: number): boolean => {
    const item = pileDomain.pileDataList.find((item) => item.id === id);
    if (!item) {
      return false;
    }
    setPileDomain((prev) => ({
      ...prev,
      selectedPileDataId: id,
      currentPile: {
        initSet: item.initSetData,
        sections: item.sectionData,
        locations: item.locationData,
        reinforced: item.reinforcedData,
      },
    }));
    return true;
  };

  // pileDataList 전체 업데이트 (데이터 임포트 시 사용)
  const updatePileDataList = (newPileDataList: PileDataItem[]) => {
    setPileDomain((prev) => ({
      ...prev,
      pileDataList: newPileDataList,
    }));
  };

  return {
    // 상태 값들
    basicDim: pileDomain.basicDim, // 기초 제원 반환
    currentPile: pileDomain.currentPile, // 현재 편집 중인 말뚝 데이터 반환
    pileDataList: pileDomain.pileDataList, // 말뚝 데이터 목록 반환
    selectedPileDataId: pileDomain.selectedPileDataId, // 선택된 말뚝 데이터 ID 반환
    selectedPile, // 선택된 말뚝 데이터 객체 반환
    summaryList: useRecoilValue(pileSummaryListSelector), // 말뚝 요약 목록 반환

    // 기초 제원 업데이트 (폭, 길이 등)
    updateBasicDim: (updates: Partial<PileDomainState["basicDim"]>) => {
      setPileDomain((prev) => ({
        ...prev,
        basicDim: { ...prev.basicDim, ...updates },
      }));
    },

    // 현재 말뚝 초기 설정 업데이트
    updateCurrentPileInitSet: (updates: Partial<PileInitSet>) => {
      setPileDomain((prev) => ({
        ...prev,
        currentPile: {
          ...prev.currentPile,
          initSet: { ...prev.currentPile.initSet, ...updates },
        },
      }));
    },

    // 현재 말뚝 단면 설정 업데이트
    updateCurrentPileSections: (sections: PileSection[]) => {
      setPileDomain((prev) => ({
        ...prev,
        currentPile: {
          ...prev.currentPile,
          sections,
        },
      }));
    },

    // 현재 말뚝 위치 설정 업데이트
    updateCurrentPileLocations: (locations: PileLocation[]) => {
      setPileDomain((prev) => ({
        ...prev,
        currentPile: {
          ...prev.currentPile,
          locations,
        },
      }));
    },

    // 현재 말뚝 보강 설정 업데이트
    updateCurrentPileReinforced: (reinforced: PileReinforced[]) => {
      setPileDomain((prev) => ({
        ...prev,
        currentPile: {
          ...prev.currentPile,
          reinforced,
        },
      }));
    },

    // 데이터 관리 함수들
    selectItem, // 말뚝 데이터 선택
    deselectItem, // 말뚝 데이터 선택 해제 및 currentPile 초기화
    saveData, // 현재 편집 중인 말뚝 데이터 저장
    updateData, // 기존 말뚝 데이터 수정
    deleteData, // 말뚝 데이터 삭제
    loadData, // 말뚝 데이터 불러오기
    generateNewID, // 새 말뚝 데이터 ID 생성
    updatePileDataList, // pileDataList 전체 업데이트
  };
};
