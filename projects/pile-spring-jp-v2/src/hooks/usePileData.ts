import { useRecoilState, useRecoilValue } from "recoil";
import { useMemo } from "react";
import {
  pileDataListState,
  pileReinforcedState,
  pileInitSetState,
  pileLocationState,
  selectedPileDataIdState,
  pileSectionState,
  PileDataItem,
  pileSummaryListState,
  defaultPileInitSet,
  defaultPileLocation,
  defaultPileReinforced,
  defaultPileSection,
} from "../states";

export const usePileData = () => {
  // 저장 데이터
  const [pileDataList, setPileDataList] = useRecoilState(pileDataListState);
  const [selectedId, setSelectedId] = useRecoilState(selectedPileDataIdState);
  // 요약 목록을 셀렉터로 가져오기
  const summaryList = useRecoilValue(pileSummaryListState);

  // 패널 데이터
  const [initSetData, setInitSetData] = useRecoilState(pileInitSetState);
  const [locationData, setLocationData] = useRecoilState(pileLocationState);
  const [reinforcedData, setReinforcedData] =
    useRecoilState(pileReinforcedState);
  const [sectionData, setSectionData] = useRecoilState(pileSectionState);

  // 선택된 데이터 아이템 - useMemo로 최적화
  const selectedItem = useMemo(
    () =>
      selectedId !== null
        ? pileDataList.find((item) => item.id === selectedId)
        : null,
    [selectedId, pileDataList]
  );

  /**
   * 데이터 항목 선택 함수
   * @param {number} id 선택할 항목의 ID
   * @returns {boolean} 선택 성공 여부
   */
  const selectItem = (id: number): boolean => {
    const item = pileDataList.find((item) => item.id === id);
    if (!item) return false;

    setSelectedId(id);
    return true;
  };

  /**
   * 선택 해제 함수
   */
  const deselectItem = () => {
    setSelectedId(null);
    // 기본 데이터로 초기화
    setInitSetData(defaultPileInitSet);
    setLocationData(defaultPileLocation);
    setReinforcedData(defaultPileReinforced);
    setSectionData(defaultPileSection);
  };

  // 데이터 유효성 검토 함수
  const validateData = () => {
    // 추후 추가
    return { valid: true, message: "" };
  };

  // 새 ID 생성 함수
  const generateNewID = (): number => {
    return pileDataList.length > 0
      ? Math.max(...pileDataList.map((item) => item.id)) + 1
      : 1;
  };

  // 새 데이터 추가 함수
  const saveData = () => {
    const validation = validateData();
    if (!validation.valid) {
      return null;
    }

    const newID = generateNewID();
    const newItem: PileDataItem = {
      id: newID,
      pileName: initSetData.pileName,
      pileNumber: locationData[0].space.length + 1,
      initSetData,
      locationData,
      reinforcedData,
      sectionData,
    };

    setPileDataList((prev) => [...prev, newItem]);
    return newID;
  };

  // 데이터 수정 함수
  const updateData = (id: number) => {
    if (id === null) return false;

    const validation = validateData();
    if (!validation.valid) {
      return false;
    }

    const itemExists = pileDataList.some((item) => item.id === id);
    if (!itemExists) return false;

    setPileDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              pileName: initSetData.pileName,
              pileNumber: locationData[0].space.length + 1,
              initSetData,
              locationData,
              reinforcedData,
              sectionData,
            }
          : item
      )
    );

    return true;
  };

  // 데이터 삭제 함수
  const deleteData = (id: number) => {
    const itemExists = pileDataList.some((item) => item.id === id);
    if (!itemExists) return false;

    // 현재 선택된 ID 저장
    const currentSelectedId = selectedId;

    // 선택된 항목 처리
    if (currentSelectedId === id) {
      // 삭제되는 항목이 선택됐다면 선택 해제
      deselectItem();
    }

    setPileDataList((prev) => {
      // 항목 삭제
      const filteredList = prev.filter((item) => item.id !== id);

      // 삭제 후 ID 재정렬
      const reorderedList = filteredList.map((item, index) => ({
        ...item,
        id: index + 1,
      }));

      // 선택된 항목이 없거나 삭제되는 항목이 아니라면
      if (currentSelectedId !== null && currentSelectedId !== id) {
        // 삭제된 항목 이후에 있던 항목이 선택되어 있었다면 ID 조정
        if (currentSelectedId > id) {
          setSelectedId(currentSelectedId - 1);
        }
      }

      return reorderedList;
    });

    return true;
  };

  // 데이터 불러오기 함수 (패널 업데이트)
  const loadData = (id: number): boolean => {
    const item = pileDataList.find((item) => item.id === id);
    if (!item) {
      return false;
    }

    // 선택된 ID 설정
    selectItem(id);

    // 각 패널 상태 업데이트
    setInitSetData(item.initSetData);
    setLocationData(item.locationData);
    setReinforcedData(item.reinforcedData);
    setSectionData(item.sectionData);

    return true;
  };

  // 훅에서 반환하는 값들
  return {
    pileDataList,
    selectedId,
    selectedItem,
    summaryList,
    saveData,
    updateData,
    deleteData,
    loadData,
    selectItem,
    deselectItem,
    validateData,
  };
};
