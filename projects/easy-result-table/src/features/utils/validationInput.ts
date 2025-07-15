import { Category } from "../types/category";
import { SnackbarState } from "../hooks/useSnackbarMessage";

const ValidationInput = (categories: Category[]): SnackbarState => {
  for (const category of categories) {
    for (const item of category.items) {
      // LoadCases의 데이터가 있으나, 길이가 0인 경우
      if (item.settings.LoadCaseName?.loadCases.length === 0) {
        return {
          open: true,
          message: 'Load Case Name is required for "' + item.name + '"',
          severity: "error",
        };
      }
      // LoadCases의 데이터가 있으나, isChecked가 모두 False인 경우
      if (
        item.settings.LoadCaseName?.loadCases &&
        item.settings.LoadCaseName?.loadCases.length > 0
      ) {
        if (
          item.settings.LoadCaseName?.loadCases.every(
            (loadCase) => !loadCase.isChecked
          )
        ) {
          return {
            open: true,
            message: 'Load Case Name is not selected for "' + item.name + '"',
            severity: "error",
          };
        }
      }
      // StoryDriftParameter의 데이터 검증
      if (
        item.settings.StoryDriftParameter?.deflectionFactor &&
        item.settings.StoryDriftParameter?.deflectionFactor < 1
      ) {
        return {
          open: true,
          message:
            'Deflection Amplification Factor must be greater than or equal to 1 for "' +
            item.name +
            '"',
          severity: "error",
        };
      }
      if (
        item.settings.StoryDriftParameter?.importanceFactor &&
        item.settings.StoryDriftParameter?.importanceFactor <= 0
      ) {
        return {
          open: true,
          message:
            'Importance Factor must be greater than 0 for "' + item.name + '"',
          severity: "error",
        };
      }
      if (
        item.settings.StoryDriftParameter?.scaleFactor &&
        item.settings.StoryDriftParameter?.scaleFactor <= 0
      ) {
        return {
          open: true,
          message:
            'Scale Factor must be greater than 0 for "' + item.name + '"',
          severity: "error",
        };
      }
      if (
        item.settings.StoryDriftParameter?.allowableRatio &&
        item.settings.StoryDriftParameter?.allowableRatio <= 0
      ) {
        return {
          open: true,
          message:
            'Allowable Ratio must be greater than 0 for "' + item.name + '"',
          severity: "error",
        };
      }
      // combinations의 데이터가 있으나, 각 데이터 scaleFactor가 0보다 같거나 작을경우 NG
      if (
        item.settings.StoryDriftParameter?.combinations.length !== 0 &&
        item.settings.StoryDriftParameter?.combinations.every(
          (combination) => combination.scaleFactor <= 0
        )
      ) {
        return {
          open: true,
          message:
            'Vertical Load Comb. Scale Factor must be greater than 0 for "' +
            item.name +
            '"',
          severity: "error",
        };
      }

      // StabilityCoefficientParameter의 데이터 검증
      if (
        item.settings.StabilityCoefficientParameter?.deflectionFactor &&
        item.settings.StabilityCoefficientParameter?.deflectionFactor < 1
      ) {
        return {
          open: true,
          message:
            'Deflection Amplification Factor must be greater than or equal to 1 for "' +
            item.name +
            '"',
          severity: "error",
        };
      }
      if (
        item.settings.StabilityCoefficientParameter?.importanceFactor &&
        item.settings.StabilityCoefficientParameter?.importanceFactor <= 0
      ) {
        return {
          open: true,
          message:
            'Importance Factor must be greater than 0 for "' + item.name + '"',
          severity: "error",
        };
      }
      if (
        item.settings.StabilityCoefficientParameter?.scaleFactor &&
        item.settings.StabilityCoefficientParameter?.scaleFactor <= 0
      ) {
        return {
          open: true,
          message:
            'Scale Factor must be greater than 0 for "' + item.name + '"',
          severity: "error",
        };
      }
      // combinations의 데이터가 있으나, 각 데이터 scaleFactor가 0보다 같거나 작을경우 NG
      if (
        item.settings.StabilityCoefficientParameter?.combinations.length !==
          0 &&
        item.settings.StabilityCoefficientParameter?.combinations.every(
          (combination) => combination.scaleFactor <= 0
        )
      ) {
        return {
          open: true,
          message:
            'Vertical Load Comb. Scale Factor must be greater than 0 for "' +
            item.name +
            '"',
          severity: "error",
        };
      }
    }
  }

  return {
    open: true,
    message: "Validation successful",
    severity: "success",
  };
};

export default ValidationInput;
