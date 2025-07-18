import { useState } from "react";
import { floorLoadState, loadStateFromJson } from "../states/stateFloorLoad";
import { loadPresetById } from "../states/presetManager";
import { useFloorLoadState } from "./useFloorLoadState";
import { FloorLoadState } from "../states/stateFloorLoad";
import { getAllPresets, PresetInfo } from "../states/presetManager";

export const useFileOperations = () => {
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const { state: currentState, notifyStateChange } = useFloorLoadState();

  // JSON 파일로 저장
  const saveToFile = () => {
    const dataStr = JSON.stringify(floorLoadState, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `floor-load-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 로컬 파일에서 불러오기
  const loadFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            loadStateFromJson(jsonData);
            // 상태 변경 알림
            notifyStateChange();
            // 성공 메시지나 상태 업데이트 로직 추가 가능
          } catch (error) {
            console.error("JSON 파일 파싱 오류:", error);
            // 에러 메시지 표시 로직 추가 가능
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  // 프리셋 모달 열기
  const openPresetModal = () => {
    setIsPresetModalOpen(true);
  };

  // 프리셋 모달 닫기
  const closePresetModal = () => {
    setIsPresetModalOpen(false);
  };

  // 프리셋 선택
  const selectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
  };

  // 프리셋 적용
  const applyPreset = () => {
    if (selectedPresetId) {
      const presetData = loadPresetById(selectedPresetId);
      if (presetData) {
        loadStateFromJson(presetData);
        // 상태 변경 알림
        notifyStateChange();
        closePresetModal();
      }
    }
    // 선택된 프리셋이 없으면 아무것도 하지 않음
  };

  return {
    saveToFile,
    loadFromFile,
    isPresetModalOpen,
    openPresetModal,
    closePresetModal,
    applyPreset,
    selectPreset,
    selectedPresetId,
    currentState,
    presets: getAllPresets(),
  };
};
