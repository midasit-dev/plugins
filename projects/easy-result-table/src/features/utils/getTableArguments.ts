/**
 * @fileoverview 테이블 데이터 불러오는 함수
 */
import { Category } from "../types/category";
import { PanelTypes } from "../types/category";

export interface GetTableArgumentState {
  Argument: {
    TABLE_NAME: string;
    TABLE_TYPE: string;
    UNIT?: {
      FORCE: string | undefined;
      DIST: string | undefined;
    };
    STYLES?: {
      FORMAT: string | undefined;
      PLACE: number | undefined;
    };
    LOAD_CASE_NAMES?: string[];
    NODE_ELEMS?: {
      KEYS: number[];
    };
    MODES?: string[];
    ADDITIONAL?: {
      SET_STORY_DRIFT_PARAMS?: {
        RESPONSE_MOD_FACTOR_CHECK: boolean;
        DEFLECTION_AMPL_FACTOR_VALUE: number;
        IMPORTANCE_FACTOR_VALUE: number;
        SCALE_FACTOR_VALUE: number;
        ALLOWABLE_RATIO: number;
        LCOMS: {
          NAME: string;
          FACTOR: number;
        }[];
        BETA: {
          FIX_USER_CHECK: string;
          VALUE: number;
        };
      };
      SET_STABILITY_COEFFICIENT_PARAMS?: {
        RESPONSE_MOD_FACTOR_CHECK: boolean;
        DEFLECTION_AMPL_FACTOR_VALUE: number;
        IMPORTANCE_FACTOR_VALUE: number;
        SCALE_FACTOR_VALUE: number;
        LCOMS: {
          NAME: string;
          FACTOR: number;
        }[];
        BETA: {
          FIX_USER_CHECK: string;
          VALUE: number;
        };
      };
      SET_CALCULATION_METHOD?: {
        STORY_DRIFT_METHOD: string;
        STORY_STIFFNESS_METHOD: string;
      };
      SET_ANGLE?: {
        ANGLE: number;
      };
    };
  };
}

export function getTableNumber(categories: Category[]): number {
  let tableNumber = 0;
  for (const category of categories) {
    tableNumber += category.items.length;
  }
  return tableNumber;
}

/**
 * @description GET REACTION TABLE
 */
export function getTableArgument(
  categories: Category[]
): GetTableArgumentState[] {
  const tableArgument: GetTableArgumentState[] = [];
  let tempData: GetTableArgumentState;

  for (const category of categories) {
    if (category.items.length > 0) {
      let index = 0;
      for (const item of category.items) {
        index++;

        // 기본 Argument 구조 생성
        const baseArgument: {
          TABLE_NAME: string;
          TABLE_TYPE: string;
          UNIT?: {
            FORCE: string | undefined;
            DIST: string | undefined;
          };
          STYLES?: {
            FORMAT: string | undefined;
            PLACE: number | undefined;
          };
          LOAD_CASE_NAMES?: string[];
        } = {
          TABLE_NAME: category.name + "_#" + index,
          TABLE_TYPE: item.type,
        };

        // 카테고리의 itemTypeInfo에서 필요한 패널 정보 가져오기
        const itemInfo = category.itemTypeInfo[item.type];
        if (!itemInfo) continue;

        // Unit 이 필요한 경우 추가
        if (itemInfo.panels.includes(PanelTypes.SYSTEM_UNIT)) {
          baseArgument.UNIT = {
            FORCE: item.settings.SystemUnit?.force,
            DIST: item.settings.SystemUnit?.distance,
          };
        }

        // Style 이 필요한 경우 추가
        if (itemInfo.panels.includes(PanelTypes.SYSTEM_STYLE)) {
          baseArgument.STYLES = {
            FORMAT: item.settings.SystemStyle?.style,
            PLACE: item.settings.SystemStyle?.decimalPlaces,
          };
        }

        // LoadCaseName이 필요한 경우 추가
        if (
          itemInfo.panels.includes(PanelTypes.LOAD_CASE_NAME) &&
          item.settings.LoadCaseName
        ) {
          baseArgument.LOAD_CASE_NAMES = item.settings.LoadCaseName.loadCases
            .filter((loadCase) => loadCase.isChecked)
            .map((loadCase) => loadCase.name);
        }

        // ADDITIONAL 설정 구성
        let additional = {};

        // Story Drift Parameter 설정
        if (itemInfo.panels.includes(PanelTypes.STORY_DRFIT_PARAMETER)) {
          additional = {
            SET_STORY_DRIFT_PARAMS: {
              RESPONSE_MOD_FACTOR_CHECK: false,
              DEFLECTION_AMPL_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.deflectionFactor,
              IMPORTANCE_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.importanceFactor,
              SCALE_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.scaleFactor,
              ALLOWABLE_RATIO:
                item.settings.StoryDriftParameter?.allowableRatio,
              LCOMS: [
                ...(item.settings.StoryDriftParameter?.combinations.map(
                  (combination) => ({
                    NAME: combination.loadCase,
                    FACTOR: combination.scaleFactor,
                  })
                ) || []),
              ],
              BETA: {
                FIX_USER_CHECK: "FIXED",
                VALUE: 1,
              },
            },
          };
        }

        // Stability Coefficient Parameter 설정
        if (
          itemInfo.panels.includes(PanelTypes.STABILITY_COEFFICIENT_PARAMETER)
        ) {
          additional = {
            ...additional,
            SET_STABILITY_COEFFICIENT_PARAMS: {
              RESPONSE_MOD_FACTOR_CHECK: false,
              DEFLECTION_AMPL_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.deflectionFactor,
              IMPORTANCE_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.importanceFactor,
              SCALE_FACTOR_VALUE:
                item.settings.StoryDriftParameter?.scaleFactor,
              LCOMS: [
                ...(item.settings.StoryDriftParameter?.combinations.map(
                  (combination) => ({
                    NAME: combination.loadCase,
                    FACTOR: combination.scaleFactor,
                  })
                ) || []),
              ],
              BETA: {
                FIX_USER_CHECK: "FIXED",
                VALUE: 1,
              },
            },
          };
        }

        // Story Drift Method 설정
        if (itemInfo.panels.includes(PanelTypes.STORY_DRIFT_METHOD)) {
          additional = {
            ...additional,
            SET_CALCULATION_METHOD: {
              ...((additional as any).SET_CALCULATION_METHOD || {}),
              STORY_DRIFT_METHOD: item.settings.StoryDriftMethod?.method,
            },
          };
        }

        // Story Stiffness Method 설정
        if (itemInfo.panels.includes(PanelTypes.STORY_STIFFNESS_METHOD)) {
          additional = {
            ...additional,
            SET_CALCULATION_METHOD: {
              ...((additional as any).SET_CALCULATION_METHOD || {}),
              STORY_STIFFNESS_METHOD:
                item.settings.StoryStiffnessMethod?.method,
            },
          };
        }

        // Angle Setting 설정
        if (itemInfo.panels.includes(PanelTypes.ANGLE_SETTING)) {
          additional = {
            ...additional,
            SET_ANGLE: {
              ANGLE: item.settings.AngleSetting?.angle,
            },
          };
        }

        // ADDITIONAL 필드가 있는 경우에만 추가
        const finalArgument = {
          ...baseArgument,
          ...(Object.keys(additional).length > 0
            ? { ADDITIONAL: additional }
            : {}),
        };

        tempData = {
          Argument: finalArgument,
        };

        tableArgument.push(tempData);
      }
    }
  }

  return tableArgument;
}
