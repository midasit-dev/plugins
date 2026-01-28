// Conversion Panel Component
// Displays parsed data info and handles conversion

import React, { useCallback } from 'react';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Typography,
  Button,
  Separator,
} from '@midasit-dev/moaui';
import {
  excelParseResultState,
  availableSheetsSelector,
  hasRequiredSheetsSelector,
  nodeCountSelector,
  elementCountSelector,
  sheetCountSelector,
} from '../stores/excelState';
import {
  conversionResultState,
  isConvertingState,
  conversionProgressState,
  conversionStepState,
  conversionOptionsState,
  hasErrorsSelector,
  hasWarningsSelector,
  conversionErrorsSelector,
  conversionWarningsSelector,
} from '../stores/conversionState';
import { generateMCT } from '../generators/MCTGenerator';

interface ConversionPanelProps {
  onConversionComplete?: () => void;
}

const ConversionPanel: React.FC<ConversionPanelProps> = ({ onConversionComplete }) => {
  const { t } = useTranslation();

  const parseResult = useRecoilValue(excelParseResultState);
  const availableSheets = useRecoilValue(availableSheetsSelector);
  const hasRequiredSheets = useRecoilValue(hasRequiredSheetsSelector);
  const nodeCount = useRecoilValue(nodeCountSelector);
  const elementCount = useRecoilValue(elementCountSelector);
  const sheetCount = useRecoilValue(sheetCountSelector);
  const options = useRecoilValue(conversionOptionsState);

  const [isConverting, setIsConverting] = useRecoilState(isConvertingState);
  const [progress, setProgress] = useRecoilState(conversionProgressState);
  const [step, setStep] = useRecoilState(conversionStepState);

  const setConversionResult = useSetRecoilState(conversionResultState);

  const hasErrors = useRecoilValue(hasErrorsSelector);
  const hasWarnings = useRecoilValue(hasWarningsSelector);
  const errors = useRecoilValue(conversionErrorsSelector);
  const warnings = useRecoilValue(conversionWarningsSelector);

  const handleConvert = useCallback(async () => {
    if (!parseResult) return;

    setIsConverting(true);
    setProgress(0);
    setStep(t('conversionPanel.startConversion'));

    try {
      const result = await generateMCT(
        parseResult,
        options,
        (prog, msg) => {
          setProgress(prog);
          setStep(msg);
        }
      );

      setConversionResult(result);

      if (onConversionComplete) {
        onConversionComplete();
      }
    } catch (error) {
      setConversionResult({
        success: false,
        mctData: null,
        mctText: '',
        errors: [`${t('conversionPanel.conversionError')}: ${error}`],
        warnings: [],
      });
    } finally {
      setIsConverting(false);
    }
  }, [t, parseResult, options, setIsConverting, setProgress, setStep, setConversionResult, onConversionComplete]);

  if (!parseResult) {
    return (
      <Panel variant="shadow2" width="100%" padding={2}>
        <GuideBox center padding={4}>
          <Typography color="textSecondary">
            {t('conversionPanel.uploadHint')}
          </Typography>
        </GuideBox>
      </Panel>
    );
  }

  return (
    <Panel variant="shadow2" width="100%" padding={2}>
      <GuideBox spacing={2}>
        <Typography variant="h1">{t('conversionPanel.title')}</Typography>

        <Separator />

        <GuideBox row spacing={4}>
          <GuideBox spacing={1}>
            <Typography variant="body2" color="textSecondary">
              {t('conversionPanel.sheetCount')}
            </Typography>
            <Typography variant="h1">{String(sheetCount)}</Typography>
          </GuideBox>
          <GuideBox spacing={1}>
            <Typography variant="body2" color="textSecondary">
              {t('conversionPanel.nodeCount')}
            </Typography>
            <Typography variant="h1">{String(nodeCount)}</Typography>
          </GuideBox>
          <GuideBox spacing={1}>
            <Typography variant="body2" color="textSecondary">
              {t('conversionPanel.elementCount')}
            </Typography>
            <Typography variant="h1">{String(elementCount)}</Typography>
          </GuideBox>
        </GuideBox>

        <Separator />

        <GuideBox spacing={1}>
          <Typography variant="body1">{t('conversionPanel.detectedSheets')}</Typography>
          <div
            style={{
              maxHeight: 100,
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
            }}
          >
            {availableSheets.map((sheet, index) => (
              <Typography key={index} variant="body2">
                {sheet}
              </Typography>
            ))}
          </div>
        </GuideBox>

        {!hasRequiredSheets && (
          <div
            style={{
              backgroundColor: '#fff3e0',
              padding: 8,
              borderRadius: 4,
            }}
          >
            <Typography color="error">
              {t('conversionPanel.missingRequired')}
            </Typography>
          </div>
        )}

        {hasErrors && (
          <div
            style={{
              backgroundColor: '#ffebee',
              padding: 8,
              borderRadius: 4,
            }}
          >
            <Typography variant="body1" color="error">
              {t('conversionPanel.errors')}
            </Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2" color="error">
                {error}
              </Typography>
            ))}
          </div>
        )}

        {hasWarnings && (
          <div
            style={{
              backgroundColor: '#fff8e1',
              padding: 8,
              borderRadius: 4,
            }}
          >
            <span style={{ color: '#f57c00', fontWeight: 500 }}>
              {t('conversionPanel.warnings')}
            </span>
            {warnings.map((warning, index) => (
              <div key={index} style={{ color: '#f57c00', fontSize: 14 }}>
                {warning}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {isConverting && (
          <GuideBox spacing={1}>
            <Typography variant="body2">{step}</Typography>
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: '#e0e0e0',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#1976d2',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </GuideBox>
        )}

        <Button
          variant="contained"
          onClick={handleConvert}
          disabled={isConverting || !hasRequiredSheets}
          width="100%"
        >
          {isConverting ? t('conversionPanel.converting') : t('conversionPanel.convertButton')}
        </Button>
      </GuideBox>
    </Panel>
  );
};

export default ConversionPanel;
