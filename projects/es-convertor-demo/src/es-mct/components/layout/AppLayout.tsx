import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import DataGrid from '../grid/DataGrid';
import MctResultModal from '../modal/MctResultModal';
import { useConverterState } from '../../context/ConverterContext';
import { useMctConvert } from '../../hooks/useMctConvert';
import type { TabId } from '../../types';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('node');
  const { mctResult } = useConverterState();
  const { runConvert, modalOpen, closeModal } = useMctConvert();

  return (
    <Box sx={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, display: 'flex', bgcolor: 'background.default', zIndex: 1 }}>
      {/* 사이드바 */}
      <Sidebar activeTab={activeTab} onTabSelect={setActiveTab} />

      {/* 메인 영역 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <TopBar activeTab={activeTab} />

        {/* 그리드 영역 */}
        <Box sx={{ flex: 1, minHeight: 0, p: 1.5 }}>
          <Box sx={{ width: '100%', height: '100%' }}>
            <DataGrid activeTab={activeTab} />
          </Box>
        </Box>

        <BottomBar onConvert={runConvert} />
      </Box>

      {/* MCT 결과 모달 */}
      {mctResult && (
        <MctResultModal
          open={modalOpen}
          onClose={closeModal}
          mctResult={mctResult}
        />
      )}
    </Box>
  );
}
