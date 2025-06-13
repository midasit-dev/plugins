import { useState } from "react";
import { useRecoilState } from "recoil";
import { pileSectionState, PileRowData } from "../states";
import { PileTypeItems } from "../constants";
import {
  CustomNumberField,
  CustomCheckBox,
  CustomDropList,
} from "../components";
import { useTranslation } from "react-i18next";

export const usePileSectionTable = () => {
  const [rows, setRows] = useRecoilState(pileSectionState);
  const [tabValue, setTabValue] = useState("concrete");
  const [editingRow, setEditingRow] = useState<PileRowData | null>(null);

  const { t } = useTranslation();

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileRowData,
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
  const isEditable = (field: keyof PileRowData, type: string) => {
    const noEdit: Partial<Record<keyof PileRowData, string[]>> = {
      concrete_thickness: ["Cast_In_Situ", "Steel_Pile", "Soil_Cement_Pile"],
      concrete_diameter: ["Steel_Pile"],
      concrete_modulus: ["Steel_Pile"],
      steel_diameter: ["SC_Pile"],
      steel_thickness: ["Cast_In_Situ", "PHC_Pile"],
      steel_cor_thickness: ["Cast_In_Situ"],
    };
    return !noEdit[field]?.includes(type);
  };

  // 테이블 렌더링 로직
  const getNumberCell = (
    row: PileRowData,
    field: keyof PileRowData,
    width = 100
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

  const renderRow = (row: PileRowData) => {
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
      getNumberCell(row, "length", 120),
    ];

    // 탭에 따른 추가 셀 (콘크리트 / 강재)
    const tabSpecificCells =
      tabValue === "concrete"
        ? [
            getNumberCell(row, "concrete_diameter", 130),
            getNumberCell(row, "concrete_thickness", 130),
            getNumberCell(row, "concrete_modulus", 140),
          ]
        : [
            getNumberCell(row, "steel_diameter", 100),
            getNumberCell(row, "steel_thickness", 100),
            getNumberCell(row, "steel_modulus", 100),
            getNumberCell(row, "steel_cor_thickness", 100),
          ];

    return [...commonCells, ...tabSpecificCells];
  };

  // 테이블 헤더 렌더링 함수
  const getHeaders = () => {
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
      { label: t("Pile_Name"), width: 130 },
      { label: t("Pile_Type"), width: 140 },
      { label: t("Pile_Length"), width: 120 },
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
        { label: diameterText, width: 130 },
        { label: thicknessText, width: 130 },
        { label: modulusText, width: 140 },
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
        { label: diameterText, width: 100 },
        { label: thicknessText, width: 100 },
        { label: t("Basic_Steel_Modulus"), width: 100 },
        { label: corThicknessText, width: 100 },
      ];
    }
  };

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
