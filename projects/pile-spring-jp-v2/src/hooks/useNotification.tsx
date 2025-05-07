import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { IconButton } from "@mui/material"; // MUI의 Button 컴포넌트
import {
  Close,
  CheckCircleOutline,
  InfoOutlined,
  ErrorOutline,
  WarningOutlined,
} from "@mui/icons-material";

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
  ): void => {
    // 아이콘 컴포넌트 매핑 객체
    const NOTIFICATION_ICONS = {
      success: CheckCircleOutline,
      error: ErrorOutline,
      info: InfoOutlined,
      warning: WarningOutlined,
    };

    // 알림 타입별 설정 통합
    const NOTIFICATION_CONFIG = {
      success: {
        backgroundColor: "#EFFFEF",
        color: "#06C406",
      },
      error: {
        backgroundColor: "#FFECEA",
        color: "#FF5C4E",
      },
      info: {
        backgroundColor: "#E6F7FF",
        color: "#0099FF",
      },
      warning: {
        backgroundColor: "#FFF3CD",
        color: "#FFAA00",
      },
    };

    // 공통 스타일 정의
    const ICON_STYLE = {
      width: "16px",
      height: "16px",
      padding: "2px",
    };

    enqueueSnackbar(t(messageKey), {
      variant: severity,
      autoHideDuration: 4000,
      content: (key) => {
        const IconComponent = NOTIFICATION_ICONS[severity];
        const config = NOTIFICATION_CONFIG[severity];

        return (
          <div
            style={{
              backgroundColor: config.backgroundColor,
              color: config.color,
              border: `1px solid ${config.color}`,
              padding: "12px 16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <IconComponent style={{ ...ICON_STYLE, color: config.color }} />

            <span
              style={{
                color: config.color,
                fontSize: "12px",
                fontWeight: "400",
                fontStyle: "normal",
                fontFamily: "Pretendard",
                lineHeight: "18px",
                letterSpacing: "-0.24px",
                width: "100%",
              }}
            >
              {t(messageKey)}
            </span>

            <IconButton
              onClick={() => closeSnackbar(key)}
              style={{ color: config.color, width: "16px", height: "16px" }}
            >
              <Close style={ICON_STYLE} />
            </IconButton>
          </div>
        );
      },
      ...options,
    });
  };

  return {
    showNotification,
    closeSnackbar,
  };
};
