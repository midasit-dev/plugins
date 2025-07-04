/**
 * @fileoverview
 * 설정 패널 컨테이너 컴포넌트.
 * 선택된 아이템의 설정을 관리하는 UI를 제공합니다.
 * 패널 컴포넌트를 동적으로 렌더링하며, 설정 값의 임시 저장 및
 * 최종 저장 기능을 제공합니다.
 */

import React, { Suspense, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useItemSettings } from "../hooks/useItemSettings";
import { PanelType, PanelTypes } from "../types/category";
import { PANEL_COMPONENTS } from "../registry/panelRegistry";
import { PREDEFINED_LAYOUTS } from "../types/panelLayouts";

// 로딩 컴포넌트
const LoadingPanel: React.FC = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

const SettingsPanel: React.FC = () => {
  const {
    getSelectedItemInfo,
    getCurrentSettings,
    updateTempSettings,
    handleSave,
    handleCancel,
  } = useItemSettings();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const selectedInfo = getSelectedItemInfo();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSave = async () => {
    try {
      await handleSave();
      setSnackbar({
        open: true,
        message: "Settings saved successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save settings.",
        severity: "error",
      });
    }
  };

  // 패널 컴포넌트 생성
  const createPanelComponent = (panelType: PanelType) => {
    const PanelComponent = PANEL_COMPONENTS[panelType];
    const currentSettings = getCurrentSettings(panelType);
    if (!currentSettings) return null;

    const panelSettings = currentSettings.settings[panelType];

    return (
      <Box key={panelType} sx={{ flex: 1 }}>
        <Suspense fallback={<LoadingPanel />}>
          <PanelComponent
            value={panelSettings}
            onChange={(newSettings: any) =>
              updateTempSettings(panelType, newSettings)
            }
          />
        </Suspense>
      </Box>
    );
  };

  // 패널 레이아웃 렌더링
  const renderPanels = (panels: PanelType[]) => {
    // 모든 패널 컴포넌트를 생성
    const panelComponents = Object.values(PanelTypes).reduce(
      (acc, panelType) => {
        acc[panelType as PanelType] = null;
        return acc;
      },
      {} as Record<PanelType, React.ReactNode>
    );

    panels.forEach((panelType) => {
      panelComponents[panelType] = createPanelComponent(panelType);
    });

    // 미리 정의된 레이아웃이 있는지 확인
    const predefinedLayout = PREDEFINED_LAYOUTS.find(
      (layout) =>
        layout.panels.length === panels.length &&
        layout.panels.every((p) => panels.includes(p))
    );

    if (predefinedLayout) {
      // 미리 정의된 레이아웃 사용
      return predefinedLayout.render(panelComponents);
    } else {
      // 기본 그리드 레이아웃 사용
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          {panels.map((panelType) => panelComponents[panelType])}
        </Box>
      );
    }
  };

  return (
    <>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Settings
      </Typography>
      {selectedInfo ? (
        <Box
          sx={{
            height: "90%",
            width: "100%",
            flexGrow: 1,
            overflow: "auto",
            padding: 2,
          }}
        >
          {renderPanels(selectedInfo.typeInfo.panels)}
        </Box>
      ) : (
        // 선택된 아이템이 없는 경우 안내 메시지 표시
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            flexGrow: 1,
            overflow: "auto",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">Please select an item.</Typography>
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
          onClick={onSave}
          disabled={!selectedInfo}
        >
          Save
        </Button>
        <Button
          variant="contained"
          onClick={handleCancel}
          disabled={!selectedInfo}
        >
          Cancel
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SettingsPanel;
