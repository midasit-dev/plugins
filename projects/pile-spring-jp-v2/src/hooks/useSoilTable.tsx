import { ReactNode, useEffect, useMemo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  soilTableState,
  SoilTable,
  defaultSoilTable,
  soilBasicState,
} from "../states";
import { useTranslation } from "react-i18next";
import { CustomDropList, CustomNumberField } from "../components";
import { SoilLayerTypeItems } from "../constants";
import { Box, IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

export const useSoilTable = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useRecoilState(soilTableState);
  const { groundLevel, calVsiState, liquefactionState, slopeEffectState } =
    useRecoilValue(soilBasicState);
  const layerTypeItems = SoilLayerTypeItems();

  // layerDepth 재계산 함수 메모이제이션
  const recalculateLayerDepths = useCallback(
    (data: SoilTable[]): SoilTable[] => {
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
    setTableData((prev) => recalculateLayerDepths(prev));
  }, [groundLevel, recalculateLayerDepths, setTableData]);

  // Vsi 계산 함수
  const calculateVsi = useCallback((layerType: string, avgN: number) => {
    if (layerType === "SoilType_Clay") {
      return 100 * Math.pow(Math.min(avgN, 25), 1 / 3);
    } else if (
      layerType === "SoilType_Sand" ||
      layerType === "SoilType_Sandstone"
    ) {
      return 80 * Math.pow(Math.min(avgN, 50), 1 / 3);
    }
    return 0.0;
  }, []);

  // ED 계산 함수
  const calculateED = useCallback((Vsi: number, gamma: number, vd: number) => {
    let Vsd = Vsi < 300 ? 0.8 * Vsi : Vsi;
    let Gd = (gamma / 9.8) * Math.pow(Vsd, 2);
    return 2 * (1 + vd) * Gd;
  }, []);

  // calVsiState가 변경될 때 Vsi 값 자동 계산
  useEffect(() => {
    if (calVsiState) {
      setTableData((prevData) => {
        return prevData.map((row) => {
          const Vsi = calculateVsi(row.layerType, row.avgNvalue);
          const ED = calculateED(Vsi, row.gamma, row.vd);

          return {
            ...row,
            Vsi,
            ED,
          };
        });
      });
    }
  }, [calVsiState, setTableData, calculateVsi, calculateED]);

  // liquefactionState가 변경될 때 DE 값 업데이트
  useEffect(() => {
    setTableData((prevData) => {
      return prevData.map((row) => ({
        ...row,
        DE: liquefactionState ? row.DE : 1,
      }));
    });
  }, [liquefactionState, setTableData]);

  // slopeEffectState가 변경될 때 length 값 업데이트
  useEffect(() => {
    setTableData((prevData) => {
      return prevData.map((row) => ({
        ...row,
        length: slopeEffectState ? row.length : 1,
      }));
    });
  }, [slopeEffectState, setTableData]);

  const handleAddRow = useCallback(() => {
    const newRow = {
      ...defaultSoilTable,
      id: tableData.length + 1,
      layerNo: tableData.length + 1,
    };
    const updated = [...tableData, newRow];
    setTableData(recalculateLayerDepths(updated));
  }, [tableData, recalculateLayerDepths, setTableData]);

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
      setTableData(recalculateLayerDepths(updated));
    },
    [tableData, recalculateLayerDepths, setTableData]
  );

  const handleDeleteRow = useCallback(
    (index: number) => {
      const newData = tableData.filter((_, idx) => idx !== index);
      const updated = newData.map((row, idx) => ({
        ...row,
        id: idx + 1,
        layerNo: idx + 1,
      }));
      setTableData(recalculateLayerDepths(updated));
    },
    [tableData, recalculateLayerDepths, setTableData]
  );

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

      setTableData(newData);
    },
    [tableData, setTableData, calVsiState, calculateVsi, calculateED]
  );

  const handleChange = useCallback(
    (id: number, field: keyof SoilTable, value: string) => {
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
        setTableData(recalculateLayerDepths(newData));
      } else {
        setTableData(newData);
      }
    },
    [
      tableData,
      recalculateLayerDepths,
      setTableData,
      calVsiState,
      calculateVsi,
      calculateED,
    ]
  );

  // 헤더 메모이제이션
  const header = useMemo(
    () => [
      { label: t("Soil_Table_No"), width: 60 },
      { label: t("Soil_Table_Type"), width: 80 },
      { label: t("Soil_Table_Level"), width: 80 },
      { label: t("Soil_Table_Depth"), width: 80 },
      { label: t("Soil_Table_AvgN"), width: 80 },
      { label: "γ (kN/m³)", width: 80 },
      { label: t("Soil_Table_AE0_Normal"), width: 80 },
      { label: t("Soil_Table_AE0_Seismic"), width: 80 },
      { label: "νd", width: 80 },
      { label: "Vsi", width: 80 },
      { label: "ED (kN/m²)", width: 80 },
      { label: "DE", width: 80 },
      { label: t("Soil_Table_Length"), width: 80 },
      { label: t("Soil_Table_Actions"), width: 80 },
    ],
    [t]
  );

  const renderNumberField = useCallback(
    (row: SoilTable, field: keyof SoilTable, disabled = false) => (
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
    (row: SoilTable, index: number): ReactNode[] => [
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
