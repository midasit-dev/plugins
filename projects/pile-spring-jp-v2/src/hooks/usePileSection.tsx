import { useState, useMemo } from "react";
import { useRecoilState } from "recoil";
import { pileSectionState, PileSection, PileType } from "../states";
import { PileTypeItems } from "../constants";
import {
  CustomNumberField,
  CustomCheckBox,
  CustomDropList,
} from "../components";
import { useTranslation } from "react-i18next";

// 파일 타입에 따라, 수정 불가능한 필드 정의
const NO_EDIT_FIELDS: Partial<Record<keyof PileSection, string[]>> = {
  concrete_thickness: ["Cast_In_Situ", "Steel_Pile", "Soil_Cement_Pile"],
  concrete_diameter: ["Steel_Pile"],
  concrete_modulus: ["Steel_Pile"],
  steel_diameter: ["SC_Pile"],
  steel_thickness: ["Cast_In_Situ", "PHC_Pile"],
  steel_cor_thickness: ["Cast_In_Situ"],
};

// 테이블 너비 정의
const FIELD_WIDTHS: Partial<Record<keyof PileSection, number>> = {
  name: 120,
  pileType: 140,
  length: 130,
  concrete_diameter: 130,
  concrete_thickness: 130,
  concrete_modulus: 140,
  steel_diameter: 100,
  steel_thickness: 100,
  steel_modulus: 100,
  steel_cor_thickness: 100,
} as const;

