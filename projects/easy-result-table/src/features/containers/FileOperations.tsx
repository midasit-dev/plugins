/**
 * @fileoverview
 * 파일 작업 컨테이너 컴포넌트.
 * 설정 데이터의 저장 및 불러오기 기능을 제공하는 플로팅 버튼 UI입니다.
 * JSON 파일 형식으로 데이터를 저장하고 불러올 수 있으며,
 * 작업 결과를 스낵바를 통해 사용자에게 알립니다.
 */

import React, { useRef } from "react";
import { Box, Button, Snackbar, Alert, Stack } from "@mui/material";
import { Save as SaveIcon, Upload as UploadIcon } from "@mui/icons-material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useFileOperations } from "../hooks/useFileOperations";
import { useRecoilValue } from "recoil";
import { categoriesState } from "../states/stateCategories";

const FileOperations: React.FC = () => {
  // 파일 작업 관련 상태와 핸들러
  const {
    snackbar,
    handleSaveToFile,
    handleLoadFromFile,
    handleCloseSnackbar,
  } = useFileOperations();

  // 파일 입력을 위한 숨겨진 input 요소의 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 시 처리
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLoadFromFile(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 테이블 생성 시 처리
  const categories = useRecoilValue(categoriesState);
  const handleCreateTable = () => {
    console.log(categories);
  };

  return (
    <>
      {/* 플로팅 버튼 컨테이너 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: 1,
          padding: 2,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveToFile}
          >
            SAVE
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            LOAD
          </Button>
          {/* 숨겨진 파일 입력 요소 */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".json"
            onChange={handleFileInputChange}
          />
        </Stack>
        <Button
          variant="contained"
          color="primary"
          startIcon={<KeyboardDoubleArrowRightIcon />}
          onClick={handleCreateTable}
        >
          CREATE TABLE
        </Button>
      </Box>
      {/* 작업 결과 알림을 위한 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileOperations;
