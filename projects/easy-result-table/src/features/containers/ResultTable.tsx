/**
 * @fileoverview
 * 결과 테이블의 메인 레이아웃 컨테이너 컴포넌트.
 * 카테고리 목록(CategoryList), 설정 패널(SettingsPanel),
 * 파일 작업(FileOperations) 컴포넌트를 조합하여
 * 전체 UI 레이아웃을 구성합니다.
 */

import React from "react";
import { Box, Grid } from "@mui/material";
import CategoryList from "./CategoryList";
import SettingsPanel from "./SettingsPanel";
import FileOperations from "./FileOperations";

const ResultTable: React.FC = () => {
  return (
    <Box
      sx={{ maxWidth: "100%", margin: "0 auto", p: 3, position: "relative" }}
    >
      <Grid container spacing={2}>
        {/* 왼쪽: 카테고리 목록 영역 (8/12) */}
        <Grid item xs={8}>
          <CategoryList />
        </Grid>
        {/* 오른쪽: 설정 패널 영역 (4/12) */}
        <Grid item xs={4}>
          <SettingsPanel />
        </Grid>
      </Grid>
      {/* 하단: 파일 작업 플로팅 버튼 */}
      <FileOperations />
    </Box>
  );
};

export default ResultTable;
