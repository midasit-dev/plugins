/**
 * @fileoverview
 * 구조 해석 결과의 카테고리 목록을 표시하는 컨테이너 컴포넌트.
 * 카테고리의 확장/축소, 아이템 추가/삭제, 선택 기능을 제공합니다.
 * Material-UI를 사용하여 사용자 친화적인 인터페이스를 구현하며,
 * 카테고리별 아이템 관리를 위한 주요 UI 컴포넌트입니다.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  UnfoldLess as UnfoldLessIcon,
  UnfoldMore as UnfoldMoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { useCategories } from "../hooks/useCategories";
import { useItemSettings } from "../hooks/useItemSettings";
import { PanelTypes } from "../types/category";
import { TableItem } from "../types/category";

// 메뉴 위치를 추적하기 위한 인터페이스
interface MenuPosition {
  mouseX: number;
  mouseY: number;
}

const CategoryList: React.FC = () => {
  // useCategories 훅을 통해 카테고리 관련 상태와 함수들을 가져옴
  const {
    categories,
    selectedItem,
    expandedCategories,
    isLoading,
    handleCategoryToggle,
    toggleAllCategories,
    handleAddItem,
    handleDeleteItem,
    handleItemClick,
    isItemSelected,
  } = useCategories();

  const { getCurrentSettings } = useItemSettings();

  // 메뉴 관련 상태 제거
  const handleAddItemClick = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleAddItem(categoryId);
  };

  // 모든 카테고리에 아이템 추가/삭제/삭제 함수들
  const handleAddAllCategories = () => {
    categories.forEach((category) => {
      handleAddItem(category.id);
    });
  };

  const handleRemoveLastFromCategories = () => {
    categories.forEach((category) => {
      if (category.items.length > 0) {
        const lastItem = category.items[category.items.length - 1];
        handleDeleteItem(category.id, lastItem.id);
      }
    });
  };

  const handleClearAllCategories = () => {
    categories.forEach((category) => {
      category.items.forEach((item) => {
        handleDeleteItem(category.id, item.id);
      });
    });
  };

  // 설정 상태를 요약하는 함수
  const getSettingsSummary = (item: TableItem): string => {
    const summaryParts: string[] = [];

    // StoryDriftParameter 설정 요약
    const storyDriftParameterData =
      item.settings[PanelTypes.STORY_DRFIT_PARAMETER];
    if (
      storyDriftParameterData?.deflectionFactor &&
      storyDriftParameterData?.importanceFactor &&
      storyDriftParameterData?.scaleFactor &&
      storyDriftParameterData?.allowableRatio &&
      storyDriftParameterData?.combinations
    ) {
      summaryParts.push(
        `Story Drift Parameter: 
        ${storyDriftParameterData.deflectionFactor},
        ${storyDriftParameterData.importanceFactor},
        ${storyDriftParameterData.scaleFactor},
        ${storyDriftParameterData.allowableRatio},
        ${storyDriftParameterData.combinations.length} registered`
      );
    }

    // StabilityCoefficientParameter 설정 요약
    const stabilityCoefficientParameterData =
      item.settings[PanelTypes.STABILITY_COEFFICIENT_PARAMETER];
    if (
      stabilityCoefficientParameterData?.deflectionFactor &&
      stabilityCoefficientParameterData?.importanceFactor &&
      stabilityCoefficientParameterData?.scaleFactor &&
      stabilityCoefficientParameterData?.combinations
    ) {
      summaryParts.push(
        `StabilityCoefficientParameter: 
        ${stabilityCoefficientParameterData.deflectionFactor}, 
        ${stabilityCoefficientParameterData.importanceFactor}, 
        ${stabilityCoefficientParameterData.scaleFactor},
        ${stabilityCoefficientParameterData.combinations.length} registered`
      );
    }

    // LoadCase 설정 요약 (isChecked의 갯수를 카운트)
    const loadCaseData = item.settings[PanelTypes.LOAD_CASE_NAME];
    if (loadCaseData?.loadCases) {
      const selectedCount = loadCaseData.loadCases.filter(
        (loadCase) => loadCase.isChecked
      ).length;
      summaryParts.push(`LoadCase: ${selectedCount} selected`);
    }

    // Story Drift Method 설정 요약
    const storyDriftMethodData = item.settings[PanelTypes.STORY_DRIFT_METHOD];
    if (storyDriftMethodData?.method) {
      summaryParts.push(`Story Drift Method: ${storyDriftMethodData.method}`);
    }

    // Story Stiffness Method 설정 요약
    const storyStiffnessMethodData =
      item.settings[PanelTypes.STORY_STIFFNESS_METHOD];
    if (storyStiffnessMethodData?.method) {
      summaryParts.push(
        `Story Stiffness Method: ${storyStiffnessMethodData.method}`
      );
    }

    // Angle Setting 설정 요약
    const angleSettingData = item.settings[PanelTypes.ANGLE_SETTING];
    if (angleSettingData?.angle) {
      summaryParts.push(`Angle Setting: ${angleSettingData.angle}`);
    }

    // Unit 설정 요약
    const unitData = item.settings[PanelTypes.SYSTEM_UNIT];
    if (unitData?.force && unitData?.distance) {
      summaryParts.push(`Unit: ${unitData.force}, ${unitData.distance}`);
    }

    // Style 설정 요약
    const styleData = item.settings[PanelTypes.SYSTEM_STYLE];
    if (styleData?.style && styleData?.decimalPlaces) {
      summaryParts.push(
        `Style: ${styleData.style}, ${styleData.decimalPlaces}`
      );
    }
    return summaryParts.length > 0
      ? summaryParts.join("; ")
      : `생성일: ${item.createdAt.toLocaleDateString()}`;
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          position: "relative",
        }}
      >
        <Typography variant="h3">Result Table</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Add All Categories">
            <IconButton onClick={handleAddAllCategories}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Remove Last Item from All Categories">
            <IconButton onClick={handleRemoveLastFromCategories}>
              <RemoveCircleIcon />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Delete All Items from All Categories">
            <IconButton onClick={handleClearAllCategories}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              Object.values(expandedCategories).every((value) => value)
                ? "Collapse All"
                : "Expand All"
            }
          >
            <IconButton onClick={toggleAllCategories}>
              {Object.values(expandedCategories).every((value) => value) ? (
                <UnfoldLessIcon />
              ) : (
                <UnfoldMoreIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          pr: 2,
          cursor: isLoading ? "wait" : "default",
        }}
      >
        {categories.map((category) => (
          <Paper key={category.id} sx={{ mb: 2 }}>
            {/* 카테고리 목록 */}
            <Box
              onClick={() => handleCategoryToggle(category.id)}
              sx={{
                p: 1,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "4px",
                bgcolor: "grey.200",
                "&:hover": {
                  bgcolor: "grey.300",
                },
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {expandedCategories[category.id] ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
                <Typography variant="h2" sx={{ ml: 1 }}>
                  {category.name}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={(e) => handleAddItemClick(category.id, e)}
              >
                Add
              </Button>
            </Box>

            {/* 카테고리 아이템 목록 */}
            <Collapse in={expandedCategories[category.id]}>
              <Box sx={{ p: 2 }}>
                <List>
                  {category.items.map((item) => (
                    <ListItem
                      key={item.id}
                      onClick={() => handleItemClick(category.id, item.id)}
                      sx={{
                        bgcolor: isItemSelected(category.id, item.id)
                          ? "grey.300" // 선택된 아이템 배경색
                          : "transparent", // 선택되지 않은 아이템 배경색
                        color: isItemSelected(category.id, item.id)
                          ? "grey.900" // 선택된 아이템 텍스트 색상
                          : "grey.900", // 선택되지 않은 아이템 텍스트 색상
                        borderRadius: 1,
                        transition: "all 0.2s ease",
                        cursor: isLoading ? "wait" : "pointer",
                        "&:hover": {
                          bgcolor: isItemSelected(category.id, item.id)
                            ? "grey.400" // 선택된 아이템 호버 배경색
                            : "grey.100", // 선택되지 않은 아이템 호버 배경색
                        },
                      }}
                    >
                      {/* <Tooltip
                        title={getSettingsSummary(item)}
                        placement="bottom-start"
                      > */}
                      <ListItemText
                        primary={item.type}
                        secondary={getSettingsSummary(item)}
                        secondaryTypographyProps={{
                          sx: {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          },
                        }}
                      />
                      {/* </Tooltip> */}
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(category.id, item.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {category.items.length === 0 && (
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      No items, Please add new item.
                    </Typography>
                  )}
                </List>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>
    </>
  );
};

export default CategoryList;
