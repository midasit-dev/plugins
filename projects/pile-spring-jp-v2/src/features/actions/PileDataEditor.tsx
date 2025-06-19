/**
 * Pile 데이터 액션 컴포넌트
 * 저장 및 업데이트 기능을 제공하는 버튼 그룹 컴포넌트
 */
import React from "react";
import { GuideBox, Button } from "@midasit-dev/moaui";
import { usePileData, useNotification } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import {
  pileInitSetState,
  pileSectionState,
  pileLocationState,
  pileReinforcedState,
  PileSection,
} from "../../states";
import { VALIDATION_MESSAGES } from "../../constants/validationMessages";
import { validateInputs } from "../../utils";
import { NotificationSeverity } from "../../hooks/useNotification";

interface PileActionsProps {
  onSave?: (id: number) => void;
  onUpdate?: (id: number) => void;
}

const PileDataEditor: React.FC<PileActionsProps> = ({ onSave, onUpdate }) => {
  const { t } = useTranslation();
  const { saveData, updateData, selectedId, selectedItem } = usePileData();
  const { showNotification } = useNotification();

  // 상태 값 가져오기
  const pileInitSet = useRecoilValue(pileInitSetState);
  const pileSections = useRecoilValue(pileSectionState);
  const pileLocations = useRecoilValue(pileLocationState);
  const pileReinforced = useRecoilValue(pileReinforcedState);

  /**
   * 저장 버튼 클릭 핸들러
   * 현재 상태를 새 파일로 저장합니다.
   */
  const handleSaveClick = () => {
    if (
      !validateInputs({
        pileInitSet,
        pileLocations,
        pileReinforced,
        pileSections,
        showNotification: (key, type) =>
          showNotification(key, type as NotificationSeverity),
      })
    ) {
      return;
    }

    const newID = saveData();

    if (newID) {
      const message = VALIDATION_MESSAGES.SAVE_SUCCESS;
      showNotification(message.key, message.type as NotificationSeverity);

      if (onSave) {
        onSave(newID);
      }
    } else {
      const message = VALIDATION_MESSAGES.SAVE_FAILED;
      showNotification(message.key, message.type as NotificationSeverity);
    }
  };

  /**
   * 업데이트 버튼 클릭 핸들러
   * 현재 선택된 파일을 업데이트합니다.
   */
  const handleUpdateClick = () => {
    if (selectedId === null) {
      const message = VALIDATION_MESSAGES.NO_SELECTED_ITEM;
      showNotification(message.key, message.type as NotificationSeverity);
      return;
    }

    if (
      !validateInputs({
        pileInitSet,
        pileLocations,
        pileReinforced,
        pileSections,
        showNotification: (key, type) =>
          showNotification(key, type as NotificationSeverity),
      })
    ) {
      return;
    }

    const success = updateData(selectedId);

    if (success) {
      const message = VALIDATION_MESSAGES.UPDATE_SUCCESS;
      showNotification(message.key, message.type as NotificationSeverity);

      if (onUpdate) {
        onUpdate(selectedId);
      }
    } else {
      const message = VALIDATION_MESSAGES.UPDATE_FAILED;
      showNotification(message.key, message.type as NotificationSeverity);
    }
  };

  return (
    <GuideBox row spacing={1}>
      <Button variant="contained" onClick={handleSaveClick}>
        {t("Pile_Add_Button")}
      </Button>

      <Button
        variant="contained"
        onClick={handleUpdateClick}
        disabled={selectedItem === null}
      >
        {t("Pile_Modify_Button")}
      </Button>
    </GuideBox>
  );
};

export default PileDataEditor;
