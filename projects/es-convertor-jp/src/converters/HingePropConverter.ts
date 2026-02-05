// Hinge Property Converter - Class090_Hinge_Prop equivalent
// Converts ES M-φ element detail data to MCT *IHINGE-PROP format

import { ConversionContext } from '../types/converter.types';
import { safeParseNumber, vbaFormatNumber } from '../utils/unitConversion';
import { truncateHingeName } from '../utils/stringUtils';

export interface HingePropConversionResult {
  mctLines: string[];
  mctLinesAssign: string[];
  hingePropertyMapping: Map<string, number>;
}

// Hinge type mapping (VBA dicHYST - line 124-143)
// Japanese hinge type names to MCT codes
const HINGE_HYST_MAP: Record<string, string> = {
  '線形': 'EBI',
  'バイリニア(対称)正負方向': 'NBI',
  'バイリニア(対称)Takeda': 'TAK',
  'バイリニア(非対称)Takeda': 'TAK',
  'トリリニア(対称)Takeda': 'TAK',
  'トリリニア(対称)ノーマル': 'KIN',
  'トリリニア(対称)原点指向': 'ORG',
  'トリリニア(対称)原点最大指向': 'PKO',
  'トリリニア(対称)弾性': 'ETR',
  'トリリニア(非対称)Takeda': 'TAK',
  'トリリニア(非対称)原点指向': 'ORG',
  'トリリニア(非対称)原点最大指向': 'PKO',
  'トリリニア(非対称)弾性': 'ETR',
  'テトラリニア(対称)Takeda': 'TTE',
  'テトラリニア(対称)H11 鉄道(耐震)': 'TTE',
  'テトラリニア(非対称)Takeda': 'TTE',
  'テトラリニア(非対称)H11 鉄道(耐震)': 'TTE',
  'RC橋脚バイリニア(動解)Takeda': 'TAK',
};

// Symmetry mapping (VBA dicSYM - line 145-164)
const HINGE_SYM_MAP: Record<string, number> = {
  '線形': 0,
  'バイリニア(対称)正負方向': 0,
  'バイリニア(対称)Takeda': 0,
  'バイリニア(非対称)Takeda': 1,
  'トリリニア(対称)Takeda': 0,
  'トリリニア(対称)ノーマル': 0,
  'トリリニア(対称)原点指向': 0,
  'トリリニア(対称)原点最大指向': 0,
  'トリリニア(対称)弾性': 0,
  'トリリニア(非対称)Takeda': 1,
  'トリリニア(非対称)原点指向': 1,
  'トリリニア(非対称)原点最大指向': 1,
  'トリリニア(非対称)弾性': 1,
  'テトラリニア(対称)Takeda': 0,
  'テトラリニア(対称)H11 鉄道(耐震)': 0,
  'テトラリニア(非対称)Takeda': 1,
  'テトラリニア(非対称)H11 鉄道(耐震)': 1,
  'RC橋脚バイリニア(動解)Takeda': 0,
};

/**
 * Get line type for special processing (VBA GetLineType)
 * Returns: 0 = no special processing, 1 = EBI bilinear, 2 = TAK with shift
 */
function getLineType(hingeType: string, cateDetail: string): number {
  if (hingeType === 'EBI') {
    return 1;
  } else if (hingeType === 'TAK') {
    if (cateDetail !== 'トリリニア(対称)Takeda' && cateDetail !== 'トリリニア(非対称)Takeda') {
      return 2;
    }
  }
  return 0;
}

/**
 * Check hinge type for extra factor (VBA CheckeHingeType)
 */
function checkHingeTypeFactor(hingeType: string): string {
  switch (hingeType) {
    case 'TAK':
    case 'TTE':
    case 'MTT':
      return '0.5,1';
    default:
      return '';
  }
}

/**
 * Preprocess data similar to VBA UseData function
 * Consolidates rows by name and restructures data
 *
 * VBA UseData logic:
 *   strDataZp(0, n) = strName (element name)
 *   strDataZp(1, n) = strProp (property name)
 *   strDataZp(j, n) = strBufZp(j + 1, i)  -- zp shifts +1
 *   strDataYp(j, n) = strBufYp(j, i)       -- yp no shift
 */
