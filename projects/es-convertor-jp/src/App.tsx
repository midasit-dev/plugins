/**
 * ES Convertor
 *
 * Converts ES (Engineer Studio) data to MIDAS Civil NX MCT format
 */

import React, { useCallback, useState, useRef } from 'react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Button,
} from '@midasit-dev/moaui';
import { Menu, MenuItem } from '@mui/material';

import SheetTabs, { SheetTabsRef } from './components/SheetTabs';
import ConversionModal from './components/ConversionModal';
import {
  hasAnyDataSelector,
  nodeSheetDataState,
  frameSheetDataState,
  planeElementSheetDataState,
  rigidSheetDataState,
  materialSheetDataState,
  numbSectSheetDataState,
  sectElemSheetDataState,
  sectionSheetDataState,
  plnSectSheetDataState,
  hingePropZpSheetDataState,
  hingePropYpSheetDataState,
  hingeAssSheetDataState,
  springSheetDataState,
  spg6CompSheetDataState,
  spgAllSymLinearSheetDataState,
  spgAllSymBilinearSheetDataState,
  spgAllSymTrilinearSheetDataState,
  spgAllSymTetralinearSheetDataState,
  spgAllASymBilinearSheetDataState,
  spgAllASymTrilinearSheetDataState,
  spgAllASymTetralinearSheetDataState,
  spgAllOtherNagoyaSheetDataState,
  spgAllOtherBmrSheetDataState,
  fulcrumSheetDataState,
  fulcrumDetailSheetDataState,
  nodalMassSheetDataState,
  loadSheetDataState,
  internalForceSheetDataState,
} from './stores/sheetDataState';
import { SHEET_NAMES, SHEET_CONFIGS } from './constants/sheetNames';
import { generateMCT } from './generators/MCTGenerator';
import { exportToExcel, createExportData } from './parsers/ExcelExporter';
import {
  NODE_EXAMPLE,
  MATERIAL_EXAMPLE,
  FRAME_EXAMPLE,
  SECTION_EXAMPLE,
  PLN_SECT_EXAMPLE,
  PLANE_ELEMENT_EXAMPLE,
  RIGID_EXAMPLE,
  LOAD_EXAMPLE,
  FULCRUM_EXAMPLE,
  FULC_DETAIL_EXAMPLE,
  NODAL_MASS_EXAMPLE,
  INTERNAL_FORCE_EXAMPLE,
  ELEM_SPRING_EXAMPLE,
  SPG_6COMP_EXAMPLE,
  SPG_ALL_SYM_LINEAR_EXAMPLE,
  SPG_ALL_SYM_BILINEAR_EXAMPLE,
  HINGE_ASS_EXAMPLE,
  HINGE_PROP_ZP_EXAMPLE,
  HINGE_PROP_YP_EXAMPLE,
  EXAMPLE_GROUPS,
} from './data/exampleData';

// Helper function to skip header rows when preparing data for conversion
const skipHeaderRows = (data: (string | number)[][], configKey: string): (string | number)[][] => {
  const headerRows = SHEET_CONFIGS[configKey]?.headerRows || 1;
  return data.slice(headerRows);
};

