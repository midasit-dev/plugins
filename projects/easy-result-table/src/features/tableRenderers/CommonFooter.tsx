import { View, Text, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  footerFont: { fontSize: 8, letterSpacing: -0.5 },
});

// PDF 공통 푸터 컴포넌트
export const PDFCommonFooter: React.FC<{
  currentPage: number;
  totalPages: number;
}> = ({ currentPage, totalPages }) => {
  const currentData = new Date();
  const formattedData = currentData.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        marginTop: 10,
        borderTop: "1px solid #000",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Text style={pdfStyles.footerFont}>
          Modeling, Integrated Design & Analysis Software
        </Text>
        <Text style={pdfStyles.footerFont}>
          Print Date/Time : {formattedData}
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Text style={pdfStyles.footerFont}>http://www.MidasUser.com</Text>
        <Text style={pdfStyles.footerFont}>
          {currentPage}/{totalPages}
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <Text style={pdfStyles.footerFont}>MIDAS GEN NX 2025</Text>
      </View>
    </View>
  );
};
