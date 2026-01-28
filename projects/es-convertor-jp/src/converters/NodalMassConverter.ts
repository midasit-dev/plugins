// NodalMass Converter - Class180_NodalMass equivalent
// Converts ES nodal mass data to MCT *NODALMASS format
// Based on VBA Class180_NodalMass.ChangeNodalMass (lines 22-83)

import { NodalMassData } from '../types/excel.types';
import { MCTNodalMass } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface NodalMassConversionResult {
  nodalMasses: MCTNodalMass[];
  mctLines: string[];
}

// VBA Column structure (nReadSTRow=4, nReadSTCol=2, nReadEDCol=11)
// Cols B-K = indices 0-9 in data array
// VBA lines 64-70:
//   strData(0) = Node name
//   strData(4) = mX
//   strData(5) = mY (ES)
//   strData(6) = mZ (ES)
//   strData(7) = rmX
//   strData(8) = rmY (ES)
//   strData(9) = rmZ (ES)

/**
 * Parse nodal mass data from Excel sheet
 */
export function parseNodalMassData(rawData: (string | number)[][]): NodalMassData[] {
  const masses: NodalMassData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    // VBA columns: 4=mX, 5=mY, 6=mZ, 7=rmX, 8=rmY, 9=rmZ
    const mass: NodalMassData = {
      nodeId: String(row[0]),
      mx: safeParseNumber(row[4]),
      my: safeParseNumber(row[5]),
      mz: safeParseNumber(row[6]),
      mrx: safeParseNumber(row[7]),
      mry: safeParseNumber(row[8]),
      mrz: safeParseNumber(row[9]),
    };

    masses.push(mass);
  }

  return masses;
}

/**
 * Convert ES nodal mass to MCT format
 * Based on VBA Class180_NodalMass.ChangeNodalMass (lines 22-83)
 *
 * VBA coordinate swap (lines 65-70):
 *   strBuf(1) = strData(4)  ' ES mX  → MCT mX
 *   strBuf(2) = strData(6)  ' ES mZ  → MCT mY
 *   strBuf(3) = strData(5)  ' ES mY  → MCT mZ
 *   strBuf(4) = strData(7)  ' ES rmX → MCT rmX
 *   strBuf(5) = strData(9)  ' ES rmZ → MCT rmY
 *   strBuf(6) = strData(8)  ' ES rmY → MCT rmZ
 */
export function convertNodalMass(
  rawData: (string | number)[][],
  context: ConversionContext
): NodalMassConversionResult {
  const nodalMasses: MCTNodalMass[] = [];
  const mctLines: string[] = [];

  if (rawData.length === 0) {
    return { nodalMasses, mctLines };
  }

  // VBA comments (lines 56-57)
  mctLines.push('*NODALMASS    ; Nodal Masses');
  mctLines.push('; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ');

  // VBA data cleaning (lines 48-54): columns 4-9 non-numeric → 0
  for (let j = 0; j < rawData.length; j++) {
    const row = rawData[j];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const nodeId = String(row[0]);
    const nodeNo = context.nodeMapping.get(nodeId) || 0;

    if (nodeNo === 0) continue;

    // Parse mass values from VBA columns (4-9)
    const esMx = safeParseNumber(row[4]);   // VBA strData(4)
    const esMy = safeParseNumber(row[5]);   // VBA strData(5)
    const esMz = safeParseNumber(row[6]);   // VBA strData(6)
    const esRmx = safeParseNumber(row[7]);  // VBA strData(7)
    const esRmy = safeParseNumber(row[8]);  // VBA strData(8)
    const esRmz = safeParseNumber(row[9]);  // VBA strData(9)

    // VBA coordinate swap (lines 65-70):
    // ES (X, Y, Z) → MCT (X, Z, Y)
    const mctMx = esMx;    // strBuf(1) = strData(4) - no swap
    const mctMy = esMz;    // strBuf(2) = strData(6) - ES mZ → MCT mY
    const mctMz = esMy;    // strBuf(3) = strData(5) - ES mY → MCT mZ
    const mctRmx = esRmx;  // strBuf(4) = strData(7) - no swap
    const mctRmy = esRmz;  // strBuf(5) = strData(9) - ES rmZ → MCT rmY
    const mctRmz = esRmy;  // strBuf(6) = strData(8) - ES rmY → MCT rmZ

    // VBA output format (lines 72-75): nodeNo,mX,mY,mZ,rmX,rmY,rmZ
    const mctLine = `${nodeNo},${mctMx},${mctMy},${mctMz},${mctRmx},${mctRmy},${mctRmz}`;
    mctLines.push(mctLine);

    nodalMasses.push({
      nodeNo,
      mx: mctMx,
      my: mctMy,
      mz: mctMz,
      mrx: mctRmx,
      mry: mctRmy,
      mrz: mctRmz,
    });
  }

  return { nodalMasses, mctLines };
}
