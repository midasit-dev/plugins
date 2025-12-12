import { useState, useEffect } from "react";
import { floorLoadState, FloorLoadState } from "../states/stateFloorLoad";

// 전역 상태 변경을 감지하기 위한 이벤트 시스템
const stateChangeEvent = new CustomEvent("floorLoadStateChanged");

export const useFloorLoadState = () => {
  const [state, setState] = useState<FloorLoadState>(floorLoadState);

  // 전역 상태 변경 감지
  useEffect(() => {
    const handleStateChange = () => {
      setState(JSON.parse(JSON.stringify(floorLoadState)));
    };

    // 이벤트 리스너 등록
    window.addEventListener("floorLoadStateChanged", handleStateChange);

    return () => {
      window.removeEventListener("floorLoadStateChanged", handleStateChange);
    };
  }, []);

  // 상태 변경 알림 함수
  const notifyStateChange = () => {
    window.dispatchEvent(stateChangeEvent);
  };

  return { state, notifyStateChange };
};
