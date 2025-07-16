import { FloorLoadState, TableSetting } from "../states/stateFloorLoad";
import { validateAndShowMessage } from "./inputValidation";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
  Font,
} from "@react-pdf/renderer";
import PretendardRegular from "../fonts/Pretendard-Regular.ttf";

Font.register({
  family: "Pretendard",
  src: PretendardRegular,
});

const styles = StyleSheet.create({
  tableHeaderFont: {
    fontSize: 9,
    fontFamily: "Pretendard",
    textAlign: "center",
  },
  tableHeaderCell: {
    alignItems: "center",
    justifyContent: "center",
    borderRight: "1px solid #9e9e9e",
  },
  tableCellFontCenter: {
    fontSize: 9,
    fontFamily: "Pretendard",
    textAlign: "center",
  },
  tableCellFontRight: {
    fontSize: 9,
    fontFamily: "Pretendard",
    textAlign: "right",
    paddingRight: 4,
  },
  tableCellFontLeft: {
    fontSize: 9,
    fontFamily: "Pretendard",
    textAlign: "left",
    paddingLeft: 4,
  },
  tableCellSmall: {
    height: 20,
    borderBottom: "1px solid #9e9e9e",
    borderRight: "1px solid #9e9e9e",
    display: "flex",
    justifyContent: "center",
  },
  tableCellColumn: {
    display: "flex",
    flexDirection: "column",
  },
  tableCellName: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "12%",
    height: "100%",
    borderBottom: "1px solid #9e9e9e",
    borderRight: "1px solid #9e9e9e",
    padding: 4,
  },
  tableCellLiveLoad: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "13%",
    height: "100%",
    borderBottom: "1px solid #9e9e9e",
    borderRight: "1px solid #9e9e9e",
    padding: 4,
  },
  tableCellServiceLoad: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "15%",
    height: "100%",
    borderBottom: "1px solid #9e9e9e",
    borderRight: "1px solid #9e9e9e",
    padding: 4,
  },
  tableCellFactoredLoad: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "15%",
    height: "100%",
    borderBottom: "1px solid #9e9e9e",
    padding: 4,
  },
  tableCellSubtotal: {
    borderTop: "1px solid #9e9e9e",
  },
  tableCellSubtotalRight: {
    borderTop: "1px solid #9e9e9e",
    borderRightWidth: 0,
  },
});

const forceLineBreak = (text: string, maxChars: number) => {
  if (text.length <= maxChars) return text;

  const result = [];
  for (let i = 0; i < text.length; i += maxChars) {
    result.push(text.slice(i, i + maxChars));
  }
  return result.join("\n");
};

// 페이지 분할을 위한 상수들
const PAGE_HEIGHT = 841.89; // A4 높이 (pt)
const PAGE_PADDING_TOP = 50;
const PAGE_PADDING_BOTTOM = 50;
const TABLE_HEADER_HEIGHT = 50;
const ROW_HEIGHT = 20; // tableCellSmall의 height
const PAGE_HEADER_ESTIMATED_HEIGHT = 40; // 예상 높이
const PAGE_FOOTER_ESTIMATED_HEIGHT = 20; // 예상 높이

// 페이지당 사용 가능한 높이 계산
const getAvailableHeightPerPage = () => {
  return (
    PAGE_HEIGHT -
    PAGE_PADDING_TOP -
    PAGE_PADDING_BOTTOM -
    PAGE_HEADER_ESTIMATED_HEIGHT -
    PAGE_FOOTER_ESTIMATED_HEIGHT -
    TABLE_HEADER_HEIGHT
  );
};

// 테이블 설정을 페이지별로 분할
const splitTableSettingsIntoPages = (tableSettings: TableSetting[]) => {
  const availableHeight = getAvailableHeightPerPage();
  const maxRowsPerPage = Math.floor(availableHeight / ROW_HEIGHT);

  const pages: TableSetting[][] = [];
  let currentPage: TableSetting[] = [];
  let currentPageRows = 0;

  for (const tableSetting of tableSettings) {
    const itemRows = tableSetting.dead_load.length + 1; // +1 for subtotal row

    // 현재 아이템이 현재 페이지에 들어갈 수 있는지 확인
    if (currentPageRows + itemRows <= maxRowsPerPage) {
      currentPage.push(tableSetting);
      currentPageRows += itemRows;
    } else {
      // 현재 페이지가 비어있지 않으면 새 페이지 시작
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [tableSetting];
        currentPageRows = itemRows;
      } else {
        // 현재 페이지가 비어있으면 강제로 추가 (아이템이 너무 클 경우)
        currentPage.push(tableSetting);
        pages.push(currentPage);
        currentPage = [];
        currentPageRows = 0;
      }
    }
  }

  // 마지막 페이지 추가
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

