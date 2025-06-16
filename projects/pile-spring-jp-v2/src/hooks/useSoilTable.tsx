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
import { ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";

export const useSoilTable = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useRecoilState(soilTableState);
  const { groundLevel } = useRecoilValue(soilBasicState); // groundLevel 사용
  const layerTypeItems = SoilLayerTypeItems();

  // layerDepth 재계산 함수 메모이제이션
  const recalculateLayerDepths = useCallback(
    (data: SoilTable[]): SoilTable[] => {
      let currentDepth = groundLevel;
      return data.map((row, idx) => {
        if (idx === 0) {
          currentDepth = groundLevel;
        } else {
          currentDepth = currentDepth + data[idx - 1].depth;
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
      setTableData(newData);
    },
    [tableData, setTableData]
  );

  const handleChange = useCallback(
    (id: number, field: keyof SoilTable, value: string) => {
      const newData = tableData.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            [field]: parseFloat(value) || 0,
          };
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
    [tableData, recalculateLayerDepths, setTableData]
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
        disabled={disabled}
        textAlign="center"
        hideBorder
      />
    ),
    [handleChange]
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
      renderNumberField(row, "DE", true),
      renderNumberField(row, "length", true),
      <Box
        sx={{
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
          <ArrowUpward sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleMoveRow(index, "down")}
          disabled={index === tableData.length - 1}
        >
          <ArrowDownward sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton size="small" onClick={() => handleDeleteRow(index)}>
          <Delete sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>,
    ],
    [
      layerTypeItems,
      handleLayerTypeChange,
      renderNumberField,
      handleMoveRow,
      handleDeleteRow,
      tableData.length,
    ]
  );

  return {
    tableData,
    header,
    renderRow,
    handleAddRow,
  };
};
