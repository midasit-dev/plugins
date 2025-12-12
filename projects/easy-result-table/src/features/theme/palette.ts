/**
 * @fileoverview
 * MUI 테마의 색상 팔레트 설정.
 * MIDAS IT의 브랜드 색상과 UI 요소들의 색상을 정의합니다.
 */

import { PaletteOptions } from "@mui/material/styles";

export const palette: PaletteOptions = {
  // 주요 브랜드 색상
  primary: {
    main: "#343A3F",
    light: "#5F666B",
    dark: "#1E2429",
    contrastText: "#ffffff",
  },

  // 보조 색상
  secondary: {
    main: "#9c27b0", // 보라색 계열
    light: "#ba68c8",
    dark: "#7b1fa2",
    contrastText: "#ffffff",
  },

  // 에러 색상
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
    contrastText: "#ffffff",
  },

  // 경고 색상
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
    contrastText: "#ffffff",
  },

  // 정보 색상
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
    contrastText: "#ffffff",
  },

  // 성공 색상
  success: {
    main: "#2e7d32",
    light: "#4caf50",
    dark: "#1b5e20",
    contrastText: "#ffffff",
  },

  // 회색 계열
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // 배경색
  background: {
    default: "#ffffff",
    paper: "#ffffff",
  },

  // 텍스트 색상
  text: {
    primary: "#1F2937",
    secondary: "#5F666B",
    disabled: "#C4C6C8",
  },

  // 구분선 색상
  divider: "rgba(0, 0, 0, 0.12)",

  // 액션 색상
  action: {
    active: "rgba(0, 0, 0, 0.54)",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(0, 0, 0, 0.12)",
  },
};