const PageHeader = ({ floorLoadData }: { floorLoadData: FloorLoadState }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e0e0e0",
        marginBottom: 10,
      }}
    >
      <View style={{ paddingLeft: 4, flex: 1 }}>
        <Text
          style={{ fontSize: 14, marginBottom: 5, fontFamily: "Pretendard" }}
        >
          {floorLoadData.global_setting.project_name || "Project Name"}
        </Text>
      </View>
      {floorLoadData.global_setting.image_base64 && (
        <View
          style={{
            paddingRight: 4,
            width: 60,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image src={floorLoadData.global_setting.image_base64} />
        </View>
      )}
    </View>
  );
};

const PageFooter = ({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        borderTop: "1px solid #e0e0e0",
        paddingTop: 10,
        fontSize: 8,
        color: "#666666",
        fontFamily: "Pretendard",
      }}
    >
      <View style={{ flex: 1, paddingLeft: 4 }}>
        <Text>
          Print Date: {currentDate} {currentTime}
        </Text>
      </View>
      <View style={{ textAlign: "right", paddingRight: 4 }}>
        <Text
          render={({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `${pageNumber} / ${totalPages}`}
        />
      </View>
    </View>
  );
};

const TableHeader = ({ floorLoadData }: { floorLoadData: FloorLoadState }) => {
  const dl_factor = floorLoadData.global_setting.factor_dl || 1.2;
  const ll_factor = floorLoadData.global_setting.factor_ll || 1.6;

  return (
    <View style={{ height: 50, display: "flex", flexDirection: "column" }}>
      <Text
        style={{
          fontFamily: "Pretendard",
          textAlign: "right",
          fontSize: 8,
          marginBottom: 2,
        }}
      >
        단위: kN/㎡
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: 40,
          backgroundColor: "#eeeeee",
          borderTop: "1px solid #9e9e9e",
          borderBottom: "1px solid #9e9e9e",
          fontSize: 10,
        }}
      >
        <View
          style={{
            width: "12%",
            height: "100%",
            ...styles.tableHeaderCell,
          }}
        >
          <Text style={styles.tableHeaderFont}>구분</Text>
        </View>
        <View style={{ width: "45%", height: "100%" }}>
          <View
            style={{
              width: "100%",
              height: "50%",
              borderBottom: "1px solid #9e9e9e",
              ...styles.tableHeaderCell,
            }}
          >
            <Text style={styles.tableHeaderFont}>고정하중(DEAD LOAD)</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "50%",
              ...styles.tableHeaderCell,
            }}
          >
            <View
              style={{
                width: "40%",
                height: "100%",
                ...styles.tableHeaderCell,
              }}
            >
              <Text style={styles.tableHeaderFont}>재료마감</Text>
            </View>
            <View
              style={{
                width: "20%",
                height: "100%",
                ...styles.tableHeaderCell,
              }}
            >
              <Text style={styles.tableHeaderFont}>두께(mm)</Text>
            </View>
            <View
              style={{
                width: "20%",
                height: "100%",
                ...styles.tableHeaderCell,
              }}
            >
              <Text style={styles.tableHeaderFont}>단위중량</Text>
            </View>
            <View
              style={{
                width: "20%",
                height: "100%",
                ...styles.tableHeaderCell,
                borderRightWidth: 0,
              }}
            >
              <Text style={styles.tableHeaderFont}>하중</Text>
            </View>
          </View>
        </View>
        <View
          style={{ width: "13%", height: "100%", ...styles.tableHeaderCell }}
        >
          <Text style={styles.tableHeaderFont}>적재하중</Text>
          <Text style={styles.tableHeaderFont}>(LIVE LOAD)</Text>
        </View>
        <View
          style={{ width: "15%", height: "100%", ...styles.tableHeaderCell }}
        >
          <Text style={styles.tableHeaderFont}>사용하중</Text>
          <Text style={styles.tableHeaderFont}>(D.L + L.L)</Text>
        </View>
        <View
          style={{
            width: "15%",
            height: "100%",
            ...styles.tableHeaderCell,
            borderRightWidth: 0,
          }}
        >
          <Text style={styles.tableHeaderFont}>계수하중</Text>
          <Text style={styles.tableHeaderFont}>
            ({dl_factor} D.L+{ll_factor} L.L)
          </Text>
        </View>
      </View>
    </View>
  );
};

