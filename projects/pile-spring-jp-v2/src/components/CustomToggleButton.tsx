import React from "react";
import {
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  ToggleButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface CustomToggleButtonProps
  extends Omit<ToggleButtonGroupProps, "children"> {
  buttons: Array<{
    value: string;
    icon: React.ReactNode;
    label?: string;
  }>;
  value?: string;
  onToggle?: (value: string) => void;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  borderRadius: "6px",
  padding: "2px",
  border: "1px solid rgba(255, 255, 255, 0.2)",

  "& .MuiToggleButton-root": {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    padding: "2px",
    minWidth: "28px",
    height: "28px",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.2s ease-in-out",
    margin: "0 2px",

    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 1)",
    },

    "&.Mui-selected": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "rgba(255, 255, 255, 1)",
      boxShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
    },

    "&.Mui-selected:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },

    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },
}));

const CustomToggleButton: React.FC<CustomToggleButtonProps> = ({
  buttons,
  value,
  onToggle,
  ...props
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (onToggle && newValue !== null) {
      onToggle(newValue);
    }
  };

  return (
    <StyledToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      {...props}
    >
      {buttons.map((button) => (
        <ToggleButton key={button.value} value={button.value}>
          {button.icon}
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

export default CustomToggleButton;
