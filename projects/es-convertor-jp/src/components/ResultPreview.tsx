// Result Preview Component
// Displays MCT output preview

import React, { useState, useCallback } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Typography,
  Button,
  Separator,
} from '@midasit-dev/moaui';
import {
  mctTextState,
  mctPreviewSelector,
  mctPreviewLinesState,
  mctLineCountSelector,
  mctFileSizeDisplaySelector,
  hasMctOutputSelector,
} from '../stores/mctState';
import { isConversionSuccessSelector } from '../stores/conversionState';

interface ResultPreviewProps {
  maxHeight?: number;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ maxHeight = 400 }) => {
  const { t } = useTranslation();

  const mctText = useRecoilValue(mctTextState);
  const mctPreview = useRecoilValue(mctPreviewSelector);
  const lineCount = useRecoilValue(mctLineCountSelector);
  const fileSize = useRecoilValue(mctFileSizeDisplaySelector);
  const hasMctOutput = useRecoilValue(hasMctOutputSelector);
  const isSuccess = useRecoilValue(isConversionSuccessSelector);

  const [previewLines, setPreviewLines] = useRecoilState(mctPreviewLinesState);
  const [copied, setCopied] = useState(false);

  const handleShowMore = useCallback(() => {
    setPreviewLines(prev => prev + 100);
  }, [setPreviewLines]);

  const handleShowAll = useCallback(() => {
    setPreviewLines(lineCount);
  }, [setPreviewLines, lineCount]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mctText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [mctText]);

  if (!hasMctOutput) {
    return (
      <Panel variant="shadow2" width="100%" padding={2}>
        <GuideBox center padding={4}>
          <Typography color="textSecondary">
            {t('resultPreview.noResult')}
          </Typography>
        </GuideBox>
      </Panel>
    );
  }

  return (
    <Panel variant="shadow2" width="100%" padding={2}>
      <GuideBox spacing={2}>
        <GuideBox row spacing={2} verCenter>
          <Typography variant="h1">{t('resultPreview.title')}</Typography>
          {isSuccess && (
            <div
              style={{
                backgroundColor: '#e8f5e9',
                padding: '4px 8px',
                borderRadius: 4,
              }}
            >
              <span style={{ color: '#2e7d32', fontSize: 14 }}>
                {t('resultPreview.conversionSuccess')}
              </span>
            </div>
          )}
        </GuideBox>

        <GuideBox row spacing={4}>
          <Typography variant="body2" color="textSecondary">
            {t('resultPreview.lineCount')}: {lineCount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('resultPreview.fileSize')}: {fileSize}
          </Typography>
        </GuideBox>

        <Separator />

        <div
          style={{
            width: '100%',
            maxHeight,
            overflowY: 'auto',
            backgroundColor: '#1e1e1e',
            borderRadius: 4,
            padding: 12,
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 12,
              lineHeight: 1.5,
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {mctPreview}
          </pre>
        </div>

        {previewLines < lineCount && (
          <GuideBox row spacing={1} horCenter>
            <Button variant="outlined" onClick={handleShowMore}>
              {t('resultPreview.showMore')}
            </Button>
            <Button variant="outlined" onClick={handleShowAll}>
              {t('resultPreview.showAll')}
            </Button>
          </GuideBox>
        )}

        <Separator />

        <GuideBox row spacing={1} horRight>
          <Button
            variant="outlined"
            onClick={handleCopyToClipboard}
          >
            {copied ? t('resultPreview.copied') : t('resultPreview.copyToClipboard')}
          </Button>
        </GuideBox>
      </GuideBox>
    </Panel>
  );
};

export default ResultPreview;
