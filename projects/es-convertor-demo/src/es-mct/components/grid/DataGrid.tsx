import React, { useMemo } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import Box from '@mui/material/Box';
import { useConverterState } from '../../context/ConverterContext';
import { getTabConfig } from '../../constants/tabs';
import type { TabId, GridRowData } from '../../types';

// ag-grid v35: 모듈 등록 필수
ModuleRegistry.registerModules([AllCommunityModule]);

interface DataGridProps {
  activeTab: TabId;
}

const defaultColDef: ColDef = {
  editable: true,
  resizable: true,
  sortable: true,
  filter: true,
  minWidth: 80,
};

export default function DataGrid({ activeTab }: DataGridProps) {
  const { tabData } = useConverterState();
  const tabConfig = getTabConfig(activeTab);

  const rowData: GridRowData[] = useMemo(() => {
    const raw = tabData[activeTab];
    if (!raw || raw.length === 0) return [];
    return raw.map((row) => {
      const obj: GridRowData = {};
      row.forEach((cell, i) => {
        obj[`col${i}`] = cell;
      });
      return obj;
    });
  }, [tabData, activeTab]);

  const colDefs = tabConfig?.colDefs ?? [];

  return (
    <Box
      className="ag-theme-alpine-dark"
      sx={{ width: '100%', height: '100%' }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        headerHeight={32}
        rowHeight={28}
      />
    </Box>
  );
}
