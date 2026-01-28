// FulcDetail Converter - Class170_FulcDetail equivalent
// Converts ES support detail data to MCT *GSPRTYPE format
// Based on VBA Class170_FulcDetail.ChangeFulcDetail (lines 44-135)

import { FulcrumDetailData } from '../types/excel.types';
import { MCTGSprType } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface FulcDetailConversionResult {
  gSprTypes: MCTGSprType[];
  mctLines: string[];
}

// VBA Column structure (nReadSTRow=4, nReadSTCol=2, nReadEDCol=21)
// Cols B-U = indices 0-19 in data array
// Cell enum (VBA lines 18-37):
//   Cel_D=2, Cel_E=3, Cel_F=4, Cel_G=5, Cel_H=6, Cel_I=7,
//   Cel_J=8, Cel_K=9, Cel_L=10, Cel_M=11, Cel_N=12, Cel_O=13,
//   Cel_P=14, Cel_Q=15, Cel_R=16, Cel_S=17, Cel_T=18, Cel_U=19

// VBA output mapping (lines 89-110):
// strBuf index → strData cell index, sign multiplier
const OUTPUT_MAPPING: { cellIndex: number; sign: number }[] = [
  // strBuf[0] = NAME (handled separately)
  { cellIndex: 2, sign: 1 },    // strBuf[1] = Abs(Cel_D) = SDx1
  { cellIndex: 9, sign: 1 },    // strBuf[2] = Abs(Cel_K) = SDy1
  { cellIndex: 4, sign: 1 },    // strBuf[3] = Abs(Cel_F) = SDy2
  { cellIndex: 8, sign: 1 },    // strBuf[4] = Abs(Cel_J) = SDz1
  { cellIndex: 12, sign: 1 },   // strBuf[5] = Abs(Cel_N) = SDz2
  { cellIndex: 3, sign: 1 },    // strBuf[6] = Abs(Cel_E) = SDz3
  { cellIndex: -1, sign: 0 },   // strBuf[7] = "0" (padding)
  { cellIndex: 15, sign: 1 },   // strBuf[8] = Abs(Cel_Q) = SRx1
  { cellIndex: 13, sign: -1 },  // strBuf[9] = -1*Abs(Cel_O) = SRy1
  { cellIndex: 5, sign: 1 },    // strBuf[10] = Abs(Cel_G) = SRy2
  { cellIndex: 11, sign: -1 },  // strBuf[11] = -1*Abs(Cel_M) = SRz1
  { cellIndex: -1, sign: 0 },   // strBuf[12] = "0" (padding)
  { cellIndex: 14, sign: 1 },   // strBuf[13] = Abs(Cel_P) = SRz2
  { cellIndex: 18, sign: 1 },   // strBuf[14] = Abs(Cel_T) = SRz3
  { cellIndex: 7, sign: 1 },    // strBuf[15] = Abs(Cel_I) = SRz4
  { cellIndex: 10, sign: 1 },   // strBuf[16] = Abs(Cel_L) = SRz5
  { cellIndex: 16, sign: 1 },   // strBuf[17] = Abs(Cel_R) = SRz6
  { cellIndex: -1, sign: 0 },   // strBuf[18] = "0" (padding)
  { cellIndex: 17, sign: 1 },   // strBuf[19] = Abs(Cel_S)
  { cellIndex: 19, sign: 1 },   // strBuf[20] = Abs(Cel_U)
  { cellIndex: 6, sign: 1 },    // strBuf[21] = Abs(Cel_H)
];

/**
 * Parse fulcrum detail data from Excel sheet
 */
export function parseFulcrumDetailData(rawData: (string | number)[][]): FulcrumDetailData[] {
  const details: FulcrumDetailData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const detail: FulcrumDetailData = {
      name: String(row[0]),
      type: String(row[1] || 'LINEAR'),
      sdx: safeParseNumber(row[2]),
      sdy: safeParseNumber(row[3]),
      sdz: safeParseNumber(row[4]),
      srx: safeParseNumber(row[5]),
      sry: safeParseNumber(row[6]),
      srz: safeParseNumber(row[7]),
    };

    details.push(detail);
  }

  return details;
}

