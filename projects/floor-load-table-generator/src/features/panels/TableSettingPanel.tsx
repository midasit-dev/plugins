import React from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemButton,
  Chip,
  Divider,
} from "@mui/material";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { DeadLoadItem } from "../states/stateFloorLoad";
import { useTableSettingHandlers } from "../hooks/useTableSettingHandlers";
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
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 0",
};

const lastHeaderCellStyle = {
  textAlign: "center" as const,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 0",
};

// 헤더 셀 컴포넌트
const HeaderCell: React.FC<{ children: React.ReactNode; isLast?: boolean }> = ({
  children,
  isLast,
}) => (
  <Box sx={isLast ? lastHeaderCellStyle : headerCellStyle}>
    <Typography variant="body2">{children}</Typography>
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
  height: "100%",
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
        ? { height: "100%", display: "flex", alignItems: "center" }
        : tableCellStyle
    }
  >
    {children}
  </Box>
);

interface TableSettingPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<any>>;
}

export const TableSettingPanel: React.FC<TableSettingPanelProps> = ({
  setSnackbar,
}) => {
  const {
    currentState,
    expandedTables,
    handleAddTable,
    handleRemoveTable,
    handleTableNameChange,
    handleLiveLoadChange,
    handleAddDeadLoad,
    handleRemoveDeadLoad,
    handleDeadLoadChange,
    handleToggleExpand,
    handleClearAll,
    handleToggleAllExpand,
    handleMoveTableUp,
    handleMoveTableDown,
    handleMoveDeadLoadUp,
    handleMoveDeadLoadDown,
  } = useTableSettingHandlers(setSnackbar);

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
          <Typography variant="h2">Load Group Setting</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={handleToggleAllExpand}
              size="small"
              title="Expand/Collapse All"
            >
              <UnfoldMoreIcon />
            </IconButton>
            <IconButton
              onClick={handleAddTable}
              size="small"
              title="Add Load Group"
            >
              <AddCircleIcon />
            </IconButton>
            <IconButton
              onClick={handleClearAll}
              size="small"
              title="Clear All"
              color="error"
            >
              <DeleteSweepIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
          <TransitionGroup component={List} sx={{ width: "100%" }}>
            {currentState.table_setting.map((table, tableIndex) => (
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
                      padding: 1,
                      cursor: "pointer",
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
                      {expandedTables.has(tableIndex) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                      <TextField
                        value={table.name}
                        onChange={(e) =>
                          handleTableNameChange(tableIndex, e.target.value)
                        }
                        sx={{ ml: 1, width: 250 }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Enter load group name"
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
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
                        disabled={
                          tableIndex === currentState.table_setting.length - 1
                        }
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
                          gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr",
                          gap: 0,
                          borderTop: "1px solid #e0e0e0",
                          borderBottom: "1px solid #e0e0e0",
                          mb: 0,
                          alignItems: "center",
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        <HeaderCell>Name</HeaderCell>
                        <HeaderCell>Type</HeaderCell>
                        <HeaderCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">Thickness</Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              (mm)
                            </Typography>
                          </Box>
                        </HeaderCell>
                        <HeaderCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">Unit Weight</Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              (kN/m³)
                            </Typography>
                          </Box>
                        </HeaderCell>
                        <HeaderCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">Load</Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              (kN/m²)
                            </Typography>
                          </Box>
                        </HeaderCell>
                        <HeaderCell isLast>Edit</HeaderCell>
                      </Box>

                      {/* Dead Load 항목들 */}
                      <TransitionGroup component={Box} disablePadding>
                        {table.dead_load.map(
                          (deadLoad: DeadLoadItem, deadLoadIndex: number) => (
                            <CSSTransition
                              key={`deadload-${tableIndex}-${deadLoadIndex}`}
                              timeout={400}
                              classNames="deadload-item"
                            >
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "1.5fr 1.5fr 1fr 1fr 1fr 1fr",
                                  alignItems: "center",
                                  gap: 0,
                                  padding: "0",
                                  borderBottom: "1px solid #e0e0e0",
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
                          gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr",
                          gap: 0,
                          padding: "0",
                          bgcolor: "#f5f5f5",
                          borderRadius: 0,
                          alignItems: "center",
                          borderBottom: "1px solid #e0e0e0",
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
                        <Box
                          sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ textAlign: "center", width: "100%" }}
                          >
                            -
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </Box>
      </Paper>
    </>
  );
};
