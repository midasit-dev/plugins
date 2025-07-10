import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  // PDF 헤더 스타일
  headerMainfont: { fontSize: 12, fontWeight: "bold" },
  headerSubfont: { fontSize: 10, fontWeight: "bold" },
});

// PDF 공통 헤더 컴포넌트
export const PDFCommonHeader: React.FC<{ tableName: string }> = ({
  tableName,
}) => {
  return (
    <View style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <View style={{ marginBottom: 4 }}>
        <Text style={pdfStyles.headerMainfont}>MIDAS GEN NX</Text>
      </View>
      <View style={{ padding: 2, borderTop: "2px solid #000" }}>
        <Text style={pdfStyles.headerSubfont}>Certified by:</Text>
      </View>
      <View style={{ padding: 2, borderTop: "1px solid #000" }}>
        <Text style={pdfStyles.headerSubfont}>Project Title:</Text>
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
          <Image style={{ width: "80px" }} src="/images/MIDAS_logo_color.png" />
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
              <Text style={pdfStyles.headerSubfont}>MIDAS IT</Text>
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
              <Text style={pdfStyles.headerSubfont}>JAY</Text>
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
              <Text style={pdfStyles.headerSubfont}>Chang</Text>
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
              <Text style={pdfStyles.headerSubfont}>File</Text>
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
              <Text style={pdfStyles.headerSubfont}>Story.mgb</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
