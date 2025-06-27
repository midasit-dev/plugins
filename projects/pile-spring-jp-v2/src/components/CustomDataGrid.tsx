/**
 * @fileoverview 커스텀 데이터 그리드 컴포넌트
 */

import React from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

interface CustomDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  disableHoverStyle?: boolean;
  [key: string]: any;
}

const StyledDataGrid = styled(DataGrid)<{ disableHoverStyle?: boolean }>(
  ({ disableHoverStyle }) => ({
    ...(disableHoverStyle && {
      "& .MuiDataGrid-row:hover": {
        backgroundColor: "transparent",
      },
      "& .MuiDataGrid-row.Mui-selected": {
        backgroundColor: "transparent",
      },
      "& .MuiDataGrid-row.Mui-selected:hover": {
        backgroundColor: "transparent",
      },
    }),
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
      cursor: "default",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: "#E6E6E6",
      fontFamily: "Pretendard",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "12px",
      padding: "0px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      cursor: "default",
    },
    "& .MuiDataGrid-columnHeaderTitleContainer": {
      justifyContent: "center",
    },
    "& .cell-highlight": {
      backgroundColor: "#f9f9f9",
    },
    "& .MuiDataGrid-cell:focus": {
      outline: "1px solid #B9BCCF",
    },
    "& .MuiDataGrid-columnHeader:focus": {
      outline: "1px solid #B9BCCF",
    },
    "& .MuiDataGrid-scrollbarFiller": {
      backgroundColor: "#E6E6E6",
    },
  })
);

const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  rows,
  columns,
  disableHoverStyle = false,
  ...props
}) => {
  return (
    <StyledDataGrid
      rows={rows}
      columns={columns}
      hideFooter
      disableColumnMenu
      rowHeight={30}
      columnHeaderHeight={32}
      disableHoverStyle={disableHoverStyle}
      {...props}
    />
  );
};

export default CustomDataGrid;
