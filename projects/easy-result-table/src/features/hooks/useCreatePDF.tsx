import React, { useMemo } from "react";
import { View, Text, Document, Page, pdf, Font } from "@react-pdf/renderer";
import { useRecoilState } from "recoil";
import { tableDataState, TableData } from "../states/stateTableData";
import { useSnackbarMessage } from "./useSnackbarMessage";
import { getTableRenderer } from "../tableRenderers";
import { PDFCommonHeader } from "../tableRenderers/CommonHeader";
import { PDFCommonFooter } from "../tableRenderers/CommonFooter";

// 다국어 지원 폰트 등록 (Noto Sans CJK - 한글, 일본어, 중국어 등 지원)
// PUBLIC_URL을 사용하여 빌드 환경에서도 안정적으로 로드
Font.register({
  family: "NotoSans",
  src: `${process.env.PUBLIC_URL || ""}/fonts/NotoSansCJK-Regular.ttf`,
});

// PDF 테이블 관련 타입 정의
interface TableProps {
  data: TableData;
  currentPage: number;
  tableName: string;
  totalPages: number;
  projectInfo?: {
    author: string;
    filename: string;
    client: string;
    company: string;
    project_title: string;
    certified_by: string;
  };
}

// PDF 테이블 컴포넌트
const PDFTableComponent: React.FC<TableProps> = ({
  data,
  currentPage,
  tableName,
  totalPages,
  projectInfo,
}) => {
  const renderer = useMemo(() => getTableRenderer(tableName), [tableName]);

  if (!renderer) {
    return (
      <View>
        <Text>No renderer found for table: {tableName}</Text>
      </View>
    );
  }

  // 각 렌더러에서 페이지별 JSX를 받아옴
  const pages = renderer.getPages(data);
  const pageRows = pages[currentPage - 1] || [];

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* 공통 헤더 */}
        <PDFCommonHeader tableName={tableName} projectInfo={projectInfo} />
        {/* 페이지별 테이블(헤더/행 모두 포함) */}
        {pageRows}
      </View>
      {/* 공통 푸터 */}
      <PDFCommonFooter currentPage={currentPage} totalPages={totalPages} />
    </View>
  );
};

// PDF 문서 컴포넌트
const PDFContent: React.FC<{
  tables: { title: string; data: TableData }[];
  projectInfo?: {
    author: string;
    filename: string;
    client: string;
    company: string;
    project_title: string;
    certified_by: string;
  };
}> = ({ tables, projectInfo }) => {
  return (
    <>
      {tables.map(({ title, data }) => {
        const renderer = getTableRenderer(title);
        if (!renderer) return null;
        const pages = renderer.getPages(data);
        const totalPages = pages.length;
        return pages.map((pageRows, pageIndex) => (
          <Page
            key={`${title}-${pageIndex + 1}`}
            size="A4"
            orientation={
              renderer.getConfig().isLandscape ? "landscape" : "portrait"
            }
            style={{
              flexDirection: "column",
              paddingLeft: 40,
              paddingRight: 40,
              paddingTop: 50,
              paddingBottom: 50,
              fontFamily: "Courier",
            }}
          >
            <PDFTableComponent
              data={data}
              currentPage={pageIndex + 1}
              tableName={title}
              totalPages={totalPages}
              projectInfo={projectInfo}
            />
          </Page>
        ));
      })}
    </>
  );
};

export const useCreatePDF = () => {
  const [tableData, setTableData] = useRecoilState(tableDataState);
  const { snackbar, setSnackbar } = useSnackbarMessage();

  // PDF 다운로드 핸들러
  const handleDownloadPDF = async (signal?: AbortSignal) => {
    if (!tableData?.table?.length) {
      setSnackbar({
        open: true,
        message: "No data to download.",
        severity: "error",
      });
      return;
    }

    try {
      // 테이블 데이터를 올바른 형식으로 변환
      const tables = tableData.table.map((tableObj: any) => {
        const tableName = Object.keys(tableObj)[0];
        const data = tableObj[tableName];

        // 테이블 이름과 일치하는 tableArgument만 필터링
        const matchingTableArgument = tableData.tableArguments?.find(
          (arg) => arg.Argument.TABLE_NAME === tableName
        );

        return {
          title: tableName,
          data: {
            HEAD: data.HEAD || [],
            DATA: data.DATA || [],
            FORCE: data.FORCE || "kN",
            DIST: data.DIST || "m",
            SUB_TABLES: data.SUB_TABLES || [], // SUB_TABLES 추가
            tableArguments: matchingTableArgument
              ? [matchingTableArgument]
              : [], // 일치하는 것만 전달
          },
        };
      });

      // PDF 생성
      const pdfDoc = (
        <Document>
          <PDFContent tables={tables} projectInfo={tableData} />
        </Document>
      );

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new Error("PDF generation was aborted");
      }

      const pdfBlob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `all-tables-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "PDF downloaded successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      setSnackbar({
        open: true,
        message: "Failed to download PDF.",
        severity: "error",
      });
    }
  };

  return {
    handleDownloadPDF,
  };
};
