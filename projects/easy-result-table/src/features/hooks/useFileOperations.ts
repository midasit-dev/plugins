/**
 * @fileoverview
 * 파일 작업 관련 커스텀 훅.
 * 카테고리와 설정 데이터를 JSON 파일로 저장하고 불러오는 기능을 제공합니다.
 * 파일 저장/로드 시 Date 객체의 직렬화/역직렬화를 처리하며,
 * 작업 결과를 스낵바를 통해 알리는 기능을 포함합니다.
 */

import React, { useState, useRef, useMemo } from "react";
import { useRecoilState } from "recoil";
import {
  categoriesState,
  expandedCategoriesState,
  selectedItemState,
} from "../states/stateCategories";
import { Category, TableItem } from "../types/category";
import { useSnackbarMessage } from "./useSnackbarMessage";
import ValidationInput from "../utils/validationInput";
import { getTableArgument, getTableNumber } from "../utils/getTableArguments";
import { midasAPI } from "../utils/common";
import { tableDataState, TableData } from "../states/stateTableData";
import { useCreatePDF } from "./useCreatePDF";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// Date 객체를 포함한 Item을 직렬화하기 위한 인터페이스
interface SerializedTodoItem extends Omit<TableItem, "createdAt"> {
  createdAt: string; // ISO 문자열로 변환된 날짜
}

// 직렬화된 Item을 포함한 Category 인터페이스
interface SerializedCategory extends Omit<Category, "items"> {
  items: SerializedTodoItem[];
}

// 파일로 저장될 전체 데이터 구조
interface SavedData {
  categories: SerializedCategory[];
  expandedCategories: Record<string, boolean>;
}

interface ProcessingStatus {
  open: boolean;
  currentTableName: string;
  tableStatuses: {
    tableName: string;
    status: "PENDING" | "PROCESSING" | "OK" | "NG";
    errorMessage?: string;
    pdfStatus?: "PENDING" | "PROCESSING" | "OK" | "NG";
    pdfErrorMessage?: string;
  }[];
  canClose: boolean;
  isStopping: boolean;
}

