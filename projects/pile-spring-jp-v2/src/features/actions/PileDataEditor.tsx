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
   * 입력값 검증 함수
   * @returns {boolean} 검증 성공 여부
   */
  const validateInputs = (): boolean => {
    // 1. 기본 정보 검증
    // 1.1 말뚝 명칭 (문자열이 있는지 검증)
    if (!pileInitSet.pileName.trim()) {
      const message = VALIDATION_MESSAGES.PILE_NAME_REQUIRED;
      showNotification(message.key, message.type);
      return false;
    }

    // 1.2 말뚝 길이 (필요 없음: 자동계산 됨)
    // 1.3 저면 표고 (숫자인지 검증)
    if (
      typeof pileInitSet.topLevel !== "number" ||
      isNaN(pileInitSet.topLevel)
    ) {
      const message = VALIDATION_MESSAGES.TOP_LEVEL_INVALID;
      showNotification(message.key, message.type);
      return false;
    }

    // 1.4 말뚝머리 접합조건 (필요 없음: 선택 리스트)
    // 1.5 시공방법 (필요 없음: 선택 리스트)
    // 1.6 말뚝 선단 조건 (필요 없음: 선택 리스트)

    // 2. 말뚝 배치 정보 검증
    for (const location of pileLocations) {
      // 2.1 참조기준 검증 (필요 없음: 선택 리스트)
      // 2.2 위치값 검증 (숫자인지 검증)
      if (typeof location.loc !== "number" || isNaN(location.loc)) {
        const message = VALIDATION_MESSAGES.LOCATION_SPACE_INVALID;
        showNotification(message.key, message.type);
        return false;
      }

      // 2.3 간격 검증
      if (location.space.length > 0) {
        for (const space of location.space) {
          if (space <= 0) {
            const message = VALIDATION_MESSAGES.SPACE_INVALID;
            showNotification(message.key, message.type);
            return false;
          }
        }
      }

      // 2.4 각도 검증
      if (location.angle.length !== location.space.length + 1) {
        const message = VALIDATION_MESSAGES.ANGLE_LENGTH_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
      for (const angle of location.angle) {
        if (typeof angle !== "number" || isNaN(angle)) {
          const message = VALIDATION_MESSAGES.ANGLE_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }
    }

    // 3. 보강 정보 검증
    const checkedReinforced = pileReinforced.filter(
      (reinforced) => reinforced.checked
    );

    // 3.1 체크박스 검증
    if (!pileReinforced[0].checked && pileReinforced[1].checked) {
      const message = VALIDATION_MESSAGES.REINFORCED_CHECK_INVALID;
      showNotification(message.key, message.type);
      return false;
    }

    for (const reinforced of checkedReinforced) {
      // 3.2 보강 방법 검증 (필요 없음: 상수값임)
      // 3.3 시작점과 끝점 검증
      // 시작점은 음수이면 안됨
      if (reinforced.start <= 0) {
        const message = VALIDATION_MESSAGES.REINFORCED_START_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
      // 끝점은 시작점보다 작거나 같으면 안됨
      if (reinforced.end <= reinforced.start) {
        const message = VALIDATION_MESSAGES.REINFORCED_END_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
      // 시작점과 끝점은 말뚝 길이를 초과할 수 없음
      if (
        reinforced.start > pileInitSet.pileLength ||
        reinforced.end > pileInitSet.pileLength
      ) {
        const message = VALIDATION_MESSAGES.REINFORCED_POINT_EXCEED_LENGTH;
        showNotification(message.key, message.type);
        return false;
      }

      // 3.4 두께와 탄성계수 검증
      // 두께는 음수이면 안됨
      if (reinforced.thickness <= 0) {
        const message = VALIDATION_MESSAGES.REINFORCED_THICKNESS_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
      // 탄성계수는 음수이면 안됨
      if (reinforced.modulus <= 0) {
        const message = VALIDATION_MESSAGES.REINFORCED_MODULUS_INVALID;
        showNotification(message.key, message.type);
        return false;
      }
    }

    // 4. 단면 정보 검증
    const checkedSections = pileSections.filter((section) => section.checked);

    // 4.1 선택된 단면들의 유효성 검증
    for (const section of checkedSections) {
      // 4.1 단면 길이 검증
      if (section.length <= 0) {
        const message = VALIDATION_MESSAGES.SECTION_LENGTH_INVALID;
        showNotification(message.key, message.type);
        return false;
      }

      // 4.2 단면 타입별 검증
      if (section.pileType === "Cast_In_Situ") {
        if (section.concrete_diameter <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_modulus <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_diameter <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_modulus <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }

      if (section.pileType === "PHC_Pile") {
        if (section.concrete_diameter <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_thickness <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_modulus <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_diameter <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_modulus <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_cor_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_COR_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }

      if (section.pileType === "SC_Pile") {
        if (section.concrete_diameter <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_thickness <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_modulus <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_modulus <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_cor_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_COR_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }

      if (section.pileType === "Steel_Pile") {
        if (section.steel_diameter <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_modulus <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_cor_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_COR_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }

      if (section.pileType === "Soil_Cement_Pile") {
        if (section.concrete_diameter <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.concrete_modulus <= 0) {
          const message = VALIDATION_MESSAGES.CONCRETE_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_diameter <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_DIAMETER_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_modulus <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_MODULUS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
        if (section.steel_cor_thickness <= 0) {
          const message = VALIDATION_MESSAGES.STEEL_COR_THICKNESS_INVALID;
          showNotification(message.key, message.type);
          return false;
        }
      }
    }

    return true;
  };

  /**
   * 저장 버튼 클릭 핸들러
   * 현재 상태를 새 파일로 저장합니다.
   */
  const handleSaveClick = () => {
    if (!validateInputs()) {
      return;
    }

    const newID = saveData();

    if (newID) {
      const message = VALIDATION_MESSAGES.SAVE_SUCCESS;
      showNotification(message.key, message.type);

      if (onSave) {
        onSave(newID);
      }
    } else {
      const message = VALIDATION_MESSAGES.SAVE_FAILED;
      showNotification(message.key, message.type);
    }
  };

  /**
   * 업데이트 버튼 클릭 핸들러
   * 현재 선택된 파일을 업데이트합니다.
   */
  const handleUpdateClick = () => {
    if (selectedId === null) {
      const message = VALIDATION_MESSAGES.NO_SELECTED_ITEM;
      showNotification(message.key, message.type);
      return;
    }

    if (!validateInputs()) {
      return;
    }

    const success = updateData(selectedId);

    if (success) {
      const message = VALIDATION_MESSAGES.UPDATE_SUCCESS;
      showNotification(message.key, message.type);

      if (onUpdate) {
        onUpdate(selectedId);
      }
    } else {
      const message = VALIDATION_MESSAGES.UPDATE_FAILED;
      showNotification(message.key, message.type);
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
