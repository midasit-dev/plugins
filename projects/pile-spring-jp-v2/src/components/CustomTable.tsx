import React, { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  Box,
} from "@mui/material";
import { TabGroup, Tab } from "./CustomTab";

interface CustomTableProps {
  headers: ReactNode[];
  rows: any[];
  renderRow: (row: any, index: number) => ReactNode;
  tabs?: { value: string; label: string }[];
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
  tableContainerProps?: any;
  tableProps?: any;
  headerStartIndex?: number;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "& .MuiTable-root": {
    borderCollapse: "collapse",
  },
  "& .MuiTableCell-root": {
    padding: "0px",
  },
  "& .MuiTableCell-sizeSmall": {
    padding: "0px",
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Pretendard",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "12px",
  padding: "0px",
  textAlign: "center",
  height: "28px",
  verticalAlign: "middle",
  width: "100%",
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: "#E6E6E6",
  fontFamily: "Pretendard",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "12px",
  padding: "0px",
  textAlign: "center",
  height: "32px",
  verticalAlign: "middle",
  borderRight: "1px solid #D1D1D1",
  "&:last-child": {
    borderRight: "none",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  "&:focus": {
    outline: "1px solid #B9BCCF",
  },
}));

const CustomTable: React.FC<CustomTableProps> = ({
  headers,
  rows,
  renderRow,
  tabs,
  currentTab,
  onTabChange,
  showTabs = true,
  tableProps,
  headerStartIndex = 0,
  tableContainerProps,
}) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange && onTabChange(newValue);
  };

  return (
    <StyledTableContainer component={Paper} {...tableContainerProps}>
      <Table size="small" {...tableProps}>
        <TableHead>
          {showTabs && tabs && tabs.length > 0 && (
            <TableRow>
              {headerStartIndex > 0 && (
                <TableCell
                  colSpan={headerStartIndex}
                  align="center"
                  sx={{
                    padding: 0,
                    backgroundColor: "transparent",
                  }}
                />
              )}
              <TableCell
                colSpan={headers.length - headerStartIndex}
                align="center"
                sx={{ padding: 0, backgroundColor: "#E6E6E6" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <TabGroup value={currentTab} onChange={handleTabChange}>
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                      />
                    ))}
                  </TabGroup>
                </Box>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            {headers.map((header, index) => (
              <StyledHeaderCell key={index} align="center">
                {header}
              </StyledHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <StyledTableRow key={index}>{renderRow(row, index)}</StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export const CustomTableCell: React.FC<any> = ({ children, ...props }) => {
  return (
    <StyledTableCell align="center" {...props}>
      {children}
    </StyledTableCell>
  );
};

export default CustomTable;
