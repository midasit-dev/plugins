/**
 * @fileoverview
 * Recoil을 사용한 카테고리 관련 전역 상태 관리.
 * 카테고리 목록, 선택된 아이템, 카테고리 확장 상태를 관리하는
 * atom들을 정의합니다. 초기 상태는 미리 정의된 카테고리 목록을
 * 기반으로 설정됩니다.
 */

import { atom } from "recoil";
import { Category } from "../types/category";
import { PanelType } from "../types/category";
import { PREDEFINED_CATEGORIES } from "../types/category";

// 편집 중인 아이템의 임시 설정 (UI 반응용, categories는 자주 갱신하지 않음)
export const pendingItemSettingsState = atom<{
  itemKey: string;
  settings: Partial<Record<PanelType, unknown>>;
} | null>({
  key: "pendingItemSettingsState",
  default: null,
});

// 카테고리 목록 상태
export const categoriesState = atom<Category[]>({
  key: "categoriesState",
  default: PREDEFINED_CATEGORIES, // 미리 정의된 카테고리로 초기화
});

// 현재 선택된 아이템 상태
export const selectedItemState = atom<{
  categoryId: string;
  itemId: string;
} | null>({
  key: "selectedItemState",
  default: null, // 초기에는 아무것도 선택되지 않은 상태
});

// 카테고리 확장/축소 상태
export const expandedCategoriesState = atom<Record<string, boolean>>({
  key: "expandedCategoriesState",
  default: PREDEFINED_CATEGORIES.reduce(
    // 모든 카테고리를 초기에 축소된 상태로 설정
    (acc, category) => ({
      ...acc,
      [category.id]: false,
    }),
    {}
  ),
});
