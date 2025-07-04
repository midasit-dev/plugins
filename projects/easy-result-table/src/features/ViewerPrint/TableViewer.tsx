import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import { getReactionTable } from "../utils/getTableData";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

import { TableData, ReactionTableData } from "../utils/getTableData";

// 공통 타입 정의
interface TableProps {
  data: TableData;
  currentPage: number;
  rowsPerPage: number;
}

// MUI 테이블 컴포넌트를 메모이제이션
const MUITableComponent = React.memo<TableProps>(
  ({ data, currentPage, rowsPerPage }) => {
    if (!data?.HEAD || !data?.DATA) {
      return null;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = data.DATA.slice(startIndex, endIndex);

    return (
      <TableContainer>
        <Table size="small" sx={{ fontSize: "12pt" }}>
          <TableHead>
            <TableRow>
              {data.HEAD.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: "bold",
                    fontSize: "12pt",
                    border: "1px solid rgba(0,0,0,0.2)",
                    padding: "8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    sx={{
                      fontSize: "12pt",
                      border: "1px solid rgba(0,0,0,0.2)",
                      padding: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cellIndex > 2 ? Number(cell).toFixed(3) : cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    flexGrow: 1,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 4,
    fontSize: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  indexCell: { width: "8%" },
  nodeCell: { width: "10%" },
  loadCell: { width: "10%" },
  valueCell: { width: "12%" },
});

// PDF 테이블 컴포넌트
const PDFTableComponent: React.FC<TableProps> = ({
  data,
  currentPage,
  rowsPerPage,
}) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.DATA.slice(startIndex, endIndex);

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        {data.HEAD.map((header, index) => (
          <Text
            key={index}
            style={[
              styles.tableCell,
              index === 0
                ? styles.indexCell
                : index === 1
                ? styles.nodeCell
                : index === 2
                ? styles.loadCell
                : styles.valueCell,
            ]}
          >
            {header}
          </Text>
        ))}
      </View>
      {currentData.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <Text
              key={cellIndex}
              style={[
                styles.tableCell,
                cellIndex === 0
                  ? styles.indexCell
                  : cellIndex === 1
                  ? styles.nodeCell
                  : cellIndex === 2
                  ? styles.loadCell
                  : styles.valueCell,
              ]}
            >
              {cellIndex > 2 ? Number(cell).toFixed(3) : cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

// PDF 문서 컴포넌트 - 단일 테이블용
const PDFDocument: React.FC<{
  data: TableData;
  isLandscape: boolean;
  title: string;
}> = ({ data, isLandscape, title }) => {
  const totalPages = Math.ceil(data.DATA.length / ROWS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Document>
      {pages.map((pageNumber) => (
        <Page
          key={pageNumber}
          size="A4"
          orientation={isLandscape ? "landscape" : "portrait"}
          style={styles.page}
        >
          <Text style={styles.title}>
            {title} - Page {pageNumber}
          </Text>
          <PDFTableComponent
            data={data}
            currentPage={pageNumber}
            rowsPerPage={ROWS_PER_PAGE}
          />
        </Page>
      ))}
    </Document>
  );
};

// PDF 문서 컴포넌트 - 전체 테이블용
const AllTablesPDFDocument: React.FC<{
  mainTable: TableData;
  subTables: { title: string; data: TableData }[];
  isLandscape: boolean;
}> = ({ mainTable, subTables, isLandscape }) => {
  return (
    <Document>
      {/* 메인 테이블 */}
      {(() => {
        const totalPages = Math.ceil(mainTable.DATA.length / ROWS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return pages.map((pageNumber) => (
          <Page
            key={`main-${pageNumber}`}
            size="A4"
            orientation={isLandscape ? "landscape" : "portrait"}
            style={styles.page}
          >
            <Text style={styles.title}>
              Reaction Forces - Page {pageNumber}
            </Text>
            <PDFTableComponent
              data={mainTable}
              currentPage={pageNumber}
              rowsPerPage={ROWS_PER_PAGE}
            />
          </Page>
        ));
      })()}

      {/* 서브 테이블들 */}
      {subTables.map(({ title, data }) => {
        const totalPages = Math.ceil(data.DATA.length / ROWS_PER_PAGE);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return pages.map((pageNumber) => (
          <Page
            key={`${title}-${pageNumber}`}
            size="A4"
            orientation={isLandscape ? "landscape" : "portrait"}
            style={styles.page}
          >
            <Text style={styles.title}>
              {title} - Page {pageNumber}
            </Text>
            <PDFTableComponent
              data={data}
              currentPage={pageNumber}
              rowsPerPage={ROWS_PER_PAGE}
            />
          </Page>
        ));
      })}
    </Document>
  );
};

const ROWS_PER_PAGE = 20;

// A4 크기 계산을 메모이제이션된 훅으로 분리
const useA4Dimensions = (isLandscape: boolean) => {
  return useMemo(() => {
    const a4Dimensions = {
      portrait: {
        width: 794,
        height: 1123,
      },
      landscape: {
        width: 1123,
        height: 794,
      },
    };
    return isLandscape ? a4Dimensions.landscape : a4Dimensions.portrait;
  }, [isLandscape]);
};

// 컨트롤 버튼 컴포넌트 분리
const ControlButtons = React.memo<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onReset: () => void;
  onRotate: () => void;
}>(({ onZoomIn, onZoomOut, onFitScreen, onReset, onRotate }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 20,
        top: 20,
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        padding: "8px",
        display: "flex",
        gap: 1,
      }}
    >
      <IconButton onClick={onZoomIn}>
        <ZoomInIcon />
      </IconButton>
      <IconButton onClick={onZoomOut}>
        <ZoomOutIcon />
      </IconButton>
      <IconButton onClick={onFitScreen}>
        <FitScreenIcon />
      </IconButton>
      <IconButton onClick={onReset}>
        <RestartAltIcon />
      </IconButton>
      <IconButton onClick={onRotate}>
        <ScreenRotationIcon />
      </IconButton>
    </Box>
  );
});

// 페이지네이션 컴포넌트 분리
const Pagination = React.memo<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>(({ currentPage, totalPages, onPageChange }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        bottom: 20,
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <IconButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <Typography sx={{ mx: 2 }}>
        {currentPage} / {totalPages}
      </Typography>
      <IconButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
});

const TableViewer = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [allTableData, setAllTableData] = useState<ReactionTableData[] | null>(
    null
  );
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReactionTable();
        if (data?.table && Array.isArray(data.table)) {
          // JSON 문자열을 파싱하여 데이터 추출
          const parsedData = data.table
            .map((item) => {
              try {
                const jsonStr = JSON.stringify(item);
                const parsed = JSON.parse(jsonStr);
                return parsed.REACTIONG || parsed.REACTIONG2;
              } catch (e) {
                console.error("Failed to parse table data:", e);
                return null;
              }
            })
            .filter(Boolean);

          if (parsedData.length > 0) {
            setAllTableData(parsedData);
            setSelectedTable("REACTIONG"); // 기본값으로 첫 번째 테이블 선택
            setCurrentPage(1); // 페이지 초기화
          }
        }
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      }
    };
    fetchData();
  }, []);

  const availableTables = useMemo(() => {
    if (!allTableData?.length) return [];

    return allTableData.map((item, index) => ({
      id: `REACTIONG${index > 0 ? index + 1 : ""}`,
      title: `REACTIONG${index > 0 ? index + 1 : ""}`,
      data: {
        HEAD: item.HEAD || [],
        DATA: item.DATA || [],
      },
    }));
  }, [allTableData]);

  const currentTableData = useMemo(() => {
    if (!allTableData?.length || !selectedTable) return null;

    const tableIndex =
      selectedTable === "REACTIONG"
        ? 0
        : parseInt(selectedTable.replace("REACTIONG", "")) - 1;

    if (tableIndex >= 0 && tableIndex < allTableData.length) {
      const tableData = allTableData[tableIndex];
      return {
        HEAD: tableData.HEAD || [],
        DATA: tableData.DATA || [],
      };
    }
    return null;
  }, [allTableData, selectedTable]);

  const { totalPages } = useMemo(() => {
    if (!currentTableData?.DATA?.length) return { totalPages: 0 };
    return {
      totalPages: Math.ceil(currentTableData.DATA.length / ROWS_PER_PAGE),
    };
  }, [currentTableData]);

  // A4 크기 계산을 메모이제이션된 훅으로 분리
  const currentDimensions = useA4Dimensions(isLandscape);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 680,
        width: 1000,
        padding: 2,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: 620,
          width: "100%",
          position: "relative",
          boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          overflow: "hidden",
          padding: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 20,
            top: 20,
            zIndex: 1000,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "8px",
            minWidth: 200,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Select Table</InputLabel>
            <Select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setCurrentPage(1);
              }}
              label="Select Table"
              size="small"
            >
              {availableTables.map((table) => (
                <MenuItem key={table.id} value={table.id}>
                  {table.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform, setTransform }) => {
            const handleFitToScreen = () => {
              const containerWidth = 1000;
              const containerHeight = 680;
              const scale =
                Math.min(
                  containerWidth / currentDimensions.width,
                  containerHeight / currentDimensions.height
                ) * 0.9;
              setTransform(
                (containerWidth - currentDimensions.width * scale) / 2,
                (containerHeight - currentDimensions.height * scale) / 2,
                scale
              );
            };

            return (
              <>
                <ControlButtons
                  onZoomIn={() => zoomIn()}
                  onZoomOut={() => zoomOut()}
                  onFitScreen={handleFitToScreen}
                  onReset={() => resetTransform()}
                  onRotate={() => setIsLandscape(!isLandscape)}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      width: currentDimensions.width,
                      height: currentDimensions.height,
                      backgroundColor: "white",
                      fontSize: "12pt",
                      position: "relative",
                      transition: "width 0.3s, height 0.3s",
                      padding: "40px",
                    }}
                  >
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>
                      {availableTables.find((t) => t.id === selectedTable)
                        ?.title || ""}{" "}
                      - Page {currentPage}
                    </Typography>
                    {currentTableData && (
                      <MUITableComponent
                        data={currentTableData}
                        currentPage={currentPage}
                        rowsPerPage={ROWS_PER_PAGE}
                      />
                    )}
                  </Paper>
                </TransformComponent>
              </>
            );
          }}
        </TransformWrapper>
      </Box>

      {allTableData && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <PDFDownloadLink
            document={
              <PDFDocument
                data={currentTableData!}
                isLandscape={isLandscape}
                title={
                  availableTables.find((t) => t.id === selectedTable)?.title ||
                  ""
                }
              />
            }
            fileName={`${selectedTable}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button variant="contained" color="primary" disabled={loading}>
                {loading ? "Loading..." : "Download Current Table"}
              </Button>
            )}
          </PDFDownloadLink>

          <PDFDownloadLink
            document={
              <AllTablesPDFDocument
                mainTable={{
                  HEAD: currentTableData?.HEAD || [],
                  DATA: currentTableData?.DATA || [],
                }}
                subTables={availableTables.map((table) => ({
                  title: table.title,
                  data: table.data,
                }))}
                isLandscape={isLandscape}
              />
            }
            fileName="all-tables.pdf"
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <Button variant="contained" color="secondary" disabled={loading}>
                {loading ? "Loading..." : "Download All Tables"}
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      )}
    </Box>
  );
};

export default TableViewer;
