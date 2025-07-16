import React from "react";
import { Button, Box } from "@mui/material";
import { PictureAsPdf, Send } from "@mui/icons-material";
import { exportFloorLoad } from "../utils/exportFloorLoad";
import { SnackbarState } from "../hooks/useSnackbarMessage";
import { useFloorLoadState } from "../hooks/useFloorLoadState";
import { pdfCreator } from "../utils/pdfCreator";

interface ExportPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ setSnackbar }) => {
  const { state: floorLoadData } = useFloorLoadState();

  // 스낵바 메시지 표시 함수
  const showMessage = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // PDF 출력 함수
  const handleExportToPDF = async () => {
    try {
      await pdfCreator(floorLoadData, showMessage);
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  // MIDAS API 전송 함수
  const handleSendToMidas = async () => {
    try {
      await exportFloorLoad(floorLoadData, showMessage);
    } catch (error) {
      console.error("MIDAS API Error:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        variant="contained"
        startIcon={<PictureAsPdf />}
        onClick={handleExportToPDF}
        sx={{ minWidth: 150 }}
      >
        Export to PDF
      </Button>

      <Button
        variant="contained"
        startIcon={<Send />}
        onClick={handleSendToMidas}
        sx={{ minWidth: 150 }}
      >
        Send to MIDAS
      </Button>
    </Box>
  );
};

export default ExportPanel;
