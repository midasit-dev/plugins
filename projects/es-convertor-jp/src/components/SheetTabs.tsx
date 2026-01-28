// Sheet Tabs Component
// Tab-based navigation for all 21 ES data sheets

import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Button,
  Typography,
} from '@midasit-dev/moaui';
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import SpreadsheetEditor, { SpreadsheetColumn } from './SpreadsheetEditor';
import { SHEET_NAMES, SHEET_CONFIGS } from '../constants/sheetNames';
import { parseExcelFile } from '../parsers/ExcelParser';
import {
  nodeSheetDataState,
  frameSheetDataState,
  planeElementSheetDataState,
  rigidSheetDataState,
  materialSheetDataState,
  numbSectSheetDataState,
  sectElemSheetDataState,
  sectionSheetDataState,
  plnSectSheetDataState,
  hingePropSheetDataState,
  hingePropZpSheetDataState,
  hingePropYpSheetDataState,
  hingeAssSheetDataState,
  springSheetDataState,
  spg6CompSheetDataState,
  spgAllSymSheetDataState,
  spgAllSymLinearSheetDataState,
  spgAllSymBilinearSheetDataState,
  spgAllSymTrilinearSheetDataState,
  spgAllSymTetralinearSheetDataState,
  spgAllASymSheetDataState,
  spgAllASymBilinearSheetDataState,
  spgAllASymTrilinearSheetDataState,
  spgAllASymTetralinearSheetDataState,
  spgAllOtherSheetDataState,
  spgAllOtherNagoyaSheetDataState,
  spgAllOtherBmrSheetDataState,
  fulcrumSheetDataState,
  fulcrumDetailSheetDataState,
  nodalMassSheetDataState,
  loadSheetDataState,
  internalForceSheetDataState,
  resetAllSheetData,
} from '../stores/sheetDataState';

// Sheet tab configuration - All 21 sheets
interface SheetTabConfig {
  id: string;
  labelKey: string;
  sheetName: string;
  configKey: string; // Key in SHEET_CONFIGS
}

// Generate columns dynamically from SHEET_CONFIGS
const generateColumnsFromConfig = (configKey: string): SpreadsheetColumn[] => {
  const config = SHEET_CONFIGS[configKey];
  if (!config) return [];

  const colCount = config.endCol - config.startCol + 1;
  const cols: SpreadsheetColumn[] = [];

  // Create a map of column index to dropdown options
  const dropdownMap = new Map<number, string[]>();
  if (config.dropdowns) {
    for (const dropdown of config.dropdowns) {
      dropdownMap.set(dropdown.colIndex, dropdown.options);
    }
  }

  for (let i = 0; i < colCount; i++) {
    // Use Excel-style column letters (A, B, C, ...)
    const colLetter = String.fromCharCode(65 + ((config.startCol - 1 + i) % 26));
    const column: SpreadsheetColumn = { key: `col${i}`, label: colLetter };

    // Add dropdown options if this column has them
    const options = dropdownMap.get(i);
    if (options) {
      column.options = options;
      column.width = 120;  // Wider for dropdown columns
    }

    cols.push(column);
  }
  return cols;
};

// Fixed heights for consistent UI
const SPREADSHEET_CONTAINER_HEIGHT = 450;  // Total height for spreadsheet area
const SUB_TAB_HEIGHT = 40;  // Height of sub-tab buttons

