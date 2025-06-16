import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { pileReinforcedState, PileReinforced } from "../states";
import { CustomCheckBox, CustomNumberField } from "../components";

const FIELD_WIDTHS: Partial<Record<keyof PileReinforced, number>> = {
  method: 90,
  start: 100,
  end: 100,
  thickness: 100,
  modulus: 100,
} as const;

export const usePileReinforced = () => {
  const [rows, setRows] = useRecoilState(pileReinforcedState);
  const { t } = useTranslation();

  // 체크박스 변경 함수
  // 1행은 독립적으로 체크가 가능
  // 2행은 1행의 체크 여부에 따라 체크 여부가 결정됨
  const handleCheckboxChange = (
    id: number,
    value: boolean,
    prev: PileReinforced[]
  ) => {
    if (id === 2 && value === true) {
      const firstRow = prev.find((r) => r.id === 1);
      if (!firstRow?.checked) {
        return prev;
      }
    }
    if (id === 1 && value === false) {
      return prev.map((row) =>
        row.id === 2 ? { ...row, checked: false } : { ...row, checked: value }
      );
    }
    return prev.map((row) =>
      row.id === id ? { ...row, checked: value } : row
    );
  };

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileReinforced,
    value: string | boolean
  ) => {
    setRows((prev) => {
      if (field === "checked") {
        return handleCheckboxChange(id, value as boolean, prev);
      }

      const updatedRows = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );

      if (id === 1 && (field === "start" || field === "end")) {
        return updatedRows.map((row) =>
          row.id === 2 ? { ...row, [field]: value } : row
        );
      }

      return updatedRows;
    });
  };

  // 숫자 필드 렌더링 함수
  const getNumberField = (
    row: PileReinforced,
    field: keyof PileReinforced,
    disabled = false,
    overrideValue?: string
  ) => (
    <CustomNumberField
      value={overrideValue ?? String(row[field] ?? "")}
      onChange={(e) => handleChange(row.id, field, e.target.value)}
      width={FIELD_WIDTHS[field]}
      numberFieldWidth={FIELD_WIDTHS[field]}
      placeholder="number.."
      hideBorder
      textAlign="center"
      disabled={disabled}
      numberOptions={{
        min: 0,
        condition: {
          min: "greater",
        },
      }}
    />
  );

  // 테이블 렌더링 함수
  const firstRow = rows.find((r) => r.id === 1);
  const renderRow = (row: PileReinforced): ReactNode[] => [
    <CustomCheckBox
      checked={row.checked}
      onChange={(e) => handleChange(row.id, "checked", e.target.checked)}
    />,
    t(row.method),
    getNumberField(
      row,
      "start",
      row.id === 2,
      firstRow?.start.toString() || ""
    ),
    getNumberField(row, "end", row.id === 2, firstRow?.end.toString() || ""),
    getNumberField(row, "thickness", false),
    getNumberField(row, "modulus", false),
  ];

  // 테이블 헤더 렌더링 함수
  const getHeaders = () => {
    return [
      {
        label: (
          <CustomCheckBox
            indeterminate={
              rows.some((r) => r.checked) && !rows.every((r) => r.checked)
            }
            checked={rows.every((r) => r.checked)}
            onChange={(e) => {
              const checked = e.target.checked;
              setRows((prev) => prev.map((r) => ({ ...r, checked })));
            }}
          />
        ),
      },
      { label: t("Reinforced_Method"), width: FIELD_WIDTHS.method },
      { label: t("Reinforced_Start"), width: FIELD_WIDTHS.start },
      { label: t("Reinforced_End"), width: FIELD_WIDTHS.end },
      {
        label: t("Reinforced_Thickness"),
        width: FIELD_WIDTHS.thickness,
      },
      { label: t("Reinforced_Modulus"), width: FIELD_WIDTHS.modulus },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
