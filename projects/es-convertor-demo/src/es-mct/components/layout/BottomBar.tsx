import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BoltIcon from '@mui/icons-material/Bolt';
import { useTranslation } from 'react-i18next';
import { useExcelImport } from '../../hooks/useExcelImport';
import { useExcelExport } from '../../hooks/useExcelExport';

interface BottomBarProps {
  onConvert: () => void;
}

export default function BottomBar({ onConvert }: BottomBarProps) {
  const { t } = useTranslation();
  const { triggerImport } = useExcelImport();
  const { triggerExport } = useExcelExport();

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.25,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      {/* 좌측: Excel Import / Export */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileUploadIcon />}
          onClick={triggerImport}
          sx={{ borderColor: 'divider', color: 'text.primary' }}
        >
          {t('buttons.excelImport')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={triggerExport}
          sx={{ borderColor: 'divider', color: 'text.primary' }}
        >
          {t('buttons.excelExport')}
        </Button>
      </Box>

      {/* 우측: MCT Convert */}
      <Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<BoltIcon />}
          onClick={onConvert}
          sx={{
            fontWeight: 600,
            letterSpacing: 0.5,
            px: 2.5,
          }}
        >
          {t('buttons.mctConvert')}
        </Button>
      </Box>
    </Box>
  );
}
