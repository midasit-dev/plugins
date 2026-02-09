import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { getTabConfig } from '../../constants/tabs';
import { useConverterState } from '../../context/ConverterContext';
import type { TabId } from '../../types';

interface TopBarProps {
  activeTab: TabId;
}

export default function TopBar({ activeTab }: TopBarProps) {
  const { t } = useTranslation();
  const { tabData } = useConverterState();
  const tabConfig = getTabConfig(activeTab);
  const rowCount = tabData[activeTab]?.length ?? 0;

  if (!tabConfig) return null;

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      {/* 좌측: 탭 경로 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 14, color: 'primary.main' }}>
          {tabConfig.icon}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
          {t(tabConfig.groupKey)}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          ›
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
          {t(tabConfig.labelKey)}
        </Typography>
        {tabConfig.parent && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 0.5 }}>
            ({tabConfig.parent})
          </Typography>
        )}
      </Box>

      {/* 우측: 메타정보 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
          {t('topbar.esRange')}:
        </Typography>
        <Box
          component="code"
          sx={{
            fontSize: 11,
            bgcolor: 'background.paper',
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            color: 'warning.main',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {tabConfig.esRange}
        </Box>
        <Typography sx={{ color: 'divider' }}>|</Typography>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
          {t('topbar.rows')}:
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'success.main', fontWeight: 600 }}>
          {rowCount}
        </Typography>
      </Box>
    </Box>
  );
}
