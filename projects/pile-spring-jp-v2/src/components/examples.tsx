import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridColumnGroupingModel,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";

const columns: GridColDef[] = [
  {
    field: "groupHeader",
    headerName: "Group Header",
    colSpan: 2, // 두 컬럼을 그룹화
    renderHeader: (params) => (
      <Button onClick={() => alert("Group header clicked!")}>
        {params.colDef.headerName}
      </Button>
    ),
  },
  { field: "col1", headerName: "Column 1", width: 150 },
  { field: "col2", headerName: "Column 2", width: 150 },
];

const rows: GridRowsProp = [
  { id: 1, col1: "Data 1", col2: "Data 2" },
  { id: 2, col1: "Data 3", col2: "Data 4" },
];

const MyDataGrid: React.FC = () => {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
};

export default MyDataGrid;
