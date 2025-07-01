/**
 * @fileoverview
 * 구조 해석 결과 테이블에서 사용되는 카테고리, 아이템, 설정 관련 타입 정의.
 * 시스템 스타일, 단위 설정 및 카테고리별 기본값을 포함합니다.
 * 모든 카테고리와 아이템의 기본 구조를 정의하며, 프로젝트 전반에서 사용되는
 * 타입 시스템의 기반이 됩니다.
 */

export interface SystemStyleSettings {
  style: string;
  decimalPlaces: number;
}

export interface SystemUnitSettings {
  force: string;
  distance: string;
}

export interface ItemSettings {
  systemStyle?: SystemStyleSettings;
  systemUnit?: SystemUnitSettings;
  [key: string]: any; // 추후 추가될 수 있는 다른 설정들을 위한 인덱스 시그니처
}

// 패널 정보를 정의하는 타입
export type PanelType = "SystemStyle" | "SystemUnit";

// 각 항목 타입별로 필요한 패널 정보를 정의
export interface ItemTypeInfo {
  panels: PanelType[]; // 해당 항목에 필요한 패널들
  defaultSettings?: ItemSettings; // 해당 항목의 기본 설정값
}

export interface TodoItem {
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
  items: TodoItem[];
  availableItems: string[];
  itemTypeInfo: Record<string, ItemTypeInfo>; // 각 availableItems의 항목별 패널 정보
}

export type Categories = Category[];

// 미리 정의된 카테고리와 항목들
export const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Reaction",
    items: [],
    availableItems: ["REACTIONG"],
    itemTypeInfo: {
      REACTIONG: {
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
          },
        },
      },
      STORY_DRIFT_Y: {
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
          },
        },
      },
      STORY_DISPLACEMENT_Y: {
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
      STORY_STABILITY_COEFFICIENT_Y: {
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
      WEIGHT_IRREGULARITY_Y: {
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle", "SystemUnit"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
          systemUnit: {
            force: "kN",
            distance: "mm",
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
      TORSIONAL_IRREGULARITY_Y: {
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
      TORSIONAL_AMPLIFICATION_FACTOR_Y: {
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
      STIFNESS_IRREGULARITY_Y: {
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
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
        panels: ["SystemStyle"],
        defaultSettings: {
          systemStyle: {
            style: "Default",
            decimalPlaces: 0,
          },
        },
      },
    },
  },
];
