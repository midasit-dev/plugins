import { useState } from "react";
import {
  addTableToCategory,
  DeadLoadItem,
  moveDeadLoadDown,
  moveDeadLoadUp,
  moveTableDown,
  moveTableUp,
  removeTableFromCategory,
  TableSetting,
  updateTableInCategory,
} from "../states/stateFloorLoad";
import { calculateLoad } from "../utils/loadCalculation";
import { useFloorLoadState } from "./useFloorLoadState";

export const useTableSettingHandlers = (
  setSnackbar?: React.Dispatch<React.SetStateAction<any>>,
  selectedCategoryIndex: number = 0
) => {
  const { state: currentState, notifyStateChange } = useFloorLoadState();
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());

  // 현재 선택된 카테고리의 테이블들 가져오기
  const getCurrentTables = () => {
    if (
      selectedCategoryIndex < 0 ||
      selectedCategoryIndex >= currentState.table_setting.length
    ) {
      return [];
    }
    const category = currentState.table_setting[selectedCategoryIndex];
    const categoryName = Object.keys(category)[0];
    return category[categoryName];
  };

  // 새 테이블 추가
  const handleAddTable = (name?: string) => {
    if (selectedCategoryIndex < 0) {
      setSnackbar?.({
        open: true,
        message: "카테고리를 먼저 선택해주세요.",
        severity: "warning",
      });
      return;
    }

    try {
      const newTable: TableSetting = {
        name: name || "",
        dead_load: [],
        live_load: 0,
      };

      addTableToCategory(selectedCategoryIndex, newTable);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "New Load Group added.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error adding Load Group.",
        severity: "error",
      });
    }
  };

  // 테이블 삭제
  const handleRemoveTable = (index: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      removeTableFromCategory(selectedCategoryIndex, index);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "Load Group deleted.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error deleting Load Group.",
        severity: "error",
      });
    }
  };

  // 테이블 이름 업데이트
  const handleTableNameChange = (index: number, name: string) => {
    if (selectedCategoryIndex < 0) return;

    updateTableInCategory(selectedCategoryIndex, index, { name });
    notifyStateChange();
  };

  // Live Load 업데이트
  const handleLiveLoadChange = (index: number, liveLoad: number) => {
    if (selectedCategoryIndex < 0) return;

    updateTableInCategory(selectedCategoryIndex, index, {
      live_load: liveLoad,
    });
    notifyStateChange();
  };

  // Dead Load 항목 추가
  const handleAddDeadLoad = (tableIndex: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      const newDeadLoad: DeadLoadItem = {
        name: "",
        type: "thickness",
        thickness: 0,
        unit_weight: 0,
        load: calculateLoad({
          name: "",
          type: "thickness",
          thickness: 0,
          unit_weight: 0,
          load: 0,
        }),
      };

      const currentTables = getCurrentTables();
      const updatedTable = {
        ...currentTables[tableIndex],
        dead_load: [...currentTables[tableIndex].dead_load, newDeadLoad],
      };

      updateTableInCategory(selectedCategoryIndex, tableIndex, updatedTable);
      notifyStateChange();

      // 하위항목 추가 시 해당 테이블이 접혀있으면 자동으로 펴기
      const newExpandedTables = new Set(expandedTables);
      newExpandedTables.add(tableIndex);
      setExpandedTables(newExpandedTables);

      setSnackbar?.({
        open: true,
        message: "New Sub Load added.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error adding Sub Load.",
        severity: "error",
      });
    }
  };

  // Dead Load 항목 삭제
  const handleRemoveDeadLoad = (tableIndex: number, deadLoadIndex: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      const currentTables = getCurrentTables();
      const updatedTable = {
        ...currentTables[tableIndex],
        dead_load: currentTables[tableIndex].dead_load.filter(
          (_, i) => i !== deadLoadIndex
        ),
      };

      updateTableInCategory(selectedCategoryIndex, tableIndex, updatedTable);
      notifyStateChange();

      setSnackbar?.({
        open: true,
        message: "Sub Load deleted.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error deleting Sub Load.",
        severity: "error",
      });
    }
  };

  // Dead Load 항목 변경
  const handleDeadLoadChange = (
    tableIndex: number,
    deadLoadIndex: number,
    field: keyof DeadLoadItem,
    value: any
  ) => {
    if (selectedCategoryIndex < 0) return;

    const currentTables = getCurrentTables();
    const updatedDeadLoads = [...currentTables[tableIndex].dead_load];
    const currentItem = updatedDeadLoads[deadLoadIndex];

    // 기본 필드 업데이트
    updatedDeadLoads[deadLoadIndex] = {
      ...currentItem,
      [field]: value,
    };

    // thickness 타입일 때, thickness나 unit_weight가 변경되거나 타입이 thickness로 변경될 때 자동으로 load 계산
    const updatedItem = updatedDeadLoads[deadLoadIndex];
    if (
      updatedItem.type === "thickness" &&
      (field === "thickness" || field === "unit_weight" || field === "type")
    ) {
      const calculatedLoad = calculateLoad(updatedItem);
      updatedDeadLoads[deadLoadIndex] = {
        ...updatedItem,
        load: calculatedLoad,
      };
    }

    const updatedTable = {
      ...currentTables[tableIndex],
      dead_load: updatedDeadLoads,
    };

    updateTableInCategory(selectedCategoryIndex, tableIndex, updatedTable);
    notifyStateChange();
  };

  // 테이블 확장/축소 토글
  const handleToggleExpand = (tableIndex: number) => {
    const newExpandedTables = new Set(expandedTables);
    if (newExpandedTables.has(tableIndex)) {
      newExpandedTables.delete(tableIndex);
    } else {
      newExpandedTables.add(tableIndex);
    }
    setExpandedTables(newExpandedTables);
  };

  // 모든 테이블 삭제
  const handleClearAll = () => {
    if (selectedCategoryIndex < 0) return;

    try {
      const { removeCategory } = require("../states/stateFloorLoad");
      removeCategory(selectedCategoryIndex);
      setExpandedTables(new Set());
      notifyStateChange();

      setSnackbar?.({
        open: true,
        message: "All Load Groups cleared.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error clearing Load Groups.",
        severity: "error",
      });
    }
  };

  // 모든 테이블 확장/축소 토글
  const handleToggleAllExpand = () => {
    const currentTables = getCurrentTables();
    if (expandedTables.size === currentTables.length) {
      setExpandedTables(new Set());
    } else {
      const newExpandedTables = new Set<number>();
      currentTables.forEach((_, index) => newExpandedTables.add(index));
      setExpandedTables(newExpandedTables);
    }
  };

  // 테이블 위로 이동
  const handleMoveTableUp = (tableIndex: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      moveTableUp(tableIndex);
      notifyStateChange();
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving table up.",
        severity: "error",
      });
    }
  };

  // 테이블 아래로 이동
  const handleMoveTableDown = (tableIndex: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      moveTableDown(tableIndex);
      notifyStateChange();
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving table down.",
        severity: "error",
      });
    }
  };

  // Dead Load 위로 이동
  const handleMoveDeadLoadUp = (tableIndex: number, deadLoadIndex: number) => {
    if (selectedCategoryIndex < 0) return;

    try {
      moveDeadLoadUp(tableIndex, deadLoadIndex);
      notifyStateChange();
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving sub load up.",
        severity: "error",
      });
    }
  };

  // Dead Load 아래로 이동
  const handleMoveDeadLoadDown = (
    tableIndex: number,
    deadLoadIndex: number
  ) => {
    if (selectedCategoryIndex < 0) return;

    try {
      moveDeadLoadDown(tableIndex, deadLoadIndex);
      notifyStateChange();
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving sub load down.",
        severity: "error",
      });
    }
  };

  return {
    expandedTables,
    handleAddTable,
    handleRemoveTable,
    handleTableNameChange,
    handleLiveLoadChange,
    handleAddDeadLoad,
    handleRemoveDeadLoad,
    handleDeadLoadChange,
    handleToggleExpand,
    handleClearAll,
    handleToggleAllExpand,
    handleMoveTableUp,
    handleMoveTableDown,
    handleMoveDeadLoadUp,
    handleMoveDeadLoadDown,
    getCurrentTables,
  };
};
