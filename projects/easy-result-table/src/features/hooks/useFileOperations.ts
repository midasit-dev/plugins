/**
 * @fileoverview
 * 파일 작업 관련 커스텀 훅.
 * 카테고리와 설정 데이터를 JSON 파일로 저장하고 불러오는 기능을 제공합니다.
 * 파일 저장/로드 시 날짜 형식 변환과 에러 처리를 포함하며,
 * 작업 결과를 스낵바를 통해 사용자에게 알립니다.
 */

import { useState } from "react";
import { useRecoilState } from "recoil";
import {
  categoriesState,
  expandedCategoriesState,
  selectedItemState,
} from "../states/stateCategories";
import { Category, TodoItem } from "../types/category";

// Date 객체를 직렬화하기 위한 TodoItem 인터페이스
interface SerializedTodoItem extends Omit<TodoItem, "createdAt"> {
  createdAt: string; // ISO 문자열로 변환된 날짜
}

// 직렬화된 카테고리 인터페이스
interface SerializedCategory extends Omit<Category, "items"> {
  items: SerializedTodoItem[]; // 직렬화된 아이템 배열
}

// 파일로 저장될 데이터 구조
interface SavedData {
  categories: SerializedCategory[];
  expandedCategories: Record<string, boolean>;
}

// 스낵바 상태 인터페이스
interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export const useFileOperations = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState
  );
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);

  // 스낵바 상태 관리
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

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

      // 성공 메시지 표시
      setSnackbar({
        open: true,
        message: "설정이 성공적으로 저장되었습니다.",
        severity: "success",
      });
    } catch (error) {
      // 에러 메시지 표시
      setSnackbar({
        open: true,
        message: "설정 저장 중 오류가 발생했습니다.",
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
            })) as TodoItem[],
          })
        );

        // 상태 업데이트
        setCategories(processedCategories);
        setExpandedCategories(data.expandedCategories);
        setSelectedItem(null);

        // 성공 메시지 표시
        setSnackbar({
          open: true,
          message: "설정이 성공적으로 불러와졌습니다.",
          severity: "success",
        });
      } catch (error) {
        console.error("Error loading file:", error);
        // 에러 메시지 표시
        setSnackbar({
          open: true,
          message: "설정을 불러오는 중 오류가 발생했습니다.",
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

  return {
    snackbar,
    handleSaveToFile,
    handleLoadFromFile,
    handleCloseSnackbar,
  };
};
