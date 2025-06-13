import { atom } from "recoil";

// 인터페이스 정의
export interface ProjectData {
  projectName: string;
}

export const projectData = atom<ProjectData>({
  key: "projectData",
  default: {
    projectName: "",
  },
});
