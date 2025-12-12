/**
 * @fileoverview
 * 재사용 가능한 스타일 믹스인 정의.
 * 자주 사용되는 스타일 패턴을 믹스인으로 정의하여
 * 일관된 스타일링을 제공합니다.
 */

import { CSSObject, Theme } from "@mui/material/styles";
import { Mixins } from "@mui/material/styles/createMixins";
import { Property } from "csstype";

// 커스텀 믹스인 타입 정의
declare module "@mui/material/styles" {
  interface Theme {
    customMixins: {
      flexCenter: CSSObject;
      flexColumnCenter: CSSObject;
      absoluteCenter: CSSObject;
      customScrollbar: CSSObject;
      textEllipsis: CSSObject;
      gradientBackground: CSSObject;
      responsivePadding: CSSObject;
      cardStyle: CSSObject;
      hoverEffect: CSSObject;
      focusEffect: CSSObject;
    };
  }
  interface ThemeOptions {
    customMixins?: {
      flexCenter?: CSSObject;
      flexColumnCenter?: CSSObject;
      absoluteCenter?: CSSObject;
      customScrollbar?: CSSObject;
      textEllipsis?: CSSObject;
      gradientBackground?: CSSObject;
      responsivePadding?: CSSObject;
      cardStyle?: CSSObject;
      hoverEffect?: CSSObject;
      focusEffect?: CSSObject;
    };
  }
}

// 기본 MUI mixins 확장
export const mixins: Mixins = {
  toolbar: {
    minHeight: 56,
    "@media (min-width:0px) and (orientation: landscape)": {
      minHeight: 48,
    },
    "@media (min-width:600px)": {
      minHeight: 64,
    },
  },
};

// 커스텀 mixins 정의
export const customMixins = {
  flexCenter: {
    display: "flex" as Property.Display,
    alignItems: "center" as Property.AlignItems,
    justifyContent: "center" as Property.JustifyContent,
  },

  flexColumnCenter: {
    display: "flex" as Property.Display,
    flexDirection: "column" as Property.FlexDirection,
    alignItems: "center" as Property.AlignItems,
    justifyContent: "center" as Property.JustifyContent,
  },

  absoluteCenter: {
    position: "absolute" as Property.Position,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)" as Property.Transform,
  },

  customScrollbar: {
    "&::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(0, 0, 0, 0.1)" as Property.Background,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(0, 0, 0, 0.2)" as Property.Background,
      borderRadius: "3px",
      "&:hover": {
        background: "rgba(0, 0, 0, 0.3)" as Property.Background,
      },
    },
  },

  textEllipsis: {
    overflow: "hidden" as Property.Overflow,
    textOverflow: "ellipsis" as Property.TextOverflow,
    whiteSpace: "nowrap" as Property.WhiteSpace,
  },

  gradientBackground: {
    background:
      "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)" as Property.Background,
    color: "white" as Property.Color,
  },

  responsivePadding: {
    padding: "16px",
    "@media (min-width: 600px)": {
      padding: "24px",
    },
    "@media (min-width: 960px)": {
      padding: "32px",
    },
  } as CSSObject,

  cardStyle: {
    backgroundColor: "#ffffff" as Property.BackgroundColor,
    borderRadius: "8px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" as Property.BoxShadow,
    transition: "all 0.3s ease" as Property.Transition,
    "&:hover": {
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" as Property.BoxShadow,
      transform: "translateY(-2px)" as Property.Transform,
    },
  },

  hoverEffect: {
    transition: "all 0.2s ease" as Property.Transition,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)" as Property.BackgroundColor,
      transform: "scale(1.02)" as Property.Transform,
    },
  },

  focusEffect: {
    outline: "none" as Property.Outline,
    "&:focus": {
      boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)" as Property.BoxShadow,
    },
    "&:focus-visible": {
      outline: "2px solid rgba(25, 118, 210, 0.5)" as Property.Outline,
      outlineOffset: "2px",
    },
  },
} as const;
