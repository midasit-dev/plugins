/**
 * @fileoverview
 * MUI 테마 설정의 메인 파일.
 * 색상, 타이포그래피, 컴포넌트 스타일 등을 통합하여
 * 프로젝트의 전체적인 디자인 시스템을 정의합니다.
 */

import { createTheme, Theme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";
import { components } from "./components";
import { mixins, customMixins } from "./mixins";

// MIDAS IT 디자인 시스템에 맞는 테마 생성
export const theme = createTheme({
  // 색상 팔레트
  palette,

  // 타이포그래피 설정
  typography,

  // 컴포넌트별 스타일 오버라이드
  components,

  // 믹스인 (재사용 스타일)
  mixins,

  // 커스텀 믹스인
  customMixins,

  // 간격 설정
  spacing: 4, // 기본 간격을 4px로 설정

  // 모서리 둥글기 설정
  shape: {
    borderRadius: 4,
  },

  // 반응형 브레이크포인트 설정
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// 테마 타입 확장
declare module "@mui/material/styles" {
  interface Theme {
    // 여기에 커스텀 테마 속성 추가
  }
  interface ThemeOptions {
    // 여기에 커스텀 테마 옵션 추가
  }
}

export type AppTheme = Theme;
export default theme;
