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
