/**
 * @fileoverview
 * MUI 컴포넌트들의 기본 스타일 오버라이드 설정.
 * 프로젝트 전반에서 사용되는 MUI 컴포넌트들의 기본 스타일을
 * MIDAS IT의 디자인 시스템에 맞게 커스터마이징합니다.
 */

import { Components, Theme } from "@mui/material/styles";
import { text } from "stream/consumers";

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      "*": {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px",
          "&:hover": {
            background: "#555",
          },
        },
      },
    },
  },

  // 버튼 컴포넌트 스타일링
  MuiButton: {
    styleOverrides: {
      root: {
        display: "flex", // 버튼을 flex 컨테이너로 설정
        alignItems: "center", // 수직 중앙 정렬
        justifyContent: "center", // 수평 중앙 정렬
        color: "#1F2937",
        borderRadius: "4px",
        textTransform: "none",
        fontSize: "12px",
        fontWeight: 500,
        padding: "4px 10px",
        gap: 1,
        backgroundColor: "#EEEEEE",
        "&:hover": {
          color: "#FFFFFF",
          backgroundColor: "#5F666B",
        },
      },
      // contained 버튼 스타일
      contained: {
        border: "1px solid #C4C6C8",
        boxShadow: "none",
        "&:hover": {
          border: "1px solid #5F666B",
          boxShadow: "none",
        },
      },
      // outlined 버튼 스타일
      outlined: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },

  // 텍스트 필드 컴포넌트 스타일링
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "& fieldset": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(0, 0, 0, 0.87)",
          },
          "&.Mui-focused fieldset": {
            borderWidth: "1px",
          },
        },
        "& .MuiInputBase-input": {
          padding: "2px 8px",
          height: "32px",
        },
      },
    },
  },

  // 페이퍼 컴포넌트 스타일링
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      },
      rounded: {
        borderRadius: "8px",
      },
    },
  },

  // 카드 컴포넌트 스타일링
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      },
    },
  },

  // 리스트 아이템 컴포넌트 스타일링
  MuiList: {
    styleOverrides: {
      root: {
        padding: "0px",
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        cursor: "pointer",
        borderRadius: "4px",
        padding: "4px",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        "& .MuiListItemText-secondary": {
          paddingRight: "32px",
          fontSize: "11px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
        },
      },
    },
  },

  MuiListItemText: {
    styleOverrides: {
      root: {
        fontSize: "12px",
        fontWeight: 500,
      },
    },
  },

  // 아이콘 버튼 컴포넌트 스타일링
  MuiIconButton: {
    styleOverrides: {
      root: {
        padding: "4px",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },

  MuiSvgIcon: {
    styleOverrides: {
      root: {
        width: "16px",
        height: "16px",
      },
    },
  },

  // 스위치 컴포넌트 스타일링
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
      },
      switchBase: {
        padding: 1,
        "&.Mui-checked": {
          transform: "translateX(16px)",
          color: "#fff",
        },
      },
      thumb: {
        width: 24,
        height: 24,
      },
      track: {
        borderRadius: 13,
        border: "1px solid #bdbdbd",
        backgroundColor: "#fafafa",
        opacity: 1,
      },
    },
  },

  // 체크박스 컴포넌트 스타일링
  MuiCheckbox: {
    styleOverrides: {
      root: {
        padding: "9px",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },

  // 라디오 버튼 컴포넌트 스타일링
  MuiRadio: {
    styleOverrides: {
      root: {
        marginLeft: "8px",
        padding: "4px",
        borderRadius: "50%",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },

  MuiSelect: {
    defaultProps: {
      MenuProps: {
        PaperProps: {
          style: {
            maxHeight: 110, // 메뉴의 최대 높이를 200px로 설정
            overflow: "auto", // 스크롤 활성화
          },
        },
      },
    },
    styleOverrides: {
      select: {
        padding: "2px 8px",
        height: "32px",
        display: "flex",
        alignItems: "center", // 수직 중앙 정렬
      },
      icon: {
        width: "20px", // Select 아이콘만 원래 크기로
        height: "20px",
      },
    },
  },

  // FormControl 컴포넌트 스타일링
  MuiFormControl: {
    styleOverrides: {
      root: {
        "& .MuiInputLabel-root": {
          fontSize: "12px",
          color: "#C4C6C8",
          transform: "translate(8px, 10px) scale(1)", // 기본 위치
          "&.Mui-focused": {
            transform: "translate(12px, -6px) scale(0.75)", // 포커스 시 위치
            color: "#1F2937",
          },
          "&.MuiFormLabel-filled": {
            transform: "translate(12px, -6px) scale(0.75)", // 값이 있을 때 위치
            color: "#1F2937",
          },
        },
      },
    },
  },

  // 툴팁 컴포넌트 스타일링
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: "primary.main",
        fontSize: "0.75rem",
        fontWeight: 400,
        padding: "8px 12px",
        borderRadius: "4px",
      },
    },
  },
};
