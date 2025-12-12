/**
 * @fileoverview 말뚝 위치 테이블 관리를 위한 커스텀 훅
 * 말뚝 위치 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { ReactNode, useState, useCallback } from "react";

import {
  CustomNumberField,
  CustomDropList,
  CustomTextField,
} from "../../components";

import { usePileDomain } from "./usePileDomain";
import {
  PileLocRefXItems,
  PileLocRefYItems,
} from "../../constants/common/selectOptions";
import { PILE_LOCATION_TABLE } from "../../constants/pile/tableConstants";
import { PileLocation } from "../../types/typePileDomain";
import {
  parseSpaceInput,
  formatSpaceDisplay,
} from "../../utils/converters/pileSpacingConverter";

import { useTranslation } from "react-i18next";

export const usePileLocation = () => {
  const { currentPile, updateCurrentPileLocations } = usePileDomain();
  const { t } = useTranslation();

  // 테이블 상수 가져오기
  const {
    FIELD_WIDTHS,
    TRANSLATION_KEYS: { HEADERS },
  } = PILE_LOCATION_TABLE;

  // 편집 중이 값들을 위한 임시 상태
  const [editingValues, setEditingValues] = useState<
    Record<number, { space?: string; angle?: string }>
  >({});

  // 기존 rows를 currentPile.locations에서 가져오기
  const rows = currentPile.locations;

  // 간격 입력값 변경 함수
  const handleSpaceChange = useCallback((id: number, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], space: value },
    }));
  }, []);

  // 각도 입력값 변경 함수
  const handleAngleChange = useCallback((id: number, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], angle: value },
    }));
  }, []);

  // 간격 입력값 포커스 아웃될 때 동작하도록 처리
  const handleSpaceBlur = useCallback(
    (id: number, value: string) => {
      const newRows = rows.map((row) => {
        if (row.id === id) {
          const spaceArray = parseSpaceInput(value, {
            emptyOnSingleZero: true,
          });
          // 간격이 0 하나만 있는 경우 빈 배열로 처리
          const finalSpaceArray = spaceArray;

          // 각도는 간격 배열보다 하나 크게 설정
          const targetLength = finalSpaceArray.length + 1;
          let angleArray: number[];

          if (
            row.angle.length === 0 ||
            (row.angle.length === 1 && row.angle[0] === 0)
          ) {
            // 기존 각도가 비어있거나 0 하나만 있을 때는 새로운 길이로 0으로 채움
            angleArray = Array(targetLength).fill(0);
          } else {
            // 기존 각도가 있을 때는 최대한 유지하면서 길이 조정
            if (row.angle.length < targetLength) {
              // 기존 각도보다 길이가 길어지면 나머지를 0으로 채움
              angleArray = [
                ...row.angle,
                ...Array(targetLength - row.angle.length).fill(0),
              ];
            } else if (row.angle.length > targetLength) {
              // 기존 각도보다 길이가 짧아지면 앞부분만 유지
              angleArray = row.angle.slice(0, targetLength);
            } else {
              // 길이가 같으면 기존 각도 유지
              angleArray = row.angle;
            }
          }

          return { ...row, space: finalSpaceArray, angle: angleArray };
        }
        return row;
      });

      // 1행의 간격이 변경될 때 2행의 각도도 동일하게 업데이트
      if (id === 1) {
        const firstRowSpaceLength = newRows[0].space.length;
        const secondRowAngle = newRows[1].angle;

        if (
          secondRowAngle.length === 0 ||
          (secondRowAngle.length === 1 && secondRowAngle[0] === 0)
        ) {
          // 2행의 각도가 비어있거나 0 하나만 있을 때는 새로운 길이로 0으로 채움
          newRows[1] = {
            ...newRows[1],
            angle: Array(firstRowSpaceLength + 1).fill(0),
          };
        } else {
          // 2행의 각도가 있을 때는 최대한 유지하면서 길이 조정
          const targetLength = firstRowSpaceLength + 1;
          if (secondRowAngle.length < targetLength) {
            newRows[1] = {
              ...newRows[1],
              angle: [
                ...secondRowAngle,
                ...Array(targetLength - secondRowAngle.length).fill(0),
              ],
            };
          } else if (secondRowAngle.length > targetLength) {
            newRows[1] = {
              ...newRows[1],
              angle: secondRowAngle.slice(0, targetLength),
            };
          }
        }
      }

      // 상태 업데이트
      updateCurrentPileLocations(newRows);

      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    },
    [rows, updateCurrentPileLocations]
  );

  // 각도 입력값 포커스 아웃될 때 동작하도록 처리
  const handleAngleBlur = useCallback(
    (id: number, value: string) => {
      const newRows = rows.map((row) => {
        if (row.id === id) {
          const angleArray = parseSpaceInput(value, {
            emptyOnSingleZero: true,
          });
          const firstRowSpaceLength = rows[0].space.length;
          const targetLength = firstRowSpaceLength + 1;

          if (
            angleArray.length === 0 ||
            (angleArray.length === 1 && angleArray[0] === 0)
          ) {
            return { ...row, angle: Array(targetLength).fill(0) };
          }

          let adjustedAngleArray: number[];

          if (angleArray.length < targetLength) {
            adjustedAngleArray = [
              ...angleArray,
              ...Array(targetLength - angleArray.length).fill(0),
            ];
          } else if (angleArray.length > targetLength) {
            adjustedAngleArray = angleArray.slice(0, targetLength);
          } else {
            adjustedAngleArray = angleArray;
          }

          return { ...row, angle: adjustedAngleArray };
        }
        return row;
      });

      updateCurrentPileLocations(newRows);

      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    },
    [rows, updateCurrentPileLocations]
  );

  // 입력값 표시 함수
  const getDisplayValue = useCallback(
    (row: PileLocation, field: keyof PileLocation): string => {
      if (field === "space" || field === "angle") {
        const editingValue = editingValues[row.id]?.[field];
        if (editingValue !== undefined) {
          return editingValue;
        }
        return field === "space" && row.id === 2
          ? ""
          : formatSpaceDisplay(row[field] as number[]);
      }
      return String(row[field]);
    },
    [editingValues]
  );

  // 테이블 행 렌더링 함수
  const renderRow = useCallback(
    (row: PileLocation): ReactNode[] => [
      t(row.loc_title),
      <CustomDropList
        key="ref_point"
        value={row.ref_point}
        onChange={(e) => {
          const newRows = rows.map((r) =>
            r.id === row.id ? { ...r, ref_point: e.target.value } : r
          );
          updateCurrentPileLocations(newRows);
        }}
        itemList={
          row.id === 1
            ? Array.from(PileLocRefXItems())
            : Array.from(PileLocRefYItems())
        }
        width={FIELD_WIDTHS.ref_point}
        droplistWidth={FIELD_WIDTHS.ref_point}
        hideBorder
        textAlign="center"
      />,
      <CustomNumberField
        key="loc"
        value={row.loc.toString()}
        onChange={(e) => {
          const newRows = rows.map((r) =>
            r.id === row.id ? { ...r, loc: Number(e.target.value) } : r
          );
          updateCurrentPileLocations(newRows);
        }}
        width={FIELD_WIDTHS.loc}
        numberFieldWidth={FIELD_WIDTHS.loc}
        placeholder="0"
        hideBorder
        textAlign="center"
      />,
      <CustomTextField
        key="space"
        value={getDisplayValue(row, "space")}
        onChange={(e) => handleSpaceChange(row.id, e.target.value)}
        onBlur={(e) => handleSpaceBlur(row.id, e.target.value)}
        width={FIELD_WIDTHS.space}
        textFieldWidth={FIELD_WIDTHS.space}
        placeholder={row.id === 2 ? "" : "3@2.0, 1.0"}
        hideBorder
        textAlign="center"
        disabled={row.id === 2}
      />,
      <CustomTextField
        key="angle"
        value={getDisplayValue(row, "angle")}
        onChange={(e) => handleAngleChange(row.id, e.target.value)}
        onBlur={(e) => handleAngleBlur(row.id, e.target.value)}
        width={FIELD_WIDTHS.angle}
        textFieldWidth={FIELD_WIDTHS.angle}
        placeholder={"4@0.0, 0.0"}
        hideBorder
        textAlign="center"
      />,
    ],
    [
      t,
      getDisplayValue,
      handleSpaceChange,
      handleSpaceBlur,
      handleAngleChange,
      handleAngleBlur,
      rows,
      updateCurrentPileLocations,
    ]
  );

  // 테이블 헤더 렌더링 함수
  const getHeaders = useCallback(
    () => [
      { label: t(HEADERS.TITLE), width: FIELD_WIDTHS.loc_title },
      { label: t(HEADERS.REF_POINT), width: FIELD_WIDTHS.ref_point },
      { label: t(HEADERS.LOC), width: FIELD_WIDTHS.loc },
      { label: t(HEADERS.SPACE), width: FIELD_WIDTHS.space },
      { label: t(HEADERS.ANGLE), width: FIELD_WIDTHS.angle },
    ],
    [t]
  );

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
