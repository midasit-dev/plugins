import { useRecoilState, useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import {
  pileDataListState,
  pileReinforcedState,
  pileInitSetState,
  pileLocationState,
  selectedPileDataIdState,
  pileSectionState,
  PileDataSummary,
  PileDataItem,
} from "../states";

export const usePileData = () => {
  const { t } = useTranslation();

  // 저장 데이터
  const [pileDataList, setPileDataList] = useRecoilState(pileDataListState);
  const [selectedId, setSelectedId] = useRecoilState(selectedPileDataIdState);

  // 패널 데이터
  const initSetData = useRecoilValue(pileInitSetState);
  const locationData = useRecoilValue(pileLocationState);
  const reinforcedData = useRecoilValue(pileReinforcedState);
  const sectionData = useRecoilValue(pileSectionState);

  // 선택된 데이터 아이템
  const selectedItem =
    selectedId !== null
      ? pileDataList.find((item) => item.id === selectedId)
      : null;

  // 데이터 유효성 검토
  const validateData = () => {
    // 추후 추가
    return { valid: true, message: "" };
  };

  // 데이터 그리드에 표시할 요약 정보
  const getSummaryList = (): PileDataSummary[] => {
    return pileDataList.map((item) => ({
      id: item.id,
      pileName: item.pileName,
      pileType: item.sectionData[0].pileType,
      constructionMethod: initSetData.constructionMethod,
      pileNumber: "4",
    }));
  };

  // ID 생성
  const generateNewID = (): number => {
    return pileDataList.length > 0
      ? Math.max(...pileDataList.map((item) => item.id)) + 1
      : 1;
  };

  // 새 데이터 추가
  const saveData = () => {
    const validation = validateData();
    if (!validation.valid) {
      console.log(validation.message);
      return;
    }

    const newID = generateNewID();
    const newItem: PileDataItem = {
      id: newID,
      pileName: initSetData.pileName,
      initSetData,
      locationData,
      reinforcedData,
      sectionData,
    };

    setPileDataList((prev) => [...prev, newItem]);
    return newID;
  };

  // 데이터 수정
  const updateData = (id: number, name?: string) => {
    if (id === null) return;

    const validation = validateData();
    if (!validation.valid) {
      console.log(validation.message);
      return;
    }

    setPileDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              pileName: name || item.pileName,
              initSetData,
              locationData,
              reinforcedData,
              sectionData,
            }
          : item
      )
    );
  };

  // 데이터 삭제
  const deleteData = (id: number) => {
    setPileDataList((prev) => {
      // 항목 삭제
      const filteredList = prev.filter((item) => item.id !== id);

      // 삭제 후 ID 재정렬
      const reorderedList = filteredList.map((item, index) => ({
        ...item,
        id: index + 1,
      }));

      return reorderedList;
    });

    // 선택된 항목 처리
    if (selectedId !== null) {
      if (selectedId === id) {
        // 선택된 항목이 삭제되었을 경우 선택 해제
        setSelectedId(null);
      } else if (selectedId > id) {
        // 선택된 항목의 ID가 삭제된 항목보다 크면 ID 1 감소
        setSelectedId(selectedId - 1);
      }
      // selectedId < id인 경우는 영향 없음
    }
  };

  //데이터 불러오기 (패널 업데이트)
  const loadData = (id: number) => {
    const selectedItem = pileDataList.find((item) => item.id === id);
    if (!selectedItem) return;

    setSelectedId(id);
  };

  return {
    pileDataList,
    selectedId,
    selectedItem,
    summaryList: getSummaryList(),
    saveData,
    updateData,
    deleteData,
    loadData,
    setSelectedId,
    validateData,
  };
};
