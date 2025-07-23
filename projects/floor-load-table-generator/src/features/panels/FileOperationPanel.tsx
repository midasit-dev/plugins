import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button } from "@mui/material";
import React from "react";
import { useFileOperations } from "../hooks/useFileOperations";

interface FileOperationPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<any>>;
}

export const FileOperationPanel: React.FC<FileOperationPanelProps> = ({
  setSnackbar,
}) => {
  const { saveToFile, loadFromFile } = useFileOperations();

  const handleLocalLoad = () => {
    loadFromFile();
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

          {/* 불러오기 버튼 */}
          <Button
            variant="contained"
            startIcon={<FolderOpenIcon />}
            onClick={handleLocalLoad}
            sx={{ minWidth: 100 }}
          >
            Load
          </Button>
        </Box>
      </Box>
    </>
  );
};
