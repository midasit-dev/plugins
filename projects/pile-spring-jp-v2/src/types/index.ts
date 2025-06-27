// 모든 타입들을 통합 export
export * from "./typePileDomain";
export * from "./typeSoilDomain";
export * from "./typePileViewer";
export * from "./typeLegacyData";

// 공통 타입들
export interface ProjectData {
  projectName: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: Date;
}
