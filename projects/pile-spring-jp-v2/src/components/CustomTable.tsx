import React, { ReactNode, useRef, useEffect, useState } from "react";
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

interface HeaderItem {
  label: ReactNode;
  width?: number;
}

interface CustomTableProps {
  headers: HeaderItem[];
  rows: any[];
  renderRow: (row: any, index: number) => ReactNode[];
  tabs?: { value: string; label: string }[];
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
  tableContainerProps?: any;
  tableProps?: any;
  headerStartIndex?: number;
  totalWidth?: number;
  minColWidth?: number;
  height?: number | string;
  stickyLastColumn?: boolean;
}

const StyledTableContainer = styled(TableContainer)(() => ({
  "& .MuiTable-root": {
    borderCollapse: "collapse",
    width: "100%",
  },
  "& .MuiTableCell-root": {
    padding: "0px",
  },
  "& .MuiTableHead-root": {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "#E6E6E6",
  },
  "& .MuiTableBody-root .MuiTableRow-root": {
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
    "&:focus": {
      outline: "1px solid #B9BCCF",
    },
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontFamily: "Pretendard",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "12px",
  padding: "0px",
  height: "28px",
  textAlign: "center",
  verticalAlign: "middle",
  width: "100%",
  "&.sticky-last": {
    position: "sticky",
    right: 0,
    zIndex: 1,
    backgroundColor: "#FFFFFF",
  },
}));

const StyledHeaderCell = styled(TableCell)(() => ({
  backgroundColor: "#E6E6E6",
  fontFamily: "Pretendard",
  fontSize: "12px",
  padding: "0px",
  height: "32px",
  textAlign: "center",
  verticalAlign: "middle",
  borderRight: "1px solid #D1D1D1",
  position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundClip: "padding-box",
  "&:last-child": {
    borderRight: "none",
  },
  "&.sticky-last": {
    position: "sticky",
    right: 0,
    zIndex: 3,
    backgroundColor: "#E6E6E6",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
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
  totalWidth = 1000,
  minColWidth = 50,
  height,
  stickyLastColumn = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const scrollbarW =
        containerRef.current.offsetWidth - containerRef.current.clientWidth;
      setScrollbarWidth(scrollbarW);
    }
  }, [rows.length]);

  const getColumnWidths = () => {
    const specifiedWidths = headers.map((h) => h.width ?? null);
    const specifiedTotal = specifiedWidths.reduce<number>(
      (sum, w) => sum + (w ?? 0),
      0
    );
    const unspecifiedCount = specifiedWidths.filter((w) => w === null).length;
    const remaining = totalWidth - specifiedTotal;
    const defaultWidth =
      unspecifiedCount > 0
        ? Math.max(minColWidth, Math.floor(remaining / unspecifiedCount))
        : 0;
    return specifiedWidths.map((w) => w ?? defaultWidth);
  };

  const columnWidths = getColumnWidths();
  const totalCalculatedWidth = columnWidths.reduce<number>(
    (sum, w) => sum + w,
    0
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    if (onTabChange) onTabChange(newValue);
  };

  return (
    <StyledTableContainer
      component={Paper}
      ref={containerRef}
      sx={{
        overflowX: "auto",
        overflowY: "auto",
        ...(height ? { height } : {}),
      }}
      {...tableContainerProps}
    >
      <Table
        size="small"
        {...tableProps}
        sx={{
          minWidth: `${totalCalculatedWidth}px`,
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={index} style={{ width: `${width}px` }} />
          ))}
        </colgroup>
        <TableHead>
          {showTabs && tabs && tabs.length > 0 && (
            <TableRow>
              {headerStartIndex > 0 && (
                <TableCell
                  colSpan={headerStartIndex}
                  align="center"
                  sx={{ padding: 0, backgroundColor: "transparent" }}
                />
              )}
              <TableCell
                colSpan={headers.length - headerStartIndex}
                align="center"
                sx={{ padding: 0, backgroundColor: "#E6E6E6" }}
              >
                <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              <StyledHeaderCell
                key={index}
                align="center"
                className={
                  stickyLastColumn && index === headers.length - 1
                    ? "sticky-last"
                    : ""
                }
                sx={{
                  width: `${columnWidths[index]}px`,
                  ...(index === headers.length - 1 && scrollbarWidth > 0
                    ? { paddingRight: `${scrollbarWidth}px` }
                    : {}),
                }}
              >
                {header.label}
              </StyledHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => {
            const cells = renderRow(row, rowIndex);
            return (
              <StyledTableRow key={rowIndex}>
                {cells.map((cell, colIndex) => (
                  <StyledTableCell
                    key={colIndex}
                    className={
                      stickyLastColumn && colIndex === cells.length - 1
                        ? "sticky-last"
                        : ""
                    }
                    sx={{ width: `${columnWidths[colIndex]}px` }}
                    align="center"
                  >
                    {cell}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            );
          })}
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
