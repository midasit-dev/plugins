import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import SnackBar from "../components/SnackBar";
import { useFloorLoadState } from "../hooks/useFloorLoadState";
import { useSnackbarMessage } from "../hooks/useSnackbarMessage";
import {
  CategoryPanel,
  ExportPanel,
  FileOperationPanel,
  GlobalSettingPanel,
  TableSettingPanel,
} from "../panels";
import { theme } from "../theme";

const FloorLoadContainer: React.FC = () => {
  const { snackbar, setSnackbar, handleCloseSnackbar } = useSnackbarMessage();
  const { state: currentState } = useFloorLoadState();
  const [selectedCategoryIndex, setSelectedCategoryIndex] =
    useState<number>(-1);

  // 초기 카테고리 선택
  useEffect(() => {
    if (currentState.table_setting.length > 0 && selectedCategoryIndex === -1) {
      setSelectedCategoryIndex(0);
    } else if (currentState.table_setting.length === 0) {
      setSelectedCategoryIndex(-1);
    }
  }, [currentState.table_setting.length, selectedCategoryIndex]);

  const handleCategorySelect = (index: number) => {
    setSelectedCategoryIndex(index);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 1200,
          height: 560,
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <GlobalSettingPanel setSnackbar={setSnackbar} />
          <CategoryPanel
            setSnackbar={setSnackbar}
            selectedCategoryIndex={selectedCategoryIndex}
            onCategorySelect={handleCategorySelect}
          />
          <TableSettingPanel
            setSnackbar={setSnackbar}
            selectedCategoryIndex={selectedCategoryIndex}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <FileOperationPanel setSnackbar={setSnackbar} />
          <ExportPanel setSnackbar={setSnackbar} />
        </Box>
      </Box>
      <SnackBar snackbar={snackbar} handleCloseSnackbar={handleCloseSnackbar} />
    </ThemeProvider>
  );
};

export default FloorLoadContainer;
