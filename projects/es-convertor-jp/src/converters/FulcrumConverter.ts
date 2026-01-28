// Fulcrum Converter - Class160_Fulcrum equivalent
// Converts ES support (支点) data to MCT *GSPRING and *CONSTRAINT format
// Based on VBA Class160_Fulcrum.ChangeFulcrum (lines 25-139)

import { ConversionContext } from '../types/converter.types';

export interface FulcrumConversionResult {
  mctLinesGSpring: string[];
  mctLinesConstraint: string[];
  springTypeMapping: Map<string, boolean>;
}

// Free/Fixed DOF mapping (VBA dicFreeFixt lines 48-51)
const FREE_FIXT_MAP: Record<string, string> = {
  '自由': '0',
  '固定': '1',
  'Free': '0',
  'Fixed': '1',
  '': '0', // Empty = Free
};

// Spring indicator string (VBA strSpring line 17)
const SPRING_STRING = 'ばね';

/**
 * Convert ES fulcrum data to MCT format
 * Based on Class160_Fulcrum.ChangeFulcrum (VBA lines 25-139)
 *
 * VBA Column structure (nReadSTCol=2, nReadEDCol=13):
 * - strData(0): Support name (支点名)
 * - strData(1): Unknown
 * - strData(2): Node name (節点名)
 * - strData(3): DX constraint (col 5 in Excel, index 3 in data array)
 * - strData(4): DY constraint
 * - strData(5): DZ constraint
 * - strData(6): RX constraint
 * - strData(7): RY constraint
 * - strData(8): RZ constraint
 * - strData(9-11): Additional columns
 */
export function convertFulcrum(
  rawData: (string | number)[][],
  context: ConversionContext
): FulcrumConversionResult {
  const mctLinesGSpring: string[] = [];
  const mctLinesConstraint: string[] = [];
  const springTypeMapping = new Map<string, boolean>();

  // MCT Comments (VBA lines 62-68)
  // *GSPRING header
  const gspringLines: string[] = [];
  gspringLines.push('*GSPRING    ; General Spring Supports');
  gspringLines.push('; NODE_LIST, TYPE-NAME, GROUP');

  // *CONSTRAINT header
  const constraintLines: string[] = [];
  constraintLines.push('*CONSTRAINT    ; Supports');
  constraintLines.push('; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP');

  let gspringCount = 0;
  let constraintCount = 0;

  // Process each row (VBA lines 73-121)
  for (let j = 0; j < rawData.length; j++) {
    const row = rawData[j];
    if (!row[0] || String(row[0]).trim() === '') continue;

    // VBA: strData(0) = support name, strData(2) = node name
    const supportName = String(row[0] || '');
    const nodeName = String(row[2] || '');

    // Get MCT node number from context
    const nodeNo = context.nodeMapping.get(nodeName);
    if (nodeNo === undefined || nodeNo === 0) continue;

    // Check for spring type in DOF columns (VBA lines 74-80)
    // Loop through columns 3-8 (strData indices 3-8)
    let bOutput = false;
    for (let k = 3; k <= 8; k++) {
      const dofValue = String(row[k] || '');
      if (dofValue === SPRING_STRING) {
        bOutput = true;
        break;
      }
    }

    if (bOutput) {
      // Spring support - output to *GSPRING (VBA lines 82-96)
      springTypeMapping.set(supportName, true);

      // VBA format: nodeNo, typeName, (empty group)
      // strBuf(0) = m_NodeData(strData(2,j)) = nodeNo
      // strBuf(1) = strData(0,j) = supportName
      // strBuf(2) = "" (empty group)
      gspringLines.push(`${nodeNo},${supportName},`);
      gspringCount++;
    } else {
      // Fixed/Free constraint - output to *CONSTRAINT (VBA lines 97-119)
      springTypeMapping.set(supportName, false);

      // Get DOF values from columns 3-8
      const dofValues: string[] = [];
      for (let k = 3; k <= 8; k++) {
        const dofStr = String(row[k] || '');
        dofValues.push(FREE_FIXT_MAP[dofStr] ?? '0');
      }

      // Apply coordinate swap (VBA lines 104-109)
      // MCT DOF order: DX, DY, DZ, RX, RY, RZ
      // ES column order: 3(DX), 4(DY), 5(DZ), 6(RX), 7(RY), 8(RZ)
      // Swap: ES DZ → MCT DY, ES DY → MCT DZ, ES RZ → MCT RY, ES RY → MCT RZ
      const dofString =
        dofValues[0] +  // col 3: ES DX → MCT DX
        dofValues[2] +  // col 5: ES DZ → MCT DY
        dofValues[1] +  // col 4: ES DY → MCT DZ
        dofValues[3] +  // col 6: ES RX → MCT RX
        dofValues[5] +  // col 8: ES RZ → MCT RY
        dofValues[4];   // col 7: ES RY → MCT RZ

      // VBA format: nodeNo, dofString, (empty group)
      constraintLines.push(`${nodeNo},${dofString},`);
      constraintCount++;
    }
  }

  // Clear output if no data (VBA lines 123-130)
  if (gspringCount > 0) {
    mctLinesGSpring.push(...gspringLines);
  }

  if (constraintCount > 0) {
    mctLinesConstraint.push(...constraintLines);
  }

  return {
    mctLinesGSpring,
    mctLinesConstraint,
    springTypeMapping,
  };
}

/**
 * Get constraint string for individual DOF values with coordinate swap
 */
export function buildConstraintString(dofValues: string[]): string {
  // Ensure we have 6 DOF values
  while (dofValues.length < 6) {
    dofValues.push('0');
  }

  // Apply coordinate swap: ES (X, Y, Z) → MIDAS (X, Z, Y)
  return [
    dofValues[0], // DX → DX
    dofValues[2], // DZ → DY
    dofValues[1], // DY → DZ
    dofValues[3], // RX → RX
    dofValues[5], // RZ → RY
    dofValues[4], // RY → RZ
  ].join('');
}

/**
 * Check if a support has spring DOFs
 */
export function isSpringSupport(
  springTypeMapping: Map<string, boolean>,
  supportName: string
): boolean {
  return springTypeMapping.get(supportName) === true;
}