// All 21 sheets - using SHEET_CONFIGS for dynamic column generation
const SHEET_TABS: SheetTabConfig[] = [
  { id: 'node', labelKey: 'sheets.node', sheetName: SHEET_NAMES.NODE, configKey: 'NODE' },
  { id: 'frame', labelKey: 'sheets.frame', sheetName: SHEET_NAMES.FRAME, configKey: 'FRAME' },
  { id: 'planeElement', labelKey: 'sheets.planeElement', sheetName: SHEET_NAMES.PLANE_ELEMENT, configKey: 'PLANE_ELEMENT' },
  { id: 'rigid', labelKey: 'sheets.rigid', sheetName: SHEET_NAMES.RIGID, configKey: 'RIGID' },
  { id: 'material', labelKey: 'sheets.material', sheetName: SHEET_NAMES.MATERIAL, configKey: 'MATERIAL' },
  { id: 'numbSect', labelKey: 'sheets.numbSect', sheetName: SHEET_NAMES.NUMB_SECT, configKey: 'NUMB_SECT' },
  { id: 'sectElem', labelKey: 'sheets.sectElem', sheetName: SHEET_NAMES.SECT_ELEM, configKey: 'SECT_ELEM' },
  { id: 'section', labelKey: 'sheets.section', sheetName: SHEET_NAMES.SECT, configKey: 'SECT' },
  { id: 'plnSect', labelKey: 'sheets.plnSect', sheetName: SHEET_NAMES.PLN_SECT, configKey: 'PLN_SECT' },
  { id: 'hingeProp', labelKey: 'sheets.hingeProp', sheetName: SHEET_NAMES.HINGE_PROP, configKey: 'HINGE_PROP' },
  { id: 'hingeAss', labelKey: 'sheets.hingeAss', sheetName: SHEET_NAMES.HINGE_ASS, configKey: 'HINGE_ASS' },
  { id: 'spring', labelKey: 'sheets.spring', sheetName: SHEET_NAMES.ELEM_SPRING, configKey: 'ELEM_SPRING' },
  { id: 'spg6Comp', labelKey: 'sheets.spg6Comp', sheetName: SHEET_NAMES.SPG_6COMP, configKey: 'SPG_6COMP' },
  { id: 'spgAllSym', labelKey: 'sheets.spgAllSym', sheetName: SHEET_NAMES.SPG_ALL_SYM, configKey: 'SPG_ALL_SYM' },
  { id: 'spgAllASym', labelKey: 'sheets.spgAllASym', sheetName: SHEET_NAMES.SPG_ALL_ASYM, configKey: 'SPG_ALL_ASYM' },
  { id: 'spgAllOther', labelKey: 'sheets.spgAllOther', sheetName: SHEET_NAMES.SPG_ALL_OTHER, configKey: 'SPG_ALL_OTHER' },
  { id: 'fulcrum', labelKey: 'sheets.fulcrum', sheetName: SHEET_NAMES.FULCRUM, configKey: 'FULCRUM' },
  { id: 'fulcrumDetail', labelKey: 'sheets.fulcrumDetail', sheetName: SHEET_NAMES.FULC_DETAIL, configKey: 'FULC_DETAIL' },
  { id: 'nodalMass', labelKey: 'sheets.nodalMass', sheetName: SHEET_NAMES.NODAL_MASS, configKey: 'NODAL_MASS' },
  { id: 'load', labelKey: 'sheets.load', sheetName: SHEET_NAMES.LOAD, configKey: 'LOAD' },
  { id: 'internalForce', labelKey: 'sheets.internalForce', sheetName: SHEET_NAMES.INTERNAL_FORCE, configKey: 'INTERNAL_FORCE' },
];

// Map tab ID to atom state
const TAB_TO_ATOM: Record<string, any> = {
  node: nodeSheetDataState,
  frame: frameSheetDataState,
  planeElement: planeElementSheetDataState,
  rigid: rigidSheetDataState,
  material: materialSheetDataState,
  numbSect: numbSectSheetDataState,
  sectElem: sectElemSheetDataState,
  section: sectionSheetDataState,
  plnSect: plnSectSheetDataState,
  hingeProp: hingePropSheetDataState,
  hingeAss: hingeAssSheetDataState,
  spring: springSheetDataState,
  spg6Comp: spg6CompSheetDataState,
  spgAllSym: spgAllSymSheetDataState,
  spgAllASym: spgAllASymSheetDataState,
  spgAllOther: spgAllOtherSheetDataState,
  fulcrum: fulcrumSheetDataState,
  fulcrumDetail: fulcrumDetailSheetDataState,
  nodalMass: nodalMassSheetDataState,
  load: loadSheetDataState,
  internalForce: internalForceSheetDataState,
};

export interface SheetTabsRef {
  triggerImport: () => void;
}

interface SheetTabsProps {
  onDataChanged?: () => void;
}

