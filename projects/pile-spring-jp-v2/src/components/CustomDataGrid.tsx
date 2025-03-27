import React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

interface CustomDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  sx?: any;
  [key: string]: any;
}

const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  rows,
  columns,
  sx,
  ...props
}) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      hideFooter
      disableColumnMenu
      rowHeight={30}
      columnHeaderHeight={32}
      sx={{
        "& .MuiDataGrid-cell": {
          fontFamily: "Pretendard",
          fontStyle: "normal",
          fontWeight: "400",
          fontSize: "12px",
          padding: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: "#EEEEEE",
          fontFamily: "Pretendard",
          fontStyle: "normal",
          fontWeight: "400",
          fontSize: "12px",
          padding: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        },
        "& .MuiDataGrid-columnHeaderTitleContainer": {
          justifyContent: "center",
        },
        "& .cell-highlight": {
          backgroundColor: "#f9f9f9",
        },
        "& .MuiDataGrid-cell:focus": {
          outline: "1px solid #BFC6CC",
        },
        "& .MuiDataGrid-columnHeader:focus": {
          outline: "1px solid #BFC6CC",
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default CustomDataGrid;