function preprocessData(
  rawDataZp: (string | number)[][],
  rawDataYp: (string | number)[][]
): { dataZp: (string | number)[][]; dataYp: (string | number)[][] } {
  const elemDetail = new Map<string, number>();
  const dataZp: (string | number)[][] = [];
  const dataYp: (string | number)[][] = [];

  const maxLen = Math.max(rawDataZp.length, rawDataYp.length);

  let lastValidName = '';
  let lastValidProp = '';

  for (let i = 0; i < maxLen; i++) {
    const rowZp = rawDataZp[i] || [];
    const rowYp = rawDataYp[i] || [];

    // VBA: strBufZp(1, i) = element name (column index 1 in zp array)
    // VBA: strBufZp(2, i) = property name (column index 2 in zp array)
    // In our UI, column 0 = element name, column 1 = property name
    let name = String(rowZp[0] || '').trim();
    let prop = String(rowZp[1] || '').trim();

    // If name is empty, use last valid name (VBA carry-forward behavior)
    if (!name) {
      name = lastValidName;
    }
    if (!prop) {
      prop = lastValidProp;
    }

    if (!name) continue;

    // Update last valid values
    lastValidName = name;
    lastValidProp = prop;

    let n: number;
    if (elemDetail.has(name)) {
      n = elemDetail.get(name)!;
    } else {
      n = elemDetail.size;
      elemDetail.set(name, n);
      dataZp.push(new Array(25).fill(0));
      dataYp.push(new Array(25).fill(0));
    }

    // Set name and property (indices 0, 1)
    dataZp[n][0] = name;
    dataYp[n][0] = name;
    dataZp[n][1] = prop;
    dataYp[n][1] = prop;

    // VBA: strDataZp(j, n) = strBufZp(j + 1, i) -- zp shifts +1 in VBA
    // BUT: VBA's strBufZp includes an extra column at index 0 (Excel col 1)
    // that TS's rawDataZp doesn't have (TS starts from col 2 = element name).
    // So the +1 shift in VBA compensates for the extra column, and TS should NOT shift.
    for (let j = 2; j < 23; j++) {
      if (j < rowZp.length) {
        dataZp[n][j] = rowZp[j] !== undefined ? rowZp[j] : 0;
      }
    }

    // VBA: strDataYp(j, n) = strBufYp(j, i) -- yp no shift
    for (let j = 2; j < 23; j++) {
      if (j < rowYp.length) {
        dataYp[n][j] = rowYp[j] !== undefined ? rowYp[j] : 0;
      }
    }
  }

  return { dataZp, dataYp };
}

/**
 * Read hinge property data and create property mapping
 * Based on Class090_Hinge_Prop.ReadHinge_Prop
 */
export function readHingeProperties(
  rawData: (string | number)[][],
  context: ConversionContext
): Map<string, number> {
  const hingePropertyMapping = new Map<string, number>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const hingeName = String(row[0]);

    // Use index + 1 as property number
    hingePropertyMapping.set(hingeName, i + 1);
  }

  return hingePropertyMapping;
}

/**
 * Convert ES hinge properties to MCT format
 * Based on Class090_Hinge_Prop.ChangeHinge_Prop
 */
