import { useState, useCallback } from 'react';
import { useConverterState, useConverterDispatch } from '../context/ConverterContext';
import { orchestrate } from '../converters/orchestrator';

/**
 * MCT 변환 훅
 * orchestrator 호출 → dispatch SET_MCT_RESULT → 모달 open 상태 반환
 */
export function useMctConvert() {
  const { tabData } = useConverterState();
  const dispatch = useConverterDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const runConvert = useCallback(() => {
    const { mctResult, globalMaps } = orchestrate(tabData);
    dispatch({ type: 'SET_GLOBAL_MAPS', maps: globalMaps });
    dispatch({ type: 'SET_MCT_RESULT', result: mctResult });
    setModalOpen(true);
  }, [tabData, dispatch]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return { runConvert, modalOpen, closeModal };
}
