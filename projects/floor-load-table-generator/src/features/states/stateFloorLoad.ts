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

export interface CategorySetting {
  [categoryName: string]: TableSetting[];
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
  table_setting: CategorySetting[];
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

// 카테고리 관련 함수들
export const addCategory = (categoryName: string) => {
  const newCategory: CategorySetting = { [categoryName]: [] };
  floorLoadState = {
    ...floorLoadState,
    table_setting: [...floorLoadState.table_setting, newCategory],
  };
};

export const removeCategory = (index: number) => {
  const newTableSetting = floorLoadState.table_setting.filter(
    (_, i) => i !== index
  );
  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

export const moveCategoryUp = (index: number) => {
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

export const moveCategoryDown = (index: number) => {
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

export const updateCategoryName = (index: number, newName: string) => {
  if (index >= 0 && index < floorLoadState.table_setting.length) {
    const category = floorLoadState.table_setting[index];
    const oldName = Object.keys(category)[0];
    const tables = category[oldName];

    const newCategory: CategorySetting = { [newName]: tables };
    const newTableSetting = [...floorLoadState.table_setting];
    newTableSetting[index] = newCategory;

    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

// 카테고리 내 테이블 관련 함수들
export const addTableToCategory = (
  categoryIndex: number,
  newTable: TableSetting
) => {
  const newTableSetting = [...floorLoadState.table_setting];
  const category = newTableSetting[categoryIndex];
  const categoryName = Object.keys(category)[0];
  newTableSetting[categoryIndex] = {
    [categoryName]: [...category[categoryName], newTable],
  };
  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

export const removeTableFromCategory = (
  categoryIndex: number,
  tableIndex: number
) => {
  const newTableSetting = [...floorLoadState.table_setting];
  const category = newTableSetting[categoryIndex];
  const categoryName = Object.keys(category)[0];
  const newTables = category[categoryName].filter((_, i) => i !== tableIndex);
  newTableSetting[categoryIndex] = {
    [categoryName]: newTables,
  };
  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

export const updateTableInCategory = (
  categoryIndex: number,
  tableIndex: number,
  newSetting: Partial<TableSetting>
) => {
  const newTableSetting = [...floorLoadState.table_setting];
  const category = newTableSetting[categoryIndex];
  const categoryName = Object.keys(category)[0];
  const newTables = [...category[categoryName]];
  newTables[tableIndex] = {
    ...newTables[tableIndex],
    ...newSetting,
  };
  newTableSetting[categoryIndex] = {
    [categoryName]: newTables,
  };
  floorLoadState = {
    ...floorLoadState,
    table_setting: newTableSetting,
  };
};

// 기존 함수들 (하위 호환성을 위해 유지)
export const updateTableSetting = (
  index: number,
  newSetting: Partial<TableSetting>
) => {
  // 첫 번째 카테고리의 첫 번째 테이블로 처리 (임시)
  if (floorLoadState.table_setting.length > 0) {
    updateTableInCategory(0, index, newSetting);
  }
};

export const addTableSetting = (newTable: TableSetting) => {
  // 첫 번째 카테고리에 추가 (임시)
  if (floorLoadState.table_setting.length > 0) {
    addTableToCategory(0, newTable);
  } else {
    // 카테고리가 없으면 기본 카테고리 생성
    addCategory("기본 카테고리");
    addTableToCategory(0, newTable);
  }
};

export const removeTableSetting = (index: number) => {
  // 첫 번째 카테고리의 테이블 삭제 (임시)
  if (floorLoadState.table_setting.length > 0) {
    removeTableFromCategory(0, index);
  }
};

// 테이블 순서 변경 함수들
export const moveTableUp = (index: number) => {
  if (index > 0) {
    const newTableSetting = [...floorLoadState.table_setting];
    const category = newTableSetting[0];
    const categoryName = Object.keys(category)[0];
    const newTables = [...category[categoryName]];
    [newTables[index], newTables[index - 1]] = [
      newTables[index - 1],
      newTables[index],
    ];
    newTableSetting[0] = {
      [categoryName]: newTables,
    };
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

export const moveTableDown = (index: number) => {
  const newTableSetting = [...floorLoadState.table_setting];
  const category = newTableSetting[0];
  const categoryName = Object.keys(category)[0];
  if (index < category[categoryName].length - 1) {
    const newTables = [...category[categoryName]];
    [newTables[index], newTables[index + 1]] = [
      newTables[index + 1],
      newTables[index],
    ];
    newTableSetting[0] = {
      [categoryName]: newTables,
    };
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
    const category = newTableSetting[0];
    const categoryName = Object.keys(category)[0];
    const newTables = [...category[categoryName]];
    const deadLoads = [...newTables[tableIndex].dead_load];
    [deadLoads[deadLoadIndex], deadLoads[deadLoadIndex - 1]] = [
      deadLoads[deadLoadIndex - 1],
      deadLoads[deadLoadIndex],
    ];
    newTables[tableIndex] = {
      ...newTables[tableIndex],
      dead_load: deadLoads,
    };
    newTableSetting[0] = {
      [categoryName]: newTables,
    };
    floorLoadState = {
      ...floorLoadState,
      table_setting: newTableSetting,
    };
  }
};

export const moveDeadLoadDown = (tableIndex: number, deadLoadIndex: number) => {
  const newTableSetting = [...floorLoadState.table_setting];
  const category = newTableSetting[0];
  const categoryName = Object.keys(category)[0];
  const table = category[categoryName][tableIndex];
  if (deadLoadIndex < table.dead_load.length - 1) {
    const newTables = [...category[categoryName]];
    const deadLoads = [...newTables[tableIndex].dead_load];
    [deadLoads[deadLoadIndex], deadLoads[deadLoadIndex + 1]] = [
      deadLoads[deadLoadIndex + 1],
      deadLoads[deadLoadIndex],
    ];
    newTables[tableIndex] = {
      ...newTables[tableIndex],
      dead_load: deadLoads,
    };
    newTableSetting[0] = {
      [categoryName]: newTables,
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