const SheetTabs = forwardRef<SheetTabsRef, SheetTabsProps>(({ onDataChanged }, ref) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('node');
  const [hingePropSubTab, setHingePropSubTab] = useState<'zp' | 'yp'>('zp');
  const [spgAllSymSubTab, setSpgAllSymSubTab] = useState<'linear' | 'bilinear' | 'trilinear' | 'tetralinear'>('linear');
  const [spgAllASymSubTab, setSpgAllASymSubTab] = useState<'bilinear' | 'trilinear' | 'tetralinear'>('bilinear');
  const [spgAllOtherSubTab, setSpgAllOtherSubTab] = useState<'nagoya' | 'bmr'>('nagoya');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All sheet data states
  const [nodeData, setNodeData] = useRecoilState(nodeSheetDataState);
  const [frameData, setFrameData] = useRecoilState(frameSheetDataState);
  const [planeElementData, setPlaneElementData] = useRecoilState(planeElementSheetDataState);
  const [rigidData, setRigidData] = useRecoilState(rigidSheetDataState);
  const [materialData, setMaterialData] = useRecoilState(materialSheetDataState);
  const [numbSectData, setNumbSectData] = useRecoilState(numbSectSheetDataState);
  const [sectElemData, setSectElemData] = useRecoilState(sectElemSheetDataState);
  const [sectionData, setSectionData] = useRecoilState(sectionSheetDataState);
  const [plnSectData, setPlnSectData] = useRecoilState(plnSectSheetDataState);
  const [hingePropData, setHingePropData] = useRecoilState(hingePropSheetDataState);
  const [hingePropZpData, setHingePropZpData] = useRecoilState(hingePropZpSheetDataState);
  const [hingePropYpData, setHingePropYpData] = useRecoilState(hingePropYpSheetDataState);
  const [hingeAssData, setHingeAssData] = useRecoilState(hingeAssSheetDataState);
  const [springData, setSpringData] = useRecoilState(springSheetDataState);
  const [spg6CompData, setSpg6CompData] = useRecoilState(spg6CompSheetDataState);
  const [spgAllSymData, setSpgAllSymData] = useRecoilState(spgAllSymSheetDataState);
  const [spgAllSymLinearData, setSpgAllSymLinearData] = useRecoilState(spgAllSymLinearSheetDataState);
  const [spgAllSymBilinearData, setSpgAllSymBilinearData] = useRecoilState(spgAllSymBilinearSheetDataState);
  const [spgAllSymTrilinearData, setSpgAllSymTrilinearData] = useRecoilState(spgAllSymTrilinearSheetDataState);
  const [spgAllSymTetralinearData, setSpgAllSymTetralinearData] = useRecoilState(spgAllSymTetralinearSheetDataState);
  const [spgAllASymData, setSpgAllASymData] = useRecoilState(spgAllASymSheetDataState);
  const [spgAllASymBilinearData, setSpgAllASymBilinearData] = useRecoilState(spgAllASymBilinearSheetDataState);
  const [spgAllASymTrilinearData, setSpgAllASymTrilinearData] = useRecoilState(spgAllASymTrilinearSheetDataState);
  const [spgAllASymTetralinearData, setSpgAllASymTetralinearData] = useRecoilState(spgAllASymTetralinearSheetDataState);
  const [spgAllOtherData, setSpgAllOtherData] = useRecoilState(spgAllOtherSheetDataState);
  const [spgAllOtherNagoyaData, setSpgAllOtherNagoyaData] = useRecoilState(spgAllOtherNagoyaSheetDataState);
  const [spgAllOtherBmrData, setSpgAllOtherBmrData] = useRecoilState(spgAllOtherBmrSheetDataState);
  const [fulcrumData, setFulcrumData] = useRecoilState(fulcrumSheetDataState);
  const [fulcrumDetailData, setFulcrumDetailData] = useRecoilState(fulcrumDetailSheetDataState);
  const [nodalMassData, setNodalMassData] = useRecoilState(nodalMassSheetDataState);
  const [loadData, setLoadData] = useRecoilState(loadSheetDataState);
  const [internalForceData, setInternalForceData] = useRecoilState(internalForceSheetDataState);

  // Data map for dynamic access
  const dataMap: Record<string, { data: (string | number)[][]; setData: (data: (string | number)[][]) => void }> = {
    node: { data: nodeData, setData: setNodeData },
    frame: { data: frameData, setData: setFrameData },
    planeElement: { data: planeElementData, setData: setPlaneElementData },
    rigid: { data: rigidData, setData: setRigidData },
    material: { data: materialData, setData: setMaterialData },
    numbSect: { data: numbSectData, setData: setNumbSectData },
    sectElem: { data: sectElemData, setData: setSectElemData },
    section: { data: sectionData, setData: setSectionData },
    plnSect: { data: plnSectData, setData: setPlnSectData },
    hingeProp: { data: hingePropData, setData: setHingePropData },
    hingePropZp: { data: hingePropZpData, setData: setHingePropZpData },
    hingePropYp: { data: hingePropYpData, setData: setHingePropYpData },
    hingeAss: { data: hingeAssData, setData: setHingeAssData },
    spring: { data: springData, setData: setSpringData },
    spg6Comp: { data: spg6CompData, setData: setSpg6CompData },
    spgAllSym: { data: spgAllSymData, setData: setSpgAllSymData },
    spgAllSymLinear: { data: spgAllSymLinearData, setData: setSpgAllSymLinearData },
    spgAllSymBilinear: { data: spgAllSymBilinearData, setData: setSpgAllSymBilinearData },
    spgAllSymTrilinear: { data: spgAllSymTrilinearData, setData: setSpgAllSymTrilinearData },
    spgAllSymTetralinear: { data: spgAllSymTetralinearData, setData: setSpgAllSymTetralinearData },
    spgAllASym: { data: spgAllASymData, setData: setSpgAllASymData },
    spgAllASymBilinear: { data: spgAllASymBilinearData, setData: setSpgAllASymBilinearData },
    spgAllASymTrilinear: { data: spgAllASymTrilinearData, setData: setSpgAllASymTrilinearData },
    spgAllASymTetralinear: { data: spgAllASymTetralinearData, setData: setSpgAllASymTetralinearData },
    spgAllOther: { data: spgAllOtherData, setData: setSpgAllOtherData },
    spgAllOtherNagoya: { data: spgAllOtherNagoyaData, setData: setSpgAllOtherNagoyaData },
    spgAllOtherBmr: { data: spgAllOtherBmrData, setData: setSpgAllOtherBmrData },
    fulcrum: { data: fulcrumData, setData: setFulcrumData },
    fulcrumDetail: { data: fulcrumDetailData, setData: setFulcrumDetailData },
    nodalMass: { data: nodalMassData, setData: setNodalMassData },
    load: { data: loadData, setData: setLoadData },
    internalForce: { data: internalForceData, setData: setInternalForceData },
  };

  // Handle file import
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Expose import function via ref
  useImperativeHandle(ref, () => ({
    triggerImport: handleImportClick,
  }), [handleImportClick]);

  // Reset all data
  const resetAllData = useCallback(() => {
    Object.values(dataMap).forEach(({ setData }) => setData([]));
  }, [dataMap]);

  // Reset modal handlers
  const handleResetClick = useCallback(() => {
    setIsResetModalOpen(true);
  }, []);

  const handleResetCancel = useCallback(() => {
    setIsResetModalOpen(false);
  }, []);

  const handleResetConfirm = useCallback(() => {
    resetAllData();
    setActiveTab('node'); // Reset to first tab
    setIsResetModalOpen(false);
    if (onDataChanged) {
      onDataChanged();
    }
  }, [resetAllData, onDataChanged]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setIsLoading(true);

      try {
        const result = await parseExcelFile(file);

        if (result.success) {
          // Reset all data first
          resetAllData();

          // Load data from each sheet
          for (const tab of SHEET_TABS) {
            const sheetData = result.sheets.get(tab.sheetName);
            if (sheetData && dataMap[tab.id]) {
              dataMap[tab.id].setData(sheetData.data);
            }
          }

          // Load sub-table data
          // HingeProp sub-tables
          const hingePropZp = result.subTables.get('HINGE_PROP_ZP');
          if (hingePropZp) setHingePropZpData(hingePropZp);
          const hingePropYp = result.subTables.get('HINGE_PROP_YP');
          if (hingePropYp) setHingePropYpData(hingePropYp);

          // SPGAllSym sub-tables
          const spgSymLinear = result.subTables.get('SPG_ALL_SYM_LINEAR');
          if (spgSymLinear) setSpgAllSymLinearData(spgSymLinear);
          const spgSymBilinear = result.subTables.get('SPG_ALL_SYM_BILINEAR');
          if (spgSymBilinear) setSpgAllSymBilinearData(spgSymBilinear);
          const spgSymTrilinear = result.subTables.get('SPG_ALL_SYM_TRILINEAR');
          if (spgSymTrilinear) setSpgAllSymTrilinearData(spgSymTrilinear);
          const spgSymTetralinear = result.subTables.get('SPG_ALL_SYM_TETRALINEAR');
          if (spgSymTetralinear) setSpgAllSymTetralinearData(spgSymTetralinear);

          // SPGAllASym sub-tables
          const spgAsymBilinear = result.subTables.get('SPG_ALL_ASYM_BILINEAR');
          if (spgAsymBilinear) setSpgAllASymBilinearData(spgAsymBilinear);
          const spgAsymTrilinear = result.subTables.get('SPG_ALL_ASYM_TRILINEAR');
          if (spgAsymTrilinear) setSpgAllASymTrilinearData(spgAsymTrilinear);
          const spgAsymTetralinear = result.subTables.get('SPG_ALL_ASYM_TETRALINEAR');
          if (spgAsymTetralinear) setSpgAllASymTetralinearData(spgAsymTetralinear);

          // SPGAllOther sub-tables
          const spgOtherNagoya = result.subTables.get('SPG_ALL_OTHER_NAGOYA');
          if (spgOtherNagoya) setSpgAllOtherNagoyaData(spgOtherNagoya);
          const spgOtherBmr = result.subTables.get('SPG_ALL_OTHER_BMR');
          if (spgOtherBmr) setSpgAllOtherBmrData(spgOtherBmr);

          if (onDataChanged) {
            onDataChanged();
          }
        }
      } catch (error) {
        console.error('Failed to import Excel:', error);
      } finally {
        setIsLoading(false);
        event.target.value = '';
      }
    },
    [dataMap, resetAllData, onDataChanged, setHingePropZpData, setHingePropYpData,
     setSpgAllSymLinearData, setSpgAllSymBilinearData, setSpgAllSymTrilinearData, setSpgAllSymTetralinearData,
     setSpgAllASymBilinearData, setSpgAllASymTrilinearData, setSpgAllASymTetralinearData,
     setSpgAllOtherNagoyaData, setSpgAllOtherBmrData]
  );

  // Handle data change for current tab
  const handleDataChange = useCallback(
    (newData: (string | number)[][]) => {
      if (dataMap[activeTab]) {
        dataMap[activeTab].setData(newData);
        if (onDataChanged) {
          onDataChanged();
        }
      }
    },
    [activeTab, dataMap, onDataChanged]
  );

  // Handle data change for hingeProp zp
  const handleHingePropZpChange = useCallback(
    (newData: (string | number)[][]) => {
      setHingePropZpData(newData);
      if (onDataChanged) {
        onDataChanged();
      }
    },
    [setHingePropZpData, onDataChanged]
  );

  // Handle data change for hingeProp yp
  const handleHingePropYpChange = useCallback(
    (newData: (string | number)[][]) => {
      setHingePropYpData(newData);
      if (onDataChanged) {
        onDataChanged();
      }
    },
    [setHingePropYpData, onDataChanged]
  );

  // Handle data change for SPGAllSym sub-tabs
  const handleSpgAllSymLinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllSymLinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllSymLinearData, onDataChanged]
  );

  const handleSpgAllSymBilinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllSymBilinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllSymBilinearData, onDataChanged]
  );

  const handleSpgAllSymTrilinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllSymTrilinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllSymTrilinearData, onDataChanged]
  );

  const handleSpgAllSymTetralinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllSymTetralinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllSymTetralinearData, onDataChanged]
  );

  // Handle data change for SPGAllASym sub-tabs
  const handleSpgAllASymBilinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllASymBilinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllASymBilinearData, onDataChanged]
  );

  const handleSpgAllASymTrilinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllASymTrilinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllASymTrilinearData, onDataChanged]
  );

  const handleSpgAllASymTetralinearChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllASymTetralinearData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllASymTetralinearData, onDataChanged]
  );

  // Handle data change for SPGAllOther sub-tabs
  const handleSpgAllOtherNagoyaChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllOtherNagoyaData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllOtherNagoyaData, onDataChanged]
  );

  const handleSpgAllOtherBmrChange = useCallback(
    (newData: (string | number)[][]) => {
      setSpgAllOtherBmrData(newData);
      if (onDataChanged) onDataChanged();
    },
    [setSpgAllOtherBmrData, onDataChanged]
  );

  // Get current tab config
  const currentTab = SHEET_TABS.find((tab) => tab.id === activeTab);
  const currentData = dataMap[activeTab]?.data || [];

  return (
    <GuideBox width="100%" spacing={1}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.xlsm"
        style={{ display: 'none' }}
      />

      {/* Hint text and Reset button */}
      <GuideBox row horSpaceBetween verCenter width="100%">
        <Typography variant="body2" color="textSecondary">
          {isLoading ? t('sheetTabs.loading') : t('sheetTabs.dataHint')}
        </Typography>
        <Button
          variant="text"
          color="negative"
          onClick={handleResetClick}
        >
          {t('sheetTabs.reset')}
        </Button>
      </GuideBox>

      {/* Tabs - Scrollable for 21 tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          width: '100%',
          minHeight: 32,
          '& .MuiTabs-indicator': {
            backgroundColor: '#4a8bcf',
            height: 2,
          },
          '& .MuiTab-root': {
            minHeight: 32,
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'none',
            color: '#666',
            '&.Mui-selected': {
              color: '#4a8bcf',
              fontWeight: 500,
            },
          },
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': { opacity: 0.3 },
          },
        }}
      >
        {SHEET_TABS.map((tab) => {
          // For hingeProp, show combined count of zp and yp
          // For spgAllSym, show combined count of 4 tables
          // For spgAllASym, show combined count of 3 tables
          // Subtract header rows from count to show only data rows
          const config = SHEET_CONFIGS[tab.configKey];
          const headerRows = config?.headerRows || 1;
          let rowCount = 0;
          if (tab.id === 'hingeProp') {
            const zpHeaders = SHEET_CONFIGS['HINGE_PROP_ZP']?.headerRows || 1;
            const ypHeaders = SHEET_CONFIGS['HINGE_PROP_YP']?.headerRows || 1;
            rowCount = Math.max(0, (hingePropZpData?.length || 0) - zpHeaders) +
                       Math.max(0, (hingePropYpData?.length || 0) - ypHeaders);
          } else if (tab.id === 'spgAllSym') {
            const linearHeaders = SHEET_CONFIGS['SPG_ALL_SYM_LINEAR']?.headerRows || 1;
            const bilinearHeaders = SHEET_CONFIGS['SPG_ALL_SYM_BILINEAR']?.headerRows || 1;
            const trilinearHeaders = SHEET_CONFIGS['SPG_ALL_SYM_TRILINEAR']?.headerRows || 1;
            const tetralinearHeaders = SHEET_CONFIGS['SPG_ALL_SYM_TETRALINEAR']?.headerRows || 1;
            rowCount = Math.max(0, (spgAllSymLinearData?.length || 0) - linearHeaders) +
                       Math.max(0, (spgAllSymBilinearData?.length || 0) - bilinearHeaders) +
                       Math.max(0, (spgAllSymTrilinearData?.length || 0) - trilinearHeaders) +
                       Math.max(0, (spgAllSymTetralinearData?.length || 0) - tetralinearHeaders);
          } else if (tab.id === 'spgAllASym') {
            const bilinearHeaders = SHEET_CONFIGS['SPG_ALL_ASYM_BILINEAR']?.headerRows || 1;
            const trilinearHeaders = SHEET_CONFIGS['SPG_ALL_ASYM_TRILINEAR']?.headerRows || 1;
            const tetralinearHeaders = SHEET_CONFIGS['SPG_ALL_ASYM_TETRALINEAR']?.headerRows || 1;
            rowCount = Math.max(0, (spgAllASymBilinearData?.length || 0) - bilinearHeaders) +
                       Math.max(0, (spgAllASymTrilinearData?.length || 0) - trilinearHeaders) +
                       Math.max(0, (spgAllASymTetralinearData?.length || 0) - tetralinearHeaders);
          } else if (tab.id === 'spgAllOther') {
            const nagoyaHeaders = SHEET_CONFIGS['SPG_ALL_OTHER_NAGOYA']?.headerRows || 1;
            const bmrHeaders = SHEET_CONFIGS['SPG_ALL_OTHER_BMR']?.headerRows || 1;
            rowCount = Math.max(0, (spgAllOtherNagoyaData?.length || 0) - nagoyaHeaders) +
                       Math.max(0, (spgAllOtherBmrData?.length || 0) - bmrHeaders);
          } else {
            rowCount = Math.max(0, (dataMap[tab.id]?.data?.length || 0) - headerRows);
          }
          const label = rowCount > 0
            ? `${t(tab.labelKey)} (${rowCount})`
            : t(tab.labelKey);
          return (
            <Tab
              key={tab.id}
              value={tab.id}
              label={label}
            />
          );
        })}
      </Tabs>

      {/* Spreadsheet Editor - Fixed height container */}
      {currentTab && activeTab !== 'hingeProp' && activeTab !== 'spgAllSym' && activeTab !== 'spgAllASym' && activeTab !== 'spgAllOther' && (
        <div style={{ height: SPREADSHEET_CONTAINER_HEIGHT, width: '100%' }}>
          <SpreadsheetEditor
            key={activeTab}
            columns={generateColumnsFromConfig(currentTab.configKey)}
            data={currentData}
            onChange={handleDataChange}
            minRows={20}
            height={SPREADSHEET_CONTAINER_HEIGHT - 40}
            headerRows={SHEET_CONFIGS[currentTab.configKey]?.headerRows ?? 1}
            headerValues={SHEET_CONFIGS[currentTab.configKey]?.headerValues}
          />
        </div>
      )}

      {/* HingeProp - Sub-tabs for zp and yp - Same fixed height as other sheets */}
      {activeTab === 'hingeProp' && (
        <div style={{ height: SPREADSHEET_CONTAINER_HEIGHT, width: '100%' }}>
          {/* Sub-tabs for zp/yp */}
          <div style={{ display: 'flex', gap: '4px', height: SUB_TAB_HEIGHT, alignItems: 'center' }}>
            <button
              onClick={() => setHingePropSubTab('zp')}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderBottom: hingePropSubTab === 'zp' ? '2px solid #1976d2' : '2px solid transparent',
                background: hingePropSubTab === 'zp' ? '#e3f2fd' : '#f5f5f5',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: hingePropSubTab === 'zp' ? 600 : 400,
                color: hingePropSubTab === 'zp' ? '#1976d2' : '#666',
                borderRadius: '4px 4px 0 0',
              }}
            >
              軸zp
              {hingePropZpData.length > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '11px', color: '#999' }}>
                  ({hingePropZpData.length})
                </span>
              )}
            </button>
            <button
              onClick={() => setHingePropSubTab('yp')}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderBottom: hingePropSubTab === 'yp' ? '2px solid #1976d2' : '2px solid transparent',
                background: hingePropSubTab === 'yp' ? '#e3f2fd' : '#f5f5f5',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: hingePropSubTab === 'yp' ? 600 : 400,
                color: hingePropSubTab === 'yp' ? '#1976d2' : '#666',
                borderRadius: '4px 4px 0 0',
              }}
            >
              軸yp
              {hingePropYpData.length > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '11px', color: '#999' }}>
                  ({hingePropYpData.length})
                </span>
              )}
            </button>
          </div>

          {/* zp Table */}
          {hingePropSubTab === 'zp' && (
            <SpreadsheetEditor
              key="hingeProp-zp"
              columns={generateColumnsFromConfig('HINGE_PROP_ZP')}
              data={hingePropZpData}
              onChange={handleHingePropZpChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['HINGE_PROP_ZP']?.headerRows ?? 1}
              headerValues={SHEET_CONFIGS['HINGE_PROP_ZP']?.headerValues}
            />
          )}

          {/* yp Table */}
          {hingePropSubTab === 'yp' && (
            <SpreadsheetEditor
              key="hingeProp-yp"
              columns={generateColumnsFromConfig('HINGE_PROP_YP')}
              data={hingePropYpData}
              onChange={handleHingePropYpChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['HINGE_PROP_YP']?.headerRows ?? 1}
              headerValues={SHEET_CONFIGS['HINGE_PROP_YP']?.headerValues}
            />
          )}
        </div>
      )}

      {/* SPGAllSym - Sub-tabs for 4 tables: Linear, Bilinear, Trilinear, Tetralinear */}
      {activeTab === 'spgAllSym' && (
        <div style={{ height: SPREADSHEET_CONTAINER_HEIGHT, width: '100%' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', height: SUB_TAB_HEIGHT, alignItems: 'center' }}>
            {[
              { key: 'linear', label: '①線形', data: spgAllSymLinearData },
              { key: 'bilinear', label: '②バイリニア', data: spgAllSymBilinearData },
              { key: 'trilinear', label: '③トリリニア', data: spgAllSymTrilinearData },
              { key: 'tetralinear', label: '④テトラリニア', data: spgAllSymTetralinearData },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSpgAllSymSubTab(tab.key as any)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  borderBottom: spgAllSymSubTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
                  background: spgAllSymSubTab === tab.key ? '#e3f2fd' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: spgAllSymSubTab === tab.key ? 600 : 400,
                  color: spgAllSymSubTab === tab.key ? '#1976d2' : '#666',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                {tab.label}
                {tab.data.length > 0 && (
                  <span style={{ marginLeft: '4px', fontSize: '11px', color: '#999' }}>
                    ({tab.data.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Linear Table */}
          {spgAllSymSubTab === 'linear' && (
            <SpreadsheetEditor
              key="spgAllSym-linear"
              columns={generateColumnsFromConfig('SPG_ALL_SYM_LINEAR')}
              data={spgAllSymLinearData}
              onChange={handleSpgAllSymLinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_SYM_LINEAR']?.headerRows ?? 1}
            />
          )}

          {/* Bilinear Table */}
          {spgAllSymSubTab === 'bilinear' && (
            <SpreadsheetEditor
              key="spgAllSym-bilinear"
              columns={generateColumnsFromConfig('SPG_ALL_SYM_BILINEAR')}
              data={spgAllSymBilinearData}
              onChange={handleSpgAllSymBilinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_SYM_BILINEAR']?.headerRows ?? 1}
            />
          )}

          {/* Trilinear Table */}
          {spgAllSymSubTab === 'trilinear' && (
            <SpreadsheetEditor
              key="spgAllSym-trilinear"
              columns={generateColumnsFromConfig('SPG_ALL_SYM_TRILINEAR')}
              data={spgAllSymTrilinearData}
              onChange={handleSpgAllSymTrilinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_SYM_TRILINEAR']?.headerRows ?? 1}
            />
          )}

          {/* Tetralinear Table */}
          {spgAllSymSubTab === 'tetralinear' && (
            <SpreadsheetEditor
              key="spgAllSym-tetralinear"
              columns={generateColumnsFromConfig('SPG_ALL_SYM_TETRALINEAR')}
              data={spgAllSymTetralinearData}
              onChange={handleSpgAllSymTetralinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_SYM_TETRALINEAR']?.headerRows ?? 1}
            />
          )}
        </div>
      )}

      {/* SPGAllASym - Sub-tabs for 3 tables: Bilinear, Trilinear, Tetralinear */}
      {activeTab === 'spgAllASym' && (
        <div style={{ height: SPREADSHEET_CONTAINER_HEIGHT, width: '100%' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', height: SUB_TAB_HEIGHT, alignItems: 'center' }}>
            {[
              { key: 'bilinear', label: '①バイリニア', data: spgAllASymBilinearData },
              { key: 'trilinear', label: '②トリリニア', data: spgAllASymTrilinearData },
              { key: 'tetralinear', label: '③テトラリニア', data: spgAllASymTetralinearData },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSpgAllASymSubTab(tab.key as any)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  borderBottom: spgAllASymSubTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
                  background: spgAllASymSubTab === tab.key ? '#e3f2fd' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: spgAllASymSubTab === tab.key ? 600 : 400,
                  color: spgAllASymSubTab === tab.key ? '#1976d2' : '#666',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                {tab.label}
                {tab.data.length > 0 && (
                  <span style={{ marginLeft: '4px', fontSize: '11px', color: '#999' }}>
                    ({tab.data.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bilinear Table */}
          {spgAllASymSubTab === 'bilinear' && (
            <SpreadsheetEditor
              key="spgAllASym-bilinear"
              columns={generateColumnsFromConfig('SPG_ALL_ASYM_BILINEAR')}
              data={spgAllASymBilinearData}
              onChange={handleSpgAllASymBilinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_ASYM_BILINEAR']?.headerRows ?? 1}
            />
          )}

          {/* Trilinear Table */}
          {spgAllASymSubTab === 'trilinear' && (
            <SpreadsheetEditor
              key="spgAllASym-trilinear"
              columns={generateColumnsFromConfig('SPG_ALL_ASYM_TRILINEAR')}
              data={spgAllASymTrilinearData}
              onChange={handleSpgAllASymTrilinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_ASYM_TRILINEAR']?.headerRows ?? 1}
            />
          )}

          {/* Tetralinear Table */}
          {spgAllASymSubTab === 'tetralinear' && (
            <SpreadsheetEditor
              key="spgAllASym-tetralinear"
              columns={generateColumnsFromConfig('SPG_ALL_ASYM_TETRALINEAR')}
              data={spgAllASymTetralinearData}
              onChange={handleSpgAllASymTetralinearChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_ASYM_TETRALINEAR']?.headerRows ?? 1}
            />
          )}
        </div>
      )}

      {/* SPGAllOther - Sub-tabs for 2 tables: 名古屋高速ゴム支承, BMR(CD)ダンパー */}
      {activeTab === 'spgAllOther' && (
        <div style={{ height: SPREADSHEET_CONTAINER_HEIGHT, width: '100%' }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', height: SUB_TAB_HEIGHT, alignItems: 'center' }}>
            {[
              { key: 'nagoya', label: '①名古屋高速ゴム支承', data: spgAllOtherNagoyaData },
              { key: 'bmr', label: '②BMR(CD)ダンパー', data: spgAllOtherBmrData },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSpgAllOtherSubTab(tab.key as any)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  borderBottom: spgAllOtherSubTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
                  background: spgAllOtherSubTab === tab.key ? '#e3f2fd' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: spgAllOtherSubTab === tab.key ? 600 : 400,
                  color: spgAllOtherSubTab === tab.key ? '#1976d2' : '#666',
                  borderRadius: '4px 4px 0 0',
                }}
              >
                {tab.label}
                {tab.data.length > 0 && (
                  <span style={{ marginLeft: '4px', fontSize: '11px', color: '#999' }}>
                    ({tab.data.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Nagoya Rubber Bearing Table */}
          {spgAllOtherSubTab === 'nagoya' && (
            <SpreadsheetEditor
              key="spgAllOther-nagoya"
              columns={generateColumnsFromConfig('SPG_ALL_OTHER_NAGOYA')}
              data={spgAllOtherNagoyaData}
              onChange={handleSpgAllOtherNagoyaChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_OTHER_NAGOYA']?.headerRows ?? 1}
            />
          )}

          {/* BMR(CD) Damper Table */}
          {spgAllOtherSubTab === 'bmr' && (
            <SpreadsheetEditor
              key="spgAllOther-bmr"
              columns={generateColumnsFromConfig('SPG_ALL_OTHER_BMR')}
              data={spgAllOtherBmrData}
              onChange={handleSpgAllOtherBmrChange}
              minRows={20}
              height={SPREADSHEET_CONTAINER_HEIGHT - SUB_TAB_HEIGHT - 40}
              headerRows={SHEET_CONFIGS['SPG_ALL_OTHER_BMR']?.headerRows ?? 1}
            />
          )}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Dialog
        open={isResetModalOpen}
        onClose={handleResetCancel}
      >
        <DialogTitle>{t('sheetTabs.resetTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('sheetTabs.resetMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCancel} variant="text">
            {t('sheetTabs.cancel')}
          </Button>
          <Button onClick={handleResetConfirm} variant="contained" color="negative">
            {t('sheetTabs.resetConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </GuideBox>
  );
});

SheetTabs.displayName = 'SheetTabs';

export default SheetTabs;
