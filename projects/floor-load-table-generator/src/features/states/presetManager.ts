import { FloorLoadState } from "./stateFloorLoad";
import apartPreset from "./preset_apart.json";
import parkingPreset from "./preset_parking.json";

// 프리셋 정보 인터페이스
export interface PresetInfo {
  id: string;
  name: string;
  description: string;
  data: FloorLoadState;
}

// 프리셋 메타데이터 정의
const presetMetadata: Omit<PresetInfo, "data">[] = [
  {
    id: "apart",
    name: "설계하중 (아파트)",
    description:
      "침실/거실, 발코니, 현관, 욕실/다용도실, 창고, AC룸 등의 기본 설정",
  },
  {
    id: "parking",
    name: "설계하중 (지하주차장)",
    description:
      "지상1층 조경/야외, 지하주차장, SUNKEN, 팬룸, 부대복리시설 등의 기본 설정",
  },
];

// 프리셋 데이터 매핑
const presetDataMap = {
  apart: apartPreset,
  parking: parkingPreset,
};

// 모든 프리셋 목록 가져오기
export const getAllPresets = (): PresetInfo[] => {
  return presetMetadata.map((metadata) => ({
    ...metadata,
    data: presetDataMap[
      metadata.id as keyof typeof presetDataMap
    ] as FloorLoadState,
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
    data: data as FloorLoadState,
  };
};

// 프리셋 ID로 데이터만 로드
export const loadPresetById = (presetId: string): FloorLoadState | null => {
  const preset = getPresetById(presetId);
  return preset ? preset.data : null;
};
