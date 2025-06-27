/**
 * @fileoverview 토양 도메인 관리를 위한 커스텀 훅
 * 토양 데이터의 상태 관리와 관련된 기본 atom과 파생 데이터를 위한 selector들을 정의합니다.
 */

import { useCallback, useMemo, ChangeEvent, SyntheticEvent } from "react";
import { useRecoilState } from "recoil";

import { soilDomainState } from "../../states/stateSoilDomain";
import {
  SoilBasic,
  SoilResistance,
  SoilTable,
} from "../../types/typeSoilDomain";

type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export const useSoilDomain = () => {
  const [soilDomain, setSoilDomain] = useRecoilState(soilDomainState);

  // 기본 토양 정보 변경 핸들러
  const handleBasicChange = useCallback(
    (fieldName: keyof SoilBasic) => (e: InputChangeEvent) => {
      const value = e.target.value;
      setSoilDomain((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          [fieldName]:
            typeof prev.basic[fieldName] === "number" ? Number(value) : value,
        },
      }));
    },
    [setSoilDomain]
  );

  // 기본 토양 체크박스 변경 핸들러
  const handleBasicCheckBoxChange = useCallback(
    (fieldName: keyof SoilBasic) =>
      (_: SyntheticEvent<Element, Event>, checked: boolean) => {
        setSoilDomain((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            [fieldName]: checked,
          },
        }));
      },
    [setSoilDomain]
  );

  // 지반 저항 정보 변경 핸들러
  const handleResistanceChange = useCallback(
    (fieldName: keyof SoilResistance) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setSoilDomain((prev) => ({
          ...prev,
          resistance: {
            ...prev.resistance,
            [fieldName]:
              fieldName === "clayFrictionMethod" ? value : Number(value),
          },
        }));
      },
    [setSoilDomain]
  );

  // 지반 저항 체크박스 변경 핸들러
  const handleResistanceCheckBoxChange = useCallback(
    (_: SyntheticEvent, checked: boolean) => {
      setSoilDomain((prev) => ({
        ...prev,
        resistance: {
          ...prev.resistance,
          useResistance: checked,
        },
      }));
    },
    [setSoilDomain]
  );

  // 토양층 테이블 변경 핸들러
  const handleTableChange = useCallback(
    (id: number, field: keyof SoilTable, value: string) => {
      setSoilDomain((prev) => ({
        ...prev,
        soilLayers: prev.soilLayers.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              [field]: parseFloat(value) || 0,
            };
          }
          return row;
        }),
      }));
    },
    [setSoilDomain]
  );

  // 토양층 추가 핸들러
  const handleAddTableRow = useCallback(() => {
    setSoilDomain((prev) => {
      const newRow: SoilTable = {
        id: prev.soilLayers.length + 1,
        layerNo: prev.soilLayers.length + 1,
        layerType: "SoilType_Clay",
        layerDepth: 0,
        depth: 10,
        avgNvalue: 10,
        c: 0,
        pi: 0,
        gamma: 18,
        aE0: 14000,
        aE0_Seis: 28000,
        vd: 0.5,
        Vsi: 0,
        ED: 0,
        DE: 1,
        length: 1,
      };
      return {
        ...prev,
        soilLayers: [...prev.soilLayers, newRow],
      };
    });
  }, [setSoilDomain]);

  // 토양층 삭제 핸들러
  const handleDeleteTableRow = useCallback(
    (index: number) => {
      setSoilDomain((prev) => {
        const newLayers = prev.soilLayers.filter((_, idx) => idx !== index);
        const updatedLayers = newLayers.map((row, idx) => ({
          ...row,
          id: idx + 1,
          layerNo: idx + 1,
        }));
        return {
          ...prev,
          soilLayers: updatedLayers,
        };
      });
    },
    [setSoilDomain]
  );

  // 토양층 이동 핸들러
  const handleMoveTableRow = useCallback(
    (index: number, direction: "up" | "down") => {
      setSoilDomain((prev) => {
        const { soilLayers } = prev;
        if (
          (direction === "up" && index === 0) ||
          (direction === "down" && index === soilLayers.length - 1)
        ) {
          return prev;
        }

        const newLayers = [...soilLayers];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        // 요소 교환
        const temp = newLayers[index];
        newLayers[index] = newLayers[newIndex];
        newLayers[newIndex] = temp;

        // id/layerNo 재정렬
        const updatedLayers = newLayers.map((row, idx) => ({
          ...row,
          id: idx + 1,
          layerNo: idx + 1,
        }));

        return {
          ...prev,
          soilLayers: updatedLayers,
        };
      });
    },
    [setSoilDomain]
  );

  // 메모이제이션된 값들
  const memoizedValues = useMemo(() => soilDomain, [soilDomain]);

  return {
    // 전체 도메인 상태
    soilDomain: memoizedValues,

    // 개별 섹션들 (기존 훅들과의 호환성을 위해)
    basic: memoizedValues.basic,
    resistance: memoizedValues.resistance,
    soilLayers: memoizedValues.soilLayers,

    // 핸들러들
    handleBasicChange,
    handleBasicCheckBoxChange,
    handleResistanceChange,
    handleResistanceCheckBoxChange,
    handleTableChange,
    handleAddTableRow,
    handleDeleteTableRow,
    handleMoveTableRow,

    // 전체 도메인 업데이트
    setSoilDomain,
  };
};
