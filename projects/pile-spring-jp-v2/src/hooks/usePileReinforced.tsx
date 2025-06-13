import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { pileReinforcedState, PileReinforcedRowData } from "../states";
import { CustomCheckBox, CustomNumberField } from "../components";

export const usePileReinforced = () => {
  const [rows, setRows] = useRecoilState(pileReinforcedState);
  const { t } = useTranslation();

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileReinforcedRowData,
    value: string | boolean
  ) => {
    setRows((prev) => {
      // 체크박스 변경 시 특별 처리
      if (field === "checked") {
        // 2번째 행이 체크되려고 할 때 첫 번째 행이 체크되어 있지 않으면 무시
        if (id === 2 && value === true) {
          const firstRow = prev.find((r) => r.id === 1);
          if (!firstRow?.checked) {
            return prev;
          }
        }
        // 1번째 행이 체크 해제될 때 2번째 행도 체크 해제
        if (id === 1 && value === false) {
          return prev.map((row) =>
            row.id === 2
              ? { ...row, checked: false }
              : { ...row, [field]: value }
          );
        }
      }

      const updatedRows = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // id=1이고 3,4열(reinforced_start, reinforced_end)이 변경될 때만 2행에도 적용
      if (
        id === 1 &&
        (field === "reinforced_start" || field === "reinforced_end")
      ) {
        return updatedRows.map((row) =>
          row.id === 2 ? { ...row, [field]: value } : row
        );
      }

      return updatedRows;
    });
  };

  // 테이블 너비 설정
  const fieldWidths: Partial<Record<keyof PileReinforcedRowData, number>> = {
    reinforced_method: 90,
    reinforced_start: 100,
    reinforced_end: 100,
    reinforced_thickness: 100,
    reinforced_modulus: 100,
  };

  // 숫자 필드 렌더링 함수
  const getNumberField = (
    row: PileReinforcedRowData,
    field: keyof PileReinforcedRowData,
    disabled = false,
    overrideValue?: string
  ) => (
    <CustomNumberField
      value={overrideValue ?? String(row[field] ?? "")}
      onChange={(e) => handleChange(row.id, field, e.target.value)}
      width={fieldWidths[field]}
      numberFieldWidth={fieldWidths[field]}
      placeholder="number.."
      hideBorder
      textAlign="center"
      disabled={disabled}
    />
  );

  const renderRow = (row: PileReinforcedRowData): ReactNode[] => [
    <CustomCheckBox
      checked={row.checked}
      onChange={(e) => handleChange(row.id, "checked", e.target.checked)}
    />,
    t(row.reinforced_method),
    getNumberField(
      row,
      "reinforced_start",
      row.id === 2,
      rows.find((r) => r.id === 1)?.reinforced_start.toString() || ""
    ),
    getNumberField(
      row,
      "reinforced_end",
      row.id === 2,
      rows.find((r) => r.id === 1)?.reinforced_end.toString() || ""
    ),
    getNumberField(
      row,
      "reinforced_thickness",
      false,
      rows.find((r) => r.id === 1)?.reinforced_thickness.toString() || ""
    ),
    getNumberField(
      row,
      "reinforced_modulus",
      false,
      rows.find((r) => r.id === 1)?.reinforced_modulus.toString() || ""
    ),
  ];

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
      { label: t("Reinforced_Method"), width: fieldWidths.reinforced_method },
      { label: t("Reinforced_Start"), width: fieldWidths.reinforced_start },
      { label: t("Reinforced_End"), width: fieldWidths.reinforced_end },
      {
        label: t("Reinforced_Thickness"),
        width: fieldWidths.reinforced_thickness,
      },
      { label: t("Reinforced_Modulus"), width: fieldWidths.reinforced_modulus },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
