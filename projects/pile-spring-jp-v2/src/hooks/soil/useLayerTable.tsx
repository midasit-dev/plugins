/**
 * @fileoverview 토양 테이블 관리를 위한 커스텀 훅
 * 토양 레이어 데이터의 CRUD 작업과 자동 계산 기능을 제공합니다.
 */

import { ReactNode, useEffect, useMemo, useCallback } from "react";

import { CustomDropList, CustomNumberField } from "../../components";
import { IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

import { useSoilDomain } from "./useSoilDomain";
import { defaultSoilTable } from "../../constants/soil/defaults";
import { SoilLayerTypeItems } from "../../constants/common/selectOptions";
import { SOIL_TABLE } from "../../constants/soil/tableConstants";
import {
  calculateVsi,
  calculateED,
} from "../../utils/calculators/soilTableCalculator";

import { useTranslation } from "react-i18next";

export const useSoilTable = () => {
  const { t } = useTranslation();
  const { soilLayers: tableData, basic, setSoilDomain } = useSoilDomain();
  const { groundLevel, calVsiState, liquefactionState, slopeEffectState } =
    basic;
  const layerTypeItems = SoilLayerTypeItems();

  // 테이블 상수 가져오기
  const {
    FIELD_WIDTHS,
    TRANSLATION_KEYS: { HEADERS },
  } = SOIL_TABLE;

  // layerDepth 재계산 함수 메모이제이션
  const recalculateLayerDepths = useCallback(
    (data: typeof tableData): typeof tableData => {
      let currentDepth = groundLevel;
      return data.map((row, idx) => {
        if (idx === 0) {
          currentDepth = groundLevel;
        } else {
          currentDepth = currentDepth - data[idx - 1].depth;
        }
        return {
          ...row,
          layerDepth: Number(currentDepth.toFixed(10)),
        };
      });
    },
    [groundLevel]
  );

  // groundLevel이 바뀌면 자동으로 업데이트
  useEffect(() => {
    setSoilDomain((prev) => ({
      ...prev,
      soilLayers: recalculateLayerDepths(prev.soilLayers),
    }));
  }, [groundLevel, recalculateLayerDepths, setSoilDomain]);

  // calVsiState가 변경될 때 Vsi 값 자동 계산
  useEffect(() => {
    if (calVsiState) {
      setSoilDomain((prev) => ({
        ...prev,
        soilLayers: prev.soilLayers.map((row) => {
          const Vsi = calculateVsi(row.layerType, row.avgNvalue);
          const ED = calculateED(Vsi, row.gamma, row.vd);

          return {
            ...row,
            Vsi,
            ED,
          };
        }),
      }));
    }
  }, [calVsiState, setSoilDomain]);

  // liquefactionState가 변경될 때 DE 값 업데이트
  useEffect(() => {
    setSoilDomain((prev) => ({
      ...prev,
      soilLayers: prev.soilLayers.map((row) => ({
        ...row,
        DE: liquefactionState ? row.DE : 1,
      })),
    }));
  }, [liquefactionState, setSoilDomain]);

  // slopeEffectState가 변경될 때 length 값 업데이트
  useEffect(() => {
    setSoilDomain((prev) => ({
      ...prev,
      soilLayers: prev.soilLayers.map((row) => ({
        ...row,
        length: slopeEffectState ? row.length : 1,
      })),
    }));
  }, [slopeEffectState, setSoilDomain]);

  // 테이블 추가 함수
  const handleAddRow = useCallback(() => {
    const newRow = {
      ...defaultSoilTable,
      id: tableData.length + 1,
      layerNo: tableData.length + 1,
    };
    setSoilDomain((prev) => ({
      ...prev,
      soilLayers: recalculateLayerDepths([...prev.soilLayers, newRow]),
    }));
  }, [tableData.length, recalculateLayerDepths, setSoilDomain]);

  // 테이블 이동 함수
  const handleMoveRow = useCallback(
    (index: number, direction: "up" | "down") => {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === tableData.length - 1)
      )
        return;

      const newData = [...tableData];
      const newIndex = direction === "up" ? index - 1 : index + 1;

      // 요소 교환
      const temp = newData[index];
      newData[index] = newData[newIndex];
      newData[newIndex] = temp;

      // id/layerNo 재정렬 + layerDepth 재계산
      const updated = newData.map((row, idx) => ({
        ...row,
        id: idx + 1,
        layerNo: idx + 1,
      }));
      setSoilDomain((prev) => ({
        ...prev,
        soilLayers: recalculateLayerDepths(updated),
      }));
    },
    [tableData, recalculateLayerDepths, setSoilDomain]
  );

  // 테이블 삭제 함수
  const handleDeleteRow = useCallback(
    (index: number) => {
      const newData = tableData.filter((_, idx) => idx !== index);
      const updated = newData.map((row, idx) => ({
        ...row,
        id: idx + 1,
        layerNo: idx + 1,
      }));
      setSoilDomain((prev) => ({
        ...prev,
        soilLayers: recalculateLayerDepths(updated),
      }));
    },
    [tableData, recalculateLayerDepths, setSoilDomain]
  );

  // 테이블 레이어 타입 변경 함수
  const handleLayerTypeChange = useCallback(
    (index: number) => (e: any) => {
      const newData = [...tableData];
      newData[index] = {
        ...newData[index],
        layerType: e.target.value,
      };

      // calVsiState가 true일 때 Vsi와 ED 자동 계산
      if (calVsiState) {
        const row = newData[index];
        const Vsi = calculateVsi(e.target.value, row.avgNvalue);
        const ED = calculateED(Vsi, row.gamma, row.vd);
        newData[index] = {
          ...newData[index],
          Vsi,
          ED,
        };
      }

      setSoilDomain((prev) => ({
        ...prev,
        soilLayers: newData,
      }));
    },
    [tableData, setSoilDomain, calVsiState]
  );

  // 테이블 데이터 변경 함수
  const handleChange = useCallback(
    (id: number, field: keyof (typeof tableData)[0], value: string) => {
      const newData = tableData.map((row) => {
        if (row.id === id) {
          const updatedRow = {
            ...row,
            [field]: parseFloat(value) || 0,
          };

          // calVsiState가 true일 때 avgNvalue가 변경되면 Vsi 자동 계산
          if (calVsiState && field === "avgNvalue") {
            const avgN = parseFloat(value) || 0;
            const Vsi = calculateVsi(row.layerType, avgN);
            const ED = calculateED(Vsi, row.gamma, row.vd);
            updatedRow.Vsi = Vsi;
            updatedRow.ED = ED;
          }
          // Vsi나 gamma나 vd가 변경되면 ED 자동 계산
          else if (field === "Vsi" || field === "gamma" || field === "vd") {
            const Vsi = field === "Vsi" ? parseFloat(value) || 0 : row.Vsi;
            const gamma =
              field === "gamma" ? parseFloat(value) || 0 : row.gamma;
            const vd = field === "vd" ? parseFloat(value) || 0 : row.vd;
            updatedRow.ED = calculateED(Vsi, gamma, vd);
          }

          return updatedRow;
        }
        return row;
      });

      // depth나 groundLevel이 변경되면 모든 layerDepth를 재계산
      if (field === "depth") {
        setSoilDomain((prev) => ({
          ...prev,
          soilLayers: recalculateLayerDepths(newData),
        }));
      } else {
        setSoilDomain((prev) => ({
          ...prev,
          soilLayers: newData,
        }));
      }
    },
    [
      tableData,
      recalculateLayerDepths,
      setSoilDomain,
      calVsiState,
      calculateVsi,
      calculateED,
    ]
  );

  // 헤더 메모이제이션
  const header = useMemo(
    () => [
      { label: t(HEADERS.NO), width: FIELD_WIDTHS.NO },
      { label: t(HEADERS.TYPE), width: FIELD_WIDTHS.TYPE },
      { label: t(HEADERS.LEVEL), width: FIELD_WIDTHS.LEVEL },
      { label: t(HEADERS.DEPTH), width: FIELD_WIDTHS.DEPTH },
      { label: t(HEADERS.AVG_N), width: FIELD_WIDTHS.AVG_N },
      { label: HEADERS.GAMMA, width: FIELD_WIDTHS.GAMMA },
      { label: t(HEADERS.AE0_NORMAL), width: FIELD_WIDTHS.AE0_NORMAL },
      {
        label: t(HEADERS.AE0_SEISMIC),
        width: FIELD_WIDTHS.AE0_SEISMIC,
      },
      { label: HEADERS.VD, width: FIELD_WIDTHS.VD },
      { label: HEADERS.VSI, width: FIELD_WIDTHS.VSI },
      { label: HEADERS.ED, width: FIELD_WIDTHS.ED },
      { label: HEADERS.DE, width: FIELD_WIDTHS.DE },
      { label: t(HEADERS.LENGTH), width: FIELD_WIDTHS.LENGTH },
      { label: t(HEADERS.ACTIONS), width: FIELD_WIDTHS.ACTIONS },
    ],
    [t]
  );

  const renderNumberField = useCallback(
    (
      row: (typeof tableData)[0],
      field: keyof (typeof tableData)[0],
      disabled = false
    ) => (
      <CustomNumberField
        value={row[field].toString()}
        onChange={(e) => handleChange(row.id, field, e.target.value)}
        width={80}
        numberFieldWidth={80}
        disabled={
          disabled ||
          (field === "Vsi" && calVsiState) ||
          (field === "DE" && !liquefactionState)
        }
        textAlign="center"
        hideBorder
      />
    ),
    [handleChange, calVsiState, liquefactionState]
  );

  // renderRow 함수 메모이제이션
  const renderRow = useCallback(
    (row: (typeof tableData)[0], index: number): ReactNode[] => [
      row.layerNo,
      <CustomDropList
        itemList={Array.from(layerTypeItems)}
        value={row.layerType}
        onChange={handleLayerTypeChange(index)}
        droplistWidth={80}
        textAlign="center"
        hideBorder
      />,
      renderNumberField(row, "layerDepth", true),
      renderNumberField(row, "depth"),
      renderNumberField(row, "avgNvalue"),
      renderNumberField(row, "gamma"),
      renderNumberField(row, "aE0"),
      renderNumberField(row, "aE0_Seis"),
      renderNumberField(row, "vd"),
      renderNumberField(row, "Vsi"),
      renderNumberField(row, "ED", true),
      renderNumberField(row, "DE", !liquefactionState),
      renderNumberField(row, "length", !slopeEffectState),
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 0,
          borderRadius: "4px",
          backgroundColor: "#f8f8f8",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          border: "1px solid #ddd",
        }}
      >
        <IconButton
          size="small"
          onClick={() => handleMoveRow(index, "up")}
          disabled={index === 0}
        >
          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleMoveRow(index, "down")}
          disabled={index === tableData.length - 1}
        >
          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton size="small" onClick={() => handleDeleteRow(index)}>
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </div>,
    ],
    [
      layerTypeItems,
      handleLayerTypeChange,
      renderNumberField,
      handleMoveRow,
      handleDeleteRow,
      tableData.length,
      liquefactionState,
      slopeEffectState,
    ]
  );

  return {
    tableData,
    header,
    renderRow,
    handleAddRow,
  };
};
