import React, { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import type { MctResult } from '../../types';

interface MctResultModalProps {
  open: boolean;
  onClose: () => void;
  mctResult: MctResult;
}

export default function MctResultModal({ open, onClose, mctResult }: MctResultModalProps) {
  const { t } = useTranslation();
  const [versionTab, setVersionTab] = useState(0);

  const currentText = versionTab === 0 ? mctResult.v2025 : mctResult.v2026;
  const versionLabel = versionTab === 0 ? '2025' : '2026';

  const handleSave = useCallback(() => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `output_${versionLabel}.mct`);
  }, [currentText, versionLabel]);

  const handleSendApi = useCallback(() => {
    // TODO: MIDAS API 연동
    alert('Send to MIDAS API — not yet implemented');
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t('modal.mctResultTitle')}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={versionTab} onChange={(_, v) => setVersionTab(v)}>
          <Tab label={t('modal.midas2025')} />
          <Tab label={t('modal.midas2026')} />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Box
          component="pre"
          sx={{
            bgcolor: 'background.default',
            color: 'success.main',
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            maxHeight: '60vh',
            m: 0,
          }}
        >
          {currentText}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={handleSave}>
          {t('buttons.saveAsMct')}
        </Button>
        <Button variant="contained" color="success" startIcon={<SendIcon />} onClick={handleSendApi}>
          {t('buttons.sendToApi')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
