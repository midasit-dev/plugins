import { PictureAsPdf, Send } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  List,
  ListItem,
} from "@mui/material";
import React, { useState } from "react";
import { useFloorLoadState } from "../hooks/useFloorLoadState";
import { SnackbarState } from "../hooks/useSnackbarMessage";
import { exportFloorLoad } from "../utils/exportFloorLoad";
import { pdfCreator } from "../utils/pdfCreator";

interface ExportPanelProps {
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

type ExportType = "pdf" | "midas";

const ExportPanel: React.FC<ExportPanelProps> = ({ setSnackbar }) => {
  const { state: floorLoadData } = useFloorLoadState();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [exportType, setExportType] = useState<ExportType>("pdf");

  // 스낵바 메시지 표시 함수
  const showMessage = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // 카테고리 목록 가져오기
  const getCategoryNames = () => {
    return floorLoadData.table_setting.map(
      (category) => Object.keys(category)[0]
    );
  };

  // 카테고리 선택 모달 열기
  const handleOpenCategoryModal = (type: ExportType) => {
    const categoryNames = getCategoryNames();
    setSelectedCategories(new Set(categoryNames)); // 기본적으로 모든 카테고리 선택
    setExportType(type);
    setIsCategoryModalOpen(true);
  };

  // 카테고리 선택 모달 닫기
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // 카테고리 선택 상태 변경
  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  // 선택된 카테고리만 포함하는 데이터 생성
  const getFilteredFloorLoadData = () => {
    const filteredTableSetting = floorLoadData.table_setting.filter(
      (category) => {
        const categoryName = Object.keys(category)[0];
        return selectedCategories.has(categoryName);
      }
    );

    return {
      ...floorLoadData,
      table_setting: filteredTableSetting,
    };
  };

  // PDF 출력 함수
  const handleExportToPDF = async () => {
    try {
      const filteredData = getFilteredFloorLoadData();
      await pdfCreator(filteredData, showMessage);
      handleCloseCategoryModal();
    } catch (error) {
      console.error("PDF Export Error:", error);
    }
  };

  // MIDAS API 전송 함수
  const handleSendToMidas = async () => {
    try {
      const filteredData = getFilteredFloorLoadData();
      await exportFloorLoad(filteredData, showMessage);
      handleCloseCategoryModal();
    } catch (error) {
      console.error("MIDAS API Error:", error);
    }
  };

  // 모달 제목과 버튼 텍스트 결정
  const getModalTitle = () => {
    return exportType === "pdf"
      ? "Select categories to export to PDF"
      : "Select categories to send to MIDAS";
  };

  const getActionButtonText = () => {
    return exportType === "pdf" ? "Export to PDF" : "Send to MIDAS";
  };

  const getActionButtonHandler = () => {
    return exportType === "pdf" ? handleExportToPDF : handleSendToMidas;
  };

  const categoryNames = getCategoryNames();

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<PictureAsPdf />}
          onClick={() => handleOpenCategoryModal("pdf")}
          sx={{ minWidth: 150 }}
        >
          Export to PDF
        </Button>

        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={() => handleOpenCategoryModal("midas")}
          sx={{ minWidth: 150 }}
        >
          Send to MIDAS
        </Button>
      </Box>

      {/* 카테고리 선택 모달 */}
      <Dialog
        open={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogContent>
          <List>
            {categoryNames.map((categoryName, index) => (
              <React.Fragment key={categoryName}>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCategories.has(categoryName)}
                        onChange={() => handleCategoryToggle(categoryName)}
                      />
                    }
                    label={categoryName}
                  />
                </ListItem>
                {index < categoryNames.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryModal}>Cancel</Button>
          <Button
            onClick={getActionButtonHandler()}
            variant="contained"
            disabled={selectedCategories.size === 0}
          >
            {getActionButtonText()}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportPanel;
