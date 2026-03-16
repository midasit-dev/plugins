/**
 * @fileoverview
 * 아이템 설정 관리를 위한 커스텀 훅.
 * 변경 시 pending(작은 객체)만 갱신해 UI를 빠르게 하고,
 * categories는 항목 전환·CREATE TABLE 시에만 반영합니다.
 */

import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import {
  categoriesState,
  selectedItemState,
  pendingItemSettingsState,
} from "../states/stateCategories";
import { PanelType, TableItem } from "../types/category";

export const useItemSettings = () => {
  const [categories, setCategories] = useRecoilState(categoriesState);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
  const [pending, setPending] = useRecoilState(pendingItemSettingsState);
  const prevItemKeyRef = useRef<string | null>(null);

  const getItemKey = () =>
    selectedItem ? `${selectedItem.categoryId}-${selectedItem.itemId}` : null;

  // 현재 선택된 아이템 정보 조회 (pending 반영한 최종 설정으로)
  const getSelectedItemInfo = () => {
    if (!selectedItem) return null;

    const category = categories.find((c) => c.id === selectedItem.categoryId);
    if (!category) return null;

    const item = category.items.find((i) => i.id === selectedItem.itemId);
    if (!item) return null;

    const itemKey = getItemKey();
    const effectiveSettings =
      itemKey && pending?.itemKey === itemKey
        ? { ...item.settings, ...pending.settings }
        : item.settings;

    return {
      item: { ...item, settings: effectiveSettings },
      typeInfo: category.itemTypeInfo[item.type],
    };
  };

  // 설정 변경 시 pending만 갱신 (categories 미갱신 → 구독 리렌더 최소화)
  const updateTempSettings = (panelType: PanelType, newSettings: unknown) => {
    if (!selectedItem) return;

    const itemKey = getItemKey()!;
    setPending((prev) => ({
      itemKey,
      settings: {
        ...(prev?.itemKey === itemKey ? prev.settings : {}),
        [panelType]: newSettings,
      },
    }));
  };

  // 항목 전환 시: 이전 항목 pending을 categories에 반영 후 pending 초기화
  useEffect(() => {
    const itemKey = getItemKey();
    if (!itemKey) return;

    const prevKey = prevItemKeyRef.current;
    prevItemKeyRef.current = itemKey;

    if (prevKey && prevKey !== itemKey && pending?.itemKey === prevKey) {
      const sepIdx = prevKey.indexOf("-");
      const cid = prevKey.slice(0, sepIdx);
      const iid = prevKey.slice(sepIdx + 1);
      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id !== cid) return cat;
          return {
            ...cat,
            items: cat.items.map((it) => {
              if (it.id !== iid) return it;
              return {
                ...it,
                settings: { ...it.settings, ...pending.settings } as TableItem["settings"],
              };
            }),
          };
        })
      );
      setPending(null);
    }
  // 항목 전환 시에만 flush (pending은 의도적으로 의존성에서 제외)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.categoryId, selectedItem?.itemId]);

  // 현재 설정 값 조회 (categories + pending 병합)
  const getCurrentSettings = (panelType: PanelType) => {
    const selectedInfo = getSelectedItemInfo();
    if (!selectedItem || !selectedInfo) return null;

    return {
      settings: selectedInfo.item.settings,
      typeInfo: selectedInfo.typeInfo,
    };
  };

  const hasPendingChanges = () =>
    !!pending?.itemKey && Object.keys(pending.settings).length > 0;

  return {
    getSelectedItemInfo,
    updateTempSettings,
    getCurrentSettings,
    hasPendingChanges,
  };
};
