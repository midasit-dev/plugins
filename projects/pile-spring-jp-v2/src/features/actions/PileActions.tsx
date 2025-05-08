/**
 * Pile 데이터 액션 컴포넌트
 * 저장 및 업데이트 기능을 제공하는 버튼 그룹 컴포넌트
 */
import React from "react";
import { GuideBox, Button } from "@midasit-dev/moaui";
import { usePileData, useNotification } from "../../hooks";
import { useTranslation } from "react-i18next";

interface PileActionsProps {
  onSave?: (id: number) => void;
  onUpdate?: (id: number) => void;
}

const PileActions: React.FC<PileActionsProps> = ({ onSave, onUpdate }) => {
  const { t } = useTranslation();
  const { saveData, updateData, selectedId, selectedItem } = usePileData();
  const { showNotification } = useNotification();

  /**
   * 저장 버튼 클릭 핸들러
   * 현재 상태를 새 파일로 저장합니다.
   */
  const handleSaveClick = () => {
    const newID = saveData();

    if (newID) {
      showNotification("Save_Success", "success");

      if (onSave) {
        onSave(newID);
      }
    } else {
      showNotification("Save_Failed", "error");
    }
  };

  /**
   * 업데이트 버튼 클릭 핸들러
   * 현재 선택된 파일을 업데이트합니다.
   */
  const handleUpdateClick = () => {
    if (selectedId === null) {
      showNotification("No_Selected_Item", "warning");
      return;
    }

    const success = updateData(selectedId);

    if (success) {
      showNotification("Update_Success", "success");

      if (onUpdate) {
        onUpdate(selectedId);
      }
    } else {
      showNotification("Update_Failed", "error");
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

export default PileActions;
