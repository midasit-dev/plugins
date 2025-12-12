/**
 * @fileoverview
 * 패널 컴포넌트 레지스트리.
 * 패널 타입과 해당 컴포넌트를 매핑하여 관리합니다.
 * 새로운 패널 추가 시 이 파일에만 등록하면 됩니다.
 */

import { lazy } from "react";
import { PanelType, PanelTypes } from "../types/category";

// 패널 컴포넌트 타입 정의
export interface PanelProps {
  value: any;
  onChange: (newSettings: any) => void;
}

// 패널 컴포넌트 동적 import
const SystemStyleComponent = lazy(() => import("../panels/SystemStyle"));
const SystemUnitComponent = lazy(() => import("../panels/SystemUnit"));
const LoadCaseNameComponent = lazy(() => import("../panels/LoadCaseName"));
const StoryDriftParameterComponent = lazy(
  () => import("../panels/StoryDriftParameter")
);
const StoryDriftMethodComponent = lazy(
  () => import("../panels/StoryDriftMethod")
);
const StoryStiffnessMethodComponent = lazy(
  () => import("../panels/StoryStiffnessMethod")
);
const AngleSettingComponent = lazy(() => import("../panels/AngleSetting"));
const StabilityCoefficientParameterComponent = lazy(
  () => import("../panels/StabilityCoefficientParameter")
);

// 패널 타입별 컴포넌트 매핑
export const PANEL_COMPONENTS: Record<
  PanelType,
  React.ComponentType<PanelProps>
> = {
  [PanelTypes.SYSTEM_STYLE]: SystemStyleComponent,
  [PanelTypes.SYSTEM_UNIT]: SystemUnitComponent,
  [PanelTypes.LOAD_CASE_NAME]: LoadCaseNameComponent,
  [PanelTypes.STORY_DRFIT_PARAMETER]: StoryDriftParameterComponent,
  [PanelTypes.STORY_DRIFT_METHOD]: StoryDriftMethodComponent,
  [PanelTypes.STORY_STIFFNESS_METHOD]: StoryStiffnessMethodComponent,
  [PanelTypes.ANGLE_SETTING]: AngleSettingComponent,
  [PanelTypes.STABILITY_COEFFICIENT_PARAMETER]:
    StabilityCoefficientParameterComponent,
};

/**
 * 새로운 패널 추가 방법:
 * 1. types/category.ts의 PanelTypes에 새 패널 타입 추가
 * 2. panels/ 디렉토리에 새 패널 컴포넌트 생성
 * 3. 여기에 import 추가
 * 4. PANEL_COMPONENTS에 매핑 추가
 */
