import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useImageUpload } from "../hooks/useImageUpload";
import { updateGlobalSetting, floorLoadState } from "../states/stateFloorLoad";
import { getLoadCaseList } from "../utils/getLoadCaseList";
import { SnackbarState } from "../hooks/useSnackbarMessage";
import { useFloorLoadState } from "../hooks/useFloorLoadState";

interface GlobalSettingPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

export const GlobalSettingPanel: React.FC<GlobalSettingPanelProps> = ({
  setSnackbar,
}) => {
  const { state: currentState } = useFloorLoadState();

  const [projectName, setProjectName] = useState(
    currentState.global_setting.project_name
  );
  const [factorDl, setFactorDl] = useState(
    currentState.global_setting.factor_dl
  );
  const [factorLl, setFactorLl] = useState(
    currentState.global_setting.factor_ll
  );
  const [dlCaseName, setDlCaseName] = useState(
    currentState.global_setting.dl_case_name
  );
  const [llCaseName, setLlCaseName] = useState(
    currentState.global_setting.ll_case_name
  );
  const [loadCaseList, setLoadCaseList] = useState<string[]>([]);

  const { imageBase64, handleImageSelect, setImageBase64 } = useImageUpload();

  // 하중 케이스 목록 가져오기 함수
  const fetchLoadCaseList = async () => {
    const list = await getLoadCaseList((message, severity) => {
      setSnackbar({ open: true, message, severity });
    });
    if (list) {
      setLoadCaseList(list);
    }
  };

  // 하중 케이스 목록 가져오기
  useEffect(() => {
    fetchLoadCaseList();
  }, [setSnackbar]);

  // 초기 이미지 설정
  useEffect(() => {
    if (floorLoadState.global_setting.image_base64) {
      setImageBase64(floorLoadState.global_setting.image_base64);
    }
  }, [setImageBase64]);

  // currentState가 변경될 때 UI 업데이트
  useEffect(() => {
    setProjectName(currentState.global_setting.project_name);
    setFactorDl(currentState.global_setting.factor_dl);
    setFactorLl(currentState.global_setting.factor_ll);
    setDlCaseName(currentState.global_setting.dl_case_name);
    setLlCaseName(currentState.global_setting.ll_case_name);
    if (currentState.global_setting.image_base64) {
      setImageBase64(currentState.global_setting.image_base64);
    }
  }, [currentState, setImageBase64]);

  // 값이 변경될 때마다 전역 상태 업데이트
  useEffect(() => {
    updateGlobalSetting({
      project_name: projectName,
      factor_dl: factorDl,
      factor_ll: factorLl,
      image_base64: imageBase64,
      dl_case_name: dlCaseName,
      ll_case_name: llCaseName,
    });
  }, [projectName, factorDl, factorLl, imageBase64, dlCaseName, llCaseName]);

  return (
    <Paper elevation={1} sx={{ padding: 2, width: 240, height: 480 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h2">Global Setting</Typography>
        <IconButton
          onClick={fetchLoadCaseList}
          size="small"
          title="Refresh Load Case List"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <TextField
          label="DL Factor"
          type="number"
          value={factorDl}
          onChange={(e) => setFactorDl(Number(e.target.value))}
          inputProps={{ step: 0.1, min: 0 }}
        />

        <TextField
          label="LL Factor"
          type="number"
          value={factorLl}
          onChange={(e) => setFactorLl(Number(e.target.value))}
          inputProps={{ step: 0.1, min: 0 }}
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel>DL Case</InputLabel>
          <Select
            value={dlCaseName}
            onChange={(e) => setDlCaseName(e.target.value)}
            label="DL Case"
          >
            {loadCaseList.map((caseName) => (
              <MenuItem key={caseName} value={caseName}>
                {caseName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel>LL Case</InputLabel>
          <Select
            value={llCaseName}
            onChange={(e) => setLlCaseName(e.target.value)}
            label="LL Case"
          >
            {loadCaseList.map((caseName) => (
              <MenuItem key={caseName} value={caseName}>
                {caseName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={handleImageSelect}
              sx={{ width: "100%", height: "32px" }}
            >
              Select Image
            </Button>
            <Button
              variant="contained"
              onClick={() => setImageBase64("")}
              disabled={!imageBase64}
              sx={{ height: "32px" }}
            >
              <DeleteIcon />
            </Button>
          </Box>

          <Box
            sx={{
              height: "80px",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              overflow: "hidden",
            }}
          >
            {imageBase64 ? (
              <Box
                component="img"
                src={imageBase64}
                alt="Selected Image"
                sx={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Image Preview
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