export function convertHingeProperties(
  rawDataZp: (string | number)[][],
  rawDataYp: (string | number)[][],
  context: ConversionContext,
  hystYp: Map<string, string>,
  hystZp: Map<string, string>,
  hingeElements: Set<string>
): HingePropConversionResult {
  const mctLines: string[] = [];
  const mctLinesAssign: string[] = [];
  const hingePropertyMapping = new Map<string, number>();

  // Preprocess data (VBA UseData)
  const { dataZp, dataYp } = preprocessData(rawDataZp, rawDataYp);

  // Comments for IHINGE-PROP
  mctLines.push('*IHINGE-PROP    ; Inelastic Hinge Property');
  mctLines.push('; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1');
  mctLines.push('; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS              ; line 2');
  mctLines.push('; bFy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 3');
  mctLines.push('; bFz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 4');
  mctLines.push('; bMx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 5');
  mctLines.push('; bMy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 6');
  mctLines.push('; bMz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 7');
  mctLines.push('; bPMAUTO, PC0, [PMDATA], [PMDATA]                                                                       ; line 8');
  mctLines.push('; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]           ; line 9');
  mctLines.push('; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP                          ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE');
  mctLines.push('; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO                    ; CLO');
  mctLines.push('; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR            ; TAK, TAK, TTE, MTT');
  mctLines.push('; [DATA] : YS-P1, YS-P2, YS-P3, YS-P4, YD-D1, YD-D2, YD-D3, YD-D4, HSL1, ... HSL5                        ; iITYPE=1');

  // Comments for IHINGE-ASSIGN (generated here per VBA)
  mctLinesAssign.push('*IHINGE-ASSIGN  ; Inelastic Hinge Assignment');
  mctLinesAssign.push('; ELEM_LIST, PROP, FIBER_DIV');

  // Process each hinge property
  for (let j = 0; j < dataZp.length; j++) {
    const rowZp = dataZp[j];
    const rowYp = dataYp[j];

    const elemName = String(rowZp[0] || '');
    const propName = String(rowZp[1] || '');

    if (!elemName) continue;

    // Check if element has hinge (VBA: If dicHingeElem(strData_zp(0, j)) Then)
    if (hingeElements.size > 0 && !hingeElements.has(propName) && !hingeElements.has(elemName)) {
      continue;
    }

    // Ensure numeric values (VBA lines 208-233)
    for (let i = 2; i <= 21; i++) {
      if (isNaN(Number(rowZp[i]))) {
        rowZp[i] = 0;
      }
      if (isNaN(Number(rowYp[i]))) {
        rowYp[i] = 0;
      }
    }

    // Take absolute values for specific indices (VBA lines 213-234)
    for (let i = 0; i < 4; i++) {
      rowZp[13 + i] = Math.abs(safeParseNumber(rowZp[13 + i]));
      rowYp[13 + i] = Math.abs(safeParseNumber(rowYp[13 + i]));
      rowZp[18 + i] = Math.abs(safeParseNumber(rowZp[18 + i]));
      rowYp[18 + i] = Math.abs(safeParseNumber(rowYp[18 + i]));
    }

    // Get material type from element (VBA lines 247-250)
    const elemNo = context.elementMapping.get(elemName) || 0;
    const matNo = elemNo > 0 ? (context.elemNo2MaterialNo.get(elemNo) || 0) : 0;
    const matType = matNo > 0 ? (context.matNo2SorRC.get(matNo) || 'CONC') : 'CONC';

    // Truncate property name (VBA ChgCamma: replace comma with dash)
    const mctPropName = truncateHingeName(
      propName,
      context.longHingeNameUsed,
      context.longHingeNames
    ).replace(/,/g, '-');

    // Line 1: NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC
    mctLines.push(`MLHP=${mctPropName},${matType},DIST,NONE, I, SKEL,,`);

    // Line 2: bExistIJ flags - all NO
    mctLines.push('NO,NO,NO,NO,NO,NO,NO');

    // Store copy position for J end (VBA nCopy)
    const copyStartIndex = mctLines.length;

    // Lines 3-6: FY, FZ, MX, MY - all NO
    mctLines.push('NO');
    mctLines.push('NO');
    mctLines.push('NO');
    mctLines.push('NO');

    // Line 7: MZ for zp axis
    const cateDetailZp = (hystZp.get(propName) || '').replace(/ /g, '');
    const hingeTypeZp = HINGE_HYST_MAP[cateDetailZp] || 'TAK';
    const symZp = HINGE_SYM_MAP[cateDetailZp] ?? 0;

    // Apply line type adjustment (VBA lines 282-296)
    const lineTypeZp = getLineType(hingeTypeZp, cateDetailZp);
    if (lineTypeZp === 1) {
      // EBI: multiply values
      rowZp[9] = safeParseNumber(rowZp[8]) * 10;
      rowZp[4] = safeParseNumber(rowZp[3]) * 10;
      rowZp[19] = safeParseNumber(rowZp[18]) * 10;
      rowZp[14] = safeParseNumber(rowZp[13]) * 10;
    } else if (lineTypeZp === 2) {
      // TAK: shift values
      rowZp[10] = rowZp[9];
      rowZp[9] = rowZp[8];
      rowZp[5] = rowZp[4];
      rowZp[4] = rowZp[3];
      rowZp[20] = rowZp[19];
      rowZp[19] = rowZp[18];
      rowZp[15] = rowZp[14];
      rowZp[14] = rowZp[13];
    }

    // Build MZ line for zp (VBA lines 298-329)
    const zpParts = [
      'YES,1',
      hingeTypeZp,
      symZp,
      '0,1,5,1,1',
      // Moment positive side (本体)
      vbaFormatNumber(rowZp[8]), vbaFormatNumber(rowZp[9]), vbaFormatNumber(rowZp[10]), vbaFormatNumber(rowZp[11]),
      // Curvature positive side (本体)
      vbaFormatNumber(rowZp[3]), vbaFormatNumber(rowZp[4]), vbaFormatNumber(rowZp[5]), vbaFormatNumber(rowZp[6]),
      '0.5, 1, 2, 4, 8',
      // Moment negative side (負側)
      vbaFormatNumber(rowZp[18]), vbaFormatNumber(rowZp[19]), vbaFormatNumber(rowZp[20]), vbaFormatNumber(rowZp[21]),
      // Curvature negative side (負側)
      vbaFormatNumber(rowZp[13]), vbaFormatNumber(rowZp[14]), vbaFormatNumber(rowZp[15]), vbaFormatNumber(rowZp[16]),
      '0.5, 1, 2, 4, 8',
    ];

    const factorZp = checkHingeTypeFactor(hingeTypeZp);
    if (factorZp) {
      zpParts.push(factorZp);
    }

    mctLines.push(zpParts.join(','));

    // Line 7: MZ for yp axis (VBA lines 339-401)
    const cateDetailYp = (hystYp.get(propName) || '').replace(/ /g, '');
    const hingeTypeYp = HINGE_HYST_MAP[cateDetailYp] || 'TAK';
    const symYp = HINGE_SYM_MAP[cateDetailYp] ?? 0;

    // Apply line type adjustment for yp
    const lineTypeYp = getLineType(hingeTypeYp, cateDetailYp);
    if (lineTypeYp === 1) {
      rowYp[9] = safeParseNumber(rowYp[8]) * 10;
      rowYp[4] = safeParseNumber(rowYp[3]) * 10;
      rowYp[19] = safeParseNumber(rowYp[18]) * 10;
      rowYp[14] = safeParseNumber(rowYp[13]) * 10;
    } else if (lineTypeYp === 2) {
      rowYp[10] = rowYp[9];
      rowYp[9] = rowYp[8];
      rowYp[5] = rowYp[4];
      rowYp[4] = rowYp[3];
      rowYp[20] = rowYp[19];
      rowYp[19] = rowYp[18];
      rowYp[15] = rowYp[14];
      rowYp[14] = rowYp[13];
    }

    const ypParts = [
      'YES,1',
      hingeTypeYp,
      symYp,
      '0,1,5,1,1',
      vbaFormatNumber(rowYp[8]), vbaFormatNumber(rowYp[9]), vbaFormatNumber(rowYp[10]), vbaFormatNumber(rowYp[11]),
      vbaFormatNumber(rowYp[3]), vbaFormatNumber(rowYp[4]), vbaFormatNumber(rowYp[5]), vbaFormatNumber(rowYp[6]),
      '0.5, 1, 2, 4, 8',
      vbaFormatNumber(rowYp[18]), vbaFormatNumber(rowYp[19]), vbaFormatNumber(rowYp[20]), vbaFormatNumber(rowYp[21]),
      vbaFormatNumber(rowYp[13]), vbaFormatNumber(rowYp[14]), vbaFormatNumber(rowYp[15]), vbaFormatNumber(rowYp[16]),
      '0.5, 1, 2, 4, 8',
    ];

    const factorYp = checkHingeTypeFactor(hingeTypeYp);
    if (factorYp) {
      ypParts.push(factorYp);
    }

    mctLines.push(ypParts.join(','));

    // Line 8: blank (VBA line 405-406)
    mctLines.push(' ');

    // Copy lines for J end (VBA lines 408-411)
    for (let k = copyStartIndex; k < copyStartIndex + 7; k++) {
      mctLines.push(mctLines[k]);
    }

    // Line 9: PM AUTO data (VBA line 415-416)
    mctLines.push('0, 0, 0, 0, 0, 0');

    // Line 10: blank (VBA line 419-420)
    mctLines.push(' ');

    // Add to IHINGE-ASSIGN output (VBA line 423)
    // VBA: vAssign = Array("", ",BEAM") -- CIVIL NX 2026(v1.1)対応
    // 2025: "요소번호,힌지이름,"
    // 2026: "요소번호,BEAM,힌지이름,"
    if (elemNo > 0) {
      const beamSuffix = context.version >= 2026 ? ',BEAM' : '';
      mctLinesAssign.push(`${elemNo}${beamSuffix},${mctPropName},`);
    }

    // Store mapping
    hingePropertyMapping.set(propName, j + 1);
  }

  return { mctLines, mctLinesAssign, hingePropertyMapping };
}
