/**
 * @fileoverview 말뚝 섹션 테이블 관리를 위한 커스텀 훅
 * 말뚝 섹션 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { useState, useMemo } from "react";

import {
  CustomNumberField,
  CustomCheckBox,
  CustomDropList,
} from "../../components";

import { usePileDomain } from "./usePileDomain";
import { PILE_TYPES } from "../../constants/pile/constants";
import { PileTypeItems } from "../../constants/common/selectOptions";
import { PILE_SECTION_TABLE } from "../../constants/pile/tableConstants";
import { PileSection, PileType } from "../../types/typePileDomain";

import { useTranslation } from "react-i18next";

// 말뚝 섹션 테이블 관리 훅
export const usePileSection = () => {
  const { currentPile, updateCurrentPileSections } = usePileDomain();
  const [editingRow, setEditingRow] = useState<PileSection | null>(null);
  const { t } = useTranslation();

  // 테이블 상수 가져오기
  const {
    NO_EDIT_FIELDS,
    FIELD_WIDTHS,
    TRANSLATION_KEYS: { HEADERS },
  } = PILE_SECTION_TABLE;

  // 기존 rows를 currentPile.sections에서 가져오기
  const rows = currentPile.sections;

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: string,
    value: string | boolean | number
  ) => {
    // 수정 중인 행 저장
    const row = rows.find((r) => r.id === id);
    if (row) {
      setEditingRow({ ...row });
    }

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        // 기본 필드 업데이트
        if (["checked", "name", "pileType", "length"].includes(field)) {
          return { ...row, [field]: value };
        }

        // concrete 객체 필드 업데이트
        if (field.startsWith("concrete.")) {
          const concreteField = field.split(
            "."
          )[1] as keyof PileSection["concrete"];
          return {
            ...row,
            concrete: { ...row.concrete, [concreteField]: value as number },
          };
        }

        // steel 객체 필드 업데이트
        if (field.startsWith("steel.")) {
          const steelField = field.split(".")[1] as keyof PileSection["steel"];
          return {
            ...row,
            steel: { ...row.steel, [steelField]: value as number },
          };
        }
      }
      return row;
    });

    updateCurrentPileSections(updatedRows);
  };

  // 테이블 데이터 수정 가능 여부 확인 함수
  const isEditable = (field: string, type: PileType): boolean => {
    // type이 undefined인 경우 기본값 설정
    const safeType = type ?? PILE_TYPES.CAST_IN_SITU;

    if (field.startsWith("concrete.")) {
      const concreteField = field.split(
        "."
      )[1] as keyof typeof NO_EDIT_FIELDS.concrete;
      return !(
        NO_EDIT_FIELDS.concrete[concreteField]?.includes(safeType) ?? false
      );
    }

    if (field.startsWith("steel.")) {
      const steelField = field.split(
        "."
      )[1] as keyof typeof NO_EDIT_FIELDS.steel;
      return !(NO_EDIT_FIELDS.steel[steelField]?.includes(safeType) ?? false);
    }

    return true;
  };

  // 숫자 필드 셀 렌더링 함수
  const getNumberCell = (row: PileSection, field: string, width: number) => {
    // 객체 구조에서 값 가져오기
    let value: number;

    if (field === "length") {
      value = row.length;
    } else if (field.startsWith("concrete.")) {
      const concreteField = field.split(
        "."
      )[1] as keyof PileSection["concrete"];
      value = row.concrete[concreteField];
    } else if (field.startsWith("steel.")) {
      const steelField = field.split(".")[1] as keyof PileSection["steel"];
      value = row.steel[steelField];
    } else {
      value = 0;
    }

    return (
      <CustomNumberField
        value={String(value)}
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
  };

  // 테이블 행 렌더링 함수
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
              // 순차적 체크 로직
              const allAboveChecked = rows
                .filter((r) => r.id < row.id && r.id !== 1)
                .every((r) => r.checked);
              if (allAboveChecked) {
                handleChange(row.id, "checked", true);
              }
            } else {
              // 체크 해제 시 하위 행들도 해제
              const updatedRows = rows.map((r) =>
                r.id >= row.id ? { ...r, checked: false } : r
              );
              updateCurrentPileSections(updatedRows);
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

      // 콘크리트 섹션 셀
      const concreteCells = [
        getNumberCell(row, "concrete.diameter", FIELD_WIDTHS.concrete.diameter),
        getNumberCell(
          row,
          "concrete.thickness",
          FIELD_WIDTHS.concrete.thickness
        ),
        getNumberCell(row, "concrete.modulus", FIELD_WIDTHS.concrete.modulus),
      ];

      // 강재 섹션 셀
      const steelCells = [
        getNumberCell(row, "steel.diameter", FIELD_WIDTHS.steel.diameter),
        getNumberCell(row, "steel.thickness", FIELD_WIDTHS.steel.thickness),
        getNumberCell(row, "steel.modulus", FIELD_WIDTHS.steel.modulus),
        getNumberCell(
          row,
          "steel.cor_thickness",
          FIELD_WIDTHS.steel.cor_thickness
        ),
      ];

      return [...commonCells, ...concreteCells, ...steelCells];
    },
    [rows, t, updateCurrentPileSections]
  );

  // 테이블 헤더 렌더링 함수
  const getHeaders = useMemo(() => {
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
              const updatedRows = rows.map((r) =>
                r.id === 1 ? r : { ...r, checked }
              );
              updateCurrentPileSections(updatedRows);
            }}
          />
        ),
        width: 50,
      },
      { label: t(HEADERS.NAME), width: FIELD_WIDTHS.name },
      { label: t(HEADERS.TYPE), width: FIELD_WIDTHS.pileType },
      { label: t(HEADERS.LENGTH), width: FIELD_WIDTHS.length },
    ];

    // editingRow가 null일 때 기본값으로 CAST_IN_SITU를 사용
    const pileType = editingRow?.pileType ?? PILE_TYPES.CAST_IN_SITU;

    // 콘크리트 섹션 헤더
    const concreteHeaders = [
      {
        label:
          pileType === PILE_TYPES.STEEL_PILE
            ? "-"
            : t(HEADERS.CONCRETE.DIAMETER),
        width: FIELD_WIDTHS.concrete.diameter,
      },
      {
        label: (
          [
            PILE_TYPES.CAST_IN_SITU,
            PILE_TYPES.STEEL_PILE,
            PILE_TYPES.SOIL_CEMENT_PILE,
          ] as PileType[]
        ).includes(pileType)
          ? "-"
          : t(HEADERS.CONCRETE.THICKNESS),
        width: FIELD_WIDTHS.concrete.thickness,
      },
      {
        label:
          pileType === PILE_TYPES.STEEL_PILE
            ? "-"
            : pileType === PILE_TYPES.SOIL_CEMENT_PILE
            ? t(HEADERS.CONCRETE.MODULUS_CASE2)
            : t(HEADERS.CONCRETE.MODULUS_CASE1),
        width: FIELD_WIDTHS.concrete.modulus,
      },
    ];

    // 강재 섹션 헤더
    const steelHeaders = [
      {
        label:
          pileType === PILE_TYPES.SC_PILE
            ? "-"
            : (
                [PILE_TYPES.CAST_IN_SITU, PILE_TYPES.PHC_PILE] as PileType[]
              ).includes(pileType)
            ? t(HEADERS.STEEL.DIAMETER_CASE1)
            : t(HEADERS.STEEL.DIAMETER_CASE2),
        width: FIELD_WIDTHS.steel.diameter,
      },
      {
        label: (
          [PILE_TYPES.CAST_IN_SITU, PILE_TYPES.PHC_PILE] as PileType[]
        ).includes(pileType)
          ? "-"
          : t(HEADERS.STEEL.THICKNESS),
        width: FIELD_WIDTHS.steel.thickness,
      },
      {
        label: t(HEADERS.STEEL.MODULUS),
        width: FIELD_WIDTHS.steel.modulus,
      },
      {
        label:
          pileType === PILE_TYPES.CAST_IN_SITU
            ? "-"
            : pileType === PILE_TYPES.PHC_PILE
            ? t(HEADERS.STEEL.COR_CASE1)
            : t(HEADERS.STEEL.COR_CASE2),
        width: FIELD_WIDTHS.steel.cor_thickness,
      },
    ];

    // 이중 헤더 구성
    const doubleHeaders = [
      // 기본 헤더 (첫 번째 행)
      [...baseHeaders, ...concreteHeaders, ...steelHeaders],
      // 그룹 헤더 (두 번째 행)
      [
        { label: "", colSpan: 4 }, // 기본 정보 영역
        {
          label: t(HEADERS.CONCRETE.GROUP),
          colSpan: 3,
          width:
            FIELD_WIDTHS.concrete.diameter +
            FIELD_WIDTHS.concrete.thickness +
            FIELD_WIDTHS.concrete.modulus,
        },
        {
          label: t(HEADERS.STEEL.GROUP),
          colSpan: 4,
          width:
            FIELD_WIDTHS.steel.diameter +
            FIELD_WIDTHS.steel.thickness +
            FIELD_WIDTHS.steel.modulus +
            FIELD_WIDTHS.steel.cor_thickness,
        },
      ],
    ];

    return doubleHeaders;
  }, [rows, editingRow, t, updateCurrentPileSections]);

  return {
    rows,
    handleChange,
    isEditable,
    getNumberCell,
    renderRow,
    getHeaders,
    setEditingRow,
  };
};
