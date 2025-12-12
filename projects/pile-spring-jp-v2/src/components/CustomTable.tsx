/**
 * @fileoverview 커스텀 테이블 컴포넌트
 */

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
} from "@mui/material";
import { TabGroup, Tab } from "./CustomTab";

interface HeaderItem {
  label: ReactNode;
  width?: number;
  colSpan?: number;
}

interface CustomTableProps {
  headers: HeaderItem[];
  groupHeaders?: HeaderItem[];
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

const MIN_COLUMN_WIDTH = 50;

const CustomTable: React.FC<CustomTableProps> = ({
  headers,
  groupHeaders,
  rows,
  renderRow,
  tabs,
  currentTab,
  onTabChange,
  showTabs = true,
  tableProps,
  headerStartIndex = 0,
  tableContainerProps,
  totalWidth,
  height,
  stickyLastColumn = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // 컨테이너 너비를 감지하는 ResizeObserver 설정
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidths = () => {
      if (containerRef.current) {
        const scrollbarW =
          containerRef.current.offsetWidth - containerRef.current.clientWidth;
        setScrollbarWidth(scrollbarW);
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // 초기 측정
    updateWidths();

    // ResizeObserver로 크기 변경 감지
    const resizeObserver = new ResizeObserver(updateWidths);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  const getColumnWidths = () => {
    console.log("containerWidth", containerWidth);
    // 모든 열에 기본 너비 할당 (지정되지 않은 경우 MIN_COLUMN_WIDTH 사용)
    const columnWidths = headers.map(
      (header) => header.width || MIN_COLUMN_WIDTH
    );

    // 총 너비 계산
    const calculatedTotalWidth = columnWidths.reduce(
      (sum, width) => sum + width,
      0
    );

    // 컨테이너 너비가 0이면 원래 너비 반환
    if (containerWidth === 0) return columnWidths;

    // totalWidth가 지정되지 않은 경우 부모 컨테이너의 너비 사용
    const effectiveTotalWidth = totalWidth || containerWidth;

    // 총 너비가 부모 컨테이너보다 작은 경우, 비율에 맞게 늘림
    if (!totalWidth && calculatedTotalWidth < effectiveTotalWidth) {
      const ratio = effectiveTotalWidth / calculatedTotalWidth;
      return columnWidths.map((width) => Math.floor(width * ratio));
    }

    return columnWidths;
  };

  const columnWidths = getColumnWidths();
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <TabGroup value={currentTab} onChange={handleTabChange}>
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                      />
                    ))}
                  </TabGroup>
                </div>
              </TableCell>
            </TableRow>
          )}
          {groupHeaders && (
            <TableRow>
              {groupHeaders.map((header, index) => (
                <StyledHeaderCell
                  key={index}
                  align="center"
                  colSpan={header.colSpan}
                  className={
                    stickyLastColumn && index === groupHeaders.length - 1
                      ? "sticky-last"
                      : ""
                  }
                  sx={{
                    width: header.width ? `${header.width}px` : undefined,
                    ...(index === groupHeaders.length - 1 && scrollbarWidth > 0
                      ? { paddingRight: `${scrollbarWidth}px` }
                      : {}),
                  }}
                >
                  {header.label}
                </StyledHeaderCell>
              ))}
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