/**
 * Convert ES fulcrum detail to MCT format
 * Based on VBA Class170_FulcDetail.ChangeFulcDetail (lines 44-135)
 *
 * VBA Output format (lines 112-124):
 * - Line 1: NAME,value1,value2,...,value21 (21 stiffness values)
 * - Line 2: 0, 0, 0, ... (21 zeros for mass)
 * - Line 3: 0, 0, 0, ... (21 zeros for damping)
 * - Line 4: YES,NO,NO (flags)
 */
export function convertFulcrumDetail(
  rawData: (string | number)[][],
  context: ConversionContext,
  springTypeMapping: Map<string, boolean>
): FulcDetailConversionResult {
  const gSprTypes: MCTGSprType[] = [];
  const mctLines: string[] = [];

  if (rawData.length === 0 || springTypeMapping.size === 0) {
    return { gSprTypes, mctLines };
  }

  // VBA comments (lines 77-81)
  mctLines.push('*GSPRTYPE    ; Define General Spring Supports');
  mctLines.push('; NAME, SDx1, SDy1, SDy2, SDz1, SDz2, SDz3, ..., SRz1, ..., SRz6');
  mctLines.push(';       MDx1, MDy1, MDy2, MDz1, MDz2, MDz3, ..., MRz1, ..., MRz6');
  mctLines.push(';       DDx1, DDy1, DDy2, DDz1, DDz2, DDz3, ..., DRz1, ..., DRz6');
  mctLines.push(';       bStiffness, bMass, bDamping                             ');

  let typeNo = 0;

  // Process each row (VBA lines 85-128)
  for (let j = 0; j < rawData.length; j++) {
    const row = rawData[j];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const supportName = String(row[0]);

    // VBA line 86: Check if this is a spring type
    if (!springTypeMapping.get(supportName)) continue;

    typeNo++;

    // Build 21 stiffness values (VBA lines 87-110)
    const stiffValues: string[] = [];
    for (const mapping of OUTPUT_MAPPING) {
      if (mapping.cellIndex === -1) {
        // Padding value
        stiffValues.push('0');
      } else {
        const rawValue = safeParseNumber(row[mapping.cellIndex]);
        const value = mapping.sign * Math.abs(rawValue);
        stiffValues.push(String(value));
      }
    }

    // Line 1: NAME + 21 stiffness values (VBA lines 112-115)
    mctLines.push(`${supportName},${stiffValues.join(',')}`);

    // Line 2: 21 zeros for mass (VBA line 118)
    mctLines.push('0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0');

    // Line 3: 21 zeros for damping (VBA line 121)
    mctLines.push('0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0');

    // Line 4: Flags - YES for stiffness, NO for mass/damping (VBA line 124)
    mctLines.push('YES,NO,NO');

    // Build MCTGSprType for type checking (simplified)
    gSprTypes.push({
      no: typeNo,
      name: supportName,
      sdx: safeParseNumber(row[2]),
      sdy: safeParseNumber(row[3]),
      sdz: safeParseNumber(row[4]),
      srx: safeParseNumber(row[5]),
      sry: safeParseNumber(row[6]),
      srz: safeParseNumber(row[7]),
    });
  }

  return { gSprTypes, mctLines };
}

/**
 * Check if a spring type has non-zero stiffness
 */
export function hasNonZeroStiffness(detail: FulcrumDetailData): boolean {
  return (
    (detail.sdx !== undefined && detail.sdx !== 0) ||
    (detail.sdy !== undefined && detail.sdy !== 0) ||
    (detail.sdz !== undefined && detail.sdz !== 0) ||
    (detail.srx !== undefined && detail.srx !== 0) ||
    (detail.sry !== undefined && detail.sry !== 0) ||
    (detail.srz !== undefined && detail.srz !== 0)
  );
}

/**
 * Get stiffness summary for a spring type
 */
export function getStiffnessSummary(detail: FulcrumDetailData): string {
  const components: string[] = [];

  if (detail.sdx && detail.sdx !== 0) components.push(`SDx=${detail.sdx}`);
  if (detail.sdy && detail.sdy !== 0) components.push(`SDy=${detail.sdy}`);
  if (detail.sdz && detail.sdz !== 0) components.push(`SDz=${detail.sdz}`);
  if (detail.srx && detail.srx !== 0) components.push(`SRx=${detail.srx}`);
  if (detail.sry && detail.sry !== 0) components.push(`SRy=${detail.sry}`);
  if (detail.srz && detail.srz !== 0) components.push(`SRz=${detail.srz}`);

  return components.join(', ') || 'No stiffness defined';
}
