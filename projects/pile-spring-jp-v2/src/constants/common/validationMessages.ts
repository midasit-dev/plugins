/**
 * @fileoverview 커스텀 검증 메시지 컴포넌트
 */

import { NotificationSeverity } from "../../hooks/common/useNotification";

export interface ValidationMessage {
  key: string;
  type: NotificationSeverity;
}

export const VALIDATION_MESSAGES_PILE: Record<string, ValidationMessage> = {
  // 기본 정보 검증
  PILE_NAME_REQUIRED: {
    key: "Pile_Name_is_Required",
    type: "warning",
  },
  TOP_LEVEL_INVALID: {
    key: "Top_Level_should_be_Number",
    type: "warning",
  },

  // 위치 정보 검증
  LOCATION_SPACE_INVALID: {
    key: "Location_Space_should_be_Number",
    type: "warning",
  },
  SPACE_INVALID: {
    key: "Space_should_be_greater_than_zero",
    type: "warning",
  },
  ANGLE_LENGTH_INVALID: {
    key: "Angle_length_should_be_space_length_plus_one",
    type: "warning",
  },
  ANGLE_INVALID: {
    key: "Angle_should_be_Number",
    type: "warning",
  },

  // 보강 정보 검증
  REINFORCED_METHOD_REQUIRED: {
    key: "Reinforced_Method_Required",
    type: "warning",
  },
  REINFORCED_CHECK_INVALID: {
    key: "Reinforced_Check_Invalid",
    type: "warning",
  },
  REINFORCED_START_INVALID: {
    key: "Reinforced_Start_Invalid",
    type: "warning",
  },
  REINFORCED_END_INVALID: {
    key: "Reinforced_End_Invalid",
    type: "warning",
  },
  REINFORCED_POINT_EXCEED_LENGTH: {
    key: "Reinforced_Point_Exceed_Length",
    type: "warning",
  },
  REINFORCED_THICKNESS_INVALID: {
    key: "Reinforced_Thickness_Invalid",
    type: "warning",
  },
  REINFORCED_MODULUS_INVALID: {
    key: "Reinforced_Modulus_Invalid",
    type: "warning",
  },

  // 단면 정보 검증
  SECTION_LENGTH_INVALID: {
    key: "Section_Length_Invalid",
    type: "warning",
  },
  CONCRETE_DIAMETER_INVALID: {
    key: "Concrete_Diameter_Invalid",
    type: "warning",
  },
  CONCRETE_THICKNESS_INVALID: {
    key: "Concrete_Thickness_Invalid",
    type: "warning",
  },
  CONCRETE_MODULUS_INVALID: {
    key: "Concrete_Modulus_Invalid",
    type: "warning",
  },
  STEEL_DIAMETER_INVALID: {
    key: "Steel_Diameter_Invalid",
    type: "warning",
  },
  STEEL_THICKNESS_INVALID: {
    key: "Steel_Thickness_Invalid",
    type: "warning",
  },
  STEEL_MODULUS_INVALID: {
    key: "Steel_Modulus_Invalid",
    type: "warning",
  },
  STEEL_COR_THICKNESS_INVALID: {
    key: "Steel_Cor_Thickness_Invalid",
    type: "warning",
  },

  // 저장/업데이트 관련
  SAVE_SUCCESS: {
    key: "Save_Success",
    type: "success",
  },
  SAVE_FAILED: {
    key: "Save_Failed",
    type: "error",
  },
  UPDATE_SUCCESS: {
    key: "Update_Success",
    type: "success",
  },
  UPDATE_FAILED: {
    key: "Update_Failed",
    type: "error",
  },
  NO_SELECTED_ITEM: {
    key: "No_Selected_Item",
    type: "warning",
  },
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES_PILE;
