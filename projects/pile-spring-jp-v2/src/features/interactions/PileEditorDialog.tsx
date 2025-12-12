/**
 * @fileoverview 말뚝 데이터 액션 컴포넌트
 * @description
 * 말뚝 데이터 액션 컴포넌트를 표시하고, 말뚝 데이터를 저장 및 업데이트합니다.
 */

import React from "react";
import { Button } from "@midasit-dev/moaui";
import { CustomBox } from "../../components";
import { usePileDomain, useNotification } from "../../hooks";
import { useTranslation } from "react-i18next";
import { VALIDATION_MESSAGES_PILE } from "../../constants/common/validationMessages";
import { validatePileData } from "../../utils/validators/pileValidation";
import { NotificationSeverity } from "../../hooks/common/useNotification";
import { PILE_EDITOR_DIALOG } from "../../constants/common/translations";

interface PileActionsProps {
  onSave?: (id: number) => void;
  onUpdate?: (id: number) => void;
}

const PileDataEditor: React.FC<PileActionsProps> = ({ onSave, onUpdate }) => {
  const { t } = useTranslation();
  const {
    saveData,
    updateData,
    selectedPileDataId,
    selectedPile,
    currentPile,
  } = usePileDomain();
  const { showNotification } = useNotification();

  /**
   * 저장 버튼 클릭 핸들러
   * 현재 상태를 새 파일로 저장합니다.
   */
  const handleSaveClick = () => {
    if (
      !validatePileData({
        pileInitSet: currentPile.initSet,
        pileLocations: currentPile.locations,
        pileReinforced: currentPile.reinforced,
        pileSections: currentPile.sections,
        showNotification: (key, type) =>
          showNotification(key, type as NotificationSeverity),
      })
    ) {
      return;
    }

    const newID = saveData();

    if (newID) {
      const message = VALIDATION_MESSAGES_PILE.SAVE_SUCCESS;
      showNotification(message.key, message.type as NotificationSeverity);

      if (onSave) {
        onSave(newID);
      }
    } else {
      const message = VALIDATION_MESSAGES_PILE.SAVE_FAILED;
      showNotification(message.key, message.type as NotificationSeverity);
    }
  };

  /**
   * 업데이트 버튼 클릭 핸들러
   * 현재 선택된 파일을 업데이트합니다.
   */
  const handleUpdateClick = () => {
    if (selectedPileDataId === null) {
      const message = VALIDATION_MESSAGES_PILE.NO_SELECTED_ITEM;
      showNotification(message.key, message.type as NotificationSeverity);
      return;
    }

    if (
      !validatePileData({
        pileInitSet: currentPile.initSet,
        pileLocations: currentPile.locations,
        pileReinforced: currentPile.reinforced,
        pileSections: currentPile.sections,
        showNotification: (key, type) =>
          showNotification(key, type as NotificationSeverity),
      })
    ) {
      return;
    }

    const success = updateData(selectedPileDataId);

    if (success) {
      const message = VALIDATION_MESSAGES_PILE.UPDATE_SUCCESS;
      showNotification(message.key, message.type as NotificationSeverity);

      if (onUpdate) {
        onUpdate(selectedPileDataId);
      }
    } else {
      const message = VALIDATION_MESSAGES_PILE.UPDATE_FAILED;
      showNotification(message.key, message.type as NotificationSeverity);
    }
  };

  return (
    <CustomBox
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
      }}
    >
      <Button variant="contained" onClick={handleSaveClick}>
        {t(PILE_EDITOR_DIALOG.PILE_ADD_BUTTON)}
      </Button>

      <Button
        variant="contained"
        onClick={handleUpdateClick}
        disabled={selectedPile === null}
      >
        {t(PILE_EDITOR_DIALOG.PILE_MODIFY_BUTTON)}
      </Button>
    </CustomBox>
  );
};

export default PileDataEditor;
