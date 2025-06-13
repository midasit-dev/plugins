import { ReactNode, useState } from "react";
import { useRecoilState } from "recoil";
import { pileLocationState, PileLocationRowData } from "../states";
import { PileLocRefXItems, PileLocRefYItems } from "../constants";
import { useTranslation } from "react-i18next";
import {
  CustomNumberField,
  CustomDropList,
  CustomTextField,
} from "../components";

export const usePileLocation = () => {
  const [rows, setRows] = useRecoilState(pileLocationState);
  const [editingValues, setEditingValues] = useState<
    Record<number, { space?: string; angle?: string }>
  >({});

  const { t } = useTranslation();

  // space 문자열을 number[]로 변환하는 유틸리티 함수
  const parseSpaceInput = (input: string): number[] => {
    if (!input) return [];

    const parts = input.split(",");
    const result: number[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue; // 빈 문자열 건너뛰기

      if (trimmed.includes("@")) {
        const [count, value] = trimmed.split("@");
        const repeatCount = parseInt(count);
        const numValue = parseFloat(value);

        if (!isNaN(repeatCount) && !isNaN(numValue)) {
          for (let i = 0; i < repeatCount; i++) {
            result.push(numValue);
          }
        }
      } else {
        const numValue = parseFloat(trimmed);
        if (!isNaN(numValue)) {
          result.push(numValue);
        }
      }
    }

    return result;
  };

  // number[]를 문자열로 변환하는 함수
  const formatSpaceDisplay = (spaceArray: number[]): string => {
    if (!spaceArray.length) return "";

    // 연속된 같은 숫자들을 그룹화
    const groups: { value: number; count: number }[] = [];
    let currentValue = spaceArray[0];
    let currentCount = 1;

    for (let i = 1; i < spaceArray.length; i++) {
      if (spaceArray[i] === currentValue) {
        currentCount++;
      } else {
        groups.push({ value: currentValue, count: currentCount });
        currentValue = spaceArray[i];
        currentCount = 1;
      }
    }
    groups.push({ value: currentValue, count: currentCount });

    // 그룹을 문자열로 변환
    return groups
      .map((group) =>
        group.count > 1 ? `${group.count}@${group.value}` : `${group.value}`
      )
      .join(", ");
  };

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileLocationRowData,
    value: string | boolean
  ) => {
    if (field === "space" || field === "angle") {
      setEditingValues((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value as string },
      }));
    } else {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id === id) {
            return { ...row, [field]: value };
          }
          return row;
        })
      );
    }
  };

  const handleBlur = (
    id: number,
    field: keyof PileLocationRowData,
    value: string
  ) => {
    if (field === "space" || field === "angle") {
      setRows((prev) => {
        const newRows = prev.map((row) => {
          if (row.id === id) {
            if (field === "space") {
              const spaceArray = parseSpaceInput(value);
              // space가 변경되면 angle도 업데이트
              const angleArray =
                row.angle.length === 0 ||
                (row.angle.length === 1 && row.angle[0] === 0)
                  ? Array(spaceArray.length + 1).fill(0)
                  : row.angle;

              // angle 배열의 길이 조정
              let adjustedAngleArray: number[];
              const targetLength = spaceArray.length + 1;

              if (angleArray.length < targetLength) {
                // 길이가 짧으면 나머지를 0으로 채움
                adjustedAngleArray = [
                  ...angleArray,
                  ...Array(targetLength - angleArray.length).fill(0),
                ];
              } else if (angleArray.length > targetLength) {
                // 길이가 길면 잘라냄
                adjustedAngleArray = angleArray.slice(0, targetLength);
              } else {
                adjustedAngleArray = angleArray;
              }

              return { ...row, space: spaceArray, angle: adjustedAngleArray };
            } else if (field === "angle") {
              const angleArray = parseSpaceInput(value);
              // 첫 번째 행의 space 길이를 기준으로 함
              const firstRowSpaceLength = prev[0].space.length;
              const targetLength = firstRowSpaceLength + 1;

              // angle이 비어있거나 0이면 첫 번째 행의 space 길이 + 1만큼 0으로 채움
              if (
                angleArray.length === 0 ||
                (angleArray.length === 1 && angleArray[0] === 0)
              ) {
                return { ...row, angle: Array(targetLength).fill(0) };
              }

              // angle 배열의 길이 조정
              let adjustedAngleArray: number[];

              if (angleArray.length < targetLength) {
                // 길이가 짧으면 나머지를 0으로 채움
                adjustedAngleArray = [
                  ...angleArray,
                  ...Array(targetLength - angleArray.length).fill(0),
                ];
              } else if (angleArray.length > targetLength) {
                // 길이가 길면 잘라냄
                adjustedAngleArray = angleArray.slice(0, targetLength);
              } else {
                adjustedAngleArray = angleArray;
              }

              return { ...row, angle: adjustedAngleArray };
            }
          }
          return row;
        });

        // 첫 번째 행의 space가 변경되었을 때 두 번째 행의 angle 업데이트
        if (field === "space" && id === 1) {
          const firstRowSpaceLength = newRows[0].space.length;
          const targetLength = firstRowSpaceLength + 1;

          newRows[1] = {
            ...newRows[1],
            angle: Array(targetLength).fill(0),
          };
        }

        return newRows;
      });
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    }
  };

  const getDisplayValue = (
    row: PileLocationRowData,
    field: keyof PileLocationRowData
  ): string => {
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
  };

  // 테이블 너비 설정
  const fieldWidths: Partial<Record<keyof PileLocationRowData, number>> = {
    loc_title: 90,
    ref_point: 100,
    loc: 100,
    space: 100,
    angle: 100,
  };

  // 테이블 렌더링 함수
  const renderRow = (row: PileLocationRowData): ReactNode[] => [
    t(row.loc_title),
    <CustomDropList
      value={row.ref_point}
      onChange={(e) => handleChange(row.id, "ref_point", e.target.value)}
      itemList={
        row.id === 1
          ? Array.from(PileLocRefXItems())
          : Array.from(PileLocRefYItems())
      }
      width={fieldWidths.ref_point}
      droplistWidth={fieldWidths.ref_point}
      hideBorder
      textAlign="center"
    />,
    <CustomNumberField
      value={row.loc.toString()}
      onChange={(e) => handleChange(row.id, "loc", e.target.value)}
      width={fieldWidths.loc}
      numberFieldWidth={fieldWidths.loc}
      placeholder="0"
      hideBorder
      textAlign="center"
    />,
    <CustomTextField
      value={getDisplayValue(row, "space")}
      onChange={(e) => handleChange(row.id, "space", e.target.value)}
      onBlur={(e) => handleBlur(row.id, "space", e.target.value)}
      width={fieldWidths.space}
      textFieldWidth={fieldWidths.space}
      placeholder={row.id === 2 ? "" : "3@2.0, 1.0"}
      hideBorder
      textAlign="center"
      disabled={row.id === 2}
    />,
    <CustomTextField
      value={getDisplayValue(row, "angle")}
      onChange={(e) => handleChange(row.id, "angle", e.target.value)}
      onBlur={(e) => handleBlur(row.id, "angle", e.target.value)}
      width={fieldWidths.angle}
      textFieldWidth={fieldWidths.angle}
      placeholder={"4@0.0, 1.0"}
      hideBorder
      textAlign="center"
    />,
  ];

  const getHeaders = () => {
    return [
      { label: t("Pile_Location_Title") },
      { label: t("Pile_Ref_Point"), width: fieldWidths.ref_point },
      { label: t("Pile_Loc"), width: fieldWidths.loc },
      { label: t("Pile_Space"), width: fieldWidths.space },
      { label: t("Pile_Angle"), width: fieldWidths.angle },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