// Main application content
const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const sheetTabsRef = useRef<SheetTabsRef>(null);

  const hasAnyData = useRecoilValue(hasAnyDataSelector);

  // Setter for example data
  const setNodeData = useSetRecoilState(nodeSheetDataState);
  const setMaterialData = useSetRecoilState(materialSheetDataState);
  const setFrameData = useSetRecoilState(frameSheetDataState);
  const setSectionData = useSetRecoilState(sectionSheetDataState);
  const setPlnSectData = useSetRecoilState(plnSectSheetDataState);
  const setPlaneElementData = useSetRecoilState(planeElementSheetDataState);
  const setRigidData = useSetRecoilState(rigidSheetDataState);
  const setLoadData = useSetRecoilState(loadSheetDataState);
  const setFulcrumData = useSetRecoilState(fulcrumSheetDataState);
  const setFulcrumDetailData = useSetRecoilState(fulcrumDetailSheetDataState);
  const setNodalMassData = useSetRecoilState(nodalMassSheetDataState);
  const setInternalForceData = useSetRecoilState(internalForceSheetDataState);
  const setSpringData = useSetRecoilState(springSheetDataState);
  const setSpg6CompData = useSetRecoilState(spg6CompSheetDataState);
  const setSpgAllSymLinearData = useSetRecoilState(spgAllSymLinearSheetDataState);
  const setSpgAllSymBilinearData = useSetRecoilState(spgAllSymBilinearSheetDataState);
  const setHingeAssData = useSetRecoilState(hingeAssSheetDataState);
  const setHingePropZpData = useSetRecoilState(hingePropZpSheetDataState);
  const setHingePropYpData = useSetRecoilState(hingePropYpSheetDataState);

  // Sheet data from recoil (all 21 sheets)
  const nodeData = useRecoilValue(nodeSheetDataState);
  const frameData = useRecoilValue(frameSheetDataState);
  const planeElementData = useRecoilValue(planeElementSheetDataState);
  const rigidData = useRecoilValue(rigidSheetDataState);
  const materialData = useRecoilValue(materialSheetDataState);
  const numbSectData = useRecoilValue(numbSectSheetDataState);
  const sectElemData = useRecoilValue(sectElemSheetDataState);
  const sectionData = useRecoilValue(sectionSheetDataState);
  const plnSectData = useRecoilValue(plnSectSheetDataState);
  const hingePropZpData = useRecoilValue(hingePropZpSheetDataState);
  const hingePropYpData = useRecoilValue(hingePropYpSheetDataState);
  const hingeAssData = useRecoilValue(hingeAssSheetDataState);
  const springData = useRecoilValue(springSheetDataState);
  const spg6CompData = useRecoilValue(spg6CompSheetDataState);
  // SPG_ALL_SYM sub-tables
  const spgAllSymLinearData = useRecoilValue(spgAllSymLinearSheetDataState);
  const spgAllSymBilinearData = useRecoilValue(spgAllSymBilinearSheetDataState);
  const spgAllSymTrilinearData = useRecoilValue(spgAllSymTrilinearSheetDataState);
  const spgAllSymTetralinearData = useRecoilValue(spgAllSymTetralinearSheetDataState);
  // SPG_ALL_ASYM sub-tables
  const spgAllASymBilinearData = useRecoilValue(spgAllASymBilinearSheetDataState);
  const spgAllASymTrilinearData = useRecoilValue(spgAllASymTrilinearSheetDataState);
  const spgAllASymTetralinearData = useRecoilValue(spgAllASymTetralinearSheetDataState);
  // SPG_ALL_OTHER sub-tables
  const spgAllOtherNagoyaData = useRecoilValue(spgAllOtherNagoyaSheetDataState);
  const spgAllOtherBmrData = useRecoilValue(spgAllOtherBmrSheetDataState);
  const fulcrumData = useRecoilValue(fulcrumSheetDataState);
  const fulcrumDetailData = useRecoilValue(fulcrumDetailSheetDataState);
  const nodalMassData = useRecoilValue(nodalMassSheetDataState);
  const loadData = useRecoilValue(loadSheetDataState);
  const internalForceData = useRecoilValue(internalForceSheetDataState);

  // Menu state for example data
  const [exampleMenuAnchor, setExampleMenuAnchor] = useState<null | HTMLElement>(null);
  const isExampleMenuOpen = Boolean(exampleMenuAnchor);

  const handleExampleMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setExampleMenuAnchor(event.currentTarget);
  }, []);

  const handleExampleMenuClose = useCallback(() => {
    setExampleMenuAnchor(null);
  }, []);

  // Load NODE example data
  const handleLoadNodeExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, handleExampleMenuClose]);

  // Load MATERIAL example data (NODE is required for conversion)
  const handleLoadMaterialExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);  // NODE is required
    setMaterialData(MATERIAL_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, handleExampleMenuClose]);

  // Load SECTION example data (NODE, FRAME, MATERIAL are required)
  const handleLoadSectionExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);        // NODE is required
    setMaterialData(MATERIAL_EXAMPLE.data); // MATERIAL is required
    setFrameData(FRAME_EXAMPLE.data);       // FRAME provides section pairs
    setSectionData(SECTION_EXAMPLE.data);   // Main SECTION data
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, setFrameData, setSectionData, handleExampleMenuClose]);

  // Load ELEMENT example data (all element types: FRAME, PLANE, RIGID)
  const handleLoadElementExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);                 // NODE is required
    setMaterialData(MATERIAL_EXAMPLE.data);         // MATERIAL is required
    setFrameData(FRAME_EXAMPLE.data);               // FRAME elements (Beam)
    setSectionData(SECTION_EXAMPLE.data);           // SECTION for FRAME
    setPlnSectData(PLN_SECT_EXAMPLE.data);          // PLN_SECT for PLANE
    setPlaneElementData(PLANE_ELEMENT_EXAMPLE.data); // PLANE elements (PLATE)
    setRigidData(RIGID_EXAMPLE.data);               // RIGID elements
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, setFrameData, setSectionData, setPlnSectData, setPlaneElementData, setRigidData, handleExampleMenuClose]);

  // Load RIGIDLINK example data
  const handleLoadRigidLinkExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);   // NODE is required
    setRigidData(RIGID_EXAMPLE.data); // RIGID elements
    handleExampleMenuClose();
  }, [setNodeData, setRigidData, handleExampleMenuClose]);

  // Load THICKNESS example data
  const handleLoadThicknessExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);       // NODE is required
    setPlnSectData(PLN_SECT_EXAMPLE.data); // PLN_SECT (THICKNESS)
    handleExampleMenuClose();
  }, [setNodeData, setPlnSectData, handleExampleMenuClose]);

  // Load STLDCASE example data (NODE, FRAME, SECTION required for BEAMLOAD)
  const handleLoadStldCaseExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);        // NODE is required
    setMaterialData(MATERIAL_EXAMPLE.data); // MATERIAL for elements
    setFrameData(FRAME_EXAMPLE.data);       // FRAME for BEAMLOAD
    setSectionData(SECTION_EXAMPLE.data);   // SECTION for FRAME
    setLoadData(LOAD_EXAMPLE.data);         // LOAD data
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, setFrameData, setSectionData, setLoadData, handleExampleMenuClose]);

  // Load SUPPORT (支点) example data
  const handleLoadSupportExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);
    setFulcrumData(FULCRUM_EXAMPLE.data);
    setFulcrumDetailData(FULC_DETAIL_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, setFulcrumData, setFulcrumDetailData, handleExampleMenuClose]);

  // Load SPRING (ばね) example data
  const handleLoadSpringExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);
    setSpringData(ELEM_SPRING_EXAMPLE.data);
    setSpg6CompData(SPG_6COMP_EXAMPLE.data);
    setSpgAllSymLinearData(SPG_ALL_SYM_LINEAR_EXAMPLE.data);
    setSpgAllSymBilinearData(SPG_ALL_SYM_BILINEAR_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, setSpringData, setSpg6CompData, setSpgAllSymLinearData, setSpgAllSymBilinearData, handleExampleMenuClose]);

  // Load HINGE (ヒンジ) example data
  const handleLoadHingeExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);
    setMaterialData(MATERIAL_EXAMPLE.data);
    setFrameData(FRAME_EXAMPLE.data);
    setSectionData(SECTION_EXAMPLE.data);
    setHingeAssData(HINGE_ASS_EXAMPLE.data);
    setHingePropZpData(HINGE_PROP_ZP_EXAMPLE.data);
    setHingePropYpData(HINGE_PROP_YP_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, setFrameData, setSectionData, setHingeAssData, setHingePropZpData, setHingePropYpData, handleExampleMenuClose]);

  // Load LOAD (荷重) example data - all load types
  const handleLoadLoadExample = useCallback(() => {
    setNodeData(NODE_EXAMPLE.data);
    setMaterialData(MATERIAL_EXAMPLE.data);
    setFrameData(FRAME_EXAMPLE.data);
    setSectionData(SECTION_EXAMPLE.data);
    setLoadData(LOAD_EXAMPLE.data);
    setNodalMassData(NODAL_MASS_EXAMPLE.data);
    setInternalForceData(INTERNAL_FORCE_EXAMPLE.data);
    handleExampleMenuClose();
  }, [setNodeData, setMaterialData, setFrameData, setSectionData, setLoadData, setNodalMassData, setInternalForceData, handleExampleMenuClose]);

  // Handle Excel export
  const handleExportExcel = useCallback(() => {
    const exportData = createExportData(
      nodeData,
      frameData,
      planeElementData,
      rigidData,
      materialData,
      numbSectData,
      sectElemData,
      sectionData,
      plnSectData,
      hingePropZpData,
      hingePropYpData,
      hingeAssData,
      springData,
      spg6CompData,
      spgAllSymLinearData,
      spgAllSymBilinearData,
      spgAllSymTrilinearData,
      spgAllSymTetralinearData,
      spgAllASymBilinearData,
      spgAllASymTrilinearData,
      spgAllASymTetralinearData,
      spgAllOtherNagoyaData,
      spgAllOtherBmrData,
      fulcrumData,
      fulcrumDetailData,
      nodalMassData,
      loadData,
      internalForceData
    );
    exportToExcel(exportData, 'ES Convertor_Input.xlsx');
  }, [
    nodeData, frameData, planeElementData, rigidData, materialData,
    numbSectData, sectElemData, sectionData, plnSectData,
    hingePropZpData, hingePropYpData, hingeAssData,
    springData, spg6CompData,
    spgAllSymLinearData, spgAllSymBilinearData, spgAllSymTrilinearData, spgAllSymTetralinearData,
    spgAllASymBilinearData, spgAllASymTrilinearData, spgAllASymTetralinearData,
    spgAllOtherNagoyaData, spgAllOtherBmrData,
    fulcrumData, fulcrumDetailData, nodalMassData, loadData, internalForceData
  ]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    success: boolean;
    mctText2025: string;
    mctText2026: string;
    errors: string[];
    warnings: string[];
  } | null>(null);

  // Handle conversion
  const handleConvert = useCallback(async () => {
    setIsConverting(true);

    try {
      // Build sheets map from current data
      const sheets = new Map<string, { name: string; data: (string | number)[][] }>();

      // Add all 21 sheets to the map (skipping header rows for conversion)
      console.log('=== Recoil State Data Debug ===');
      console.log('nodeData (raw Recoil):', nodeData.length, 'rows');
      console.log('frameData (raw Recoil):', frameData.length, 'rows');
      console.log('planeElementData (raw Recoil):', planeElementData.length, 'rows');
      console.log('rigidData (raw Recoil):', rigidData.length, 'rows');
      console.log('plnSectData (raw Recoil):', plnSectData.length, 'rows');

      const nodeDataForConversion = skipHeaderRows(nodeData, 'NODE');
      if (nodeDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.NODE, { name: SHEET_NAMES.NODE, data: nodeDataForConversion });
      }
      const frameDataForConversion = skipHeaderRows(frameData, 'FRAME');
      console.log('frameDataForConversion (after skipHeaderRows):', frameDataForConversion.length, 'rows');
      if (frameDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.FRAME, { name: SHEET_NAMES.FRAME, data: frameDataForConversion });
      }
      const planeElementDataForConversion = skipHeaderRows(planeElementData, 'PLANE_ELEMENT');
      console.log('planeElementDataForConversion (after skipHeaderRows):', planeElementDataForConversion.length, 'rows');
      if (planeElementDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.PLANE_ELEMENT, { name: SHEET_NAMES.PLANE_ELEMENT, data: planeElementDataForConversion });
      }
      const rigidDataForConversion = skipHeaderRows(rigidData, 'RIGID');
      console.log('rigidDataForConversion (after skipHeaderRows):', rigidDataForConversion.length, 'rows');
      if (rigidDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.RIGID, { name: SHEET_NAMES.RIGID, data: rigidDataForConversion });
      }
      const materialDataForConversion = skipHeaderRows(materialData, 'MATERIAL');
      if (materialDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.MATERIAL, { name: SHEET_NAMES.MATERIAL, data: materialDataForConversion });
      }
      const numbSectDataForConversion = skipHeaderRows(numbSectData, 'NUMB_SECT');
      if (numbSectDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.NUMB_SECT, { name: SHEET_NAMES.NUMB_SECT, data: numbSectDataForConversion });
      }
      const sectElemDataForConversion = skipHeaderRows(sectElemData, 'SECT_ELEM');
      if (sectElemDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.SECT_ELEM, { name: SHEET_NAMES.SECT_ELEM, data: sectElemDataForConversion });
      }
      const sectionDataForConversion = skipHeaderRows(sectionData, 'SECT');
      if (sectionDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.SECT, { name: SHEET_NAMES.SECT, data: sectionDataForConversion });
      }
      const plnSectDataForConversion = skipHeaderRows(plnSectData, 'PLN_SECT');
      console.log('plnSectDataForConversion (after skipHeaderRows):', plnSectDataForConversion.length, 'rows');
      if (plnSectDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.PLN_SECT, { name: SHEET_NAMES.PLN_SECT, data: plnSectDataForConversion });
      }
      // HingeProp has two data regions: zp and yp
      const hingePropZpDataForConversion = skipHeaderRows(hingePropZpData, 'HINGE_PROP_ZP');
      const hingePropYpDataForConversion = skipHeaderRows(hingePropYpData, 'HINGE_PROP_YP');
      if (hingePropZpDataForConversion.length > 0 || hingePropYpDataForConversion.length > 0) {
        // Pass zp data as the main HINGE_PROP sheet
        sheets.set(SHEET_NAMES.HINGE_PROP, { name: SHEET_NAMES.HINGE_PROP, data: hingePropZpDataForConversion });
        // Pass yp data with a special key
        sheets.set('HINGE_PROP_YP', { name: 'HINGE_PROP_YP', data: hingePropYpDataForConversion });
      }
      const hingeAssDataForConversion = skipHeaderRows(hingeAssData, 'HINGE_ASS');
      if (hingeAssDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.HINGE_ASS, { name: SHEET_NAMES.HINGE_ASS, data: hingeAssDataForConversion });
      }
      const springDataForConversion = skipHeaderRows(springData, 'ELEM_SPRING');
      if (springDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.ELEM_SPRING, { name: SHEET_NAMES.ELEM_SPRING, data: springDataForConversion });
      }
      const spg6CompDataForConversion = skipHeaderRows(spg6CompData, 'SPG_6COMP');
      if (spg6CompDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.SPG_6COMP, { name: SHEET_NAMES.SPG_6COMP, data: spg6CompDataForConversion });
      }
      // SPG_ALL_SYM - use sub-table data and add placeholder sheet if any data exists
      // Debug: Log raw Recoil state data before skipHeaderRows
      console.log('=== SPG Data Debug ===');
      console.log('spgAllSymLinearData (raw Recoil):', spgAllSymLinearData.length, 'rows');
      console.log('spgAllSymBilinearData (raw Recoil):', spgAllSymBilinearData.length, 'rows');
      console.log('spgAllSymTrilinearData (raw Recoil):', spgAllSymTrilinearData.length, 'rows');
      console.log('spgAllSymTetralinearData (raw Recoil):', spgAllSymTetralinearData.length, 'rows');
      console.log('spgAllASymBilinearData (raw Recoil):', spgAllASymBilinearData.length, 'rows');
      console.log('spgAllASymTrilinearData (raw Recoil):', spgAllASymTrilinearData.length, 'rows');
      console.log('spgAllASymTetralinearData (raw Recoil):', spgAllASymTetralinearData.length, 'rows');

      const spgSymLinearForConversion = skipHeaderRows(spgAllSymLinearData, 'SPG_ALL_SYM_LINEAR');
      const spgSymBilinearForConversion = skipHeaderRows(spgAllSymBilinearData, 'SPG_ALL_SYM_BILINEAR');
      const spgSymTrilinearForConversion = skipHeaderRows(spgAllSymTrilinearData, 'SPG_ALL_SYM_TRILINEAR');
      const spgSymTetralinearForConversion = skipHeaderRows(spgAllSymTetralinearData, 'SPG_ALL_SYM_TETRALINEAR');

      console.log('After skipHeaderRows:');
      console.log('spgSymLinearForConversion:', spgSymLinearForConversion.length, 'rows');
      console.log('spgSymBilinearForConversion:', spgSymBilinearForConversion.length, 'rows');
      console.log('spgSymTrilinearForConversion:', spgSymTrilinearForConversion.length, 'rows');
      console.log('spgSymTetralinearForConversion:', spgSymTetralinearForConversion.length, 'rows');
      if (spgSymLinearForConversion.length > 0 || spgSymBilinearForConversion.length > 0 ||
          spgSymTrilinearForConversion.length > 0 || spgSymTetralinearForConversion.length > 0) {
        // Add placeholder sheet to indicate data exists
        sheets.set(SHEET_NAMES.SPG_ALL_SYM, { name: SHEET_NAMES.SPG_ALL_SYM, data: [[]] });
      }
      // SPG_ALL_ASYM - use sub-table data
      const spgAsymBilinearForConversion = skipHeaderRows(spgAllASymBilinearData, 'SPG_ALL_ASYM_BILINEAR');
      const spgAsymTrilinearForConversion = skipHeaderRows(spgAllASymTrilinearData, 'SPG_ALL_ASYM_TRILINEAR');
      const spgAsymTetralinearForConversion = skipHeaderRows(spgAllASymTetralinearData, 'SPG_ALL_ASYM_TETRALINEAR');

      console.log('ASYM After skipHeaderRows:');
      console.log('spgAsymBilinearForConversion:', spgAsymBilinearForConversion.length, 'rows');
      console.log('spgAsymTrilinearForConversion:', spgAsymTrilinearForConversion.length, 'rows');
      console.log('spgAsymTetralinearForConversion:', spgAsymTetralinearForConversion.length, 'rows');
      if (spgAsymBilinearForConversion.length > 0 || spgAsymTrilinearForConversion.length > 0 ||
          spgAsymTetralinearForConversion.length > 0) {
        sheets.set(SHEET_NAMES.SPG_ALL_ASYM, { name: SHEET_NAMES.SPG_ALL_ASYM, data: [[]] });
      }
      // SPG_ALL_OTHER - use sub-table data
      const spgOtherNagoyaForConversion = skipHeaderRows(spgAllOtherNagoyaData, 'SPG_ALL_OTHER_NAGOYA');
      const spgOtherBmrForConversion = skipHeaderRows(spgAllOtherBmrData, 'SPG_ALL_OTHER_BMR');
      if (spgOtherNagoyaForConversion.length > 0 || spgOtherBmrForConversion.length > 0) {
        sheets.set(SHEET_NAMES.SPG_ALL_OTHER, { name: SHEET_NAMES.SPG_ALL_OTHER, data: [[]] });
      }
      const fulcrumDataForConversion = skipHeaderRows(fulcrumData, 'FULCRUM');
      if (fulcrumDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.FULCRUM, { name: SHEET_NAMES.FULCRUM, data: fulcrumDataForConversion });
      }
      const fulcrumDetailDataForConversion = skipHeaderRows(fulcrumDetailData, 'FULC_DETAIL');
      if (fulcrumDetailDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.FULC_DETAIL, { name: SHEET_NAMES.FULC_DETAIL, data: fulcrumDetailDataForConversion });
      }
      const nodalMassDataForConversion = skipHeaderRows(nodalMassData, 'NODAL_MASS');
      if (nodalMassDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.NODAL_MASS, { name: SHEET_NAMES.NODAL_MASS, data: nodalMassDataForConversion });
      }
      const loadDataForConversion = skipHeaderRows(loadData, 'LOAD');
      if (loadDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.LOAD, { name: SHEET_NAMES.LOAD, data: loadDataForConversion });
      }
      const internalForceDataForConversion = skipHeaderRows(internalForceData, 'INTERNAL_FORCE');
      if (internalForceDataForConversion.length > 0) {
        sheets.set(SHEET_NAMES.INTERNAL_FORCE, { name: SHEET_NAMES.INTERNAL_FORCE, data: internalForceDataForConversion });
      }

      // Create subTables map for SPG sub-tables
      const subTables = new Map<string, (string | number)[][]>();
      if (spgSymLinearForConversion.length > 0) subTables.set('SPG_ALL_SYM_LINEAR', spgSymLinearForConversion);
      if (spgSymBilinearForConversion.length > 0) subTables.set('SPG_ALL_SYM_BILINEAR', spgSymBilinearForConversion);
      if (spgSymTrilinearForConversion.length > 0) subTables.set('SPG_ALL_SYM_TRILINEAR', spgSymTrilinearForConversion);
      if (spgSymTetralinearForConversion.length > 0) subTables.set('SPG_ALL_SYM_TETRALINEAR', spgSymTetralinearForConversion);
      if (spgAsymBilinearForConversion.length > 0) subTables.set('SPG_ALL_ASYM_BILINEAR', spgAsymBilinearForConversion);
      if (spgAsymTrilinearForConversion.length > 0) subTables.set('SPG_ALL_ASYM_TRILINEAR', spgAsymTrilinearForConversion);
      if (spgAsymTetralinearForConversion.length > 0) subTables.set('SPG_ALL_ASYM_TETRALINEAR', spgAsymTetralinearForConversion);
      if (spgOtherNagoyaForConversion.length > 0) subTables.set('SPG_ALL_OTHER_NAGOYA', spgOtherNagoyaForConversion);
      if (spgOtherBmrForConversion.length > 0) subTables.set('SPG_ALL_OTHER_BMR', spgOtherBmrForConversion);

      console.log('=== SubTables Map (App.tsx) ===');
      for (const [name, data] of subTables) {
        console.log(`SubTable "${name}": ${data.length} rows`);
      }
      console.log('Total subTables entries:', subTables.size);

      // Create parse result format
      const parseResult = {
        success: true,
        sheets,
        subTables,
        errors: [] as string[],
        warnings: [] as string[],
      };

      // Generate MCT for both versions
      const result2025 = await generateMCT(parseResult, { version: 2025, includeComments: true, validateInput: true }, () => {});
      const result2026 = await generateMCT(parseResult, { version: 2026, includeComments: true, validateInput: true }, () => {});

      // Combine and deduplicate errors and warnings from both versions
      const allErrors = [...new Set([...(result2025.errors || []), ...(result2026.errors || [])])];
      const allWarnings = [...new Set([...(result2025.warnings || []), ...(result2026.warnings || [])])];

      setConversionResult({
        success: result2025.success && result2026.success,
        mctText2025: result2025.mctText || '',
        mctText2026: result2026.mctText || '',
        errors: allErrors,
        warnings: allWarnings,
      });

      setIsModalOpen(true);
    } catch (error) {
      setConversionResult({
        success: false,
        mctText2025: '',
        mctText2026: '',
        errors: [`${t('app.conversionError')}: ${error}`],
        warnings: [],
      });
      setIsModalOpen(true);
    } finally {
      setIsConverting(false);
    }
  }, [
    t,
    nodeData,
    frameData,
    planeElementData,
    rigidData,
    materialData,
    numbSectData,
    sectElemData,
    sectionData,
    plnSectData,
    hingePropZpData,
    hingePropYpData,
    hingeAssData,
    springData,
    spg6CompData,
    spgAllSymLinearData,
    spgAllSymBilinearData,
    spgAllSymTrilinearData,
    spgAllSymTetralinearData,
    spgAllASymBilinearData,
    spgAllASymTrilinearData,
    spgAllASymTetralinearData,
    spgAllOtherNagoyaData,
    spgAllOtherBmrData,
    fulcrumData,
    fulcrumDetailData,
    nodalMassData,
    loadData,
    internalForceData,
  ]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <GuideBox width={750} spacing={2} padding={2}>
      {/* Main Content - Sheet Tabs */}
      <Panel variant="shadow2" width="100%" padding={2}>
        <SheetTabs ref={sheetTabsRef} />
      </Panel>

      {/* Bottom Actions */}
      <GuideBox row horSpaceBetween verCenter width="100%">
        <GuideBox row spacing={1}>
          <Button
            variant="outlined"
            onClick={() => sheetTabsRef.current?.triggerImport()}
          >
            {t('sheetTabs.importExcel')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            disabled={!hasAnyData}
          >
            {t('app.exportExcel', 'Export Excel')}
          </Button>
        </GuideBox>

        {/* Example Data Menu - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Button
              variant="outlined"
              onClick={handleExampleMenuOpen}
            >
              {t('app.exampleData', '例題')}
            </Button>
            <Menu
              anchorEl={exampleMenuAnchor}
              open={isExampleMenuOpen}
              onClose={handleExampleMenuClose}
            >
              {/* 基本 (Basic) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- 基本 ---</MenuItem>
              <MenuItem onClick={handleLoadNodeExample}>NODE (節点)</MenuItem>
              <MenuItem onClick={handleLoadMaterialExample}>MATERIAL (材料)</MenuItem>
              {/* 断面 (Section) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- 断面 ---</MenuItem>
              <MenuItem onClick={handleLoadSectionExample}>SECTION (断面特性)</MenuItem>
              <MenuItem onClick={handleLoadThicknessExample}>THICKNESS (平板断面)</MenuItem>
              {/* 要素 (Element) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- 要素 ---</MenuItem>
              <MenuItem onClick={handleLoadElementExample}>ELEMENT (全要素)</MenuItem>
              <MenuItem onClick={handleLoadRigidLinkExample}>RIGIDLINK (剛体)</MenuItem>
              {/* 支点 (Support) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- 支点 ---</MenuItem>
              <MenuItem onClick={handleLoadSupportExample}>SUPPORT (支点)</MenuItem>
              {/* ばね (Spring) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- ばね ---</MenuItem>
              <MenuItem onClick={handleLoadSpringExample}>SPRING (ばね要素)</MenuItem>
              {/* ヒンジ (Hinge) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- ヒンジ ---</MenuItem>
              <MenuItem onClick={handleLoadHingeExample}>HINGE (M-φ)</MenuItem>
              {/* 荷重 (Load) */}
              <MenuItem disabled style={{ opacity: 0.7, fontSize: 12 }}>--- 荷重 ---</MenuItem>
              <MenuItem onClick={handleLoadStldCaseExample}>LOAD (荷重)</MenuItem>
              <MenuItem onClick={handleLoadLoadExample}>LOAD+MASS (荷重+質量)</MenuItem>
            </Menu>
          </>
        )}

        <Button
          variant="contained"
          onClick={handleConvert}
          disabled={!hasAnyData || isConverting}
        >
          {isConverting ? t('app.converting') : t('app.convertToMCT')}
        </Button>
      </GuideBox>

      {/* Conversion Result Modal */}
      <ConversionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mctText2025={conversionResult?.mctText2025 || ''}
        mctText2026={conversionResult?.mctText2026 || ''}
        errors={conversionResult?.errors || []}
        warnings={conversionResult?.warnings || []}
        isSuccess={conversionResult?.success || false}
      />
    </GuideBox>
  );
};

// Root component with Recoil provider
const App: React.FC = () => {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
};

export default App;
