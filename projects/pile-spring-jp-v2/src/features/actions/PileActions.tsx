import React, { useState } from "react";
import {
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import { GuideBox, Button } from "@midasit-dev/moaui";
import { usePileData } from "../../hooks/usePileData";
import { useTranslation } from "react-i18next";

interface PileActionsProps {
  // 저장/불러오기 액션 후 실행할 콜백 (선택 사항)
  onSave?: (id: number) => void;
  onUpdate?: (id: number) => void;
}

const PileActions: React.FC<PileActionsProps> = ({ onSave, onUpdate }) => {
  const { t } = useTranslation();
  const { saveData, updateData, selectedId } = usePileData();

  // 다이얼로그 상태

  // 저장 버튼 클릭
  const handleSaveClick = () => {
    const newID = saveData();
    if (newID && onSave) {
      onSave(newID);
    }
  };

  // 업데이트 버튼 클릭 (즉시 처리)
  const handleUpdateClick = () => {
    if (selectedId === null) return;

    updateData(selectedId);
    if (onUpdate) {
      onUpdate(selectedId);
    }
  };

  return (
    <GuideBox>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSaveClick}>
          {t("Save_As_New")}
        </Button>

        <Button
          variant="contained"
          onClick={handleUpdateClick}
          disabled={selectedId === null}
        >
          {t("Update_Selected")}
        </Button>
      </Stack>
    </GuideBox>
  );
};

export default PileActions;