export const useFileOperations = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState
  );
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  const [tableData, setTableData] = useRecoilState(tableDataState);
  const { snackbar, setSnackbar } = useSnackbarMessage();
  const { handleDownloadPDF } = useCreatePDF();
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    open: false,
    currentTableName: "",
    tableStatuses: [],
    canClose: false,
    isStopping: false,
  });

  // AbortController 참조를 위한 ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // 파일로 저장하는 핸들러
  const handleSaveToFile = () => {
    try {
      // Date 객체를 ISO 문자열로 변환하여 직렬화
      const processedCategories: SerializedCategory[] = categories.map(
        (category) => ({
          ...category,
          items: category.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        })
      );

      const data: SavedData = {
        categories: processedCategories,
        expandedCategories,
      };

      // JSON 파일 생성 및 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `result-table-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Settings saved successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save settings.",
        severity: "error",
      });
    }
  };

  // 파일에서 불러오는 핸들러
  const handleLoadFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as SavedData;

        // ISO 문자열을 Date 객체로 변환하여 역직렬화
        const processedCategories: Category[] = data.categories.map(
          (category) => ({
            ...category,
            items: category.items.map((item) => ({
              ...item,
              createdAt: new Date(item.createdAt),
            })) as TableItem[],
          })
        );

        setCategories(processedCategories);
        setExpandedCategories(data.expandedCategories);
        setSelectedItem(null);

        setSnackbar({
          open: true,
          message: "Settings loaded successfully.",
          severity: "success",
        });
      } catch (error) {
        console.error("Error loading file:", error);
        setSnackbar({
          open: true,
          message: "Failed to load settings.",
          severity: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // 모달 닫기 핸들러
  const handleCloseProcessingModal = () => {
    setProcessingStatus((prev) => ({ ...prev, open: false }));
  };

  // 처리 중단 핸들러
  const handleStopProcessing = () => {
    if (abortControllerRef.current) {
      setProcessingStatus((prev) => ({ ...prev, isStopping: true }));
      abortControllerRef.current.abort();
    }
  };

  // 성공한 테이블들만 PDF 다운로드 핸들러
  const handleDownloadSuccessfulPDF = async () => {
    if (!tableData) {
      setSnackbar({
        open: true,
        message: "No data to download.",
        severity: "error",
      });
      return;
    }

    // 성공한 테이블들만 필터링
    const successfulTableNames = processingStatus.tableStatuses
      .filter((status) => status.status === "OK")
      .map((status) => status.tableName);

    if (successfulTableNames.length === 0) {
      setSnackbar({
        open: true,
        message: "No successful tables to download.",
        severity: "error",
      });
      return;
    }

    // PDF 상태를 PENDING으로 초기화
    setProcessingStatus((prev) => ({
      ...prev,
      tableStatuses: prev.tableStatuses.map((status) =>
        successfulTableNames.includes(status.tableName)
          ? { ...status, pdfStatus: "PENDING" as const }
          : status
      ),
    }));

    // 성공한 테이블들만 포함하는 새로운 tableData 생성
    const successfulTableData = {
      ...tableData,
      table: tableData.table.filter((tableObj: any) => {
        const tableName = Object.keys(tableObj)[0];
        return successfulTableNames.includes(tableName);
      }),
      tableArguments: (tableData.tableArguments || []).filter((arg: any) =>
        successfulTableNames.includes(arg.Argument.TABLE_NAME)
      ),
    };

    // 임시로 tableData를 성공한 테이블들만으로 설정
    const originalTableData = tableData;
    setTableData(successfulTableData as any);

    try {
      // 각 테이블별로 PDF 생성 상태 업데이트
      for (const tableName of successfulTableNames) {
        // 현재 처리중인 테이블 상태 업데이트
        setProcessingStatus((prev) => ({
          ...prev,
          currentTableName: tableName,
          tableStatuses: prev.tableStatuses.map((status) =>
            status.tableName === tableName
              ? { ...status, pdfStatus: "PROCESSING" as const }
              : status
          ),
        }));

        // AbortController 체크
        if (abortControllerRef.current?.signal.aborted) {
          setProcessingStatus((prev) => ({
            ...prev,
            tableStatuses: prev.tableStatuses.map((status) =>
              status.tableName === tableName
                ? {
                    ...status,
                    pdfStatus: "NG" as const,
                    pdfErrorMessage: "사용자에 의해 중단되었습니다.",
                  }
                : status
            ),
          }));
          return;
        }

        // 실제 PDF 생성은 한 번만 실행 (첫 번째 테이블에서)
        if (tableName === successfulTableNames[0]) {
          await handleDownloadPDF(abortControllerRef.current?.signal);
        }

        // 성공 상태 업데이트
        setProcessingStatus((prev) => ({
          ...prev,
          tableStatuses: prev.tableStatuses.map((status) =>
            status.tableName === tableName
              ? { ...status, pdfStatus: "OK" as const }
              : status
          ),
        }));
      }
    } catch (error) {
      // 에러 상태 업데이트
      setProcessingStatus((prev) => ({
        ...prev,
        tableStatuses: prev.tableStatuses.map((status) =>
          successfulTableNames.includes(status.tableName)
            ? {
                ...status,
                pdfStatus: "NG" as const,
                pdfErrorMessage:
                  error instanceof Error ? error.message : "Unknown error",
              }
            : status
        ),
      }));
    } finally {
      // 원래 tableData로 복원
      setTableData(originalTableData);
    }
  };

  // 결과 테이블 생성
  const handleCreateTable = async () => {
    const response = await midasAPI("GET", "/db/unit", {});
    if (response.error) {
      setSnackbar({
        open: true,
        message: "Not connected to the server.",
        severity: "error",
      });
      return;
    }

    const tableNumber = getTableNumber(categories);
    if (tableNumber === 0) {
      setSnackbar({
        open: true,
        message: "No data to create.",
        severity: "error",
      });
      return;
    }

    const validationResult = ValidationInput(categories);
    if (validationResult.severity === "success") {
      setSnackbar({
        open: true,
        message: validationResult.message,
        severity: validationResult.severity,
      });
      const tableArguments = getTableArgument(categories);

      console.log("Table Arguments");
      console.log(tableArguments);

      // EigenValue일때 추가 데이터 삽입
      for (const tableArgument of tableArguments) {
        if (tableArgument.Argument.TABLE_TYPE === "EIGENVALUEMODE") {
          const response = await midasAPI("GET", "/db/node", {});
          console.log(response);
          const minkey = Math.min(...Object.keys(response.NODE).map(Number));
          tableArgument.Argument.NODE_ELEMS = {
            KEYS: [minkey],
          };
          tableArgument.Argument.MODES = ["Mode1"];
        }
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      // 초기 상태 설정 - 모든 테이블을 PENDING 상태로
      setProcessingStatus({
        open: true,
        currentTableName: "",
        tableStatuses: tableArguments.map((table) => ({
          tableName: table.Argument.TABLE_NAME,
          status: "PENDING" as const,
        })),
        canClose: false,
        isStopping: false,
      });

      try {
        const tableResponses = [];
        // 각 테이블 생성 요청을 순차적으로 처리
        for (const tableData of tableArguments) {
          const tableName = tableData.Argument.TABLE_NAME;

          // 현재 처리중인 테이블 상태 업데이트
          setProcessingStatus((prev) => ({
            ...prev,
            currentTableName: tableName,
            tableStatuses: prev.tableStatuses.map((status) =>
              status.tableName === tableName
                ? { ...status, status: "PROCESSING" }
                : status
            ),
          }));

          try {
            const response = await midasAPI(
              "POST",
              "/post/table",
              tableData,
              abortControllerRef.current.signal
            );

            if (response && (!response.error || response.error === false)) {
              // 성공 상태 업데이트
              setProcessingStatus((prev) => {
                const newTableStatuses = prev.tableStatuses.map((status) =>
                  status.tableName === tableName
                    ? { ...status, status: "OK" as const }
                    : status
                );

                // 모든 테이블이 OK 상태인지 확인
                const allCompleted = newTableStatuses.every(
                  (status) => status.status === "OK"
                );

                if (allCompleted) {
                  // 모든 테이블이 완료되면 PDF 다운로드 버튼 표시
                  console.log("allCompleted");
                }

                return {
                  ...prev,
                  tableStatuses: newTableStatuses,
                  canClose: allCompleted,
                };
              });

              // 테이블 응답 저장
              tableResponses.push(response);
              console.log(tableResponses);
            } else {
              // 실패 상태 업데이트
              setProcessingStatus((prev) => ({
                ...prev,
                tableStatuses: prev.tableStatuses.map((status) =>
                  status.tableName === tableName
                    ? {
                        ...status,
                        status: "NG",
                        errorMessage:
                          response?.message ||
                          response?.error ||
                          "Unknown error",
                      }
                    : status
                ),
              }));
              // NG가 발생해도 계속 진행 (break 제거)
            }
          } catch (error) {
            // AbortError인 경우 나머지 테이블들을 PENDING 상태로 유지
            if (error instanceof Error && error.name === "AbortError") {
              setProcessingStatus((prev) => ({
                ...prev,
                tableStatuses: prev.tableStatuses.map((status) =>
                  status.status === "PENDING" || status.tableName === tableName
                    ? {
                        ...status,
                        status: "NG",
                        errorMessage: "사용자에 의해 중단되었습니다.",
                      }
                    : status
                ),
                canClose: true,
                isStopping: false,
              }));
              return;
            }

            // 일반 에러 상태 업데이트
            setProcessingStatus((prev) => ({
              ...prev,
              tableStatuses: prev.tableStatuses.map((status) =>
                status.tableName === tableName
                  ? {
                      ...status,
                      status: "NG",
                      errorMessage:
                        error instanceof Error
                          ? error.message
                          : "Unknown error",
                    }
                  : status
              ),
            }));
            // 에러가 발생해도 계속 진행 (break 제거)
          }
        }

        // 모든 테이블 처리가 완료되면 canClose를 true로 설정
        setProcessingStatus((prev) => ({
          ...prev,
          canClose: true,
        }));

        // 모든 테이블 생성이 성공적으로 완료되면 데이터 저장
        if (tableResponses.length > 0) {
          // db/pjcf에서 프로젝트 정보 가져오기
          const projectInfoResponse = await midasAPI("GET", "/db/pjcf", {});
          const programInfoResponse = await midasAPI("GET", "/config/ver", {});
          let projectInfo = {
            author: "User",
            filename: "-",
            client: "Client",
            company: "-",
            project_title: "Project",
            certified_by: "-",
          };

          // 프로젝트 정보가 성공적으로 가져와진 경우 사용
          if (
            projectInfoResponse &&
            (!projectInfoResponse.error || projectInfoResponse.error === false)
          ) {   
            projectInfo = {
              author: projectInfoResponse.PJCF["1"].USER || "User",
              filename: "-",
              client: projectInfoResponse.PJCF["1"].CLIENT || "Client",
              company: "-",
              project_title: projectInfoResponse.PJCF["1"].PROJECT || "Project",
              certified_by: "-",
            };           
          }

          if (
            programInfoResponse &&
            (!programInfoResponse.error || programInfoResponse.error === false)
          ) {
            projectInfo.company = programInfoResponse.VER.COMPANY;
          }

          const savedData = {
            ...projectInfo,
            table: tableResponses,
            tableArguments: tableArguments, // 테이블 인수 정보 추가
          };
          setTableData(savedData);
        }
      } finally {
        abortControllerRef.current = null;
      }
    } else {
      setSnackbar({
        open: true,
        message: validationResult.message,
        severity: validationResult.severity,
      });
    }
  };

  return {
    snackbar,
    setSnackbar,
    handleSaveToFile,
    handleLoadFromFile,
    handleCloseSnackbar,
    handleCreateTable,
    processingStatus,
    handleCloseProcessingModal,
    handleStopProcessing,
    handleDownloadSuccessfulPDF,
  };
};
