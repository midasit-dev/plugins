import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  // PDF 헤더 스타일
  headerMainfont: { fontSize: 12 },
  headerSubfont: { fontSize: 10 },
  headerSubfontMultilang: { fontSize: 10, fontFamily: "NotoSans" },
});

// 이미지 URL 생성 함수 (빌드 환경에서도 작동)
const getImageUrl = (path: string) => {
  const baseUrl = process.env.PUBLIC_URL || window.location.origin;
  return `${baseUrl}${path}`;
};

// 영어(ASCII) 문자만 포함되어 있는지 확인하는 함수
const isAsciiOnly = (str: string): boolean => {
  return /^[\x00-\x7F]*$/.test(str);
};

// PDF 공통 헤더 컴포넌트
export const PDFCommonHeader: React.FC<{
  tableName: string;
  projectInfo?: {
    author: string;
    filename: string;
    client: string;
    company: string;
    project_title: string;
    certified_by: string;
  };
}> = ({ tableName, projectInfo }) => {
  console.log(projectInfo);
  console.log(tableName);
  
  // 각 필드별로 영어인지 확인
  const certifiedByText = projectInfo?.certified_by || "-";
  const projectTitleText = projectInfo?.project_title || "-";
  const companyText = projectInfo?.company || "-";
  const clientText = projectInfo?.client || "-";
  const authorText = projectInfo?.author || "-";
  const tableText = tableName.split("_")[0];
  
  const isCertifiedByAscii = isAsciiOnly(certifiedByText);
  const isProjectTitleAscii = isAsciiOnly(projectTitleText);
  const isCompanyAscii = isAsciiOnly(companyText);
  const isClientAscii = isAsciiOnly(clientText);
  const isAuthorAscii = isAsciiOnly(authorText);
  const isTableAscii = isAsciiOnly(tableText);
  
  console.log("Text encoding check:", {
    certifiedBy: { text: certifiedByText, isAscii: isCertifiedByAscii },
    projectTitle: { text: projectTitleText, isAscii: isProjectTitleAscii },
    company: { text: companyText, isAscii: isCompanyAscii },
    client: { text: clientText, isAscii: isClientAscii },
    author: { text: authorText, isAscii: isAuthorAscii },
    table: { text: tableText, isAscii: isTableAscii }
  });
  
  return (
    <View style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <View style={{ marginBottom: 4 }}>
        <Text style={[pdfStyles.headerMainfont, { fontWeight: "bold" }]}>
          MIDAS GEN NX
        </Text>
      </View>
      <View style={{ padding: 2, borderTop: "2px solid #000" }}>
        <Text style={isCertifiedByAscii ? pdfStyles.headerSubfont : pdfStyles.headerSubfontMultilang}>
          Certified by: {certifiedByText}
        </Text>
      </View>
      <View style={{ padding: 2, borderTop: "1px solid #000" }}>
        <Text style={isProjectTitleAscii ? pdfStyles.headerSubfont : pdfStyles.headerSubfontMultilang}>
          Project Title: {projectTitleText}
        </Text>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          borderTop: "1px solid #000",
          borderBottom: "2px solid #000",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: "120px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image 
            style={{ width: "80px" }} 
            src={getImageUrl("/images/MIDAS_logo_color.png")} 
          />
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            width: "calc(100% - 120px)",
          }}
        >
          <View
            style={{ display: "flex", flexDirection: "row", width: "100%" }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "80px",
                padding: 2,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #000",
              }}
            >
              <Text style={pdfStyles.headerSubfont}>Company</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "calc(50% - 80px)",
                padding: 2,
                paddingLeft: 10,
                borderBottom: "1px solid #000",
              }}
            >
              <Text style={isCompanyAscii ? pdfStyles.headerSubfont : pdfStyles.headerSubfontMultilang}>
                {companyText}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "80px",
                padding: 2,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #000",
              }}
            >
              <Text style={pdfStyles.headerSubfont}>Client</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "calc(50% - 80px)",
                padding: 2,
                paddingLeft: 10,
                borderBottom: "1px solid #000",
              }}
            >
              <Text style={isClientAscii ? pdfStyles.headerSubfont : pdfStyles.headerSubfontMultilang}>
                {clientText}
              </Text>
            </View>
          </View>
          <View
            style={{ display: "flex", flexDirection: "row", width: "100%" }}
          >
            {" "}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "80px",
                padding: 2,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={pdfStyles.headerSubfont}>Author</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "calc(50% - 80px)",
                padding: 2,
                paddingLeft: 10,
              }}
            >
              <Text style={pdfStyles.headerSubfontMultilang}>
                {authorText}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "80px",
                padding: 2,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={pdfStyles.headerSubfont}>Table</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "calc(50% - 80px)",
                padding: 2,
                paddingLeft: 10,
              }}
            >
              <Text style={isTableAscii ? pdfStyles.headerSubfont : pdfStyles.headerSubfontMultilang}>
                {tableText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
