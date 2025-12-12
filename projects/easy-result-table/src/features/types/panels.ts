/**
 * @fileoverview
 * 패널 설정 타입 정의.
 */

/********************************************************************************
 * @description Story Drift Parameter 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/
export interface LoadCombination {
  loadCase: string;
  scaleFactor: number;
}

export interface StoryDriftParameterSettings {
  deflectionFactor: number;
  importanceFactor: number;
  scaleFactor: number;
  allowableRatio: number;
  combinations: LoadCombination[];
}

export interface StoryDriftParameterProps {
  value: StoryDriftParameterSettings;
  onChange: (newSettings: StoryDriftParameterSettings) => void;
}

export const DEFAULT_SETTINGS_STORYDRFITPARAMETER: StoryDriftParameterSettings =
  {
    deflectionFactor: 1,
    importanceFactor: 1.5,
    scaleFactor: 1,
    allowableRatio: 0.015,
    combinations: [],
  };

/********************************************************************************
 * @description Stability Coefficient Parameter 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface StabilityCoefficientParameterSettings {
  deflectionFactor: number;
  importanceFactor: number;
  scaleFactor: number;
  combinations: LoadCombination[];
}

export interface StabilityCoefficientParameterProps {
  value: StabilityCoefficientParameterSettings;
  onChange: (newSettings: StabilityCoefficientParameterSettings) => void;
}

export const DEFAULT_SETTINGS_STABILITYCOEFFICIENTPARAMETER: StabilityCoefficientParameterSettings =
  {
    deflectionFactor: 1,
    importanceFactor: 1.5,
    scaleFactor: 1,
    combinations: [],
  };

/********************************************************************************
 * @description Load Case Name 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface LoadCase {
  name: string;
  isChecked: boolean;
}

export interface LoadCaseNameSettings {
  loadCases: LoadCase[];
  selectAll: boolean;
  loadCaseType: "default" | "static" | "dynamic" | "static_dynamic" | string;
  fetchFunction?: () => string[];
  categoryId?: string;
  itemId?: string;
}

export interface LoadCaseNameProps {
  value: LoadCaseNameSettings;
  onChange: (newSettings: LoadCaseNameSettings) => void;
  height?: string;
}

export const DEFAULT_SETTINGS_LOADCASENAME: LoadCaseNameSettings = {
  loadCases: [],
  selectAll: false,
  loadCaseType: "default",
  categoryId: "",
  itemId: "",
};

/********************************************************************************
 * @description Story Drift Method 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface StoryDriftMethodSettings {
  method:
    | "drift at the center of mass"
    | "max. drift of outer extreme points"
    | "max. drift of all vertical elements";
}

export interface StoryDriftMethodProps {
  value: StoryDriftMethodSettings;
  onChange: (newSettings: StoryDriftMethodSettings) => void;
}

export const DEFAULT_SETTINGS_STORDRIFTMETHOD: StoryDriftMethodSettings = {
  method: "drift at the center of mass",
};

/********************************************************************************
 * @description Story Stiffness Method 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface StoryStiffnessMethodSettings {
  method: "1 / story drift ratio" | "story shear / story drift";
}

export interface StoryStiffnessMethodProps {
  value: StoryStiffnessMethodSettings;
  onChange: (newSettings: StoryStiffnessMethodSettings) => void;
}

export const DEFAULT_SETTINGS_STORYSTIFFNESSMETHOD: StoryStiffnessMethodSettings =
  {
    method: "1 / story drift ratio",
  };

/********************************************************************************
 * @description Angle Setting 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface AngleSettingSettings {
  angle: number;
}

export interface AngleSettingProps {
  value: AngleSettingSettings;
  onChange: (newSettings: AngleSettingSettings) => void;
}

export const DEFAULT_SETTINGS_ANGLESETTING: AngleSettingSettings = {
  angle: 0,
};

/********************************************************************************
 * @description System Style 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface SystemStyleSettings {
  style: string;
  decimalPlaces: number;
}

export interface SystemStyleProps {
  value?: SystemStyleSettings; // 현재 스타일 설정 값
  onChange: (newSettings: SystemStyleSettings) => void; // 설정 변경 핸들러
}

export const DEFAULT_SETTINGS_SYSTEMSTYLE: SystemStyleSettings = {
  style: "Default",
  decimalPlaces: 0,
};

/********************************************************************************
 * @description System Unit 패널에서 사용되는 설정 타입 정의.
 *********************************************************************************/

export interface SystemUnitSettings {
  force: string;
  distance: string;
}

export interface SystemUnitProps {
  value?: SystemUnitSettings; // 현재 단위 설정 값
  onChange: (newSettings: SystemUnitSettings) => void; // 설정 변경 핸들러
}

export const DEFAULT_SETTINGS_SYSTEMUNIT: SystemUnitSettings = {
  force: "kN",
  distance: "mm",
};
