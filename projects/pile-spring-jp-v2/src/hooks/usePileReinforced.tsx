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

  const renderRow = (row: PileReinforcedRowData): ReactNode[] => [
    <CustomCheckBox
      checked={row.checked}
      onChange={(e) => handleChange(row.id, "checked", e.target.checked)}
    />,
    t(row.reinforced_method),
    <CustomNumberField
      value={
        row.id === 2
          ? rows.find((r) => r.id === 1)?.reinforced_start.toString() || ""
          : row.reinforced_start.toString()
      }
      onChange={(e) => handleChange(row.id, "reinforced_start", e.target.value)}
      width={100}
      numberFieldWidth={100}
      placeholder="number.."
      disabled={row.id === 2}
      hideBorder
      textAlign="center"
    />,
    <CustomNumberField
      value={
        row.id === 2
          ? rows.find((r) => r.id === 1)?.reinforced_end.toString() || ""
          : row.reinforced_end.toString()
      }
      onChange={(e) => handleChange(row.id, "reinforced_end", e.target.value)}
      width={100}
      numberFieldWidth={100}
      placeholder="number.."
      disabled={row.id === 2}
      hideBorder
      textAlign="center"
    />,
    <CustomNumberField
      value={row.reinforced_thickness.toString()}
      onChange={(e) =>
        handleChange(row.id, "reinforced_thickness", e.target.value)
      }
      width={100}
      numberFieldWidth={100}
      placeholder="number.."
      hideBorder
      textAlign="center"
    />,
    <CustomNumberField
      value={row.reinforced_modulus.toString()}
      onChange={(e) =>
        handleChange(row.id, "reinforced_modulus", e.target.value)
      }
      width={100}
      numberFieldWidth={100}
      placeholder="number.."
      hideBorder
      textAlign="center"
    />,
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
      { label: t("Reinforced_Method"), width: 100 },
      { label: t("Reinforced_Start"), width: 100 },
      { label: t("Reinforced_End"), width: 100 },
      { label: t("Reinforced_Thickness"), width: 100 },
      { label: t("Reinforced_Modulus"), width: 100 },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
