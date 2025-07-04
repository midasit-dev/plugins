import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getStaticLoadNameCase } from "../utils/getLoadCaseList";
import {
  LoadCombination,
  StoryDriftParameterSettings,
  StoryDriftParameterProps,
  DEFAULT_SETTINGS_STORYDRFITPARAMETER,
} from "../types/panels";

const StoryDriftParameter: React.FC<StoryDriftParameterProps> = ({
  value = DEFAULT_SETTINGS_STORYDRFITPARAMETER,
  onChange,
}) => {
  const [loadCaseList, setLoadCaseList] = useState<string[]>([]);
  const [selectedLoadCase, setSelectedLoadCase] = useState("");
  const [selectedScale, setSelectedScale] = useState(1.0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleRefresh = async () => {
    try {
      const newLoadCaseList = await getStaticLoadNameCase();
      setLoadCaseList(newLoadCaseList);

      // 기존 조합들을 검사하여 새로운 로드케이스 리스트에 없는 항목 제거
      const newCombinations = value.combinations.filter((combination) =>
        newLoadCaseList.includes(combination.loadCase)
      );

      if (newCombinations.length !== value.combinations.length) {
        onChange({
          ...value,
          combinations: newCombinations,
        });
      }

      // 선택된 로드케이스가 새 리스트에 없다면 첫 번째 항목으로 설정
      if (
        !newLoadCaseList.includes(selectedLoadCase) &&
        newLoadCaseList.length > 0
      ) {
        setSelectedLoadCase(newLoadCaseList[0]);
      }
    } catch (error) {
      setSnackbarMessage("Failed to fetch load cases. Please try again.");
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [value.combinations]); // combinations 배열이 변경될 때마다 실행

  const handleFactorChange =
    (field: keyof Omit<StoryDriftParameterSettings, "combinations">) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value) || 0;
      onChange({
        ...value,
        [field]: newValue,
      });
    };

  const handleAdd = () => {
    // 중복 체크
    const isDuplicate = value.combinations.some(
      (combination) => combination.loadCase === selectedLoadCase
    );

    if (isDuplicate) {
      setSnackbarMessage(
        `Load Case "${selectedLoadCase}" is already registered.`
      );
      setOpenSnackbar(true);
      return;
    }

    const newCombination: LoadCombination = {
      loadCase: selectedLoadCase,
      scaleFactor: selectedScale,
    };
    onChange({
      ...value,
      combinations: [...value.combinations, newCombination],
    });
    setSelectedLoadCase(loadCaseList.length > 0 ? loadCaseList[0] : "");
    setSelectedScale(1.0);
  };

  const handleModify = () => {
    if (selectedIndex === null) return;

    // 선택된 항목 외의 다른 항목들 중에서 중복 체크
    const isDuplicate = value.combinations.some(
      (combination, index) =>
        index !== selectedIndex && combination.loadCase === selectedLoadCase
    );

    if (isDuplicate) {
      setSnackbarMessage(
        `Load Case "${selectedLoadCase}" is already registered.`
      );
      setOpenSnackbar(true);
      return;
    }

    const newCombinations = [...value.combinations];
    newCombinations[selectedIndex] = {
      loadCase: selectedLoadCase,
      scaleFactor: selectedScale,
    };

    onChange({
      ...value,
      combinations: newCombinations,
    });

    setSelectedIndex(null);
    setSelectedLoadCase(loadCaseList.length > 0 ? loadCaseList[0] : "");
    setSelectedScale(1.0);
  };

  const handleDelete = () => {
    if (selectedIndex === null) return;

    const newCombinations = value.combinations.filter(
      (_, index) => index !== selectedIndex
    );
    onChange({
      ...value,
      combinations: newCombinations,
    });

    setSelectedIndex(null);
    setSelectedLoadCase(loadCaseList.length > 0 ? loadCaseList[0] : "");
    setSelectedScale(1.0);
  };

  const handleRowClick = (index: number) => {
    setSelectedIndex(index);
    setSelectedLoadCase(value.combinations[index].loadCase);
    setSelectedScale(value.combinations[index].scaleFactor);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        width: "250px",
      }}
    >
      <Typography variant="h2" sx={{ mb: 4 }}>
        Story Drift Parameters
      </Typography>
      <Stack spacing={4}>
        <TextField
          label="Deflection Amplification Factor(Cd)"
          type="number"
          value={value.deflectionFactor}
          onChange={handleFactorChange("deflectionFactor")}
          inputProps={{ step: "any" }}
          size="small"
        />
        <TextField
          label="Importance Factor(Ie)"
          type="number"
          value={value.importanceFactor}
          onChange={handleFactorChange("importanceFactor")}
          inputProps={{ step: "any" }}
          size="small"
        />
        <TextField
          label="Scale Factor"
          type="number"
          value={value.scaleFactor}
          onChange={handleFactorChange("scaleFactor")}
          inputProps={{ step: "any" }}
          size="small"
        />
        <TextField
          label="Allowable Ratio"
          type="number"
          value={value.allowableRatio}
          onChange={handleFactorChange("allowableRatio")}
          inputProps={{ step: "any" }}
          size="small"
        />
        <Divider sx={{ display: "flex", flexShrink: 0 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body1">Vertical Load Combinations</Typography>
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            value={selectedLoadCase}
            onChange={(e) => setSelectedLoadCase(e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            {loadCaseList.map((loadCase) => (
              <MenuItem key={loadCase} value={loadCase}>
                {loadCase}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Scale"
            type="number"
            value={selectedScale}
            onChange={(e) => setSelectedScale(parseFloat(e.target.value) || 0)}
            size="small"
            inputProps={{ step: "any" }}
          />
        </Stack>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TableContainer component={Paper} sx={{ height: "160px" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Load Case</TableCell>
                  <TableCell align="right">S.F.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  overflow: "auto",
                }}
              >
                {value.combinations.map((combination, index) => (
                  <TableRow
                    key={index}
                    onClick={() => handleRowClick(index)}
                    selected={selectedIndex === index}
                    hover
                    sx={{ cursor: "pointer", height: "20px" }}
                  >
                    <TableCell sx={{ height: "20px" }}>
                      {combination.loadCase}
                    </TableCell>
                    <TableCell align="right" sx={{ height: "20px" }}>
                      {combination.scaleFactor}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="contained" onClick={handleAdd} size="small">
              Add
            </Button>
            <Button
              variant="contained"
              onClick={handleModify}
              disabled={selectedIndex === null}
              size="small"
            >
              Modify
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={selectedIndex === null}
              size="small"
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Stack>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default StoryDriftParameter;
