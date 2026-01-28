// Export Button Component
// Handles MCT file download and API export

import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Typography,
  Button,
  TextField,
} from '@midasit-dev/moaui';
import {
  mctTextState,
  hasMctOutputSelector,
} from '../stores/mctState';
import { isConversionSuccessSelector } from '../stores/conversionState';
import { fileNameState } from '../stores/excelState';
import { downloadMCT } from '../generators/MCTGenerator';

interface ExportButtonProps {
  apiEndpoint?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ apiEndpoint }) => {
  const { t } = useTranslation();

  const mctText = useRecoilValue(mctTextState);
  const hasMctOutput = useRecoilValue(hasMctOutputSelector);
  const isSuccess = useRecoilValue(isConversionSuccessSelector);
  const originalFileName = useRecoilValue(fileNameState);

  const [fileName, setFileName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);

  // Generate default filename from original file
  const getDefaultFileName = useCallback(() => {
    if (originalFileName) {
      return originalFileName.replace(/\.(xlsx?|xlsm)$/i, '.mct');
    }
    return 'output.mct';
  }, [originalFileName]);

  const handleDownload = useCallback(() => {
    const outputFileName = fileName || getDefaultFileName();
    downloadMCT(mctText, outputFileName);
  }, [mctText, fileName, getDefaultFileName]);

  const handleSendToMidas = useCallback(async () => {
    if (!apiEndpoint) {
      alert(t('export.noEndpoint'));
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: mctText,
      });

      if (response.ok) {
        setSendResult('success');
      } else {
        setSendResult('error');
      }
    } catch (error) {
      console.error('Failed to send to MIDAS:', error);
      setSendResult('error');
    } finally {
      setIsSending(false);
    }
  }, [t, mctText, apiEndpoint]);

  if (!hasMctOutput || !isSuccess) {
    return null;
  }

  return (
    <Panel variant="shadow2" width="100%" padding={2}>
      <GuideBox spacing={2}>
        <Typography variant="h1">{t('export.title')}</Typography>

        <GuideBox row spacing={2} verCenter>
          <TextField
            placeholder={getDefaultFileName()}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            width={250}
          />
          <Button
            variant="contained"
            onClick={handleDownload}
          >
            {t('export.download')}
          </Button>
        </GuideBox>

        {apiEndpoint && (
          <>
            <div
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#e0e0e0',
              }}
            />

            <GuideBox row spacing={2} verCenter>
              <Button
                variant="outlined"
                onClick={handleSendToMidas}
                disabled={isSending}
              >
                {isSending ? t('export.sending') : t('export.sendToMidas')}
              </Button>

              {sendResult === 'success' && (
                <span style={{ color: '#2e7d32', fontSize: 14 }}>
                  {t('export.sendSuccess')}
                </span>
              )}
              {sendResult === 'error' && (
                <Typography variant="body2" color="error">
                  {t('export.sendError')}
                </Typography>
              )}
            </GuideBox>
          </>
        )}
      </GuideBox>
    </Panel>
  );
};

export default ExportButton;
