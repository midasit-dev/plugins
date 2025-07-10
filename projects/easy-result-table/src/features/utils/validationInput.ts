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
      // StoryDriftParameter의 데이터가 있으나,
    }
  }

  return {
    open: true,
    message: "Validation successful",
    severity: "success",
  };
};

export default ValidationInput;
