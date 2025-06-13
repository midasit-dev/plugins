import { ReactNode } from "react";
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

  const { t } = useTranslation();

  // space 문자열을 number[]로 변환하는 유틸리티 함수
  const parseSpaceInput = (input: string): number[] => {
    if (!input) return [];

    const parts = input.split(",");
    const result: number[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("@")) {
        const [count, value] = trimmed.split("@");
        const repeatCount = parseInt(count);
        const numValue = parseFloat(value);

        for (let i = 0; i < repeatCount; i++) {
          result.push(numValue);
        }
      } else {
        result.push(parseFloat(trimmed));
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
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          if (field === "space") {
            return { ...row, [field]: parseSpaceInput(value as string) };
          }
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const inputWidth = 100;
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
      width={inputWidth}
      droplistWidth={inputWidth}
      hideBorder
      textAlign="center"
    />,
    <CustomNumberField
      value={row.loc.toString()}
      onChange={(e) => handleChange(row.id, "loc", e.target.value)}
      width={inputWidth}
      numberFieldWidth={inputWidth}
      placeholder="0"
      hideBorder
      textAlign="center"
    />,
    <CustomTextField
      value={formatSpaceDisplay(row.space)}
      onChange={(e) => handleChange(row.id, "space", e.target.value)}
      width={inputWidth}
      textFieldWidth={inputWidth}
      placeholder="3@2.0, 1.0"
      hideBorder
      textAlign="center"
    />,
    <CustomTextField
      value={row.angle.toString()}
      onChange={(e) => handleChange(row.id, "angle", e.target.value)}
      width={inputWidth}
      textFieldWidth={inputWidth}
      placeholder="4@0.0, 1.0"
      hideBorder
      textAlign="center"
    />,
  ];

  const getHeaders = () => {
    return [
      { label: t("Pile_Location_Title") },
      { label: t("Pile_Ref_Point"), width: 100 },
      { label: t("Pile_Loc"), width: 100 },
      { label: t("Pile_Space"), width: 100 },
      { label: t("Pile_Angle"), width: 100 },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
