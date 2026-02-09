import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { TAB_GROUPS } from '../../constants/tabs';
import { useConverterState } from '../../context/ConverterContext';
import type { TabId } from '../../types';

interface SidebarProps {
  activeTab: TabId;
  onTabSelect: (tabId: TabId) => void;
}

export default function Sidebar({ activeTab, onTabSelect }: SidebarProps) {
  const { t } = useTranslation();
  const { tabData } = useConverterState();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsed(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  return (
    <Box
      sx={{
        width: 220,
        minWidth: 220,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 로고 헤더 */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
          ES
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          →
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
          MCT
        </Typography>
      </Box>

      {/* 탭 리스트 */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {TAB_GROUPS.map((group) => {
          const isOpen = !collapsed[group.groupKey];
          return (
            <Box key={group.groupKey}>
              {/* 그룹 헤더 */}
              <Box
                onClick={() => toggleGroup(group.groupKey)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.75,
                  pt: 1,
                  pb: 0.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 16, textAlign: 'center' }}>
                  {group.icon}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    flex: 1,
                  }}
                >
                  {t(group.groupKey)}
                </Typography>
                {isOpen ? (
                  <ExpandLess sx={{ fontSize: 14, color: 'text.secondary' }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 14, color: 'text.secondary' }} />
                )}
              </Box>

              {/* 탭 항목 */}
              <Collapse in={isOpen}>
                <List disablePadding>
                  {group.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const count = tabData[tab.id]?.length ?? 0;
                    return (
                      <ListItemButton
                        key={tab.id}
                        selected={isActive}
                        onClick={() => onTabSelect(tab.id)}
                        sx={{
                          pl: 3.5,
                          py: 0.5,
                          borderLeft: isActive ? 2 : 2,
                          borderColor: isActive ? 'primary.main' : 'transparent',
                          '&.Mui-selected': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={t(tab.labelKey)}
                          primaryTypographyProps={{
                            fontSize: 12,
                            noWrap: true,
                            fontWeight: isActive ? 600 : 400,
                          }}
                        />
                        {count > 0 && (
                          <Box
                            sx={{
                              fontSize: 10,
                              bgcolor: 'rgba(75, 154, 244, 0.15)',
                              color: 'primary.main',
                              px: 0.75,
                              py: 0.125,
                              borderRadius: 1,
                              fontWeight: 600,
                              ml: 1,
                            }}
                          >
                            {count}
                          </Box>
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
