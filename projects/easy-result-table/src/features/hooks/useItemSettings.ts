/**
 * @fileoverview
 * 아이템 설정 관리를 위한 커스텀 훅.
 * 선택된 아이템의 설정을 임시로 저장하고 관리하는 기능을 제공합니다.
 * 설정 변경 시 임시 저장소에 보관하다가 사용자가 저장하면 실제 상태에
 * 반영하며, 취소 시 임시 저장소를 초기화하는 기능을 포함합니다.
 */

import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { categoriesState, selectedItemState } from "../states/stateCategories";
import { PanelType } from "../types/category";

// 임시 설정 저장을 위한 인터페이스
interface TempSettingsMap {
  [key: string]: {
    // categoryId-itemId 형식의 키
    [panelType in PanelType]?: any; // 패널 타입별 설정 값
  };
}

export const useItemSettings = () => {
  // Recoil 상태 관리
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  // 임시 설정 상태 관리
  const [tempSettings, setTempSettings] = useState<TempSettingsMap>({});
  const [previousItemKey, setPreviousItemKey] = useState<string | null>(null);

  // 선택된 항목이 변경될 때마다 이전 항목의 임시 설정을 초기화
  useEffect(() => {
    if (selectedItem) {
      const currentItemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;

      // 이전에 선택된 항목이 있고, 현재 선택된 항목이 다른 경우
      if (previousItemKey && previousItemKey !== currentItemKey) {
        setTempSettings((prev) => {
          const newSettings = { ...prev };
          delete newSettings[previousItemKey];
          return newSettings;
        });
      }

      setPreviousItemKey(currentItemKey);
    }
  }, [selectedItem]);

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

    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;

    setTempSettings((prev) => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        [panelType]: newSettings,
      },
    }));
  };

  // 설정 저장
  const handleSave = async () => {
    if (!selectedItem) return;

    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    const itemTempSettings = tempSettings[itemKey] || {};

    try {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === selectedItem.categoryId
            ? {
                ...category,
                items: category.items.map((item) =>
                  item.id === selectedItem.itemId
                    ? {
                        ...item,
                        settings: Object.entries(itemTempSettings).reduce(
                          (acc, [panelType, settings]) => ({
                            ...acc,
                            [panelType]: settings,
                          }),
                          { ...item.settings }
                        ),
                      }
                    : item
                ),
              }
            : category
        )
      );

      // 저장 후 임시 설정 초기화
      setTempSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[itemKey];
        return newSettings;
      });
    } catch (error) {
      throw new Error("설정 저장 중 오류가 발생했습니다.");
    }
  };

  // 설정 취소
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
    setSelectedItem(null);
  };

  // 현재 설정 값 조회 (임시 설정이 있으면 임시 설정 반환, 없으면 저장된 설정 반환)
  const getCurrentSettings = (panelType: PanelType) => {
    const selectedInfo = getSelectedItemInfo();
    if (!selectedItem || !selectedInfo) return null;

    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    const itemTempSettings = tempSettings[itemKey] || {};

    // 해당 패널의 임시 설정이 있으면 임시 설정을, 없으면 저장된 설정을 사용
    const currentSettings = {
      ...selectedInfo.item.settings,
      [panelType]:
        itemTempSettings[panelType] || selectedInfo.item.settings[panelType],
    };

    return {
      settings: currentSettings,
      typeInfo: selectedInfo.typeInfo,
    };
  };

  // 임시 설정이 있는지 확인
  const hasPendingChanges = () => {
    if (!selectedItem) return false;
    const itemKey = `${selectedItem.categoryId}-${selectedItem.itemId}`;
    return (
      !!tempSettings[itemKey] && Object.keys(tempSettings[itemKey]).length > 0
    );
  };

  return {
    tempSettings,
    getSelectedItemInfo,
    updateTempSettings,
    handleSave,
    handleCancel,
    getCurrentSettings,
    hasPendingChanges,
  };
};
