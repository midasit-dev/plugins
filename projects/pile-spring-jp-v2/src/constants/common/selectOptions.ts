/**
 * @fileoverview 커스텀 드롭다운 리스트 컴포넌트
 */

import { useTranslation } from "react-i18next";
import {
  HEAD_CONDITIONS,
  CONSTRUCTION_METHODS,
  BOTTOM_CONDITIONS,
  PILE_TYPES,
  REFERENCE_POINTS,
} from "../pile/constants";
import { SOIL_RESISTANCE_METHODS, SOIL_LAYER_TYPES } from "../soil/constants";

// 말뚝 두부 조건 옵션
export const HeadConditionItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(HEAD_CONDITIONS.FIXED), HEAD_CONDITIONS.FIXED],
    [t(HEAD_CONDITIONS.HINGE), HEAD_CONDITIONS.HINGE],
  ]);
};

// 말뚝 시공 방법 옵션
export const ConstructionMethodItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(CONSTRUCTION_METHODS.DROP_HAMMER), CONSTRUCTION_METHODS.DROP_HAMMER],
    [t(CONSTRUCTION_METHODS.VIBRO_HAMMER), CONSTRUCTION_METHODS.VIBRO_HAMMER],
    [t(CONSTRUCTION_METHODS.IN_SITU), CONSTRUCTION_METHODS.IN_SITU],
    [t(CONSTRUCTION_METHODS.BORING), CONSTRUCTION_METHODS.BORING],
    [t(CONSTRUCTION_METHODS.PREBORING), CONSTRUCTION_METHODS.PREBORING],
    [t(CONSTRUCTION_METHODS.SOIL_CEMENT), CONSTRUCTION_METHODS.SOIL_CEMENT],
    [t(CONSTRUCTION_METHODS.ROTATE), CONSTRUCTION_METHODS.ROTATE],
  ]);
};

// 말뚝 선단 조건 옵션
export const BottomConditionItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(BOTTOM_CONDITIONS.FREE), BOTTOM_CONDITIONS.FREE],
    [t(BOTTOM_CONDITIONS.HINGE), BOTTOM_CONDITIONS.HINGE],
    [t(BOTTOM_CONDITIONS.FIXED), BOTTOM_CONDITIONS.FIXED],
  ]);
};

// 말뚝 타입 옵션
export const PileTypeItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(PILE_TYPES.CAST_IN_SITU), PILE_TYPES.CAST_IN_SITU],
    [t(PILE_TYPES.PHC_PILE), PILE_TYPES.PHC_PILE],
    [t(PILE_TYPES.SC_PILE), PILE_TYPES.SC_PILE],
    [t(PILE_TYPES.STEEL_PILE), PILE_TYPES.STEEL_PILE],
    [t(PILE_TYPES.SOIL_CEMENT_PILE), PILE_TYPES.SOIL_CEMENT_PILE],
  ]);
};

// 말뚝 위치 참조점 X 옵션
export const PileRefPointLongItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(REFERENCE_POINTS.RIGHT), REFERENCE_POINTS.RIGHT],
    [t(REFERENCE_POINTS.LEFT), REFERENCE_POINTS.LEFT],
  ]);
};

// 말뚝 위치 참조점 Y 옵션
export const PileRefPointTranItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(REFERENCE_POINTS.TOP), REFERENCE_POINTS.TOP],
    [t(REFERENCE_POINTS.BOTTOM), REFERENCE_POINTS.BOTTOM],
  ]);
};

// 말뚝 위치 참조점 X 옵션
export const PileLocRefXItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(REFERENCE_POINTS.RIGHT), REFERENCE_POINTS.RIGHT],
    [t(REFERENCE_POINTS.LEFT), REFERENCE_POINTS.LEFT],
  ]);
};

// 말뚝 위치 참조점 Y 옵션
export const PileLocRefYItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(REFERENCE_POINTS.TOP), REFERENCE_POINTS.TOP],
    [t(REFERENCE_POINTS.BOTTOM), REFERENCE_POINTS.BOTTOM],
  ]);
};

// 토양 저항력 계산 방법 옵션
export const SoilResistanceMethodItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [
      t(SOIL_RESISTANCE_METHODS.CALCULATE_BY_N),
      SOIL_RESISTANCE_METHODS.CALCULATE_BY_N,
    ],
    [
      t(SOIL_RESISTANCE_METHODS.CALCULATE_BY_C),
      SOIL_RESISTANCE_METHODS.CALCULATE_BY_C,
    ],
  ]);
};

// 토양 층 유형 옵션
export const SoilLayerTypeItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t(SOIL_LAYER_TYPES.CLAY), SOIL_LAYER_TYPES.CLAY],
    [t(SOIL_LAYER_TYPES.SAND), SOIL_LAYER_TYPES.SAND],
    [t(SOIL_LAYER_TYPES.SANDSTONE), SOIL_LAYER_TYPES.SANDSTONE],
  ]);
};
