/**
 * @fileoverview
 * 결과 테이블의 메인 레이아웃 컨테이너 컴포넌트.
 * 카테고리 목록(CategoryList), 설정 패널(SettingsPanel),
 * 파일 작업(FileOperations) 컴포넌트를 조합하여
 * 전체 UI 레이아웃을 구성합니다.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import CategoryList from "./CategoryList";
import SettingsPanel from "./SettingsPanel";
import FileOperations from "./FileOperations";

const ResultTable: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 680,
        width: 1000,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "94%",
          gap: 2,
          padding: 2,
        }}
      >
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "45%",
            height: "100%",
            padding: 2,
          }}
        >
          <CategoryList />
        </Paper>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "55%",
            height: "100%",
            padding: 2,
          }}
        >
          <SettingsPanel />
        </Paper>
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "6%",
        }}
      >
        <FileOperations />
      </Box>
    </Box>
  );
};

export default ResultTable;