const TableContents = ({
  tableSettings,
  dl_factor,
  ll_factor,
}: {
  tableSettings: TableSetting[];
  dl_factor: number;
  ll_factor: number;
}) => {
  return (
    <View style={{ display: "flex", flexDirection: "column" }}>
      {tableSettings.map((tableSetting, index) => (
        <View
          key={index}
          style={{ display: "flex", flexDirection: "row", width: "100%" }}
        >
          <View style={styles.tableCellName}>
            <Text style={[styles.tableCellFontCenter, { width: "80%" }]}>
              {forceLineBreak(tableSetting.name, 5)}
            </Text>
          </View>
          <View style={[styles.tableCellColumn, { width: "18%" }]}>
            {tableSetting.dead_load.map((item) => (
              <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                <Text style={styles.tableCellFontLeft}>{item.name}</Text>
              </View>
            ))}
            <View style={[styles.tableCellSmall, styles.tableCellSubtotal]}>
              <Text style={styles.tableCellFontLeft}>소계</Text>
            </View>
          </View>
          <View style={[styles.tableCellColumn, { width: "9%" }]}>
            {tableSetting.dead_load.map((item) =>
              item.type === "thickness" ? (
                <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableCellFontRight}>
                    {item.thickness.toFixed(1)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableCellFontRight}></Text>
                </View>
              )
            )}
            <View
              style={[styles.tableCellSmall, styles.tableCellSubtotalRight]}
            >
              <Text style={styles.tableCellFontLeft}></Text>
            </View>
          </View>
          <View style={[styles.tableCellColumn, { width: "9%" }]}>
            {tableSetting.dead_load.map((item) =>
              item.type === "thickness" ? (
                <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableCellFontRight}>
                    {item.unit_weight.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableCellFontRight}></Text>
                </View>
              )
            )}
            <View
              style={[styles.tableCellSmall, styles.tableCellSubtotalRight]}
            >
              <Text style={styles.tableCellFontLeft}></Text>
            </View>
          </View>
          <View style={[styles.tableCellColumn, { width: "9%" }]}>
            {tableSetting.dead_load.map((item) => (
              <View style={[styles.tableCellSmall, { borderBottomWidth: 0 }]}>
                <Text style={styles.tableCellFontRight}>
                  {item.load.toFixed(3)}
                </Text>
              </View>
            ))}
            <View style={[styles.tableCellSmall, styles.tableCellSubtotal]}>
              <Text style={styles.tableCellFontRight}>
                {tableSetting.dead_load
                  .reduce((acc, item) => acc + item.load, 0)
                  .toFixed(3)}
              </Text>
            </View>
          </View>
          <View style={styles.tableCellLiveLoad}>
            <Text style={styles.tableCellFontRight}>
              {tableSetting.live_load.toFixed(3)}
            </Text>
          </View>
          <View style={styles.tableCellServiceLoad}>
            <Text style={styles.tableCellFontRight}>
              {(
                tableSetting.dead_load.reduce(
                  (acc, item) => acc + item.load,
                  0
                ) + tableSetting.live_load
              ).toFixed(3)}
            </Text>
          </View>
          <View style={styles.tableCellFactoredLoad}>
            <Text style={styles.tableCellFontRight}>
              {(
                tableSetting.dead_load.reduce(
                  (acc, item) => acc + item.load,
                  0
                ) *
                  dl_factor +
                tableSetting.live_load * ll_factor
              ).toFixed(3)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const FloorLoadPDF = ({ floorLoadData }: { floorLoadData: FloorLoadState }) => {
  // 테이블 설정을 페이지별로 분할
  const pages = splitTableSettingsIntoPages(floorLoadData.table_setting);
  const totalPages = pages.length;

  return (
    <Document>
      {pages.map((pageTableSettings, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={{
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 50,
            paddingBottom: 50,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <PageHeader floorLoadData={floorLoadData} />
          <View style={{ flex: 1 }}>
            <TableHeader floorLoadData={floorLoadData} />
            <TableContents
              tableSettings={pageTableSettings}
              dl_factor={floorLoadData.global_setting.factor_ll || 1.2}
              ll_factor={floorLoadData.global_setting.factor_ll || 1.6}
            />
          </View>
          <PageFooter pageNumber={pageIndex + 1} totalPages={totalPages} />
        </Page>
      ))}
    </Document>
  );
};

export const pdfCreator = async (
  floorLoadData: FloorLoadState,
  showMessage: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void
) => {
  try {
    // 입력 데이터 검증
    const isValid = validateAndShowMessage(floorLoadData, showMessage);
    if (!isValid) {
      return;
    }

    // PDF 생성
    const pdfBlob = await pdf(
      <FloorLoadPDF floorLoadData={floorLoadData} />
    ).toBlob();

    // 파일 다운로드
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${floorLoadData.global_setting.project_name}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 출력 성공 메시지
    if (showMessage) {
      showMessage("PDF generation completed successfully.", "success");
    }
  } catch (error) {
    // 출력 실패 메시지
    console.error("Error occurred during PDF generation:", error);
    if (showMessage) {
      showMessage("An error occurred during PDF generation.", "error");
    }
    throw error;
  }
};
