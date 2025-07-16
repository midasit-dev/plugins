import { FloorLoadState } from "../states/stateFloorLoad";

/**
 * 문자열이 비어있거나 공백으로만 구성되어 있는지 확인하는 함수
 */
const isEmptyOrWhitespace = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * global_setting 검증 함수
 */
const validateGlobalSetting = (
  globalSetting: FloorLoadState["global_setting"]
): string[] => {
  const errors: string[] = [];

  // project_name 검증
  if (isEmptyOrWhitespace(globalSetting.project_name)) {
    errors.push("Please enter a project name.");
  }

  // dl_case_name 검증
  if (isEmptyOrWhitespace(globalSetting.dl_case_name)) {
    errors.push("Please enter a dead load case name.");
  }

  // ll_case_name 검증
  if (isEmptyOrWhitespace(globalSetting.ll_case_name)) {
    errors.push("Please enter a live load case name.");
  }

  // dl_case_name과 ll_case_name이 같은지 검증
  if (globalSetting.dl_case_name.trim() === globalSetting.ll_case_name.trim()) {
    errors.push(
      "Dead load case name and live load case name must be different."
    );
  }

  // factor_dl 검증
  if (globalSetting.factor_dl <= 0) {
    errors.push("Dead load factor must be greater than 0.");
  }

  // factor_ll 검증
  if (globalSetting.factor_ll <= 0) {
    errors.push("Live load factor must be greater than 0.");
  }

  return errors;
};

/**
 * DeadLoadItem 검증 함수
 */
const validateDeadLoadItem = (item: any, itemIndex: number): string[] => {
  const errors: string[] = [];

  // name 검증
  if (isEmptyOrWhitespace(item.name)) {
    errors.push(`Please enter a name for dead load item ${itemIndex + 1}.`);
  }

  // type에 따른 검증
  if (item.type === "load") {
    if (item.load <= 0) {
      errors.push(
        `Load value for dead load item ${itemIndex + 1} must be greater than 0.`
      );
    }
  } else if (item.type === "thickness") {
    if (item.thickness <= 0) {
      errors.push(
        `Thickness for dead load item ${itemIndex + 1} must be greater than 0.`
      );
    }
    if (item.unit_weight <= 0) {
      errors.push(
        `Unit weight for dead load item ${
          itemIndex + 1
        } must be greater than 0.`
      );
    }
  }

  return errors;
};

/**
 * TableSetting 검증 함수
 */
const validateTableSetting = (
  tableSetting: FloorLoadState["table_setting"]
): string[] => {
  const errors: string[] = [];

  // table_setting 리스트 길이 검증
  if (tableSetting.length === 0) {
    errors.push("At least one table setting is required.");
    return errors;
  }

  // 각 테이블 항목 검증
  tableSetting.forEach((table, tableIndex) => {
    // name 검증
    if (isEmptyOrWhitespace(table.name)) {
      errors.push(`Please enter a name for table ${tableIndex + 1}.`);
    }

    // dead_load 리스트 길이 검증
    if (table.dead_load.length === 0) {
      errors.push(
        `Table ${tableIndex + 1} requires at least one dead load item.`
      );
    } else {
      // 각 dead_load 항목 검증
      table.dead_load.forEach((deadLoadItem, deadLoadIndex) => {
        const deadLoadErrors = validateDeadLoadItem(
          deadLoadItem,
          deadLoadIndex
        );
        errors.push(
          ...deadLoadErrors.map((error) => `Table ${tableIndex + 1}: ${error}`)
        );
      });
    }
  });

  return errors;
};

/**
 * FloorLoadState 전체 검증 함수
 * @param floorLoadData - 검증할 바닥하중 데이터
 * @returns 검증 오류 메시지 배열 (빈 배열이면 검증 통과)
 */
export const validateFloorLoadData = (
  floorLoadData: FloorLoadState
): string[] => {
  const errors: string[] = [];

  // global_setting 검증
  const globalErrors = validateGlobalSetting(floorLoadData.global_setting);
  errors.push(...globalErrors);

  // table_setting 검증
  const tableErrors = validateTableSetting(floorLoadData.table_setting);
  errors.push(...tableErrors);

  return errors;
};

/**
 * FloorLoadState 검증 및 스낵바 메시지 표시 함수
 * @param floorLoadData - 검증할 바닥하중 데이터
 * @param showMessage - 스낵바 메시지 표시 콜백 함수
 * @returns 검증 통과 여부
 */
export const validateAndShowMessage = (
  floorLoadData: FloorLoadState,
  showMessage?: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void
): boolean => {
  const errors = validateFloorLoadData(floorLoadData);

  if (errors.length > 0) {
    // 첫 번째 오류 메시지를 스낵바로 표시
    if (showMessage) {
      showMessage(errors[0], "error");
    }
    console.error("Input validation errors:", errors);
    return false;
  }

  // 검증 통과 시 성공 메시지 표시
  if (showMessage) {
    showMessage("Input data validation completed successfully.", "success");
  }
  return true;
};
