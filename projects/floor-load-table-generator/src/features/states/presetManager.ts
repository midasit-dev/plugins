import commercialPreset from "./preset_commercial.json";
import commonPreset from "./preset_common.json";
import factoryPreset from "./preset_factory.json";
import housePreset from "./preset_house.json";
import { FloorLoadState, TableSetting } from "./stateFloorLoad";

// 프리셋 정보 인터페이스
export interface PresetInfo {
  id: string;
  name: string;
  description: string;
  data: FloorLoadState | TableSetting[];
}

// 프리셋 메타데이터 정의
const presetMetadata: Omit<PresetInfo, "data">[] = [
  {
    id: "common",
    name: "공통 설계하중",
    description:
      "주차장 주차구역, 주차장 차로, 기계실, 지붕, 옥상정원 등의 기본 설정",
  },
  {
    id: "commercial",
    name: "상업시설 설계하중",
    description: "판매시설, 업무시설, 화장실, 계단실 등의 기본 설정",
  },
  {
    id: "factory",
    name: "공장 설계하중",
    description:
      "경공업 공장, 중공업 공장, 경량품 저장창고, 중량품 저장창고 등의 기본 설정",
  },
  {
    id: "house",
    name: "주택 설계하중",
    description: "거실/장판류, 거실/석재, 욕실, 현관, 발코니 등의 기본 설정",
  },
];

// 프리셋 데이터 매핑
const presetDataMap = {
  common: commonPreset,
  commercial: commercialPreset,
  factory: factoryPreset,
  house: housePreset,
};

// 모든 프리셋 목록 가져오기
export const getAllPresets = (): PresetInfo[] => {
  return presetMetadata.map((metadata) => ({
    ...metadata,
    data: presetDataMap[metadata.id as keyof typeof presetDataMap] as
      | FloorLoadState
      | TableSetting[],
  }));
};

// 프리셋 ID로 프리셋 찾기
export const getPresetById = (id: string): PresetInfo | undefined => {
  const metadata = presetMetadata.find((preset) => preset.id === id);
  if (!metadata) return undefined;

  const data = presetDataMap[metadata.id as keyof typeof presetDataMap];
  if (!data) return undefined;

  return {
    ...metadata,
    data: data as FloorLoadState | TableSetting[],
  };
};

// 프리셋 ID로 데이터만 로드
export const loadPresetById = (presetId: string): FloorLoadState | null => {
  const preset = getPresetById(presetId);
  if (!preset) return null;

  // 새로운 프리셋 구조인 경우 null 반환 (전체 상태 교체가 아닌 개별 테이블 추가용)
  if (Array.isArray(preset.data)) {
    return null;
  }

  return preset.data as FloorLoadState;
};
