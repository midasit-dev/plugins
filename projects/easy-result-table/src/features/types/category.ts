/**
 * @fileoverview
 * 구조 해석 결과 테이블에서 사용되는 카테고리, 아이템, 설정 관련 타입 정의.
 * 시스템 스타일, 단위 설정 및 카테고리별 기본값을 포함합니다.
 * 모든 카테고리와 아이템의 기본 구조를 정의하며, 프로젝트 전반에서 사용되는
 * 타입 시스템의 기반이 됩니다.
 */

import {
  LoadCaseNameSettings,
  SystemStyleSettings,
  SystemUnitSettings,
  StoryDriftParameterSettings,
  StoryDriftMethodSettings,
  StoryStiffnessMethodSettings,
  AngleSettingSettings,
  StabilityCoefficientParameterSettings,
} from "./panels";

// 패널 타입을 명시적으로 정의
export const PanelTypes = {
  SYSTEM_STYLE: "SystemStyle",
  SYSTEM_UNIT: "SystemUnit",
  LOAD_CASE_NAME: "LoadCaseName",
  STORY_DRFIT_PARAMETER: "StoryDriftParameter",
  STORY_DRIFT_METHOD: "StoryDriftMethod",
  STORY_STIFFNESS_METHOD: "StoryStiffnessMethod",
  ANGLE_SETTING: "AngleSetting",
  STABILITY_COEFFICIENT_PARAMETER: "StabilityCoefficientParameter",
} as const;

// 패널 타입 유니온 타입 정의
export type PanelType = (typeof PanelTypes)[keyof typeof PanelTypes];

// 설정 키 타입을 PanelTypes에서 파생
export type SettingsKey = Lowercase<PanelType>;

// 설정 타입 매핑
export type SettingsTypeMap = {
  [PanelTypes.SYSTEM_STYLE]: SystemStyleSettings;
  [PanelTypes.SYSTEM_UNIT]: SystemUnitSettings;
  [PanelTypes.LOAD_CASE_NAME]: LoadCaseNameSettings;
  [PanelTypes.STORY_DRFIT_PARAMETER]: StoryDriftParameterSettings;
  [PanelTypes.STORY_DRIFT_METHOD]: StoryDriftMethodSettings;
  [PanelTypes.STORY_STIFFNESS_METHOD]: StoryStiffnessMethodSettings;
  [PanelTypes.ANGLE_SETTING]: AngleSettingSettings;
  [PanelTypes.STABILITY_COEFFICIENT_PARAMETER]: StabilityCoefficientParameterSettings;
};

export interface ItemSettings {
  [PanelTypes.SYSTEM_STYLE]?: SystemStyleSettings;
  [PanelTypes.SYSTEM_UNIT]?: SystemUnitSettings;
  [PanelTypes.LOAD_CASE_NAME]?: LoadCaseNameSettings;
  [PanelTypes.STORY_DRFIT_PARAMETER]?: StoryDriftParameterSettings;
  [PanelTypes.STORY_DRIFT_METHOD]?: StoryDriftMethodSettings;
  [PanelTypes.STORY_STIFFNESS_METHOD]?: StoryStiffnessMethodSettings;
  [PanelTypes.ANGLE_SETTING]?: AngleSettingSettings;
  [PanelTypes.STABILITY_COEFFICIENT_PARAMETER]?: StabilityCoefficientParameterSettings;
  [key: string]: any;
}

// 각 항목 타입별로 필요한 패널 정보를 정의
export interface ItemTypeInfo {
  panels: PanelType[]; // 해당 항목에 필요한 패널들
  defaultSettings?: ItemSettings; // 해당 항목의 기본 설정값
}

export interface TableItem {
  id: string;
  name: string;
  type: string;
  isSelected: boolean;
  createdAt: Date;
  settings: ItemSettings;
}

