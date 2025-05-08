// src/hooks/useNotification.ts
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

export type NotificationSeverity = "success" | "error" | "info" | "warning";

export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { t } = useTranslation();

  /**
   * 알림 표시 함수
   * @param messageKey 메시지 키 (i18n 번역 키)
   * @param severity 알림 유형
   * @param options 추가 옵션
   */
  const showNotification = (
    messageKey: string,
    severity: NotificationSeverity = "info",
    options?: object
  ) => {
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
