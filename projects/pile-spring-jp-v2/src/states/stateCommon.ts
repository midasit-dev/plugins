/**
 * @fileoverview 공통 상태 관리를 위한 Recoil atoms
 */

import { atom } from "recoil";

// 프로젝트 데이터 인터페이스
export interface ProjectData {
  projectName: string;
}

// 프로젝트 데이터 atom
export const projectData = atom<ProjectData>({
  key: "projectData",
  default: {
    projectName: "",
  },
});

// Civil NX 좌표계 기반 읽기 타입 (Type1 / Type2)
// - Type1: 축 순서 X → Z 기준으로 매트릭스를 조합 (CenterX / CenterZ 의미)
// - Type2: 축 순서를 뒤집어 Z → X 기준으로 조합
export type CivilImportType = "Type1" | "Type2";

export const importTypeState = atom<CivilImportType>({
  key: "importTypeState",
  default: "Type1",
});
