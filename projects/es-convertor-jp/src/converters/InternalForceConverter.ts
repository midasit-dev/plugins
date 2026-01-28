// InternalForce Converter - Class200_InternalForce equivalent
// Converts ES internal force data to MCT *INI-EFORCE format
// Based on VBA Class200_InternalForce.ChangeInternalForce (lines 22-84)

import { InternalForceData } from '../types/excel.types';
import { MCTIniEForce } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface InternalForceConversionResult {
  iniEForces: MCTIniEForce[];
  mctLines: string[];
}

// VBA Column structure (nReadSTRow=3, nReadSTCol=2, nReadEDCol=12)
// Cols B-L = indices 0-10 in data array (11 columns)
// VBA lines 60-71:
//   strData(0) = (unused)
//   strData(1) = (unused)
//   strData(2) = Element ID
//   strData(3) = Axial-i
//   strData(4) = Axial-j
//   strData(5) = Moment-z-i (negated in output)
//   strData(6) = Moment-y-i
//   strData(7) = Moment-z-j (negated in output)
//   strData(8) = Moment-y-j
//   strData(9) = Torsion-i
//   strData(10) = Torsion-j
const COL = {
  ELEM_ID: 2,
  AXIAL_I: 3,
  AXIAL_J: 4,
  MOMENT_Z_I: 5,  // Negated in output
  MOMENT_Y_I: 6,
  MOMENT_Z_J: 7,  // Negated in output
  MOMENT_Y_J: 8,
  TORSION_I: 9,
  TORSION_J: 10,
};

/**
 * Parse internal force data from Excel sheet
 */
export function parseInternalForceData(rawData: (string | number)[][]): InternalForceData[] {
  const forces: InternalForceData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[COL.ELEM_ID] || String(row[COL.ELEM_ID]).trim() === '') continue;

    const force: InternalForceData = {
      elementId: String(row[COL.ELEM_ID]),
      loadCase: 'DEFAULT',
      forces: {
        fxi: safeParseNumber(row[COL.AXIAL_I]),
        fyi: 0, // Shear not in ES data
        fzi: 0, // Shear not in ES data
        mxi: safeParseNumber(row[COL.TORSION_I]),
        myi: safeParseNumber(row[COL.MOMENT_Y_I]),
        mzi: safeParseNumber(row[COL.MOMENT_Z_I]),
        fxj: safeParseNumber(row[COL.AXIAL_J]),
        fyj: 0, // Shear not in ES data
        fzj: 0, // Shear not in ES data
        mxj: safeParseNumber(row[COL.TORSION_J]),
        myj: safeParseNumber(row[COL.MOMENT_Y_J]),
        mzj: safeParseNumber(row[COL.MOMENT_Z_J]),
      },
    };

    forces.push(force);
  }

  return forces;
}

/**
 * Convert ES internal force to MCT format
 * Based on VBA Class200_InternalForce.ChangeInternalForce (lines 22-84)
 *
 * VBA Output format (lines 57-72):
 * TYPE,ID,Axial-i,Shear-y-i,Shear-z-i,Torsion-i,Moment-y-i,Moment-z-i,
 *         Axial-j,Shear-y-j,Shear-z-j,Torsion-j,Moment-y-j,Moment-z-j
 *
 * strBuf mapping:
 * [0]=BEAM, [1]=elemId, [2]=Axial-i, [3]=0,0, [4]=Torsion-i, [5]=Moment-y-i, [6]=-Moment-z-i
 * [7]=Axial-j, [8]=0,0, [9]=Torsion-j, [10]=Moment-y-j, [11]=-Moment-z-j
 */
export function convertInternalForce(
  rawData: (string | number)[][],
  context: ConversionContext
): InternalForceConversionResult {
  const iniEForces: MCTIniEForce[] = [];
  const mctLines: string[] = [];

  if (rawData.length === 0) {
    return { iniEForces, mctLines };
  }

  // VBA comments (lines 49-52)
  mctLines.push('*INI-EFORCE    ; Initial Element Force');
  mctLines.push('; TYPE, ID, Axial-i, Axial-j     ; TRUSS');
  mctLines.push('; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK');
  mctLines.push('; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z');

  // Process each row (VBA lines 56-79)
  for (let j = 0; j < rawData.length; j++) {
    const row = rawData[j];
    if (!row[COL.ELEM_ID] || String(row[COL.ELEM_ID]).trim() === '') continue;

    const elemId = String(row[COL.ELEM_ID]);

    // Get element number (VBA uses element name directly, but we map to number)
    const elemNo = context.elementMapping.get(elemId);
    // Use element ID if no mapping found (VBA behavior)
    const elemIdOut = elemNo !== undefined ? String(elemNo) : elemId;

    // Build output array (VBA lines 57-72)
    const strBuf: string[] = [];

    // strBuf(0) = "BEAM" (VBA line 59)
    strBuf.push('BEAM');

    // strBuf(1) = strData(2, j) - Element ID (VBA line 60)
    strBuf.push(elemIdOut);

    // strBuf(2) = strData(3, j) - Axial-i (VBA line 61)
    strBuf.push(String(safeParseNumber(row[COL.AXIAL_I])));

    // strBuf(3) = "0,0" - Shear-y-i, Shear-z-i padding (VBA line 62)
    strBuf.push('0');
    strBuf.push('0');

    // strBuf(4) = strData(9, j) - Torsion-i (VBA line 63)
    strBuf.push(String(safeParseNumber(row[COL.TORSION_I])));

    // strBuf(5) = strData(6, j) - Moment-y-i (VBA line 64)
    strBuf.push(String(safeParseNumber(row[COL.MOMENT_Y_I])));

    // strBuf(6) = -1 * strData(5, j) - Moment-z-i (negated!) (VBA line 65)
    strBuf.push(String(-1 * safeParseNumber(row[COL.MOMENT_Z_I])));

    // strBuf(7) = strData(4, j) - Axial-j (VBA line 67)
    strBuf.push(String(safeParseNumber(row[COL.AXIAL_J])));

    // strBuf(8) = "0,0" - Shear-y-j, Shear-z-j padding (VBA line 68)
    strBuf.push('0');
    strBuf.push('0');

    // strBuf(9) = strData(10, j) - Torsion-j (VBA line 69)
    strBuf.push(String(safeParseNumber(row[COL.TORSION_J])));

    // strBuf(10) = strData(8, j) - Moment-y-j (VBA line 70)
    strBuf.push(String(safeParseNumber(row[COL.MOMENT_Y_J])));

    // strBuf(11) = -1 * strData(7, j) - Moment-z-j (negated!) (VBA line 71)
    strBuf.push(String(-1 * safeParseNumber(row[COL.MOMENT_Z_J])));

    // Join with comma (VBA lines 73-76)
    const mctLine = strBuf.join(',');
    mctLines.push(mctLine);

    iniEForces.push({
      loadCase: 'DEFAULT',
      elementNo: elemNo || 0,
      data: mctLine,
    });
  }

  return { iniEForces, mctLines };
}
