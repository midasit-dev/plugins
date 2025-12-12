import { PanelTypes } from "./category";
import { PanelType } from "./category";
import { Box } from "@mui/material";
import React from "react";

// 패널 조합별 레이아웃을 정의하는 타입
type PanelLayout = {
  panels: PanelType[];
  render: (components: Record<PanelType, React.ReactNode>) => React.ReactNode;
};

// 미리 정의된 레이아웃들
export const PREDEFINED_LAYOUTS: PanelLayout[] = [
  {
    // SystemStyle, SystemUnit, LoadCaseName 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "300px",
          }
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {components[PanelTypes.SYSTEM_UNIT]}
          {components[PanelTypes.SYSTEM_STYLE]}
        </Box>
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName 조합을 위한 레이아웃
    panels: [PanelTypes.SYSTEM_STYLE, PanelTypes.SYSTEM_UNIT],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {components[PanelTypes.SYSTEM_UNIT]}
        {components[PanelTypes.SYSTEM_STYLE]}
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName, StoryDriftParameter 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
      PanelTypes.STORY_DRFIT_PARAMETER,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "517px",
          }
        )}
        {components[PanelTypes.STORY_DRFIT_PARAMETER]}
        {components[PanelTypes.SYSTEM_UNIT]}
        {components[PanelTypes.SYSTEM_STYLE]}
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName, AngleSetting 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
      PanelTypes.ANGLE_SETTING,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "365px",
          }
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {components[PanelTypes.ANGLE_SETTING]}
          {components[PanelTypes.SYSTEM_UNIT]}
          {components[PanelTypes.SYSTEM_STYLE]}
        </Box>
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName, StoryDriftParameter 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
      PanelTypes.STABILITY_COEFFICIENT_PARAMETER,
      PanelTypes.STORY_DRIFT_METHOD,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "587px",
          }
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {components[PanelTypes.STABILITY_COEFFICIENT_PARAMETER]}
          {components[PanelTypes.STORY_DRIFT_METHOD]}
        </Box>
        {components[PanelTypes.SYSTEM_UNIT]}
        {components[PanelTypes.SYSTEM_STYLE]}
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName, StoryDriftMethod 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
      PanelTypes.STORY_DRIFT_METHOD,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "395px",
          }
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {components[PanelTypes.STORY_DRIFT_METHOD]}
          {components[PanelTypes.SYSTEM_UNIT]}
          {components[PanelTypes.SYSTEM_STYLE]}
        </Box>
      </Box>
    ),
  },
  {
    // SystemStyle, SystemUnit, LoadCaseName, StoryDriftMethod 조합을 위한 레이아웃
    panels: [
      PanelTypes.SYSTEM_STYLE,
      PanelTypes.SYSTEM_UNIT,
      PanelTypes.LOAD_CASE_NAME,
      PanelTypes.STORY_DRIFT_METHOD,
      PanelTypes.STORY_STIFFNESS_METHOD,
    ],
    render: (components) => (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {React.cloneElement(
          components[PanelTypes.LOAD_CASE_NAME] as React.ReactElement,
          {
            height: "492px",
          }
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {components[PanelTypes.STORY_DRIFT_METHOD]}
          {components[PanelTypes.STORY_STIFFNESS_METHOD]}
          {components[PanelTypes.SYSTEM_UNIT]}
          {components[PanelTypes.SYSTEM_STYLE]}
        </Box>
      </Box>
    ),
  },
];
