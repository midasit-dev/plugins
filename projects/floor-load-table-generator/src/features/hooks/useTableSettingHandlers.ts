import { useState } from "react";
import {
  moveTableUp,
  moveTableDown,
  moveDeadLoadUp,
  moveDeadLoadDown,
  floorLoadState,
  TableSetting,
  DeadLoadItem,
} from "../states/stateFloorLoad";
import { useFloorLoadState } from "./useFloorLoadState";

export const useTableSettingHandlers = (
  setSnackbar?: React.Dispatch<React.SetStateAction<any>>
) => {
  const { state: currentState, notifyStateChange } = useFloorLoadState();
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());

  // 새 테이블 추가
  const handleAddTable = () => {
    try {
      const newTable: TableSetting = {
        name: "",
        dead_load: [],
        live_load: 0,
      };
      const newTableSettings = [...currentState.table_setting, newTable];
      floorLoadState.table_setting = newTableSettings;
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
    try {
      const newTableSettings = currentState.table_setting.filter(
        (_, i) => i !== index
      );
      floorLoadState.table_setting = newTableSettings;
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
    const newTableSettings = [...currentState.table_setting];
    newTableSettings[index] = { ...newTableSettings[index], name };
    floorLoadState.table_setting = newTableSettings;
    notifyStateChange();
  };

  // Live Load 업데이트
  const handleLiveLoadChange = (index: number, liveLoad: number) => {
    const newTableSettings = [...currentState.table_setting];
    newTableSettings[index] = {
      ...newTableSettings[index],
      live_load: liveLoad,
    };
    floorLoadState.table_setting = newTableSettings;
    notifyStateChange();
  };

  // Dead Load 항목 추가
  const handleAddDeadLoad = (tableIndex: number) => {
    try {
      const newDeadLoad: DeadLoadItem = {
        name: "",
        type: "thickness",
        thickness: 0,
        unit_weight: 0,
        load: 0,
      };
      const newTableSettings = [...currentState.table_setting];
      newTableSettings[tableIndex].dead_load.push(newDeadLoad);
      floorLoadState.table_setting = newTableSettings;
      notifyStateChange();

      // 하위항목 추가 시 해당 테이블이 접혀있으면 자동으로 펴기
      if (!expandedTables.has(tableIndex)) {
        const newExpandedTables = new Set(expandedTables);
        newExpandedTables.add(tableIndex);
        setExpandedTables(newExpandedTables);
      }

      setSnackbar?.({
        open: true,
        message: "Sub Load added.",
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
    try {
      const newTableSettings = [...currentState.table_setting];
      newTableSettings[tableIndex].dead_load.splice(deadLoadIndex, 1);
      floorLoadState.table_setting = newTableSettings;
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

  // Dead Load 항목 업데이트
  const handleDeadLoadChange = (
    tableIndex: number,
    deadLoadIndex: number,
    field: keyof DeadLoadItem,
    value: any
  ) => {
    const newTableSettings = [...currentState.table_setting];
    newTableSettings[tableIndex].dead_load[deadLoadIndex] = {
      ...newTableSettings[tableIndex].dead_load[deadLoadIndex],
      [field]: value,
    };
    floorLoadState.table_setting = newTableSettings;
    notifyStateChange();
  };

  // 테이블 접기/펼치기 토글
  const handleToggleExpand = (tableIndex: number) => {
    const newExpandedTables = new Set(expandedTables);
    if (newExpandedTables.has(tableIndex)) {
      newExpandedTables.delete(tableIndex);
    } else {
      newExpandedTables.add(tableIndex);
    }
    setExpandedTables(newExpandedTables);
  };

  // 모든 항목 지우기
  const handleClearAll = () => {
    try {
      floorLoadState.table_setting = [];
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "All items deleted.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error deleting items.",
        severity: "error",
      });
    }
  };

  // 모든 항목 접기/펼치기 토글
  const handleToggleAllExpand = () => {
    if (expandedTables.size === currentState.table_setting.length) {
      // 모든 항목이 펼쳐져 있으면 모두 접기
      setExpandedTables(new Set());
    } else {
      // 모든 항목 펼치기
      const allExpanded = new Set(
        currentState.table_setting.map((_, index) => index)
      );
      setExpandedTables(allExpanded);
    }
  };

  // 테이블 순서 변경 핸들러들
  const handleMoveTableUp = (tableIndex: number) => {
    try {
      moveTableUp(tableIndex);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "Load Group moved up.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving Load Group.",
        severity: "error",
      });
    }
  };

  const handleMoveTableDown = (tableIndex: number) => {
    try {
      moveTableDown(tableIndex);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "Load Group moved down.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving Load Group.",
        severity: "error",
      });
    }
  };

  // 하위항목 순서 변경 핸들러들
  const handleMoveDeadLoadUp = (tableIndex: number, deadLoadIndex: number) => {
    try {
      moveDeadLoadUp(tableIndex, deadLoadIndex);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "Sub Load moved up.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving Sub Load.",
        severity: "error",
      });
    }
  };

  const handleMoveDeadLoadDown = (
    tableIndex: number,
    deadLoadIndex: number
  ) => {
    try {
      moveDeadLoadDown(tableIndex, deadLoadIndex);
      notifyStateChange();
      setSnackbar?.({
        open: true,
        message: "Sub Load moved down.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar?.({
        open: true,
        message: "Error moving Sub Load.",
        severity: "error",
      });
    }
  };

  return {
    currentState,
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
  };
};
