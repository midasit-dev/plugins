import { ReactNode, useState, useCallback } from "react";
import { useRecoilState } from "recoil";
import { pileLocationState, PileLocation } from "../states";
import { PileLocRefXItems, PileLocRefYItems } from "../constants";
import { useTranslation } from "react-i18next";
import {
  CustomNumberField,
  CustomDropList,
  CustomTextField,
} from "../components";

// 상수 정의
const FIELD_WIDTHS: Partial<Record<keyof PileLocation, number>> = {
  loc_title: 90,
  ref_point: 100,
  loc: 100,
  space: 100,
  angle: 100,
};

export const usePileLocation = () => {
  const [rows, setRows] = useRecoilState(pileLocationState);
  const [editingValues, setEditingValues] = useState<
    Record<number, { space?: string; angle?: string }>
  >({});

  const { t } = useTranslation();

  // 입력값 파싱 함수
  const parseSpaceInput = useCallback((input: string): number[] => {
    if (!input) return [];

    const parts = input.split(",");
    const result: number[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

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

    // 0 하나만 있는 경우 빈 배열로 처리
    if (result.length === 1 && result[0] === 0) {
      return [];
    }

    return result;
  }, []);

  // 입력값 포맷팅 함수
  const formatSpaceDisplay = useCallback((spaceArray: number[]): string => {
    if (!spaceArray.length) return "";

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

    return groups
      .map((group) =>
        group.count > 1 ? `${group.count}@${group.value}` : `${group.value}`
      )
      .join(", ");
  }, []);

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
  // 입력값을 바꾸는 과정에서 문제가 생길 수 있어 처리
  const handleSpaceBlur = useCallback(
    (id: number, value: string) => {
      setRows((prev) => {
        const newRows = prev.map((row) => {
          if (row.id === id) {
            const spaceArray = parseSpaceInput(value);
            // 간격이 0이거나 비어있을 때는 빈 배열로 처리
            const finalSpaceArray =
              spaceArray.length === 1 && spaceArray[0] === 0 ? [] : spaceArray;

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

        return newRows;
      });

      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    },
    [parseSpaceInput]
  );

  // 각도 입력값 포커스 아웃될 때 동작하도록 처리
  // 입력값을 바꾸는 과정에서 문제가 생길 수 있어 처리
  const handleAngleBlur = useCallback(
    (id: number, value: string) => {
      setRows((prev) => {
        const newRows = prev.map((row) => {
          if (row.id === id) {
            const angleArray = parseSpaceInput(value);
            const firstRowSpaceLength = prev[0].space.length;
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

        return newRows;
      });

      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    },
    [parseSpaceInput]
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
    [editingValues, formatSpaceDisplay]
  );

  // 테이블 행 렌더링 함수
  const renderRow = useCallback(
    (row: PileLocation): ReactNode[] => [
      t(row.loc_title),
      <CustomDropList
        key="ref_point"
        value={row.ref_point}
        onChange={(e) =>
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id ? { ...r, ref_point: e.target.value } : r
            )
          )
        }
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
        onChange={(e) =>
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id ? { ...r, loc: Number(e.target.value) } : r
            )
          )
        }
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
        placeholder={"4@0.0, 1.0"}
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
    ]
  );

  // 테이블 헤더 렌더링 함수
  const getHeaders = useCallback(
    () => [
      { label: t("Pile_Location_Title") },
      { label: t("Pile_Ref_Point"), width: FIELD_WIDTHS.ref_point },
      { label: t("Pile_Loc"), width: FIELD_WIDTHS.loc },
      { label: t("Pile_Space"), width: FIELD_WIDTHS.space },
      { label: t("Pile_Angle"), width: FIELD_WIDTHS.angle },
    ],
    [t]
  );

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
