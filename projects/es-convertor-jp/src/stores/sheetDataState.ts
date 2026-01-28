// Sheet Data State
// Recoil atoms for each spreadsheet tab data (21 sheets)

import { atom, selector } from 'recoil';
import { SHEET_NAMES } from '../constants/sheetNames';

// Type for sheet data
type SheetData = (string | number)[][];

// Create atom for each sheet
export const nodeSheetDataState = atom<SheetData>({
  key: 'nodeSheetDataState',
  default: [],
});

export const frameSheetDataState = atom<SheetData>({
  key: 'frameSheetDataState',
  default: [],
});

export const planeElementSheetDataState = atom<SheetData>({
  key: 'planeElementSheetDataState',
  default: [],
});

export const rigidSheetDataState = atom<SheetData>({
  key: 'rigidSheetDataState',
  default: [],
});

export const materialSheetDataState = atom<SheetData>({
  key: 'materialSheetDataState',
  default: [],
});

export const numbSectSheetDataState = atom<SheetData>({
  key: 'numbSectSheetDataState',
  default: [],
});

export const sectElemSheetDataState = atom<SheetData>({
  key: 'sectElemSheetDataState',
  default: [],
});

export const sectionSheetDataState = atom<SheetData>({
  key: 'sectionSheetDataState',
  default: [],
});

export const plnSectSheetDataState = atom<SheetData>({
  key: 'plnSectSheetDataState',
  default: [],
});

export const hingePropSheetDataState = atom<SheetData>({
  key: 'hingePropSheetDataState',
  default: [],
});

// Hinge Prop has two data regions: zp and yp
export const hingePropZpSheetDataState = atom<SheetData>({
  key: 'hingePropZpSheetDataState',
  default: [],
});

export const hingePropYpSheetDataState = atom<SheetData>({
  key: 'hingePropYpSheetDataState',
  default: [],
});

export const hingeAssSheetDataState = atom<SheetData>({
  key: 'hingeAssSheetDataState',
  default: [],
});

export const springSheetDataState = atom<SheetData>({
  key: 'springSheetDataState',
  default: [],
});

export const spg6CompSheetDataState = atom<SheetData>({
  key: 'spg6CompSheetDataState',
  default: [],
});

export const spgAllSymSheetDataState = atom<SheetData>({
  key: 'spgAllSymSheetDataState',
  default: [],
});

// SPG_ALL_SYM has 4 data regions: Linear, Bilinear, Trilinear, Tetralinear
export const spgAllSymLinearSheetDataState = atom<SheetData>({
  key: 'spgAllSymLinearSheetDataState',
  default: [],
});

export const spgAllSymBilinearSheetDataState = atom<SheetData>({
  key: 'spgAllSymBilinearSheetDataState',
  default: [],
});

export const spgAllSymTrilinearSheetDataState = atom<SheetData>({
  key: 'spgAllSymTrilinearSheetDataState',
  default: [],
});

export const spgAllSymTetralinearSheetDataState = atom<SheetData>({
  key: 'spgAllSymTetralinearSheetDataState',
  default: [],
});

export const spgAllASymSheetDataState = atom<SheetData>({
  key: 'spgAllASymSheetDataState',
  default: [],
});

// SPG_ALL_ASYM has 3 data regions: Bilinear, Trilinear, Tetralinear
export const spgAllASymBilinearSheetDataState = atom<SheetData>({
  key: 'spgAllASymBilinearSheetDataState',
  default: [],
});

export const spgAllASymTrilinearSheetDataState = atom<SheetData>({
  key: 'spgAllASymTrilinearSheetDataState',
  default: [],
});

export const spgAllASymTetralinearSheetDataState = atom<SheetData>({
  key: 'spgAllASymTetralinearSheetDataState',
  default: [],
});

export const spgAllOtherSheetDataState = atom<SheetData>({
  key: 'spgAllOtherSheetDataState',
  default: [],
});

// SPG_ALL_OTHER has 2 data regions: Nagoya rubber bearing, BMR(CD) damper
export const spgAllOtherNagoyaSheetDataState = atom<SheetData>({
  key: 'spgAllOtherNagoyaSheetDataState',
  default: [],
});

export const spgAllOtherBmrSheetDataState = atom<SheetData>({
  key: 'spgAllOtherBmrSheetDataState',
  default: [],
});

export const fulcrumSheetDataState = atom<SheetData>({
  key: 'fulcrumSheetDataState',
  default: [],
});

export const fulcrumDetailSheetDataState = atom<SheetData>({
  key: 'fulcrumDetailSheetDataState',
  default: [],
});

export const nodalMassSheetDataState = atom<SheetData>({
  key: 'nodalMassSheetDataState',
  default: [],
});

export const loadSheetDataState = atom<SheetData>({
  key: 'loadSheetDataState',
  default: [],
});

