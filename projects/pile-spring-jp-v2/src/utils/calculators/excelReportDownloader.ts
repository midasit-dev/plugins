/**
 * @fileoverview 엑셀 계산서 템플릿(BaseSheet*.xlsx)과 JSON을 외부 function-executor에
 * 전송하여 채워진 엑셀을 받고 파일을 다운로드합니다.
 * v1(`ExcelReport.tsx`)과 동일한 엔드포인트/절차를 사용합니다.
 */

export interface ExcelReportDownloadOptions {
  reportJson: unknown;
  language: string;
  projectName: string;
}

const BASE_SHEET_PATH: Record<string, string> = {
  kr: "BaseSheet.xlsx",
  jp: "BaseSheet_jp.xlsx",
};

const PLUGIN_EXECUTE_URL =
  "https://moa.midasit.com/backend/function-executor/plugin-execute";

export const downloadExcelReport = async (
  options: ExcelReportDownloadOptions
): Promise<void> => {
  const { reportJson, language, projectName } = options;
  const baseSheetFile = BASE_SHEET_PATH[language] ?? BASE_SHEET_PATH.jp;

  const sheetResponse = await fetch(baseSheetFile);
  if (!sheetResponse.ok) {
    throw new Error(`Failed to fetch base sheet: ${baseSheetFile}`);
  }
  const sheetBlob = await sheetResponse.blob();

  const formData = new FormData();
  formData.append("file", sheetBlob, baseSheetFile);
  formData.append("parameter", JSON.stringify(reportJson));

  const executorResponse = await fetch(PLUGIN_EXECUTE_URL, {
    method: "POST",
    body: formData,
  });
  if (!executorResponse.ok) {
    throw new Error(
      `Excel report generation failed (status ${executorResponse.status})`
    );
  }

  const blob = await executorResponse.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = projectName || "pile-spring-report";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
