import React, { ReactNode } from "react";
import { GuideBox, Typography } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { soilTableState, SoilTableRowData } from "../../states/stateSoilTable";
import CustomTable, { CustomTableCell } from "../../components/CustomTable";
import { CustomDropList, CustomNumberField } from "../../components";
import { IconButton, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import { SoilLayerTypeItems } from "../../constants/dropListItems";
import { useTranslation } from "react-i18next";

const defaultRowData: SoilTableRowData = {
  id: 1,
  layerNo: 1,
  layerType: "SoilType_Clay",
  layerDepth: 0,
  depth: 10,
  avgNvalue: 10,
  c: 0,
  pi: 0,
  gamma: 18,
  aE0: 14000,
  aE0_Seis: 28000,
  vd: 0.5,
  Vsi: 0,
  ED: 0,
  DE: 1,
  legnth: 1,
};

const SoilTable = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useRecoilState(soilTableState);
  const layerTypeItems = SoilLayerTypeItems();

  const handleAddRow = () => {
    const newRow = {
      ...defaultRowData,
      id: tableData.length + 1,
      layerNo: tableData.length + 1,
    };
    setTableData([...tableData, newRow]);
  };

  const handleMoveRow = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tableData.length - 1)
    )
      return;

    const newData = [...tableData];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    // 배열 요소 교환
    const temp = newData[index];
    newData[index] = newData[newIndex];
    newData[newIndex] = temp;

    // layerNo와 id 재정렬
    newData.forEach((row, idx) => {
      newData[idx] = {
        ...row,
        layerNo: idx + 1,
        id: idx + 1,
      };
    });

    setTableData(newData);
  };

  const handleDeleteRow = (index: number) => {
    const newData = tableData.filter((_, idx) => idx !== index);
    // layerNo와 id 재정렬
    const updatedData = newData.map((row, idx) => ({
      ...row,
      layerNo: idx + 1,
      id: idx + 1,
    }));
    setTableData(updatedData);
  };

  const handleLayerTypeChange = (index: number) => (e: any) => {
    const newData = [...tableData];
    newData[index] = {
      ...newData[index],
      layerType: e.target.value,
    };
    setTableData(newData);
  };

  const handleChange = (
    id: number,
    field: keyof SoilTableRowData,
    value: string
  ) => {
    const newData = tableData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          [field]: parseFloat(value) || 0,
        };
      }
      return row;
    });
    setTableData(newData);
  };

  const header = [
    { label: t("Soil_Table_No"), width: 60 },
    { label: t("Soil_Table_Type"), width: 80 },
    { label: t("Soil_Table_Level"), width: 80 },
    { label: t("Soil_Table_Depth"), width: 80 },
    { label: t("Soil_Table_AvgN"), width: 80 },
    // { label: "c", width: 80 },
    // { label: "PI", width: 80 },
    { label: "γ (kN/m³)", width: 80 },
    { label: t("Soil_Table_AE0_Normal"), width: 80 },
    { label: t("Soil_Table_AE0_Seismic"), width: 80 },
    { label: "νd", width: 80 },
    { label: "Vsi", width: 80 },
    { label: "ED (kN/m²)", width: 80 },
    { label: "DE", width: 80 },
    { label: t("Soil_Table_Length"), width: 80 },
    { label: t("Soil_Table_Actions"), width: 80 },
  ];

  const renderRow = (row: SoilTableRowData, index: number): ReactNode[] => [
    row.layerNo,
    <CustomDropList
      itemList={Array.from(layerTypeItems)}
      value={row.layerType}
      onChange={handleLayerTypeChange(index)}
      droplistWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.layerDepth.toString()}
      onChange={(e) => handleChange(row.id, "layerDepth", e.target.value)}
      width={80}
      numberFieldWidth={80}
      disabled
      hideBorder
    />,
    <CustomNumberField
      value={row.depth.toString()}
      onChange={(e) => handleChange(row.id, "depth", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.avgNvalue.toString()}
      onChange={(e) => handleChange(row.id, "avgNvalue", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.gamma.toString()}
      onChange={(e) => handleChange(row.id, "gamma", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.aE0.toString()}
      onChange={(e) => handleChange(row.id, "aE0", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.aE0_Seis.toString()}
      onChange={(e) => handleChange(row.id, "aE0_Seis", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.vd.toString()}
      onChange={(e) => handleChange(row.id, "vd", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.Vsi.toString()}
      onChange={(e) => handleChange(row.id, "Vsi", e.target.value)}
      width={80}
      numberFieldWidth={80}
      hideBorder
    />,
    <CustomNumberField
      value={row.ED.toString()}
      onChange={(e) => handleChange(row.id, "ED", e.target.value)}
      width={80}
      numberFieldWidth={80}
      disabled
      hideBorder
    />,
    <CustomNumberField
      value={row.DE.toString()}
      onChange={(e) => handleChange(row.id, "DE", e.target.value)}
      width={80}
      numberFieldWidth={80}
      disabled
      hideBorder
    />,
    <CustomNumberField
      value={row.legnth.toString()}
      onChange={(e) => handleChange(row.id, "legnth", e.target.value)}
      width={80}
      numberFieldWidth={80}
      disabled
      hideBorder
    />,
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 0,
        borderRadius: "4px",
        backgroundColor: "#f8f8f8", // 약간 밝은 배경
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)", // 살짝 떠 보이게
        border: "1px solid #ddd", // 미세한 경계
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
    </Box>,
  ];

  return (
    <GuideBox width="100%" column>
      <GuideBox width="100%" row horSpaceBetween verCenter>
        <Typography variant="body2">{t("Soil_Table")}</Typography>
        <IconButton onClick={handleAddRow}>
          <AddIcon />
        </IconButton>
      </GuideBox>
      <GuideBox width="860px" column>
        <CustomTable
          headers={header}
          rows={tableData}
          renderRow={renderRow}
          height={400}
          stickyLastColumn
        />
      </GuideBox>
    </GuideBox>
  );
};

export default SoilTable;