export const internalForceSheetDataState = atom<SheetData>({
  key: 'internalForceSheetDataState',
  default: [],
});

// Reset trigger atom
export const resetAllSheetData = atom<null>({
  key: 'resetAllSheetData',
  default: null,
});

// Map of sheet ID to atom state (for dynamic access)
export const SHEET_ATOMS = {
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
  hingePropZp: hingePropZpSheetDataState,
  hingePropYp: hingePropYpSheetDataState,
  hingeAss: hingeAssSheetDataState,
  spring: springSheetDataState,
  spg6Comp: spg6CompSheetDataState,
  spgAllSym: spgAllSymSheetDataState,
  spgAllSymLinear: spgAllSymLinearSheetDataState,
  spgAllSymBilinear: spgAllSymBilinearSheetDataState,
  spgAllSymTrilinear: spgAllSymTrilinearSheetDataState,
  spgAllSymTetralinear: spgAllSymTetralinearSheetDataState,
  spgAllASym: spgAllASymSheetDataState,
  spgAllASymBilinear: spgAllASymBilinearSheetDataState,
  spgAllASymTrilinear: spgAllASymTrilinearSheetDataState,
  spgAllASymTetralinear: spgAllASymTetralinearSheetDataState,
  spgAllOther: spgAllOtherSheetDataState,
  spgAllOtherNagoya: spgAllOtherNagoyaSheetDataState,
  spgAllOtherBmr: spgAllOtherBmrSheetDataState,
  fulcrum: fulcrumSheetDataState,
  fulcrumDetail: fulcrumDetailSheetDataState,
  nodalMass: nodalMassSheetDataState,
  load: loadSheetDataState,
  internalForce: internalForceSheetDataState,
};

// Selector to check if any data exists
export const hasAnyDataSelector = selector<boolean>({
  key: 'hasAnyDataSelector',
  get: ({ get }) => {
    return Object.values(SHEET_ATOMS).some((atom) => get(atom).length > 0);
  },
});

// Selector to get node count
export const nodeCountFromSheetSelector = selector<number>({
  key: 'nodeCountFromSheetSelector',
  get: ({ get }) => get(nodeSheetDataState).length,
});

// Selector to get element count (frames + plane + rigid)
export const elementCountFromSheetSelector = selector<number>({
  key: 'elementCountFromSheetSelector',
  get: ({ get }) => {
    return (
      get(frameSheetDataState).length +
      get(planeElementSheetDataState).length +
      get(rigidSheetDataState).length
    );
  },
});

// Selector to get all sheet data as a map
export const allSheetDataSelector = selector<Map<string, SheetData>>({
  key: 'allSheetDataSelector',
  get: ({ get }) => {
    const dataMap = new Map<string, SheetData>();

    dataMap.set(SHEET_NAMES.NODE, get(nodeSheetDataState));
    dataMap.set(SHEET_NAMES.FRAME, get(frameSheetDataState));
    dataMap.set(SHEET_NAMES.PLANE_ELEMENT, get(planeElementSheetDataState));
    dataMap.set(SHEET_NAMES.RIGID, get(rigidSheetDataState));
    dataMap.set(SHEET_NAMES.MATERIAL, get(materialSheetDataState));
    dataMap.set(SHEET_NAMES.NUMB_SECT, get(numbSectSheetDataState));
    dataMap.set(SHEET_NAMES.SECT_ELEM, get(sectElemSheetDataState));
    dataMap.set(SHEET_NAMES.SECT, get(sectionSheetDataState));
    dataMap.set(SHEET_NAMES.PLN_SECT, get(plnSectSheetDataState));
    dataMap.set(SHEET_NAMES.HINGE_PROP, get(hingePropSheetDataState));
    dataMap.set(SHEET_NAMES.HINGE_ASS, get(hingeAssSheetDataState));
    dataMap.set(SHEET_NAMES.ELEM_SPRING, get(springSheetDataState));
    dataMap.set(SHEET_NAMES.SPG_6COMP, get(spg6CompSheetDataState));
    dataMap.set(SHEET_NAMES.SPG_ALL_SYM, get(spgAllSymSheetDataState));
    dataMap.set(SHEET_NAMES.SPG_ALL_ASYM, get(spgAllASymSheetDataState));
    dataMap.set(SHEET_NAMES.SPG_ALL_OTHER, get(spgAllOtherSheetDataState));
    dataMap.set(SHEET_NAMES.FULCRUM, get(fulcrumSheetDataState));
    dataMap.set(SHEET_NAMES.FULC_DETAIL, get(fulcrumDetailSheetDataState));
    dataMap.set(SHEET_NAMES.NODAL_MASS, get(nodalMassSheetDataState));
    dataMap.set(SHEET_NAMES.LOAD, get(loadSheetDataState));
    dataMap.set(SHEET_NAMES.INTERNAL_FORCE, get(internalForceSheetDataState));

    return dataMap;
  },
});
