/**
 * @fileoverview
 * 설정 패널 컨테이너 컴포넌트.
 * 선택된 아이템의 설정을 관리하는 UI를 제공합니다.
 * SystemStyle, SystemUnit 등 다양한 설정 패널을 동적으로 렌더링하며,
 * 설정 값의 임시 저장 및 최종 저장 기능을 제공합니다.
 */

import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useItemSettings } from "../hooks/useItemSettings";
import SystemStyle from "../panels/SystemStyle";
import SystemUnit from "../panels/SystemUnit";
import { PanelType } from "../types/category";

// 패널 타입별 컴포넌트 매핑
const PANEL_COMPONENTS: Record<
  PanelType,
  React.ComponentType<{ value: any; onChange: (newSettings: any) => void }>
> = {
  SystemStyle: SystemStyle as React.ComponentType<{
    value: any;
    onChange: (newSettings: any) => void;
  }>,
  SystemUnit: SystemUnit as React.ComponentType<{
    value: any;
    onChange: (newSettings: any) => void;
  }>,
};

const SettingsPanel: React.FC = () => {
  // 설정 관리를 위한 커스텀 훅 사용
  const {
    getSelectedItemInfo,
    getCurrentSettings,
    updateTempSettings,
    handleSave,
    handleCancel,
  } = useItemSettings();

  const selectedInfo = getSelectedItemInfo();

  // 패널 컴포넌트 동적 렌더링
  const renderPanelComponent = (panelType: PanelType) => {
    const PanelComponent = PANEL_COMPONENTS[panelType];
    const currentSettings = getCurrentSettings(panelType);
    if (!currentSettings) return null;

    return (
      <Box key={panelType} sx={{ mb: 2 }}>
        <PanelComponent
          value={currentSettings.settings}
          onChange={(newSettings: any) =>
            updateTempSettings(panelType, newSettings)
          }
        />
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, minHeight: "200px" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        설정
      </Typography>
      {selectedInfo ? (
        // 선택된 아이템이 있는 경우 설정 패널 표시
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {selectedInfo.typeInfo.panels.map((panelType) =>
            renderPanelComponent(panelType)
          )}
        </Box>
      ) : (
        // 선택된 아이템이 없는 경우 안내 메시지 표시
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "150px",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">항목을 선택하세요</Typography>
        </Box>
      )}
      {/* 저장/취소 버튼 영역 */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!selectedInfo}
        >
          저장
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={!selectedInfo}
        >
          취소
        </Button>
      </Box>
    </Paper>
  );
};

export default SettingsPanel;
