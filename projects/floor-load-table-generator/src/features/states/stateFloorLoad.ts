// 타입 정의
export interface DeadLoadItem {
  name: string;
  type: "load" | "thickness";
  thickness: number;
  unit_weight: number;
  load: number;
}

export interface TableSetting {
  name: string;
  dead_load: DeadLoadItem[];
  live_load: number;
}

export interface GlobalSetting {
  project_name: string;
  factor_dl: number;
  factor_ll: number;
  image_base64: string;
  dl_case_name: string;
  ll_case_name: string;
}

export interface FloorLoadState {
  global_setting: GlobalSetting;
  table_setting: TableSetting[];
}

// 초기 상태 (빈 상태)
export const initialState: FloorLoadState = {
  global_setting: {
    project_name: "",
    factor_dl: 1.2,
    factor_ll: 1.6,
    image_base64: "",
    dl_case_name: "",
    ll_case_name: "",
  },
  table_setting: [],
};

// 전역 상태 (나중에 Recoil이나 다른 상태 관리 라이브러리로 교체 가능)
export let floorLoadState: FloorLoadState = { ...initialState };

// 상태 업데이트 함수들
export const updateGlobalSetting = (newSetting: Partial<GlobalSetting>) => {
  floorLoadState = {
    ...floorLoadState,
    global_setting: {
      ...floorLoadState.global_setting,
      ...newSetting,
    },
  };

  // 전역 상태 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent("floorLoadStateChanged"));
};

export const updateTableSetting = (
  index: number,
  newSetting: Partial<TableSetting>
) => {
  const newTableSetting = [...floorLoadState.table_setting];
  newTableSetting[index] = {
    ...newTableSetting[index],
    ...newSetting,
  };

  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

export const addTableSetting = (newTable: TableSetting) => {
  floorLoadState = {
    ...floorLoadState,
    table_setting: [...floorLoadState.table_setting, newTable],
  };
};

export const removeTableSetting = (index: number) => {
  const newTableSetting = floorLoadState.table_setting.filter(
    (_, i) => i !== index
  );
  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

// 테이블 순서 변경 함수들
export const moveTableUp = (index: number) => {
  if (index > 0) {
    const newTableSetting = [...floorLoadState.table_setting];
    [newTableSetting[index], newTableSetting[index - 1]] = [
      newTableSetting[index - 1],
      newTableSetting[index],
    ];
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

export const moveTableDown = (index: number) => {
  if (index < floorLoadState.table_setting.length - 1) {
    const newTableSetting = [...floorLoadState.table_setting];
    [newTableSetting[index], newTableSetting[index + 1]] = [
      newTableSetting[index + 1],
      newTableSetting[index],
    ];
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

// 하위항목 순서 변경 함수들
export const moveDeadLoadUp = (tableIndex: number, deadLoadIndex: number) => {
  if (deadLoadIndex > 0) {
    const newTableSetting = [...floorLoadState.table_setting];
    const deadLoads = [...newTableSetting[tableIndex].dead_load];
    [deadLoads[deadLoadIndex], deadLoads[deadLoadIndex - 1]] = [
      deadLoads[deadLoadIndex - 1],
      deadLoads[deadLoadIndex],
    ];
    newTableSetting[tableIndex] = {
      ...newTableSetting[tableIndex],
      dead_load: deadLoads,
    };
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

export const moveDeadLoadDown = (tableIndex: number, deadLoadIndex: number) => {
  const table = floorLoadState.table_setting[tableIndex];
  if (deadLoadIndex < table.dead_load.length - 1) {
    const newTableSetting = [...floorLoadState.table_setting];
    const deadLoads = [...newTableSetting[tableIndex].dead_load];
    [deadLoads[deadLoadIndex], deadLoads[deadLoadIndex + 1]] = [
      deadLoads[deadLoadIndex + 1],
      deadLoads[deadLoadIndex],
    ];
    newTableSetting[tableIndex] = {
      ...newTableSetting[tableIndex],
      dead_load: deadLoads,
    };
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

export const resetToInitialState = () => {
  floorLoadState = { ...initialState };
};

export const loadStateFromJson = (jsonData: FloorLoadState) => {
  floorLoadState = { ...jsonData };
};
