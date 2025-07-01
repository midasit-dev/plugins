/**
 * @fileoverview
 * 아이템 설정 관리를 위한 커스텀 훅.
 * 선택된 아이템의 설정을 임시로 저장하고 관리하는 기능을 제공합니다.
 * 설정 변경 시 임시 저장소에 보관하다가 사용자가 저장을 선택하면
 * 실제 상태에 반영하는 방식으로 동작합니다.
 */

import { useState } from "react";
import { useRecoilState } from "recoil";
import { categoriesState, selectedItemState } from "../states/stateCategories";
import { PanelType } from "../types/category";

// 임시 설정 저장을 위한 인터페이스
interface TempSettingsMap {
  [key: string]: {
    // categoryId-itemId 형식의 키
    [panelKey: string]: any; // 패널 타입별 설정 값
  };
}

export const useItemSettings = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  // 임시 설정 상태 관리
  const [tempSettings, setTempSettings] = useState<TempSettingsMap>({});

  // 현재 선택된 아이템 정보 조회
  const getSelectedItemInfo = () => {
    if (!selectedItem) return null;

    const category = categories.find((c) => c.id === selectedItem.categoryId);
    if (!category) return null;

    const item = category.items.find((i) => i.id === selectedItem.itemId);
    if (!item) return null;

    return {
      item,
      typeInfo: category.itemTypeInfo[item.type],
    };
  };

  // 임시 설정 업데이트
  const updateTempSettings = (panelType: PanelType, newSettings: any) => {
    if (!selectedItem) return;

    // categoryId-itemId 형식의 고유 키 생성
    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    // 패널 타입을 camelCase로 변환 (예: SystemStyle -> systemStyle)
    const panelKey = panelType.charAt(0).toLowerCase() + panelType.slice(1);

    setTempSettings((prev) => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        [panelKey]: newSettings,
      },
    }));
  };

  // 설정 저장 처리
  const handleSave = () => {
    if (!selectedItem) return;

    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    const itemTempSettings = tempSettings[itemKey] || {};

    // 카테고리와 아이템을 찾아서 설정 업데이트
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === selectedItem.categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === selectedItem.itemId
                  ? {
                      ...item,
                      settings: {
                        ...item.settings,
                        ...itemTempSettings,
                      },
                    }
                  : item
              ),
            }
          : category
      )
    );

    // 저장 후 해당 항목의 임시 설정 초기화
    setTempSettings((prev) => {
      const newSettings = { ...prev };
      delete newSettings[itemKey];
      return newSettings;
    });
  };

  // 설정 취소 처리
  const handleCancel = () => {
    if (selectedItem) {
      // 임시 설정 초기화
      const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
      setTempSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[itemKey];
        return newSettings;
      });
    }
    // 선택 상태 초기화
    setSelectedItem(null);
  };

  // 현재 설정 값 조회
  const getCurrentSettings = (panelType: PanelType) => {
    const selectedInfo = getSelectedItemInfo();
    if (!selectedItem || !selectedInfo) return null;

    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    const panelKey = panelType.charAt(0).toLowerCase() + panelType.slice(1);
    const currentSettings = selectedInfo.item.settings || {};
    const itemTempSettings = tempSettings[itemKey] || {};

    // 임시 설정이 있으면 임시 설정을, 없으면 저장된 설정을 반환
    return {
      settings: itemTempSettings[panelKey] || currentSettings[panelKey] || {},
      typeInfo: selectedInfo.typeInfo,
    };
  };

  return {
    tempSettings,
    getSelectedItemInfo,
    updateTempSettings,
    handleSave,
    handleCancel,
    getCurrentSettings,
  };
};
