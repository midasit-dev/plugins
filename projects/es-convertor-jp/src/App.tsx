/**
 * ES Convertor
 *
 * Converts ES (Engineer Studio) data to MIDAS Civil NX MCT format
 */

import React, { useCallback, useState, useRef } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import {
  GuideBox,
  Panel,
  Button,
} from '@midasit-dev/moaui';

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
  spgAllSymSheetDataState,
  spgAllASymSheetDataState,
  spgAllOtherSheetDataState,
  fulcrumSheetDataState,
  fulcrumDetailSheetDataState,
  nodalMassSheetDataState,
  loadSheetDataState,
  internalForceSheetDataState,
} from './stores/sheetDataState';
import { SHEET_NAMES } from './constants/sheetNames';
import { generateMCT } from './generators/MCTGenerator';

// Main application content
const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const sheetTabsRef = useRef<SheetTabsRef>(null);

  const hasAnyData = useRecoilValue(hasAnyDataSelector);

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
  const spgAllSymData = useRecoilValue(spgAllSymSheetDataState);
  const spgAllASymData = useRecoilValue(spgAllASymSheetDataState);
  const spgAllOtherData = useRecoilValue(spgAllOtherSheetDataState);
  const fulcrumData = useRecoilValue(fulcrumSheetDataState);
  const fulcrumDetailData = useRecoilValue(fulcrumDetailSheetDataState);
  const nodalMassData = useRecoilValue(nodalMassSheetDataState);
  const loadData = useRecoilValue(loadSheetDataState);
  const internalForceData = useRecoilValue(internalForceSheetDataState);

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

      // Add all 21 sheets to the map
      if (nodeData.length > 0) {
        sheets.set(SHEET_NAMES.NODE, { name: SHEET_NAMES.NODE, data: nodeData });
      }
      if (frameData.length > 0) {
        sheets.set(SHEET_NAMES.FRAME, { name: SHEET_NAMES.FRAME, data: frameData });
      }
      if (planeElementData.length > 0) {
        sheets.set(SHEET_NAMES.PLANE_ELEMENT, { name: SHEET_NAMES.PLANE_ELEMENT, data: planeElementData });
      }
      if (rigidData.length > 0) {
        sheets.set(SHEET_NAMES.RIGID, { name: SHEET_NAMES.RIGID, data: rigidData });
      }
      if (materialData.length > 0) {
        sheets.set(SHEET_NAMES.MATERIAL, { name: SHEET_NAMES.MATERIAL, data: materialData });
      }
      if (numbSectData.length > 0) {
        sheets.set(SHEET_NAMES.NUMB_SECT, { name: SHEET_NAMES.NUMB_SECT, data: numbSectData });
      }
      if (sectElemData.length > 0) {
        sheets.set(SHEET_NAMES.SECT_ELEM, { name: SHEET_NAMES.SECT_ELEM, data: sectElemData });
      }
      if (sectionData.length > 0) {
        sheets.set(SHEET_NAMES.SECT, { name: SHEET_NAMES.SECT, data: sectionData });
      }
      if (plnSectData.length > 0) {
        sheets.set(SHEET_NAMES.PLN_SECT, { name: SHEET_NAMES.PLN_SECT, data: plnSectData });
      }
      // HingeProp has two data regions: zp and yp
      if (hingePropZpData.length > 0 || hingePropYpData.length > 0) {
        // Pass zp data as the main HINGE_PROP sheet
        sheets.set(SHEET_NAMES.HINGE_PROP, { name: SHEET_NAMES.HINGE_PROP, data: hingePropZpData });
        // Pass yp data with a special key
        sheets.set('HINGE_PROP_YP', { name: 'HINGE_PROP_YP', data: hingePropYpData });
      }
      if (hingeAssData.length > 0) {
        sheets.set(SHEET_NAMES.HINGE_ASS, { name: SHEET_NAMES.HINGE_ASS, data: hingeAssData });
      }
      if (springData.length > 0) {
        sheets.set(SHEET_NAMES.ELEM_SPRING, { name: SHEET_NAMES.ELEM_SPRING, data: springData });
      }
      if (spg6CompData.length > 0) {
        sheets.set(SHEET_NAMES.SPG_6COMP, { name: SHEET_NAMES.SPG_6COMP, data: spg6CompData });
      }
      if (spgAllSymData.length > 0) {
        sheets.set(SHEET_NAMES.SPG_ALL_SYM, { name: SHEET_NAMES.SPG_ALL_SYM, data: spgAllSymData });
      }
      if (spgAllASymData.length > 0) {
        sheets.set(SHEET_NAMES.SPG_ALL_ASYM, { name: SHEET_NAMES.SPG_ALL_ASYM, data: spgAllASymData });
      }
      if (spgAllOtherData.length > 0) {
        sheets.set(SHEET_NAMES.SPG_ALL_OTHER, { name: SHEET_NAMES.SPG_ALL_OTHER, data: spgAllOtherData });
      }
      if (fulcrumData.length > 0) {
        sheets.set(SHEET_NAMES.FULCRUM, { name: SHEET_NAMES.FULCRUM, data: fulcrumData });
      }
      if (fulcrumDetailData.length > 0) {
        sheets.set(SHEET_NAMES.FULC_DETAIL, { name: SHEET_NAMES.FULC_DETAIL, data: fulcrumDetailData });
      }
      if (nodalMassData.length > 0) {
        sheets.set(SHEET_NAMES.NODAL_MASS, { name: SHEET_NAMES.NODAL_MASS, data: nodalMassData });
      }
      if (loadData.length > 0) {
        sheets.set(SHEET_NAMES.LOAD, { name: SHEET_NAMES.LOAD, data: loadData });
      }
      if (internalForceData.length > 0) {
        sheets.set(SHEET_NAMES.INTERNAL_FORCE, { name: SHEET_NAMES.INTERNAL_FORCE, data: internalForceData });
      }

      // Create parse result format
      const parseResult = {
        success: true,
        sheets,
        subTables: new Map<string, (string | number)[][]>(),
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
    spgAllSymData,
    spgAllASymData,
    spgAllOtherData,
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
        <Button
          variant="outlined"
          onClick={() => sheetTabsRef.current?.triggerImport()}
        >
          {t('sheetTabs.importExcel')}
        </Button>

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
