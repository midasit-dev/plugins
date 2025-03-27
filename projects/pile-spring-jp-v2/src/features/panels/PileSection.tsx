// features/pile-section/components/PileSectionGrid.tsx
import React from "react";
import { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { Checkbox } from "@mui/material";
import { useRecoilState } from "recoil";
import { pileSectionState } from "../../states";
import { PileTypeItems } from "../../constants";
import { GuideBox, Typography, DropList } from "@midasit-dev/moaui";
import {
  CustomDataGrid,
  CustomNumberField,
  CustomCheckBox,
} from "../../components";

interface PileSectionRow {
  id: number;
  checked: boolean;
  name: string;
  pileType: string;
  length: number;
  startPoint: number;
  endPoint: number;
  concrete_diameter: number;
  concrete_thickness: number;
  concrete_modulus: number;
  steel_diameter: number;
  steel_thickness: number;
  steel_modulus: number;
  steel_cor_thickness: number;
}

const PileSectionGrid = () => {
  const [rows, setRows] = useRecoilState(pileSectionState);

  const columns: GridColDef[] = [
    // 1. 체크박스 열
    {
      field: "checked",
      headerName: "",
      width: 50,
      sortable: false,
      renderHeader: () => (
        <CustomCheckBox
          onChange={(e) => {
            const newChecked = e.target.checked;
            if (newChecked) {
              // 모든 행 체크 (첫 번째 행 제외)
              setRows(
                rows.map((row) =>
                  row.id === 1 ? row : { ...row, checked: true }
                )
              );
            } else {
              // 모든 행 체크 해제 (첫 번째 행 제외)
              setRows(
                rows.map((row) =>
                  row.id === 1 ? row : { ...row, checked: false }
                )
              );
            }
          }}
          checked={rows.slice(1).every((row) => row.checked)}
          indeterminate={
            rows.slice(1).some((row) => row.checked) &&
            !rows.slice(1).every((row) => row.checked)
          }
        />
      ),
      renderCell: (params) => (
        <CustomCheckBox
          checked={params.row.checked}
          disabled={params.row.id === 1}
          onChange={(e) => handleCheckChange(params.row.id, e.target.checked)}
        />
      ),
    },
    // 2. 말뚝 이름 열
    {
      field: "name",
      headerName: "말뚝",
      width: 80,
      sortable: false,
      editable: false,
      cellClassName: () => "cell-highlight",
    },
    // 3. 말뚝 종류 선택 열
    {
      field: "pileType",
      headerName: "말뚝 종류",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <DropList
          width={120}
          itemList={PileTypeItems()}
          value={params.value}
          onChange={(e) => handlePileTypeChange(params.row.id, e.target.value)}
        />
      ),
    },
    // 4. 시점 열
    {
      field: "startPoint",
      headerName: "시점",
      type: "number",
      width: 60,
      sortable: false,
      cellClassName: () => "cell-highlight",
    },
    // 5. 종점 열
    {
      field: "endPoint",
      headerName: "종점",
      type: "number",
      width: 60,
      sortable: false,
      cellClassName: () => "cell-highlight",
    },
    // 6. 길이
    {
      field: "length",
      headerName: "길이",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0 || !params.row.checked,
      }),
    },
    // 6-8. 콘크리트 그룹
    {
      field: "concrete_diameter",
      headerName: "직경(mm)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // Steel_Pile 경우 편집 불가능
        if (["Steel_Pile"].includes(params.row.pileType)) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    {
      field: "concrete_thickness",
      headerName: "두께(mm)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // Cast_In_Situ, Steel_Pile, Soil_Cement_Pile 경우 편집 불가능
        if (
          ["Cast_In_Situ", "Steel_Pile", "Soil_Cement_Pile"].includes(
            params.row.pileType
          )
        ) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    {
      field: "concrete_modulus",
      headerName: "탄성계수(N/mm²)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // Steel_Pile 경우 편집 불가능
        if (["Steel_Pile"].includes(params.row.pileType)) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    // // 9-12. 철근 그룹
    {
      field: "steel_diameter",
      headerName: "직경(mm)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // SC_Pile 경우 편집 불가능
        if (["SC_Pile"].includes(params.row.pileType)) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    {
      field: "steel_thickness",
      headerName: "두께(mm)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // Cast_In_Situ, PHC_Pile 경우 편집 불가능
        if (["Cast_In_Situ", "PHC_Pile"].includes(params.row.pileType)) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    {
      field: "steel_modulus",
      headerName: "탄성계수(N/mm²)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
    {
      field: "steel_cor_thickness",
      headerName: "코어 두께(mm)",
      type: "number",
      width: 80,
      editable: true,
      sortable: false,
      cellClassName: (params) => {
        // Cast_In_Situ, PHC_Pile 경우 편집 불가능
        if (["Cast_In_Situ"].includes(params.row.pileType)) {
          return "cell-highlight";
        }
        // 그 외 편집 가능
        return "disabled-cell";
      },
      preProcessEditCellProps: (params) => ({
        ...params.props,
        error: params.props.value <= 0,
      }),
    },
  ];

  // 컬럼 그룹 모

  const handleCheckChange = (id: number, checked: boolean) => {
    if (id === 1) return; // 첫 번째 행은 변경 불가

    if (checked) {
      // 체크하려는 경우, 위의 모든 행이 체크되어 있는지 확인
      const allPreviousRowsChecked = rows
        .filter((row) => row.id < id && row.id !== 1) // 현재 행보다 작은 id를 가진 행 & 첫 번째 행 제외
        .every((row) => row.checked);

      if (!allPreviousRowsChecked) {
        // 위의 행이 모두 체크되어 있지 않으면 체크 불가
        return;
      }

      // 위의 행이 모두 체크되어 있으면 현재 행만 체크
      setRows(
        rows.map((row) => (row.id === id ? { ...row, checked: true } : row))
      );
    } else {
      // 체크 해제하는 경우, 아래 행들도 모두 체크 해제
      setRows(
        rows.map((row) => {
          if (row.id === id || row.id > id) {
            return { ...row, checked: false };
          }
          return row;
        })
      );
    }
  };

  const handlePileTypeChange = (id: number, value: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, pileType: value } : row))
    );
  };

  const handleProcessRowUpdate = (newRow: any) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === newRow.id ? { ...row, ...newRow } : row
      )
    );
    return newRow;
  };

  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: "concrete",
      description: "콘크리트",
      children: [
        { field: "concrete_diameter" },
        { field: "concrete_thickness" },
        { field: "concrete_modulus" },
      ],
    },
    {
      groupId: "steel",
      description: "철근",
      children: [
        { field: "steel_diameter" },
        { field: "steel_thickness" },
        { field: "steel_modulus" },
        { field: "steel_cor_thickness" },
      ],
    },
  ];

  const isFieldEditable = (field: string, pileType: string): boolean => {
    switch (field) {
      case "concrete_thickness":
        // Cast_In_Situ, Steel_Pile, Soil_Cement_Pile 경우 편집 불가능
        return !["Cast_In_Situ", "Steel_Pile", "Soil_Cement_Pile"].includes(
          pileType
        );

      case "concrete_diameter":
      case "concrete_modulus":
        // Steel_Pile 경우 편집 불가능
        return !["Steel_Pile"].includes(pileType);

      case "steel_diameter":
        // SC_Pile 경우 편집 불가능
        return !["SC_Pile"].includes(pileType);

      case "steel_thickness":
        // Cast_In_Situ, PHC_Pile 경우 편집 불가능
        return !["Cast_In_Situ", "PHC_Pile"].includes(pileType);

      case "steel_cor_thickness":
        // Cast_In_Situ 경우 편집 불가능
        return !["Cast_In_Situ"].includes(pileType);

      default:
        // 그 외 필드는 편집 가능
        return true;
    }
  };

  return (
    <GuideBox height={170}>
      <CustomDataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={handleProcessRowUpdate}
        columnGroupingModel={columnGroupingModel}
        columnGroupHeaderHeight={36}
        isCellEditable={(params: any) => {
          return isFieldEditable(params.field, params.row.pileType);
        }}
      />
    </GuideBox>
  );
};

export default PileSectionGrid;
