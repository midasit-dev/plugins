import React, { useEffect } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  LoadCaseNameProps,
  DEFAULT_SETTINGS_LOADCASENAME,
} from "../types/panels";
import { useCategories } from "../hooks/useCategories";
import { useSnackbarMessage } from "../hooks/useSnackbarMessage";
import SnackBar from "../components/SnackBar";

const LoadCaseName: React.FC<LoadCaseNameProps> = ({
  value = DEFAULT_SETTINGS_LOADCASENAME,
  height = "100%",
  onChange,
}) => {
  const { snackbar, setSnackbar, handleCloseSnackbar } = useSnackbarMessage();
  const { handleLoadCaseRefresh, selectedItem } = useCategories();

  // 데이터 갱신 핸들러
  const handleRefresh = async () => {
    try {
      if (!selectedItem?.categoryId || !selectedItem?.itemId) {
        setSnackbar({
          open: true,
          message: "Please select an item first",
          severity: "error",
        });
        return;
      }

      const hasChanges = await handleLoadCaseRefresh(
        selectedItem.categoryId,
        selectedItem.itemId
      );
      if (!hasChanges) {
        setSnackbar({
          open: true,
          message: "No changes in load cases",
          severity: "warning",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch load cases. Please try again.",
        severity: "error",
      });
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    const newLoadCases = value.loadCases.map((loadCase) => ({
      ...loadCase,
      isChecked: checked,
    }));
    onChange({
      ...value,
      loadCases: newLoadCases,
      selectAll: checked,
    });
  };

  // 개별 항목 선택/해제 핸들러
  const handleToggle = (index: number) => {
    const newLoadCases = [...value.loadCases];
    newLoadCases[index] = {
      ...newLoadCases[index],
      isChecked: !newLoadCases[index].isChecked,
    };

    // 모든 항목이 선택되었는지 확인
    const allChecked = newLoadCases.every((loadCase) => loadCase.isChecked);

    onChange({
      ...value,
      loadCases: newLoadCases,
      selectAll: allChecked,
    });
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h2" sx={{ mb: 2 }}>
          Load Case Name
        </Typography>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={value.selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            disabled={value.loadCases.length === 0}
          />
        }
        label="Select All"
        sx={{ paddingLeft: 2 }}
      />
      <Divider sx={{ display: "flex", flexShrink: 0 }} />
      {value.loadCases.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          No data
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            height: height,
          }}
        >
          {value.loadCases.map((loadCase, index) => (
            <FormControlLabel
              key={loadCase.name}
              sx={{
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                paddingLeft: 2,
              }}
              control={
                <Checkbox
                  checked={loadCase.isChecked}
                  onChange={() => handleToggle(index)}
                />
              }
              label={loadCase.name}
            />
          ))}
        </Box>
      )}
      <SnackBar snackbar={snackbar} handleCloseSnackbar={handleCloseSnackbar} />
    </Paper>
  );
};

export default LoadCaseName;
