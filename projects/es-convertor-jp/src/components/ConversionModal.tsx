// Conversion Result Modal
// Displays the converted MCT data in a modal dialog

import React, { useCallback, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  GuideBox,
  Panel,
  Typography,
  Button,
  TextField,
  VerifyUtil,
} from "@midasit-dev/moaui";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Encoding from "encoding-japanese";
import { enqueueSnackbar } from "notistack";

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mctText2025: string;
  mctText2026: string;
  errors: string[];
  warnings: string[];
  isSuccess: boolean;
}

const ConversionModal: React.FC<ConversionModalProps> = ({
  isOpen,
  onClose,
  mctText2025,
  mctText2026,
  errors,
  warnings,
  isSuccess,
}) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("output.mct");
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Get current MCT text based on selected tab
  const currentMctText = useMemo(() => {
    return selectedTab === 0 ? mctText2025 : mctText2026;
  }, [selectedTab, mctText2025, mctText2026]);

  // Handle tab change
  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue);
      setCopied(false); // Reset copied state when switching tabs
    },
    [],
  );

  // Handle download with Shift_JIS encoding
  const handleDownload = useCallback(() => {
    // Convert text to Shift_JIS encoding
    const unicodeArray = Encoding.stringToCode(currentMctText);
    const sjisArray = Encoding.convert(unicodeArray, {
      to: "SJIS",
      from: "UNICODE",
    });
    const uint8Array = new Uint8Array(sjisArray);

    const blob = new Blob([uint8Array], {
      type: "text/plain;charset=shift_jis",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "output.mct";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentMctText, fileName]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentMctText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [currentMctText]);

  // Handle send to Civil NX
  const [isSending, setIsSending] = useState(false);
  const handleSendToCivilNX = useCallback(async () => {
    setIsSending(true);
    try {
      const baseUrl = VerifyUtil.getProtocolDomainPort();
      const mapiKey = VerifyUtil.getMapiKey();

      // Decode JWT header (base64url) to get product type (pg)
      let pg = "";
      try {
        const base64Url = mapiKey.split(".")[0];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const header = JSON.parse(atob(base64));
        pg = header.pg || "";
      } catch (e) {
        console.error("Failed to decode mapiKey JWT:", e);
      }

      const response = await fetch(`${baseUrl}/${pg}/ope/MXTCMDSHELL`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "mapi-key": mapiKey,
        },
        body: JSON.stringify({ Argument: currentMctText }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      enqueueSnackbar(t("conversionModal.sendSuccess"), { variant: "success" });
    } catch (error) {
      console.error("Failed to send to Civil NX:", error);
      enqueueSnackbar(
        t("conversionModal.sendError") + `: ${error}`,
        { variant: "error" },
      );
    } finally {
      setIsSending(false);
    }
  }, [currentMctText, t]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Panel
          variant="shadow2"
          width={700}
          padding={3}
          style={{
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
          }}
        >
          <GuideBox spacing={2} width="100%">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography variant="h1">
                {isSuccess
                  ? t("conversionModal.title")
                  : t("conversionModal.errorTitle")}
              </Typography>
              <Button variant="text" onClick={onClose}>
                ✕
              </Button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div
                style={{
                  backgroundColor: "#ffebee",
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              >
                <Typography variant="body1" color="error">
                  {t("conversionModal.errors")}
                </Typography>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2" color="error">
                    {error}
                  </Typography>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div
                style={{
                  backgroundColor: "#fff8e1",
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              >
                <span style={{ color: "#f57c00", fontWeight: 500 }}>
                  {t("conversionModal.warnings")}
                </span>
                {warnings.map((warning, index) => (
                  <div key={index} style={{ color: "#f57c00", fontSize: 14 }}>
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* MCT Preview with Tabs */}
            {isSuccess && (mctText2025 || mctText2026) && (
              <>
                {/* Version Tabs with Preview label inline */}
                <GuideBox row verCenter spacing={2}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body1">
                      {t("conversionModal.preview")}
                    </Typography>
                  </span>
                  <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    sx={{
                      minHeight: 36,
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#1976d2",
                      },
                      "& .MuiTab-root": {
                        minHeight: 36,
                        padding: "6px 16px",
                        fontSize: "13px",
                        textTransform: "none",
                        color: "#666",
                        "&.Mui-selected": {
                          color: "#1976d2",
                          fontWeight: 600,
                        },
                      },
                    }}
                  >
                    <Tab label={t("conversionModal.civilNX2025")} />
                    <Tab label={t("conversionModal.civilNX2026")} />
                  </Tabs>
                </GuideBox>

                {/* MCT Content */}
                <div
                  style={{
                    width: "100%",
                    minHeight: 200,
                    maxHeight: 300,
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                    borderRadius: 4,
                    padding: 12,
                    boxSizing: "border-box",
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "Consolas, Monaco, monospace",
                      fontSize: 12,
                      color: "#d4d4d4",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {currentMctText}
                  </pre>
                </div>

                {/* Tab hint message */}
                <span style={{ fontSize: 12, color: "#666" }}>
                  {t("conversionModal.tabHint")}
                </span>

                {/* Actions */}
                <GuideBox row spacing={2} verCenter>
                  <TextField
                    placeholder="output.mct"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    width={200}
                  />
                  <Button variant="contained" onClick={handleDownload}>
                    {t("conversionModal.download")}
                  </Button>
                  <Button variant="outlined" onClick={handleCopy}>
                    {copied
                      ? t("conversionModal.copied")
                      : t("conversionModal.copy")}
                  </Button>
                </GuideBox>
              </>
            )}

            {/* Bottom buttons */}
            <GuideBox row horSpaceBetween width="100%">
              <Button variant="outlined" onClick={onClose}>
                {t("conversionModal.close")}
              </Button>
              <Button
                variant="contained"
                onClick={handleSendToCivilNX}
                disabled={isSending}
              >
                {isSending
                  ? t("conversionModal.sending")
                  : t("conversionModal.sendToCivilNX")}
              </Button>
            </GuideBox>
          </GuideBox>
        </Panel>
      </div>
    </div>
  );
};

export default ConversionModal;