export interface Category {
  id: string;
  name: string;
  items: TableItem[];
  availableItems: string[];
  itemTypeInfo: Record<string, ItemTypeInfo>; // 각 availableItems의 항목별 패널 정보
}

export type Categories = Category[];

/********************************************************************************
 * @description 미리 정의된 카테고리와 항목들
 *********************************************************************************/
export const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Reaction",
    items: [],
    availableItems: ["REACTIONG"],
    itemTypeInfo: {
      REACTIONG: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 6,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
    },
  },
  {
    id: "2",
    name: "Vibration Mode Shape",
    items: [],
    availableItems: ["EIGENVALUEMODE"],
    itemTypeInfo: {
      EIGENVALUEMODE: {
        panels: [PanelTypes.SYSTEM_STYLE, PanelTypes.SYSTEM_UNIT],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
        },
      },
    },
  },
  {
    id: "3",
    name: "Story Drift",
    items: [],
    availableItems: ["STORY_DRIFT_X", "STORY_DRIFT_Y"],
    itemTypeInfo: {
      STORY_DRIFT_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRFIT_PARAMETER,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRFIT_PARAMETER]: {
            deflectionFactor: 3.0,
            importanceFactor: 1.5,
            scaleFactor: 1.0,
            allowableRatio: 0.015,
            combinations: [],
          },
        },
      },
      STORY_DRIFT_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRFIT_PARAMETER,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRFIT_PARAMETER]: {
            deflectionFactor: 3.0,
            importanceFactor: 1.5,
            scaleFactor: 1.0,
            allowableRatio: 0.015,
            combinations: [],
          },
        },
      },
    },
  },
  {
    id: "4",
    name: "Story Displacement",
    items: [],
    availableItems: ["STORY_DISPLACEMENT_X", "STORY_DISPLACEMENT_Y"],
    itemTypeInfo: {
      STORY_DISPLACEMENT_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
      STORY_DISPLACEMENT_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
    },
  },
  {
    id: "5",
    name: "Story Shear(Response Spectrum Analysis)",
    items: [],
    availableItems: ["STORY_SHEAR_FOR_RS"],
    itemTypeInfo: {
      STORY_SHEAR_FOR_RS: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Scientific",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "dynamic",
          },
        },
      },
    },
  },
  {
    id: "6",
    name: "Story Eccentricity",
    items: [],
    availableItems: ["STORY_ECNTRICITY"],
    itemTypeInfo: {
      STORY_ECNTRICITY: {
        panels: [PanelTypes.SYSTEM_STYLE, PanelTypes.SYSTEM_UNIT],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 2,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
        },
      },
    },
  },
  {
    id: "7",
    name: "Story Shear Force Ratio",
    items: [],
    availableItems: ["STORY_SHEAR_FORCE_RATIO"],
    itemTypeInfo: {
      STORY_SHEAR_FORCE_RATIO: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.ANGLE_SETTING,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "static_dynamic",
          },
          [PanelTypes.ANGLE_SETTING]: {
            angle: 0,
          },
        },
      },
    },
  },
  {
    id: "8",
    name: "Stability Coefficient",
    items: [],
    availableItems: [
      "STORY_STABILITY_COEFFICIENT_X",
      "STORY_STABILITY_COEFFICIENT_Y",
    ],
    itemTypeInfo: {
      STORY_STABILITY_COEFFICIENT_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STABILITY_COEFFICIENT_PARAMETER,
          PanelTypes.STORY_DRIFT_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STABILITY_COEFFICIENT_PARAMETER]: {
            deflectionFactor: 3.0,
            importanceFactor: 1.5,
            scaleFactor: 1.0,
            combinations: [],
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
        },
      },
      STORY_STABILITY_COEFFICIENT_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STABILITY_COEFFICIENT_PARAMETER,
          PanelTypes.STORY_DRIFT_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STABILITY_COEFFICIENT_PARAMETER]: {
            deflectionFactor: 3.0,
            importanceFactor: 1.5,
            scaleFactor: 1.0,
            combinations: [],
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
        },
      },
    },
  },
  {
    id: "9",
    name: "Weight Irregularity Check",
    items: [],
    availableItems: ["WEIGHT_IRREGULARITY_X", "WEIGHT_IRREGULARITY_Y"],
    itemTypeInfo: {
      WEIGHT_IRREGULARITY_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRIFT_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
        },
      },
      WEIGHT_IRREGULARITY_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRIFT_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
        },
      },
    },
  },
  {
    id: "10",
    name: "Overturning Moment",
    items: [],
    availableItems: ["OVERTURNING_MOMENT"],
    itemTypeInfo: {
      OVERTURNING_MOMENT: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.ANGLE_SETTING,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 2,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.ANGLE_SETTING]: {
            angle: 0,
          },
        },
      },
    },
  },
  {
    id: "11",
    name: "Story Axial Force Sum",
    items: [],
    availableItems: ["STORY_AXIAL_FORCE_SUM"],
    itemTypeInfo: {
      STORY_AXIAL_FORCE_SUM: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "static",
          },
        },
      },
    },
  },
  {
    id: "12",
    name: "Torsional Irregularity Check",
    items: [],
    availableItems: ["TORSIONAL_IRREGULARITY_X", "TORSIONAL_IRREGULARITY_Y"],
    itemTypeInfo: {
      TORSIONAL_IRREGULARITY_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
      TORSIONAL_IRREGULARITY_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 4,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
    },
  },
  {
    id: "13",
    name: "Torsional Amplification Factor",
    items: [],
    availableItems: [
      "TORSIONAL_AMPLIFICATION_FACTOR_X",
      "TORSIONAL_AMPLIFICATION_FACTOR_Y",
    ],
    itemTypeInfo: {
      TORSIONAL_AMPLIFICATION_FACTOR_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
      TORSIONAL_AMPLIFICATION_FACTOR_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "mm",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
        },
      },
    },
  },
  {
    id: "14",
    name: "Stiffness Irregularity Check(Soft Story)",
    items: [],
    availableItems: ["STIFNESS_IRREGULARITY_X", "STIFNESS_IRREGULARITY_Y"],
    itemTypeInfo: {
      STIFNESS_IRREGULARITY_X: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRIFT_METHOD,
          PanelTypes.STORY_STIFFNESS_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
          [PanelTypes.STORY_STIFFNESS_METHOD]: {
            method: "1 / story drift ratio",
          },
        },
      },
      STIFNESS_IRREGULARITY_Y: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.LOAD_CASE_NAME,
          PanelTypes.STORY_DRIFT_METHOD,
          PanelTypes.STORY_STIFFNESS_METHOD,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.LOAD_CASE_NAME]: {
            loadCases: [],
            selectAll: false,
            loadCaseType: "default",
          },
          [PanelTypes.STORY_DRIFT_METHOD]: {
            method: "drift at the center of mass",
          },
          [PanelTypes.STORY_STIFFNESS_METHOD]: {
            method: "1 / story drift ratio",
          },
        },
      },
    },
  },
  {
    id: "15",
    name: "Capacity Irregularity Check(Weak Story)",
    items: [],
    availableItems: ["CAPACITY_IRREGULARITY"],
    itemTypeInfo: {
      CAPACITY_IRREGULARITY: {
        panels: [
          PanelTypes.SYSTEM_STYLE,
          PanelTypes.SYSTEM_UNIT,
          PanelTypes.ANGLE_SETTING,
        ],
        defaultSettings: {
          [PanelTypes.SYSTEM_STYLE]: {
            style: "Fixed",
            decimalPlaces: 3,
          },
          [PanelTypes.SYSTEM_UNIT]: {
            force: "kN",
            distance: "m",
          },
          [PanelTypes.ANGLE_SETTING]: {
            angle: 0,
          },
        },
      },
    },
  },
];
