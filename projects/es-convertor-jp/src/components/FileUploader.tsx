// File Uploader Component
// Handles Excel file upload and parsing

import React, { useCallback, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Typography,
  Button,
  Icon,
} from '@midasit-dev/moaui';
import {
  selectedFileState,
  fileNameState,
  isLoadingState,
  errorMessageState,
  excelParseResultState,
} from '../stores/excelState';
import { conversionResultState } from '../stores/conversionState';
import { parseExcelFile } from '../parsers/ExcelParser';

interface FileUploaderProps {
  onFileLoaded?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setSelectedFile] = useRecoilState(selectedFileState);
  const [fileName, setFileName] = useRecoilState(fileNameState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const setError = useSetRecoilState(errorMessageState);
  const setParseResult = useSetRecoilState(excelParseResultState);
  const setConversionResult = useSetRecoilState(conversionResultState);

  const handleFileSelect = useCallback(async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError(t('fileUploader.invalidFile'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setConversionResult(null);

    try {
      setSelectedFile(file);
      setFileName(file.name);

      const result = await parseExcelFile(file);

      if (result.success) {
        setParseResult(result);
        if (result.warnings.length > 0) {
          console.warn('Parse warnings:', result.warnings);
        }
        if (onFileLoaded) {
          onFileLoaded();
        }
      } else {
        setError(result.errors.join('\n'));
        setParseResult(null);
      }
    } catch (error) {
      setError(`${t('fileUploader.loadError')}: ${error}`);
      setParseResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [t, setSelectedFile, setFileName, setIsLoading, setError, setParseResult, setConversionResult, onFileLoaded]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    event.target.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setParseResult(null);
    setError(null);
    setConversionResult(null);
  }, [setSelectedFile, setFileName, setParseResult, setError, setConversionResult]);

  return (
    <Panel variant="shadow2" width="100%" padding={2}>
      <GuideBox spacing={2}>
        <Typography variant="h1">{t('fileUploader.title')}</Typography>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".xlsx,.xls,.xlsm"
          style={{ display: 'none' }}
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 4,
            border: '2px dashed #ccc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: isLoading ? '#f5f5f5' : '#fafafa',
          }}
        >
          {isLoading ? (
            <Typography>{t('fileUploader.loading')}</Typography>
          ) : fileName ? (
            <GuideBox center spacing={1}>
              <Icon iconName="Description" />
              <Typography>{fileName}</Typography>
            </GuideBox>
          ) : (
            <GuideBox center spacing={1}>
              <Icon iconName="CloudUpload" />
              <Typography>{t('fileUploader.dropHint')}</Typography>
              <Typography variant="body2" color="secondary">
                {t('fileUploader.supportedFormats')}
              </Typography>
            </GuideBox>
          )}
        </div>

        {fileName && (
          <GuideBox row spacing={1} width="100%" horRight>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={isLoading}
            >
              {t('fileUploader.clear')}
            </Button>
          </GuideBox>
        )}
      </GuideBox>
    </Panel>
  );
};

export default FileUploader;
