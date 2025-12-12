import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useFloorLoadState } from "../hooks/useFloorLoadState";
import { SnackbarState } from "../hooks/useSnackbarMessage";
import {
  addCategory,
  moveCategoryDown,
  moveCategoryUp,
  removeCategory,
  updateCategoryName,
} from "../states/stateFloorLoad";

interface CategoryPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
  selectedCategoryIndex: number;
  onCategorySelect: (index: number) => void;
}

export const CategoryPanel: React.FC<CategoryPanelProps> = ({
  setSnackbar,
  selectedCategoryIndex,
  onCategorySelect,
}) => {
  const { state: currentState, notifyStateChange } = useFloorLoadState();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a category name",
        severity: "warning",
      });
      return;
    }

    try {
      addCategory(newCategoryName.trim());
      notifyStateChange();
      setNewCategoryName("");

      // 새로 추가된 카테고리를 자동으로 선택
      const newCategoryIndex = currentState.table_setting.length;
      onCategorySelect(newCategoryIndex);

      setSnackbar({
        open: true,
        message: "Category added successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error adding category",
        severity: "error",
      });
    }
  };

  const handleRemoveCategory = (index: number) => {
    try {
      removeCategory(index);
      notifyStateChange();

      // 삭제된 카테고리가 현재 선택된 카테고리였다면 첫 번째 카테고리 선택
      if (index === selectedCategoryIndex) {
        const newState = { ...currentState };
        newState.table_setting = newState.table_setting.filter(
          (_, i) => i !== index
        );
        if (newState.table_setting.length > 0) {
          onCategorySelect(0);
        } else {
          onCategorySelect(-1); // 카테고리가 없으면 -1
        }
      } else if (index < selectedCategoryIndex) {
        // 삭제된 카테고리가 현재 선택된 카테고리보다 앞에 있었다면 인덱스 조정
        onCategorySelect(selectedCategoryIndex - 1);
      }

      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting category",
        severity: "error",
      });
    }
  };

  const handleMoveCategoryUp = (index: number) => {
    try {
      moveCategoryUp(index);
      notifyStateChange();

      // 이동된 카테고리가 현재 선택된 카테고리였다면 인덱스 조정
      if (index === selectedCategoryIndex) {
        onCategorySelect(index - 1);
      } else if (index - 1 === selectedCategoryIndex) {
        onCategorySelect(index);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error moving category",
        severity: "error",
      });
    }
  };

  const handleMoveCategoryDown = (index: number) => {
    try {
      moveCategoryDown(index);
      notifyStateChange();

      // 이동된 카테고리가 현재 선택된 카테고리였다면 인덱스 조정
      if (index === selectedCategoryIndex) {
        onCategorySelect(index + 1);
      } else if (index + 1 === selectedCategoryIndex) {
        onCategorySelect(index);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error moving category",
        severity: "error",
      });
    }
  };

  const handleCategoryClick = (index: number) => {
    onCategorySelect(index);
  };

  const handleStartEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingName(currentName);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a category name",
        severity: "warning",
      });
      return;
    }

    try {
      updateCategoryName(index, editingName.trim());
      notifyStateChange();
      setEditingIndex(null);
      setEditingName("");

      setSnackbar({
        open: true,
        message: "Category name updated successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating category name",
        severity: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingName("");
  };

  return (
    <Paper elevation={1} sx={{ padding: 2, width: 300, height: 480 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h2">Category</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCategory();
              }
            }}
          />
          <IconButton
            onClick={handleAddCategory}
            color="primary"
            size="small"
            title="Add Category"
          >
            <AddIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: 350,
            border: "1px solid #ddd",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {currentState.table_setting.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                gap: 1,
                p: 2,
              }}
            >
              <Typography
                variant="h2"
                color="text.secondary"
                textAlign="center"
              >
                No category
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Please add a category
              </Typography>
            </Box>
          ) : (
            <List dense>
              {currentState.table_setting.map((category, index) => {
                const categoryName = Object.keys(category)[0];
                const tableCount = category[categoryName].length;
                const isEditing = editingIndex === index;

                return (
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      borderBottom: "1px solid #f0f0f0",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    {isEditing ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: "8px 16px",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <TextField
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          size="small"
                          sx={{ flex: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(index);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleSaveEdit(index)}
                          color="primary"
                          title="Save"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleCancelEdit()}
                          color="error"
                          title="Cancel"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <ListItemButton
                        onClick={() => handleCategoryClick(index)}
                        selected={index === selectedCategoryIndex}
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "#e3f2fd",
                            "&:hover": {
                              backgroundColor: "#bbdefb",
                            },
                          },
                        }}
                      >
                        <ListItemText
                          primary={categoryName}
                          secondary={`${tableCount} tables`}
                          primaryTypographyProps={{ fontSize: "12px" }}
                          secondaryTypographyProps={{ fontSize: "10px" }}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(index, categoryName);
                              }}
                              title="Edit Category Name"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveCategoryUp(index);
                              }}
                              disabled={index === 0}
                              title="Move Up"
                            >
                              <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveCategoryDown(index);
                              }}
                              disabled={
                                index === currentState.table_setting.length - 1
                              }
                              title="Move Down"
                            >
                              <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCategory(index);
                              }}
                              color="error"
                              title="Delete Category"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
