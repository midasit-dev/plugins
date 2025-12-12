/**
 * @fileoverview 말뚝 강화 테이블 관리를 위한 커스텀 훅
 * 말뚝 강화 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { ReactNode } from "react";

import { CustomCheckBox, CustomNumberField } from "../../components";

import { usePileDomain } from "./usePileDomain";
import { PILE_REINFORCED_TABLE } from "../../constants/pile/tableConstants";
import { PileReinforced } from "../../types/typePileDomain";

import { useTranslation } from "react-i18next";

export const usePileReinforced = () => {
  const { currentPile, updateCurrentPileReinforced } = usePileDomain();
  const { t } = useTranslation();

  // 테이블 상수 가져오기
  const {
    FIELD_WIDTHS,
    TRANSLATION_KEYS: { HEADERS },
  } = PILE_REINFORCED_TABLE;

  // 기존 rows를 currentPile.reinforced에서 가져오기
  const rows = currentPile.reinforced;

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
    const updatedRows = (prev: PileReinforced[]) => {
      if (field === "checked") {
        return handleCheckboxChange(id, value as boolean, prev);
      }

      const newRows = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // 1행의 start/end 필드가 변경되면 2행도 동일하게 업데이트
      if (id === 1 && (field === "start" || field === "end")) {
        return newRows.map((row) =>
          row.id === 2 ? { ...row, [field]: value } : row
        );
      }

      return newRows;
    };

    //상태 관리 업데이트
    updateCurrentPileReinforced(updatedRows(rows));
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
      width={FIELD_WIDTHS[field as keyof typeof FIELD_WIDTHS]}
      numberFieldWidth={FIELD_WIDTHS[field as keyof typeof FIELD_WIDTHS]}
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
  // 전체 선택/해제 기능 포함
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
              updateCurrentPileReinforced(rows.map((r) => ({ ...r, checked })));
            }}
          />
        ),
        width: FIELD_WIDTHS.check,
      },
      { label: t(HEADERS.METHOD), width: FIELD_WIDTHS.method },
      { label: t(HEADERS.START), width: FIELD_WIDTHS.start },
      { label: t(HEADERS.END), width: FIELD_WIDTHS.end },
      {
        label: t(HEADERS.THICKNESS),
        width: FIELD_WIDTHS.thickness,
      },
      { label: t(HEADERS.MODULUS), width: FIELD_WIDTHS.modulus },
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
