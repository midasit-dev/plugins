import { FloorLoadState } from "../states/stateFloorLoad";
import { validateAndShowMessage } from "./inputValidation";
import { midasAPI } from "./common";

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
  try {
    console.log("MIDAS API 전송 시작:", floorLoadData);

    // 입력 데이터 검증
    const isValid = validateAndShowMessage(floorLoadData, showMessage);
    if (!isValid) {
      return; // 검증 실패 시 함수 종료 (이미 스낵바로 오류 메시지가 표시됨)
    }

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

    // FBLD 데이터가 비어있거나 존재하지 않는 경우
    if (!fbldData.FBLD || Object.keys(fbldData.FBLD).length === 0) {
      console.log("FBLD 데이터가 비어있음, 1부터 순서대로 키 번호 생성");
      keyNumbers = Array.from(
        { length: floorLoadData.table_setting.length },
        (_, index) => index + 1
      );
      console.log("생성된 키 번호 목록:", keyNumbers);
    } else {
      // 기존 FBLD 데이터에서 이름 목록 추출
      const existingNames = Object.values(fbldData.FBLD).map(
        (item: any) => item.NAME
      );
      console.log("기존 FBLD 이름 목록:", existingNames);

      // table_setting의 name들을 리스트로 만들기
      const tableSettingNames = floorLoadData.table_setting.map(
        (table) => table.name
      );
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
          const maxKey = Math.max(...allKeys);

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

    // 각 table_setting에 대해 FBLD 객체 생성
    for (let i = 0; i < floorLoadData.table_setting.length; i++) {
      const tableSetting = floorLoadData.table_setting[i];
      const keyNumber = keyNumbers[i];

      // dead_load의 합 계산
      const deadLoadSum = tableSetting.dead_load.reduce(
        (sum, load) => sum + load.load,
        0
      );

      newFbld[keyNumber.toString()] = {
        NAME: tableSetting.name,
        DESC: floorLoadData.global_setting.project_name,
        ITEM: [
          {
            LCNAME: floorLoadData.global_setting.dl_case_name,
            FLOOR_LOAD: -deadLoadSum, // 음수로 변환
            OPT_SUB_BEAM_WEIGHT: true,
          },
          {
            LCNAME: floorLoadData.global_setting.ll_case_name,
            FLOOR_LOAD: -tableSetting.live_load, // 음수로 변환
            OPT_SUB_BEAM_WEIGHT: false,
          },
        ],
      };
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

    // 성공 메시지 표시
    if (showMessage) {
      showMessage("MIDAS API transmission completed successfully.", "success");
    }
  } catch (error) {
    console.error("Error occurred during MIDAS API transmission:", error);

    // 에러 메시지 표시
    if (showMessage) {
      showMessage("An error occurred during MIDAS API transmission.", "error");
    }

    throw error;
  }
};
