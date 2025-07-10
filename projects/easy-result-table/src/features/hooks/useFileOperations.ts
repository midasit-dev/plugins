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
                canClose: true,
              }));
              break;
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
              canClose: true,
            }));
            break;
          }
        }

        // 모든 테이블 생성이 성공적으로 완료되면 데이터 저장
        if (tableResponses.length > 0) {
          const savedData = {
            author: "User",
            filename: "Generated Table",
            client: "Client",
            company: "Company",
            project_title: "Project",
            certified_by: "System",
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
  };
};
