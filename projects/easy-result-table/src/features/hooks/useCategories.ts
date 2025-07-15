/**
 * @fileoverview
 * 카테고리 관리를 위한 커스텀 훅.
 * Recoil을 사용하여 카테고리, 선택된 아이템, 확장 상태를 관리합니다.
 * 카테고리와 아이템의 추가, 삭제, 선택, 토글 등 모든 상태 관리 로직을
 * 캡슐화하여 제공합니다.
 */

import { useRecoilState } from "recoil";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  categoriesState,
  selectedItemState,
  expandedCategoriesState,
} from "../states/stateCategories";
import {
  getLoadCase,
  getStaticLoadCase,
  getDynamicLoadCase,
  getStaticDynamicLoadCase,
} from "../utils/getLoadCaseList";
import { LoadCaseNameSettings, LoadCase } from "../types/panels";

export const useCategories = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState
  );

  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // 개별 카테고리 토글 처리
  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // 모든 카테고리 토글 처리
  const toggleAllCategories = () => {
    const areAllExpanded = Object.values(expandedCategories).every(
      (value) => value
    );
    const newState = !areAllExpanded;
    const updatedState: Record<string, boolean> = {};
    categories.forEach((category) => {
      updatedState[category.id] = newState;
    });
    setExpandedCategories(updatedState);
  };

  // 새로운 아이템 추가 처리
  const handleAddItem = (categoryId: string) => {
    setCategories((prevCategories) => {
      return prevCategories.map((category) => {
        if (category.id !== categoryId) return category;

        // 카테고리의 모든 사용 가능한 아이템 타입에 대해 새로운 아이템 생성
        const newItems = category.availableItems.map((itemType) => {
          const defaultSettings =
            category.itemTypeInfo[itemType]?.defaultSettings || {};
          return {
            id: uuidv4(),
            name: itemType,
            type: itemType,
            isSelected: false,
            createdAt: new Date(),
            settings: defaultSettings,
          };
        });

        return {
          ...category,
          items: [...category.items, ...newItems],
        };
      });
    });

    // 아이템 추가 후 카테고리 자동 확장
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    if (
      selectedItem?.categoryId === categoryId &&
      selectedItem?.itemId === itemId
    ) {
      setSelectedItem(null);
    }
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category
      )
    );
  };

  // 로드케이스 타입에 따른 함수 선택
  const getFetchFunction = (
    loadCaseType: string = "default",
    customFetchFunction?: () => Promise<string[]>
  ) => {
    switch (loadCaseType) {
      case "static":
        return async () => getStaticLoadCase();
      case "dynamic":
        return async () => getDynamicLoadCase();
      case "static_dynamic":
        return async () => getStaticDynamicLoadCase();
      default:
        return customFetchFunction || (async () => getLoadCase());
    }
  };

  const handleItemClick = async (categoryId: string, itemId: string) => {
    // 로딩 상태 시작
    setIsLoading(true);

    try {
      const items = categories
        .find((c) => c.id === categoryId)
        ?.items.find((i) => i.id === itemId)?.settings;

      if (items?.LoadCaseName) {
        if (items.LoadCaseName?.loadCases?.length === 0) {
          const fetchFunction = getFetchFunction(
            items.LoadCaseName?.loadCaseType || "default",
            items.LoadCaseName?.fetchFunction
              ? async () => {
                  const result = items.LoadCaseName?.fetchFunction!();
                  return result || [];
                }
              : undefined
          );
          const loadCaseNames = await fetchFunction();

          // loadCaseNames를 모두 false로 설정하여 저장
          setCategories((prevCategories) =>
            prevCategories.map((category) => {
              if (category.id === categoryId) {
                return {
                  ...category,
                  items: category.items.map((item) => {
                    if (item.id === itemId) {
                      const newLoadCaseSettings: LoadCaseNameSettings = {
                        loadCases: loadCaseNames.map(
                          (name: string): LoadCase => ({
                            name,
                            isChecked: false,
                          })
                        ),
                        selectAll: false,
                        loadCaseType:
                          items.LoadCaseName?.loadCaseType || "default",
                      };
                      return {
                        ...item,
                        settings: {
                          ...item.settings,
                          LoadCaseName: newLoadCaseSettings,
                        },
                      };
                    }
                    return item;
                  }),
                };
              }
              return category;
            })
          );
        }
      }
    } catch (error) {
      console.error("Failed to refresh load cases:", error);
    } finally {
      // 로딩 상태 종료
      setIsLoading(false);
    }

    if (
      selectedItem?.categoryId === categoryId &&
      selectedItem?.itemId === itemId
    ) {
      setSelectedItem(null);
    } else {
      setSelectedItem({ categoryId, itemId });
    }
  };

  const isItemSelected = (categoryId: string, itemId: string): boolean => {
    return (
      selectedItem?.categoryId === categoryId && selectedItem?.itemId === itemId
    );
  };

  const handleLoadCaseRefresh = async (categoryId: string, itemId: string) => {
    try {
      const category = categories.find((c) => c.id === categoryId);
      const item = category?.items.find((i) => i.id === itemId);
      const loadCaseSettings = item?.settings?.LoadCaseName as
        | LoadCaseNameSettings
        | undefined;

      if (!loadCaseSettings) return;

      const fetchFunction = getFetchFunction(
        loadCaseSettings.loadCaseType,
        loadCaseSettings.fetchFunction &&
          (async () => loadCaseSettings.fetchFunction!())
      );
      const newLoadCaseNames: string[] = await fetchFunction();

      // 기존 데이터와 비교
      const existingNames = loadCaseSettings.loadCases.map((lc) => lc.name);
      const isIdentical =
        newLoadCaseNames.length === existingNames.length &&
        newLoadCaseNames.every((name: string) => existingNames.includes(name));

      if (!isIdentical) {
        // 새로운 데이터 생성 (기존 체크 상태 유지)
        const newLoadCases = newLoadCaseNames.map((name: string) => {
          const existingCase = loadCaseSettings.loadCases.find(
            (lc) => lc.name === name
          );
          return {
            name,
            isChecked: existingCase ? existingCase.isChecked : false,
          };
        });

        setCategories((prevCategories) =>
          prevCategories.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                items: category.items.map((item) => {
                  if (item.id === itemId) {
                    const updatedSettings: LoadCaseNameSettings = {
                      loadCases: newLoadCases,
                      selectAll: newLoadCases.every((lc) => lc.isChecked),
                      loadCaseType: loadCaseSettings.loadCaseType,
                      fetchFunction: loadCaseSettings.fetchFunction,
                    };

                    return {
                      ...item,
                      settings: {
                        ...item.settings,
                        LoadCaseName: updatedSettings,
                      },
                    };
                  }
                  return item;
                }),
              };
            }
            return category;
          })
        );

        return true; // 데이터가 변경되었음을 알림
      }

      return false; // 데이터가 동일함을 알림
    } catch (error) {
      console.error("Failed to refresh load cases:", error);
      throw error;
    }
  };

  return {
    categories,
    setCategories,
    selectedItem,
    setSelectedItem,
    expandedCategories,
    setExpandedCategories,
    isLoading,
    handleCategoryToggle,
    toggleAllCategories,
    handleAddItem,
    handleDeleteItem,
    handleItemClick,
    handleLoadCaseRefresh,
    isItemSelected,
  };
};
