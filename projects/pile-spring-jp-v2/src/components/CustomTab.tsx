import React, { SyntheticEvent, ReactNode, forwardRef } from "react";
import { styled } from "@mui/material/styles";
import { Tabs, Tab as MuiTab, Box, TabsProps } from "@mui/material";

// 색상 정의
const colors = {
  primary: {
    main: "#343A3F",
    hover: "#5F666B",
    focus: "#1E2429",
    white: "#FFFFFF",
    enable: "#EEEEEE",
    enable_strock: "#C4C6C8",
  },
  secondary: {
    main: "#4B9AF4",
  },
  text: {
    primary: "#1F2937",
    secondary: "#4B5563",
    third: "#79828E",
    disable: "#BDC2C8",
  },
};

// 스타일드 탭 인터페이스
interface StyledTabProps {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

// 스타일드 탭
const StyledTab = styled(MuiTab)({
  color: colors.text.secondary,
  fontWeight: 500,
  fontSize: "0.75rem",
  lineHeight: "0.875rem",
  padding: "0.625rem",
  minHeight: 0,
  "&:hover": {
    color: colors.text.primary,
  },
  "&.Mui-selected": {
    color: colors.text.primary,
    fontWeight: 700,
  },
  "&.Mui-disabled": {
    color: colors.text.disable,
  },
});

// Custom Tabs Props
interface CustomTabsProps extends Omit<TabsProps, "onChange"> {
  indicator?: "left" | "right";
  onChange?: (event: React.SyntheticEvent, value: any) => void;
}

// 스타일드 탭 그룹
const StyledTabs = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== "indicator",
})<CustomTabsProps>((props) => {
  const { orientation, indicator } = props;

  return {
    minHeight: 0,
    "& .MuiTabs-indicator": {
      backgroundColor: colors.secondary.main,
      ...(orientation === "vertical" &&
        indicator === "left" && {
          right: "auto",
          left: 0,
        }),
      ...(orientation === "vertical" &&
        indicator === "right" && {
          left: "auto",
          right: 0,
        }),
    },
  };
});

// 탭 인터페이스
export interface TabProps extends StyledTabProps {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

// 탭 그룹 인터페이스
export interface TabGroupProps extends CustomTabsProps {
  value: any;
  onChange: (event: React.SyntheticEvent, value: any) => void;
  orientation?: "horizontal" | "vertical";
  indicator?: "left" | "right";
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  "aria-label"?: string;
  children?: ReactNode;
}

// Tab 컴포넌트
export const Tab = forwardRef<HTMLDivElement, TabProps>((props, ref) => {
  const { value, label, disabled, ...rest } = props;

  return (
    <StyledTab
      ref={ref}
      value={value}
      label={label}
      disabled={disabled}
      {...rest}
    />
  );
});

Tab.displayName = "Tab";

// TabGroup 컴포넌트
export const TabGroup = forwardRef<HTMLDivElement, TabGroupProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      orientation = "horizontal",
      indicator,
      width,
      height,
      minWidth,
      minHeight,
      "aria-label": ariaLabel,
      children,
      ...rest
    } = props;

    return (
      <Box sx={{ width, height, minWidth, minHeight }}>
        <StyledTabs
          ref={ref}
          value={value}
          onChange={onChange}
          orientation={orientation}
          indicator={indicator}
          aria-label={ariaLabel}
          {...rest}
        >
          {children}
        </StyledTabs>
      </Box>
    );
  }
);

TabGroup.displayName = "TabGroup";
