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
  Menu,
  MenuItem,
} from "@mui/material";
import {
  UnfoldLess as UnfoldLessIcon,
  UnfoldMore as UnfoldMoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useCategories } from "../hooks/useCategories";

// 메뉴 위치를 추적하기 위한 인터페이스
interface MenuPosition {
  mouseX: number;
  mouseY: number;
}

const CategoryList: React.FC = () => {
  // useCategories 훅을 통해 카테고리 관련 상태와 함수들을 가져옴
  const {
    categories,
    expandedCategories,
    handleCategoryToggle,
    toggleAllCategories,
    handleAddItem,
    handleDeleteItem,
    handleItemClick,
    isItemSelected,
  } = useCategories();

  // 메뉴 위치와 현재 선택된 카테고리 상태 관리
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  const handleAddItemClick = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const category = categories.find((c) => c.id === categoryId);

    if (category && category.availableItems.length > 1) {
      setCurrentCategory(categoryId);
      setMenuPosition({
        mouseX: event.clientX,
        mouseY: event.clientY,
      });
    } else if (category && category.availableItems.length === 1) {
      handleAddItem(categoryId, category.availableItems[0]);
    }
  };

  const handleMenuClose = () => {
    setMenuPosition(null);
    setCurrentCategory(null);
  };

  const handleItemSelect = (itemType: string) => {
    if (currentCategory) {
      handleAddItem(currentCategory, itemType);
      handleMenuClose();
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">구조 해석 결과</Typography>
        <IconButton
          onClick={toggleAllCategories}
          sx={{ ml: 2 }}
          title={
            Object.values(expandedCategories).every((value) => value)
              ? "모든 카테고리 접기"
              : "모든 카테고리 펼치기"
          }
        >
          {Object.values(expandedCategories).every((value) => value) ? (
            <UnfoldLessIcon />
          ) : (
            <UnfoldMoreIcon />
          )}
        </IconButton>
      </Box>

      <Box
        sx={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          pr: 2,
          mr: -2,
        }}
      >
        {categories.map((category) => (
          <Paper key={category.id} sx={{ mb: 2 }}>
            <Box
              onClick={() => handleCategoryToggle(category.id)}
              sx={{
                p: 2,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "grey.100",
                borderRadius: "4px 4px 0 0",
                "&:hover": {
                  bgcolor: "grey.200",
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
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {category.name}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={(e) => handleAddItemClick(category.id, e)}
                size="small"
              >
                항목 추가
              </Button>
            </Box>

            <Collapse in={expandedCategories[category.id]}>
              <Box sx={{ p: 2 }}>
                <List>
                  {category.items.map((item) => (
                    <ListItem
                      key={item.id}
                      onClick={() => handleItemClick(category.id, item.id)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: isItemSelected(category.id, item.id)
                          ? "primary.light"
                          : "transparent",
                        color: isItemSelected(category.id, item.id)
                          ? "primary.contrastText"
                          : "inherit",
                        borderRadius: 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: isItemSelected(category.id, item.id)
                            ? "primary.main"
                            : "action.hover",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.type}
                        secondary={`생성일: ${item.createdAt.toLocaleDateString()}`}
                      />
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
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        py: 2,
                        color: "text.secondary",
                      }}
                    >
                      아직 항목이 없습니다. 새로운 항목을 추가해보세요!
                    </Typography>
                  )}
                </List>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>

      <Menu
        open={menuPosition !== null}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          menuPosition !== null
            ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
            : undefined
        }
      >
        {currentCategory &&
          categories
            .find((c) => c.id === currentCategory)
            ?.availableItems.map((itemType) => (
              <MenuItem
                key={itemType}
                onClick={() => handleItemSelect(itemType)}
              >
                {itemType}
              </MenuItem>
            ))}
      </Menu>
    </>
  );
};

export default CategoryList;
