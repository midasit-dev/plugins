import { midasAPI } from "./common";

export interface LoadCaseItem {
  NO: number;
  NAME: string;
  TYPE: string;
  DESC: string;
}

export interface LoadCaseResponse {
  STLD: {
    [key: string]: LoadCaseItem;
  };
}

export const getLoadCaseList = async (
  setSnackbar?: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void
) => {
  try {
    const response = await midasAPI("GET", "/db/stld", {});

    // HTTP 상태 코드 확인
    if (response.status && (response.status < 200 || response.status >= 300)) {
      console.log(response.status);
      setSnackbar?.(`API Error: ${response.status}`, "error");
      return null;
    }

    // NAME 필드만 추출하여 리스트 생성
    const loadCaseNames: string[] = [];
    if (response.STLD) {
      Object.values(response.STLD).forEach((item: any) => {
        if (item.NAME) {
          loadCaseNames.push(item.NAME);
        }
      });
      setSnackbar?.("Load Case List fetched successfully", "success");
    }

    return loadCaseNames;
  } catch (error) {
    console.error("Load Case List Error:", error);
    setSnackbar?.("Failed to get load case list", "error");
    return null;
  }
};