export const usePileSectionTable = () => {
  const [rows, setRows] = useRecoilState(pileSectionState);
  const [tabValue, setTabValue] = useState("concrete");
  const [editingRow, setEditingRow] = useState<PileSection | null>(null);

  const { t } = useTranslation();

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileSection,
    value: string | boolean | number
  ) => {
    // 수정 중인 행 저장
    const row = rows.find((r) => r.id === id);
    if (row) {
      setEditingRow({ ...row, [field]: value });
    }

    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // 테이블 데이터 수정 가능 여부 확인 함수
  const isEditable = (field: keyof PileSection, type: PileType) => {
    return !NO_EDIT_FIELDS[field]?.includes(type);
  };

  // 테이블 렌더링 로직
  const getNumberCell = (
    row: PileSection,
    field: keyof PileSection,
    width = FIELD_WIDTHS[field] || 100
  ) => (
    <CustomNumberField
      value={String(row[field])}
      onChange={(e) => handleChange(row.id, field, Number(e.target.value))}
      onFocus={() => setEditingRow(row)}
      disabled={!isEditable(field, row.pileType)}
      width={width}
      numberFieldWidth={width}
      placeholder="0"
      hideBorder
      textAlign="center"
    />
  );

  // 테이블 렌더링 함수
  const renderRow = useMemo(
    () => (row: PileSection) => {
      // 공통 셀 (처음 4개 열)
      const commonCells = [
        <CustomCheckBox
          key="checkbox"
          checked={row.checked}
          disabled={row.id === 1}
          onChange={(e) => {
            const checked = e.target.checked;
            if (checked) {
              const allAboveChecked = rows
                .filter((r) => r.id < row.id && r.id !== 1)
                .every((r) => r.checked);
              if (allAboveChecked) {
                handleChange(row.id, "checked", true);
              }
            } else {
              setRows((prev) =>
                prev.map((r) => (r.id >= row.id ? { ...r, checked: false } : r))
              );
            }
          }}
        />,
        t(row.name),
        <CustomDropList
          key="pileType"
          value={row.pileType}
          onChange={(e) => handleChange(row.id, "pileType", e.target.value)}
          itemList={Array.from(PileTypeItems())}
          width={140}
          droplistWidth={140}
          hideBorder
          textAlign="center"
        />,
        getNumberCell(row, "length", FIELD_WIDTHS.length),
      ];

      // 탭에 따른 추가 셀 (콘크리트 / 강재)
      const tabSpecificCells =
        tabValue === "concrete"
          ? [
              getNumberCell(
                row,
                "concrete_diameter",
                FIELD_WIDTHS.concrete_diameter
              ),
              getNumberCell(
                row,
                "concrete_thickness",
                FIELD_WIDTHS.concrete_thickness
              ),
              getNumberCell(
                row,
                "concrete_modulus",
                FIELD_WIDTHS.concrete_modulus
              ),
            ]
          : [
              getNumberCell(row, "steel_diameter", FIELD_WIDTHS.steel_diameter),
              getNumberCell(
                row,
                "steel_thickness",
                FIELD_WIDTHS.steel_thickness
              ),
              getNumberCell(row, "steel_modulus", FIELD_WIDTHS.steel_modulus),
              getNumberCell(
                row,
                "steel_cor_thickness",
                FIELD_WIDTHS.steel_cor_thickness
              ),
            ];

      return [...commonCells, ...tabSpecificCells];
    },
    [rows, tabValue, t]
  );

  // 테이블 헤더 렌더링 함수
  const getHeaders = useMemo(() => {
    // 기본 헤더
    const baseHeaders = [
      {
        label: (
          <CustomCheckBox
            indeterminate={
              rows.slice(1).some((r) => r.checked) &&
              !rows.slice(1).every((r) => r.checked)
            }
            checked={rows.slice(1).every((r) => r.checked)}
            onChange={(e) => {
              const checked = e.target.checked;
              setRows((prev) =>
                prev.map((r) => (r.id === 1 ? r : { ...r, checked }))
              );
            }}
          />
        ),
        width: 50,
      },
      { label: t("Pile_Name"), width: FIELD_WIDTHS.name },
      { label: t("Pile_Type"), width: FIELD_WIDTHS.pileType },
      { label: t("Pile_Length"), width: FIELD_WIDTHS.length },
    ];

    // 수정 중인 행의 PileType 가져오기
    const pileType = editingRow?.pileType || "";

    // 콘크리트 탭
    if (tabValue === "concrete") {
      // PileType에 따라 헤더 텍스트 변경
      const diameterText =
        pileType === "Steel_Pile" ? "-" : t("Basic_Concrete_Diamter");
      const thicknessText = [
        "Cast_In_Situ",
        "Steel_Pile",
        "Soil_Cement_Pile",
      ].includes(pileType)
        ? "-"
        : t("Basic_Concrete_Thickness");
      const modulusText =
        pileType === "Steel_Pile"
          ? "-"
          : pileType === "Soil_Cement_Pile"
          ? t("Basic_Concrete_Modulus_Case2")
          : t("Basic_Concrete_Modulus_Case1");

      return [
        ...baseHeaders,
        { label: diameterText, width: FIELD_WIDTHS.concrete_diameter },
        { label: thicknessText, width: FIELD_WIDTHS.concrete_thickness },
        { label: modulusText, width: FIELD_WIDTHS.concrete_modulus },
      ];
    } else {
      // 강재 탭
      const diameterText =
        pileType === "SC_Pile"
          ? "-"
          : ["Cast_In_Situ", "PHC_Pile"].includes(pileType)
          ? t("Basic_Steel_Diamter_Case1")
          : t("Basic_Steel_Diamter_Case2");
      const thicknessText = ["Cast_In_Situ", "PHC_Pile"].includes(pileType)
        ? "-"
        : t("Basic_Steel_Thickness");
      const corThicknessText =
        pileType === "Cast_In_Situ"
          ? "-"
          : pileType === "PHC_Pile"
          ? t("Basic_Steel_Cor_Case1")
          : t("Basic_Steel_Cor_Case2");

      return [
        ...baseHeaders,
        { label: diameterText, width: FIELD_WIDTHS.steel_diameter },
        { label: thicknessText, width: FIELD_WIDTHS.steel_thickness },
        { label: t("Basic_Steel_Modulus"), width: FIELD_WIDTHS.steel_modulus },
        { label: corThicknessText, width: FIELD_WIDTHS.steel_cor_thickness },
      ];
    }
  }, [rows, tabValue, editingRow, t]);

  return {
    rows,
    tabValue,
    setTabValue,
    handleChange,
    isEditable,
    getNumberCell,
    renderRow,
    getHeaders,
    setEditingRow,
  };
};
