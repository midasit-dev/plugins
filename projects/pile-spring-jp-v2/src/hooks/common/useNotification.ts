/**
 * @fileoverview 알림 표시 기능을 제공하는 커스텀 훅
 * 알림 메시지를 표시하고 관리하는 기능을 담당합니다.
 */

import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

export type NotificationSeverity = "success" | "error" | "info" | "warning";

export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { t } = useTranslation();

  // 알림 표시 함수
  const showNotification = (
    messageKey: string,
    severity: NotificationSeverity = "info",
    options?: object
  ): void => {
    enqueueSnackbar(t(messageKey), {
      variant: severity,
      autoHideDuration: 4000,
      ...options,
    });
  };

  return {
    showNotification,
    closeSnackbar,
  };
};
