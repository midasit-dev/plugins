import { FloorLoadState } from "../states/stateFloorLoad";
import { calculateLoad } from "./loadCalculation";
import { midasAPI } from "./common";
import { validateAndShowMessage } from "./inputValidation";

/**
 * 사용자의 현재 단위 시스템을 가져오는 함수
 * @returns 현재 단위 시스템 정보
 */
const getCurrentUnitSystem = async () => {
  try {
    const unitData = await midasAPI("GET", "/db/unit", {});
    if (unitData.status && (unitData.status < 200 || unitData.status >= 300)) {
      throw new Error(`API Error: ${unitData.status}`);
    }
    return unitData.UNIT;
  } catch (error) {
    console.error("단위 시스템 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 단위 시스템을 설정하는 함수
 * @param forceUnit - FORCE 단위 (예: "KN")
 * @param distUnit - DIST 단위 (예: "M")
 */
const setUnitSystem = async (forceUnit: string, distUnit: string) => {
  try {
    const unitData = {
      Assign: {
        "1": {
          FORCE: forceUnit,
          DIST: distUnit,
        },
      },
    };

    const response = await midasAPI("PUT", "/db/unit", unitData);
    if (response.status && (response.status < 200 || response.status >= 300)) {
      throw new Error(`API Error: ${response.status}`);
    }
    console.log(`단위 시스템이 ${forceUnit}/${distUnit}로 변경되었습니다.`);
  } catch (error) {
    console.error("단위 시스템 설정 실패:", error);
    throw error;
  }
};

/**
 * MIDAS API로 데이터를 전송하는 함수
 * @param floorLoadData - 전송할 바닥하중 데이터
 * @param showMessage - 스낵바 메시지 표시 콜백 함수
 */
export const exportFloorLoad = async (
  floorLoadData: FloorLoadState,
  showMessage?: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void
) => {
  let originalUnitSystem: any = null;

  try {
    console.log("MIDAS API 전송 시작:", floorLoadData);

    // 입력 데이터 검증
    const isValid = validateAndShowMessage(floorLoadData, showMessage);
    if (!isValid) {
      return; // 검증 실패 시 함수 종료 (이미 스낵바로 오류 메시지가 표시됨)
    }

    // dead_load에서 load가 0인 항목이 있는지 검증
    for (const category of floorLoadData.table_setting) {
      const categoryName = Object.keys(category)[0];
      const tables = category[categoryName];

      if (tables && tables.length > 0) {
        for (const table of tables) {
          for (const deadLoad of table.dead_load) {
            if (deadLoad.load === 0) {
              showMessage?.(
                `경고: "${table.name}" 테이블의 "${deadLoad.name}" 항목의 Load 값이 0입니다. Load 값을 확인해주세요.`,
                "warning"
              );
              return; // dead_load가 0인 항목이 있으면 API 전송 중단
            }
          }
        }
      }
    }

    // 1. 현재 사용자의 단위 시스템을 저장
    console.log("현재 단위 시스템을 가져오는 중...");
    originalUnitSystem = await getCurrentUnitSystem();
    console.log("저장된 원래 단위 시스템:", originalUnitSystem);

    // 2. 단위 시스템을 KN/M으로 변경
    console.log("단위 시스템을 KN/M으로 변경하는 중...");
    await setUnitSystem("KN", "M");

    // 다시 한번 검토 지금 지정한 Load Case가 있는가?
    const loadCase = await midasAPI("GET", "/db/stld", {});
    if (loadCase.status && (loadCase.status < 200 || loadCase.status >= 300)) {
      showMessage?.(`API Error: ${loadCase.status}`, "error");
      return null;
    } else {
      const loadCaseList = Object.values(loadCase.STLD).map(
        (item: any) => item.NAME
      );
      if (
        !loadCaseList.includes(floorLoadData.global_setting.dl_case_name) ||
        !loadCaseList.includes(floorLoadData.global_setting.ll_case_name)
      ) {
        showMessage?.(
          `Load Case ${floorLoadData.global_setting.dl_case_name} or ${floorLoadData.global_setting.ll_case_name} not found`,
          "error"
        );
        return null;
      }
    }

    // 자 이제 FBLD 객체를 만들서 보내야 하는데 우선, GET을 받아서 제품이 가지고 있고 있는 데이터와
    // 이름이 같은게 있으면 그 객체의 키번호를 가져오고, 없으면 최대 키번호를 가져와서 +1 해서 만든다.
    const fbldData = await midasAPI("GET", "/db/fbld", {});
    if (fbldData.status && (fbldData.status < 200 || fbldData.status >= 300)) {
      showMessage?.(`API Error: ${fbldData.status}`, "error");
      return null;
    }

    // FBLD 데이터에서 키 번호 결정
    let keyNumbers: number[];

    // 전체 테이블 개수 계산
    let totalTableCount = 0;
    for (const category of floorLoadData.table_setting) {
      const categoryName = Object.keys(category)[0];
      const tables = category[categoryName];
      // 빈 카테고리는 제외
      if (tables && tables.length > 0) {
        totalTableCount += tables.length;
      }
    }

    // FBLD 데이터가 비어있거나 존재하지 않는 경우
    if (!fbldData.FBLD || Object.keys(fbldData.FBLD).length === 0) {
      console.log("FBLD 데이터가 비어있음, 1부터 순서대로 키 번호 생성");
      keyNumbers = Array.from(
        { length: totalTableCount },
        (_, index) => index + 1
      );
      console.log("생성된 키 번호 목록:", keyNumbers);
    } else {
      // 기존 FBLD 데이터에서 이름 목록 추출
      const existingNames = Object.values(fbldData.FBLD).map(
        (item: any) => item.NAME
      );
      console.log("기존 FBLD 이름 목록:", existingNames);

      // 모든 테이블의 name들을 리스트로 만들기 (빈 카테고리 제외)
      const tableSettingNames: string[] = [];
      for (const category of floorLoadData.table_setting) {
        const categoryName = Object.keys(category)[0];
        const tables = category[categoryName];
        if (tables && tables.length > 0) {
          for (const table of tables) {
            tableSettingNames.push(table.name);
          }
        }
      }
      console.log("현재 table_setting 이름 목록:", tableSettingNames);

      // 각 table_setting 이름에 대해 키 번호 결정
      const tempKeyNumbers: number[] = [];
      const usedKeys = new Set<number>(); // 이미 사용된 키 번호 추적

      for (const tableName of tableSettingNames) {
        // 같은 이름이 있는지 확인
        const existingIndex = existingNames.indexOf(tableName);

        if (existingIndex !== -1) {
          // 같은 이름이 있으면 해당 키 번호 사용
          const existingKey = parseInt(
            Object.keys(fbldData.FBLD)[existingIndex]
          );
          tempKeyNumbers.push(existingKey);
          usedKeys.add(existingKey);
          console.log(
            `이름 "${tableName}"이 기존에 존재함, 키 번호 ${existingKey} 사용`
          );
        } else {
          // 같은 이름이 없으면 사용되지 않은 최소 키 번호 찾기
          const existingKeys = Object.keys(fbldData.FBLD).map((key) =>
            parseInt(key)
          );
          const allKeys = [...existingKeys, ...Array.from(usedKeys)];

          // 사용되지 않은 키 번호 찾기 (1부터 시작)
          let newKey = 1;
          while (allKeys.includes(newKey) || usedKeys.has(newKey)) {
            newKey++;
          }

          tempKeyNumbers.push(newKey);
          usedKeys.add(newKey);
          console.log(
            `이름 "${tableName}"이 새로 생성됨, 키 번호 ${newKey} 사용`
          );
        }
      }

      console.log("최종 키 번호 목록:", tempKeyNumbers);
      keyNumbers = tempKeyNumbers;
    }

    // 이제 키 번호를 가지고 FBLD 객체를 만들어서 보내야 한다.
    const newFbld: any = {};

    // 각 카테고리의 테이블들에 대해 FBLD 객체 생성 (빈 카테고리 제외)
    let tableIndex = 0;
    for (const category of floorLoadData.table_setting) {
      const categoryName = Object.keys(category)[0];
      const tables = category[categoryName];

      // 빈 카테고리는 건너뛰기
      if (!tables || tables.length === 0) {
        continue;
      }

      for (const tableSetting of tables) {
        const keyNumber = keyNumbers[tableIndex];

        // dead_load의 합 계산
        const deadLoadSum = tableSetting.dead_load.reduce(
          (sum, item) => sum + calculateLoad(item),
          0
        );

        // ITEM 배열 생성 - dead_load는 항상 포함
        const items = [
          {
            LCNAME: floorLoadData.global_setting.dl_case_name,
            FLOOR_LOAD: -deadLoadSum, // 음수로 변환
            OPT_SUB_BEAM_WEIGHT: true,
          },
        ];

        // live_load가 0이 아닐 때만 추가
        if (tableSetting.live_load !== 0) {
          items.push({
            LCNAME: floorLoadData.global_setting.ll_case_name,
            FLOOR_LOAD: -tableSetting.live_load, // 음수로 변환
            OPT_SUB_BEAM_WEIGHT: false,
          });
        }

        newFbld[keyNumber.toString()] = {
          NAME: tableSetting.name,
          DESC:
            floorLoadData.global_setting.project_name + " - " + categoryName,
          ITEM: items,
        };
        tableIndex++;
      }
    }

    console.log("생성된 FBLD 객체:", newFbld);

    const fbldResponse = await midasAPI("PUT", "/db/fbld", {
      Assign: newFbld,
    });
    if (
      fbldResponse.status &&
      (fbldResponse.status < 200 || fbldResponse.status >= 300)
    ) {
      showMessage?.(`API Error: ${fbldResponse.status}`, "error");
      return null;
    }

    // 3. 원래 사용자의 단위 시스템으로 복원
    if (originalUnitSystem) {
      console.log("원래 단위 시스템으로 복원하는 중...");
      await setUnitSystem(
        originalUnitSystem["1"].FORCE,
        originalUnitSystem["1"].DIST
      );
      console.log("단위 시스템이 원래대로 복원되었습니다.");
    }

    // 성공 메시지 표시
    if (showMessage) {
      showMessage("MIDAS API transmission completed successfully.", "success");
    }
  } catch (error) {
    console.error("Error occurred during MIDAS API transmission:", error);

    // 에러 발생 시에도 원래 단위 시스템으로 복원 시도
    if (originalUnitSystem) {
      try {
        console.log("에러 발생으로 인한 단위 시스템 복원 시도...");
        await setUnitSystem(
          originalUnitSystem["1"].FORCE,
          originalUnitSystem["1"].DIST
        );
        console.log("단위 시스템이 원래대로 복원되었습니다.");
      } catch (restoreError) {
        console.error("단위 시스템 복원 실패:", restoreError);
      }
    }

    // 에러 메시지 표시
    if (showMessage) {
      showMessage("An error occurred during MIDAS API transmission.", "error");
    }

    throw error;
  }
};
