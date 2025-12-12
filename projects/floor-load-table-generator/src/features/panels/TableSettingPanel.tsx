import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useFileOperations } from "../hooks/useFileOperations";
import { useFloorLoadState } from "../hooks/useFloorLoadState";
import { useTableSettingHandlers } from "../hooks/useTableSettingHandlers";
import { DeadLoadItem } from "../states/stateFloorLoad";
import { calculateLoad } from "../utils/loadCalculation";

// 애니메이션 스타일
const tableItemStyles = `
  .table-item-enter {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  .table-item-enter-active {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .table-item-exit {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .table-item-exit-active {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
    transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .deadload-item-enter {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  .deadload-item-enter-active {
    opacity: 1;
    transform: translateX(0) scale(1);
    transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .deadload-item-exit {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  .deadload-item-exit-active {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
    transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// 헤더 스타일
const headerCellStyle = {
  textAlign: "center" as const,
  borderRight: "1px solid #e0e0e0",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 8px",
};

const lastHeaderCellStyle = {
  textAlign: "center" as const,
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 8px",
};

// 헤더 셀 컴포넌트
const HeaderCell: React.FC<{ children: React.ReactNode; isLast?: boolean }> = ({
  children,
  isLast,
}) => (
  <Box sx={isLast ? lastHeaderCellStyle : headerCellStyle}>
    <Typography
      variant="body2"
      sx={{
        fontSize: "12px",
        lineHeight: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  </Box>
);

// 테이블 스타일
const tableInputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    border: "none",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
};

// 숫자 입력 스타일
const numberInputStyle = {
  ...tableInputStyle,
  "& .MuiInputBase-input": {
    textAlign: "right",
  },
};

const tableCellStyle = {
  borderRight: "1px solid #e0e0e0",
  height: "32px",
  display: "flex",
  alignItems: "center",
};

// 테이블 셀 컴포넌트
const TableCell: React.FC<{ children: React.ReactNode; isLast?: boolean }> = ({
  children,
  isLast,
}) => (
  <Box
    sx={
      isLast
        ? { height: "32px", display: "flex", alignItems: "center" }
        : tableCellStyle
    }
  >
    {children}
  </Box>
);

interface TableSettingPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<any>>;
  selectedCategoryIndex: number;
}

export const TableSettingPanel: React.FC<TableSettingPanelProps> = ({
  setSnackbar,
  selectedCategoryIndex,
}) => {
  const {
    expandedTables,
    handleAddTable,
    handleRemoveTable,
    handleTableNameChange,
    handleLiveLoadChange,
    handleAddDeadLoad,
    handleRemoveDeadLoad,
    handleDeadLoadChange,
    handleToggleExpand,
    handleToggleAllExpand,
    handleMoveTableUp,
    handleMoveTableDown,
    handleMoveDeadLoadUp,
    handleMoveDeadLoadDown,
    getCurrentTables,
  } = useTableSettingHandlers(setSnackbar, selectedCategoryIndex);

  const currentTables = getCurrentTables();
  const { state: currentState } = useFloorLoadState();
  const [editingTableIndex, setEditingTableIndex] = useState<number | null>(
    null
  );
  const [editingTableName, setEditingTableName] = useState("");
  const [newTableName, setNewTableName] = useState("");

  const {
    isPresetModalOpen,
    openPresetModal,
    closePresetModal,
    applyPreset,
    selectPreset,
    selectedPresetId,
    presets,
  } = useFileOperations();

  const handleAddTableWithName = () => {
    if (!newTableName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a load group name",
        severity: "warning",
      });
      return;
    }

    try {
      handleAddTable(newTableName.trim());
      setNewTableName("");
      setSnackbar({
        open: true,
        message: "Load group added successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error adding load group",
        severity: "error",
      });
    }
  };

  // 선택된 카테고리 정보 가져오기
  const getSelectedCategoryInfo = () => {
    if (
      selectedCategoryIndex >= 0 &&
      selectedCategoryIndex < currentState.table_setting.length
    ) {
      const category = currentState.table_setting[selectedCategoryIndex];
      const categoryName = Object.keys(category)[0];
      return { name: categoryName, tables: category[categoryName] };
    }
    return null;
  };

  const selectedCategory = getSelectedCategoryInfo();

  const handleStartEditTable = (tableIndex: number, currentName: string) => {
    setEditingTableIndex(tableIndex);
    setEditingTableName(currentName);
  };

  const handleSaveTableEdit = (tableIndex: number) => {
    if (!editingTableName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a load group name",
        severity: "warning",
      });
      return;
    }

    try {
      handleTableNameChange(tableIndex, editingTableName.trim());
      setEditingTableIndex(null);
      setEditingTableName("");

      setSnackbar({
        open: true,
        message: "Load group name updated successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating load group name",
        severity: "error",
      });
    }
  };

  const handleCancelTableEdit = () => {
    setEditingTableIndex(null);
    setEditingTableName("");
  };

  return (
    <>
      <style>{tableItemStyles}</style>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          width: 700,
          height: 480,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography variant="h2">Load Group</Typography>
            {selectedCategory && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "11px" }}
              >
                Category: {selectedCategory.name} (
                {selectedCategory.tables.length} tables)
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Load Group Name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              size="small"
              sx={{ width: 200 }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTableWithName();
                }
              }}
              disabled={selectedCategoryIndex < 0}
            />
            <IconButton
              onClick={handleAddTableWithName}
              size="small"
              title="Add Load Group"
              disabled={selectedCategoryIndex < 0}
            >
              <AddCircleIcon />
            </IconButton>
            <IconButton
              onClick={openPresetModal}
              size="small"
              title="Load Preset"
              disabled={selectedCategoryIndex < 0}
            >
              <FileDownloadIcon />
            </IconButton>
            <IconButton
              onClick={handleToggleAllExpand}
              size="small"
              title="Expand/Collapse All"
              disabled={
                !selectedCategory || selectedCategory.tables.length === 0
              }
            >
              <UnfoldMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {selectedCategoryIndex < 0 ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              gap: 2,
            }}
          >
            <Typography variant="h2" color="text.secondary">
              No Category Selected
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Please select a category
              <br />
              or add a new category
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
            <TransitionGroup component={List} sx={{ width: "100%" }}>
              {currentTables.map((table, tableIndex) => {
                const isEditing = editingTableIndex === tableIndex;

                return (
                  <CSSTransition
                    key={`table-${tableIndex}`}
                    timeout={500}
                    classNames="table-item"
                  >
                    <Paper
                      elevation={1}
                      sx={{ mb: 1, border: "1px solid #e0e0e0", width: "98%" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 16px",
                          cursor: "pointer",
                          minHeight: "52px",
                        }}
                        onClick={() => handleToggleExpand(tableIndex)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpand(tableIndex);
                            }}
                            sx={{ mr: 1 }}
                          >
                            {expandedTables.has(tableIndex) ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                          {isEditing ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexGrow: 1,
                              }}
                            >
                              <TextField
                                value={editingTableName}
                                onChange={(e) =>
                                  setEditingTableName(e.target.value)
                                }
                                size="small"
                                sx={{
                                  flexGrow: 1,
                                  "& .MuiInputBase-root": {
                                    height: "36px",
                                  },
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveTableEdit(tableIndex);
                                  } else if (e.key === "Escape") {
                                    handleCancelTableEdit();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveTableEdit(tableIndex);
                                }}
                                color="primary"
                                title="Save"
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelTableEdit();
                                }}
                                color="error"
                                title="Cancel"
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                ml: 1,
                                flexGrow: 1,
                                fontWeight: 500,
                                lineHeight: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {table.name}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {!isEditing && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTable(tableIndex, table.name);
                              }}
                              size="small"
                              title="Edit Load Group Name"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTableUp(tableIndex);
                            }}
                            size="small"
                            title="Move Up"
                            disabled={tableIndex === 0}
                          >
                            <KeyboardArrowUpIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTableDown(tableIndex);
                            }}
                            size="small"
                            title="Move Down"
                            disabled={tableIndex === currentTables.length - 1}
                          >
                            <KeyboardArrowDownIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddDeadLoad(tableIndex);
                            }}
                            size="small"
                            title="Add Sub Load"
                          >
                            <AddCircleIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTable(tableIndex);
                            }}
                            size="small"
                            color="error"
                            title="Delete Load Group"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      {/* 서브 로드 아이템 */}
                      <Collapse
                        in={expandedTables.has(tableIndex)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ p: 2 }}>
                          {/* 테이블 헤더 */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns:
                                "1.5fr 1.3fr 1fr 1fr 1fr 1.2fr",
                              gap: 0,
                              borderTop: "1px solid #e0e0e0",
                              borderBottom: "1px solid #e0e0e0",
                              mb: 0,
                              alignItems: "center",
                              bgcolor: "#f5f5f5",
                              height: "48px",
                            }}
                          >
                            <HeaderCell>Name</HeaderCell>
                            <HeaderCell>Type</HeaderCell>
                            <HeaderCell>
                              <Typography variant="body2">
                                Thickness <br /> (mm)
                              </Typography>
                            </HeaderCell>
                            <HeaderCell>
                              <Typography variant="body2">
                                Unit Weight <br /> (kN/m³)
                              </Typography>
                            </HeaderCell>
                            <HeaderCell>
                              <Typography variant="body2">
                                Load <br /> (kN/m²)
                              </Typography>
                            </HeaderCell>
                            <HeaderCell isLast>Edit</HeaderCell>
                          </Box>

                          {/* 서브 로드 아이템들 */}
                          <TransitionGroup component={Box} disablePadding>
                            {table.dead_load.map(
                              (
                                deadLoad: DeadLoadItem,
                                deadLoadIndex: number
                              ) => (
                                <CSSTransition
                                  key={`deadload-${tableIndex}-${deadLoadIndex}`}
                                  timeout={400}
                                  classNames="deadload-item"
                                >
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "1.5fr 1.3fr 1fr 1fr 1fr 1.2fr",
                                      alignItems: "center",
                                      gap: 0,
                                      padding: "0",
                                      borderBottom: "1px solid #e0e0e0",
                                      height: "32px",
                                    }}
                                  >
                                    {/* Name */}
                                    <TableCell>
                                      <TextField
                                        value={deadLoad.name}
                                        onChange={(e) =>
                                          handleDeadLoadChange(
                                            tableIndex,
                                            deadLoadIndex,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter load name"
                                        sx={tableInputStyle}
                                        fullWidth
                                      />
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                      <FormControl
                                        size="small"
                                        variant="outlined"
                                        sx={tableInputStyle}
                                        fullWidth
                                      >
                                        <Select
                                          value={deadLoad.type}
                                          onChange={(e) =>
                                            handleDeadLoadChange(
                                              tableIndex,
                                              deadLoadIndex,
                                              "type",
                                              e.target.value
                                            )
                                          }
                                        >
                                          <MenuItem value="thickness">
                                            thickness
                                          </MenuItem>
                                          <MenuItem value="load">load</MenuItem>
                                        </Select>
                                      </FormControl>
                                    </TableCell>

                                    {/* Thickness */}
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        value={deadLoad.thickness}
                                        onChange={(e) =>
                                          handleDeadLoadChange(
                                            tableIndex,
                                            deadLoadIndex,
                                            "thickness",
                                            Number(e.target.value)
                                          )
                                        }
                                        inputProps={{ step: 1, min: 0 }}
                                        disabled={deadLoad.type === "load"}
                                        sx={numberInputStyle}
                                        fullWidth
                                      />
                                    </TableCell>

                                    {/* Unit Weight */}
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        value={deadLoad.unit_weight}
                                        onChange={(e) =>
                                          handleDeadLoadChange(
                                            tableIndex,
                                            deadLoadIndex,
                                            "unit_weight",
                                            Number(e.target.value)
                                          )
                                        }
                                        inputProps={{ step: 0.1, min: 0 }}
                                        disabled={deadLoad.type === "load"}
                                        sx={numberInputStyle}
                                        fullWidth
                                      />
                                    </TableCell>

                                    {/* Load */}
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        value={
                                          deadLoad.type === "thickness"
                                            ? calculateLoad(deadLoad).toFixed(3)
                                            : deadLoad.load
                                        }
                                        onChange={(e) =>
                                          handleDeadLoadChange(
                                            tableIndex,
                                            deadLoadIndex,
                                            "load",
                                            Number(e.target.value)
                                          )
                                        }
                                        inputProps={{ step: 0.1, min: 0 }}
                                        disabled={deadLoad.type === "thickness"}
                                        sx={numberInputStyle}
                                        fullWidth
                                      />
                                    </TableCell>

                                    {/* Edit */}
                                    <TableCell isLast>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 0.5,
                                          justifyContent: "center",
                                          width: "100%",
                                        }}
                                      >
                                        <IconButton
                                          onClick={() =>
                                            handleMoveDeadLoadUp(
                                              tableIndex,
                                              deadLoadIndex
                                            )
                                          }
                                          size="small"
                                          title="Move Up"
                                          disabled={deadLoadIndex === 0}
                                        >
                                          <KeyboardArrowUpIcon />
                                        </IconButton>
                                        <IconButton
                                          onClick={() =>
                                            handleMoveDeadLoadDown(
                                              tableIndex,
                                              deadLoadIndex
                                            )
                                          }
                                          size="small"
                                          title="Move Down"
                                          disabled={
                                            deadLoadIndex ===
                                            table.dead_load.length - 1
                                          }
                                        >
                                          <KeyboardArrowDownIcon />
                                        </IconButton>
                                        <IconButton
                                          onClick={() =>
                                            handleRemoveDeadLoad(
                                              tableIndex,
                                              deadLoadIndex
                                            )
                                          }
                                          size="small"
                                          color="error"
                                          title="Delete Sub Load"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  </Box>
                                </CSSTransition>
                              )
                            )}
                          </TransitionGroup>

                          {/* Live Load (기본 항목) */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns:
                                "1.5fr 1.3fr 1fr 1fr 1fr 1.2fr",
                              gap: 0,
                              padding: "0",
                              bgcolor: "#f5f5f5",
                              borderRadius: 0,
                              alignItems: "center",
                              borderBottom: "1px solid #e0e0e0",
                              height: "32px",
                            }}
                          >
                            <Box sx={tableCellStyle}>
                              <Typography variant="body2" sx={{ pl: 1 }}>
                                LL (default)
                              </Typography>
                            </Box>
                            <Box sx={tableCellStyle}>
                              <Typography
                                variant="body2"
                                sx={{ textAlign: "center", width: "100%" }}
                              >
                                -
                              </Typography>
                            </Box>
                            <Box sx={tableCellStyle}>
                              <Typography
                                variant="body2"
                                sx={{ textAlign: "center", width: "100%" }}
                              >
                                -
                              </Typography>
                            </Box>
                            <Box sx={tableCellStyle}>
                              <Typography
                                variant="body2"
                                sx={{ textAlign: "center", width: "100%" }}
                              >
                                -
                              </Typography>
                            </Box>
                            <TableCell>
                              <TextField
                                type="number"
                                value={table.live_load}
                                onChange={(e) =>
                                  handleLiveLoadChange(
                                    tableIndex,
                                    Number(e.target.value)
                                  )
                                }
                                inputProps={{ step: 0.1, min: 0 }}
                                sx={numberInputStyle}
                                fullWidth
                              />
                            </TableCell>
                          </Box>
                        </Box>
                      </Collapse>
                    </Paper>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>
          </Box>
        )}
      </Paper>

      {/* 프리셋 선택 모달 */}
      <Dialog
        open={isPresetModalOpen}
        onClose={closePresetModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Preset</DialogTitle>
        <DialogContent>
          <List>
            {presets.map((preset) => (
              <ListItem
                key={preset.id}
                button
                onClick={() => selectPreset(preset.id)}
                selected={selectedPresetId === preset.id}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#e3f2fd",
                    borderColor: "#2196f3",
                  },
                }}
              >
                <ListItemText
                  primary={preset.name}
                  secondary={preset.description}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePresetModal} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => applyPreset(selectedCategoryIndex)}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
