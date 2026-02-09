import { createTheme } from '@mui/material/styles';

// moaui 디자인 토큰 참조 (@midasit-dev/moaui Style/Color, Style/Font)
// 직접 import하지 않고, 값만 참조하여 MUI 테마에 매핑
const moaui = {
  color: {
    primary: {
      main: '#343A3F',
      hover: '#5F666B',
      focus: '#1E2429',
      white: '#FFFFFF',
      enable: '#EEEEEE',
      enable_strock: '#C4C6C8',
    },
    secondary: { main: '#4B9AF4' },
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      third: '#79828E',
      disable: '#BDC2C8',
    },
    textNegative: {
      primary: '#FFFFFF',
      secondary: '#BDC2C8',
      third: '#79828E',
    },
    component: {
      gray: '#C4C6C8',
      gray_01: '#D1D1D1',
      gray_02: '#E6E6E6',
      gray_light: '#EEEEEE',
      gray_dark: '#8F8F8F',
    },
  },
  font: {
    fontFamily: 'Pretendard, sans-serif',
    small: '0.75rem', // 12px
    medium: '1rem',
    large: '1.375rem',
  },
  borderRadius: 4, // 0.25rem = 4px
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: moaui.color.primary.focus,  // #1E2429
      paper: moaui.color.primary.main,     // #343A3F
    },
    primary: {
      main: moaui.color.secondary.main,    // #4B9AF4 (파란색 accent)
    },
    secondary: {
      main: moaui.color.primary.hover,     // #5F666B
    },
    text: {
      primary: moaui.color.textNegative.primary,    // #FFFFFF
      secondary: moaui.color.textNegative.secondary, // #BDC2C8
    },
    divider: moaui.color.component.gray_dark,        // #8F8F8F
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: moaui.font.fontFamily,
    fontSize: 12,  // moaui Font.small = 0.75rem = 12px
  },
  shape: {
    borderRadius: moaui.borderRadius,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: moaui.font.small,
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: moaui.color.primary.main,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: moaui.font.small,
          fontWeight: 600,
          minHeight: 40,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          fontSize: moaui.font.small,
        },
      },
    },
  },
});

export default theme;
