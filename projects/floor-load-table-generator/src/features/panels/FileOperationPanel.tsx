import React, { useState } from "react";
import {
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useFileOperations } from "../hooks/useFileOperations";

interface FileOperationPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<any>>;
}

export const FileOperationPanel: React.FC<FileOperationPanelProps> = ({
  setSnackbar,
}) => {
  const {
    saveToFile,
    loadFromFile,
    isPresetModalOpen,
    openPresetModal,
    closePresetModal,
    applyPreset,
    selectPreset,
    selectedPresetId,
    presets,
  } = useFileOperations();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLoadMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLoadMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLocalLoad = () => {
    loadFromFile();
    handleLoadMenuClose();
  };

  const handlePresetLoad = () => {
    openPresetModal();
    handleLoadMenuClose();
  };

  const handleSave = () => {
    try {
      saveToFile();
      setSnackbar({
        open: true,
        message: "Settings saved successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving settings.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* 저장 버튼 */}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ minWidth: 100 }}
          >
            Save
          </Button>

          {/* 불러오기 버튼 그룹 */}
          <Box sx={{ display: "flex" }}>
            <Button
              variant="contained"
              startIcon={<FolderOpenIcon />}
              onClick={handleLocalLoad}
              sx={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: "none",
                minWidth: 100,
              }}
            >
              Load
            </Button>
            <Divider orientation="vertical" flexItem />
            <IconButton
              onClick={handleLoadMenuClick}
              sx={{
                backgroundColor: "#EEEEEE",
                border: "1px solid rgba(0, 0, 0, 0.23)",
                borderLeft: "none",
                borderRadius: "0 4px 4px 0",
                "&:hover": {
                  backgroundColor: "#5F666B",
                  color: "#FFFFFF",
                },
              }}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 불러오기 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleLoadMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem onClick={handleLocalLoad}>
            <FolderOpenIcon sx={{ mr: 1 }} />
            Load from Local PC
          </MenuItem>
          <Divider />
          <MenuItem onClick={handlePresetLoad}>
            <SaveIcon sx={{ mr: 1 }} />
            Load Preset
          </MenuItem>
        </Menu>
      </Box>

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
          <Button onClick={applyPreset} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
