import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { theme } from "../theme";
import {
  GlobalSettingPanel,
  TableSettingPanel,
  FileOperationPanel,
  ExportPanel,
} from "../panels";
import SnackBar from "../components/SnackBar";
import { useSnackbarMessage } from "../hooks/useSnackbarMessage";

const FloorLoadContainer: React.FC = () => {
  const { snackbar, setSnackbar, handleCloseSnackbar } = useSnackbarMessage();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 1000,
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
          <TableSettingPanel setSnackbar={setSnackbar} />
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
