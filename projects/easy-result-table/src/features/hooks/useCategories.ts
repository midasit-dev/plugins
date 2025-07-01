/**
 * @fileoverview
 * 카테고리 관리를 위한 커스텀 훅.
 * Recoil을 사용하여 카테고리, 선택된 아이템, 확장 상태를 관리합니다.
 * 카테고리와 아이템의 추가, 삭제, 선택, 토글 등 모든 상태 관리 로직을
 * 캡슐화하여 제공합니다.
 */

import { useRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import {
  categoriesState,
  selectedItemState,
  expandedCategoriesState,
} from "../states/stateCategories";
import { Category, TodoItem } from "../types/category";

export const useCategories = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState
  );

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
  const handleAddItem = (categoryId: string, itemType: string) => {
    setCategories((prevCategories) => {
      return prevCategories.map((category) => {
        if (category.id !== categoryId) return category;

        // 아이템 타입에 따른 기본 설정 가져오기
        const defaultSettings =
          category.itemTypeInfo[itemType]?.defaultSettings || {};
        const newItem: TodoItem = {
          id: uuidv4(),
          name: itemType,
          type: itemType,
          isSelected: false,
          createdAt: new Date(),
          settings: defaultSettings,
        };

        return {
          ...category,
          items: [...category.items, newItem],
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

  const handleItemClick = (categoryId: string, itemId: string) => {
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

  return {
    categories,
    setCategories,
    selectedItem,
    setSelectedItem,
    expandedCategories,
    setExpandedCategories,
    handleCategoryToggle,
    toggleAllCategories,
    handleAddItem,
    handleDeleteItem,
    handleItemClick,
    isItemSelected,
  };
};
