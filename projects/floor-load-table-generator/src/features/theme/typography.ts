/**
 * @fileoverview
 * MUI 테마의 타이포그래피 설정.
 * MIDAS IT의 디자인 시스템에 맞는 폰트, 크기, 두께 등을 정의합니다.
 */

import { TypographyOptions } from "@mui/material/styles/createTypography";

export const typography: TypographyOptions = {
  // 기본 폰트 패밀리
  fontFamily: [
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),

  // 제목 스타일
  h1: {
    fontSize: "0.75rem", // 12px
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "140%",
  },
  h2: {
    fontSize: "0.75rem", // 12px
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "140%",
  },
  h3: {
    fontSize: "0.875rem", // 14px
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "140%",
  },
  h4: {
    fontSize: "1.0rem", // 16px
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "140%",
  },

  // 본문 스타일
  body1: {
    fontSize: "0.75rem", // 12px
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "130%",
  },
  body2: {
    fontSize: "0.75rem", // 14px
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "130%",
  },
};
