import { VALIDATION_MESSAGES } from "../constants/validationMessages";
import { PileSection } from "../states";
import { NotificationSeverity } from "../hooks/useNotification";

interface ValidationParams {
  pileInitSet: {
    pileName: string;
    pileLength: number;
    topLevel: number;
  };
  pileLocations: Array<{
    loc: number;
    space: number[];
    angle: number[];
  }>;
  pileReinforced: Array<{
    checked: boolean;
    start: number;
    end: number;
    thickness: number;
    modulus: number;
  }>;
  pileSections: PileSection[];
  showNotification: (
    messageKey: string,
    severity?: NotificationSeverity,
    options?: object
  ) => void;
}

export const validateInputs = ({
  pileInitSet,
  pileLocations,
  pileReinforced,
  pileSections,
  showNotification,
}: ValidationParams): boolean => {
  // 1. 기본 정보 검증
  // 1.1 말뚝 명칭 (문자열이 있는지 검증)
  if (!pileInitSet.pileName.trim()) {
    const message = VALIDATION_MESSAGES.PILE_NAME_REQUIRED;
    showNotification(message.key, message.type);
    return false;
  }

  // 1.2 말뚝 길이 (필요 없음: 자동계산 됨)
  // 1.3 저면 표고 (숫자인지 검증)
  if (typeof pileInitSet.topLevel !== "number" || isNaN(pileInitSet.topLevel)) {
    const message = VALIDATION_MESSAGES.TOP_LEVEL_INVALID;
    showNotification(message.key, message.type);
    return false;
  }

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
    const isSecondRow = pileLocations.indexOf(location) === 1;
    const referenceSpace = isSecondRow
      ? pileLocations[0].space
      : location.space;

    if (location.angle.length !== referenceSpace.length + 1) {
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
