// Frame Converter - Class020_Frame equivalent
// Converts ES frame element data to MCT *ELEMENT format

import { FrameData } from '../types/excel.types';
import { MCTElement } from '../types/mct.types';
import { ConversionContext, Point3D } from '../types/converter.types';
import { calculateElementAngle, checkHorizontalPoints } from '../utils/coordinateSystem';
import { safeParseNumber, isNumeric, formatNumber } from '../utils/unitConversion';

export interface FrameConversionResult {
  elements: MCTElement[];
  mctLines: string[];
  hingeElements: Set<string>;
}

// Element coordinate system types
const COORD_SYSTEMS: Record<string, number> = {
  'Y軸': 0,
  'ベクトル:Global X': 1,
  'ベクトル:Global Y': 2,
  'ベクトル:Global Z': 3,
};

const VECTOR_PREFIXES = ['節点', 'ベクトル:Alpha', 'ベクトル:X', 'ポイント'];

// Beta angle lookup table [isHorizontal][coordSystemIndex]
const BETA_ANGLES: number[][] = [
  [180, 0, 180, 270],  // Vertical elements
  [0, 0, 0, 90],       // Non-vertical elements
];

/**
 * Parse frame data from Excel sheet
 */
export function parseFrameData(rawData: (string | number)[][]): FrameData[] {
  const frames: FrameData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const frame: FrameData = {
      id: String(row[0]),
      node1: String(row[1]),
      node2: String(row[2]),
      // row[3] = 길이 (미사용), row[4] = i단면
      materialName: '', // VBA: sect2Material에서 조회
      sectionName: String(row[4] || ''),
      angle: 0,
    };

    // Parse coordinate system / angle info
    if (row[6]) {
      const coordStr = String(row[6]);
      if (coordStr.includes(':')) {
        // Reference vector or node
        frame.refNode = coordStr;
      }
    }

    frames.push(frame);
  }

  return frames;
}

/**
 * Read frame section names for section mapping
 */
export function readFrameSectionNames(
  rawData: (string | number)[][],
  context: ConversionContext
): Map<string, boolean> {
  const sectionNames = new Map<string, boolean>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    const node1 = String(row[1]);
    const node2 = String(row[2]);
    const iSectName = String(row[4] || '');
    const jSectName = String(row[5] || '');

    // Store element nodes mapping (by element number)
    context.elementNodes.set(parseInt(elemId, 10) || i + 1, {
      node1: context.nodeMapping.get(node1) || 0,
      node2: context.nodeMapping.get(node2) || 0,
    });

    // Store element node names mapping (by element ID string) - for LoadConverter
    context.elemNodeNames.set(elemId, {
      nodeI: node1,
      nodeJ: node2,
    });

    // Collect section names
    if (iSectName && !sectionNames.has(iSectName)) {
      sectionNames.set(iSectName, true);
    }
    if (jSectName && !sectionNames.has(jSectName)) {
      sectionNames.set(jSectName, true);
    }
  }

  return sectionNames;
}

/**
 * Calculate frame element angle based on coordinate system string
 */
function calcAngle(
  node1No: number,
  node2No: number,
  coordStr: string,
  context: ConversionContext
): { angle: number; isHorizontal: number } {
  const node1 = context.esNodeCoords.get(node1No);
  const node2 = context.esNodeCoords.get(node2No);

  if (!node1 || !node2) {
    return { angle: 0, isHorizontal: 1 };
  }

  const isHorizontal = checkHorizontalPoints(node1, node2);
  let angle = 0;

  // Check for predefined coordinate systems
  if (COORD_SYSTEMS[coordStr] !== undefined) {
    angle = BETA_ANGLES[isHorizontal][COORD_SYSTEMS[coordStr]];
    return { angle, isHorizontal };
  }

  // Check for vector/node reference
  for (let i = 0; i < VECTOR_PREFIXES.length; i++) {
    if (coordStr.startsWith(VECTOR_PREFIXES[i])) {
      if (i === 0) {
        // Node reference: 節点:123
        const parts = coordStr.split(':');
        if (parts.length === 2) {
          const refNodeId = parts[1];
          const refNodeNo = context.nodeMapping.get(refNodeId);
          if (refNodeNo) {
            const refNode = context.esNodeCoords.get(refNodeNo);
            if (refNode) {
              angle = calculateElementAngle(node1, node2, refNode);
            }
          }
        }
      } else if (i === 1) {
        // Alpha angle: ベクトル:Alpha=x,y=z
        const parts = coordStr.split('=');
        if (parts.length === 3) {
          const xyParts = parts[1].split(',');
          if (xyParts.length === 2) {
            const alpha = safeParseNumber(parts[2]);
            const beta = safeParseNumber(xyParts[0]);
            const refVector: Point3D = {
              x: Math.cos(alpha) * Math.cos(beta),
              y: Math.sin(alpha),
              z: -Math.cos(alpha) * Math.sin(beta),
            };
            angle = calculateElementAngle(node1, node2, refVector);
          }
        }
      } else {
        // Vector/Point: ベクトル:X=x,y=z,w=value
        const parts = coordStr.split('=');
        if (parts.length === 4) {
          const xParts = parts[1].split(',');
          const yParts = parts[2].split(',');
          if (xParts.length === 2 && yParts.length === 2) {
            const refVector: Point3D = {
              x: safeParseNumber(xParts[0]),
              y: safeParseNumber(yParts[0]),
              z: safeParseNumber(parts[3]),
            };
            angle = calculateElementAngle(node1, node2, refVector);
          }
        }
      }
      break;
    }
  }

  return { angle: parseFloat(formatNumber(angle, 2)), isHorizontal };
}

/**
 * Set element numbers and find max element number
 */
export function setElementNumbers(
  rawData: (string | number)[][],
  context: ConversionContext,
  rigidData?: (string | number)[][]
): number {
  let maxElemNo = 0;

  // Check frame elements
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    if (isNumeric(elemId)) {
      const no = parseInt(elemId, 10);
      if (no > maxElemNo) maxElemNo = no;
    }
    context.elementMapping.set(elemId, parseInt(elemId, 10) || 0);
  }

  // Check rigid elements
  if (rigidData) {
    for (let i = 0; i < rigidData.length; i++) {
      const row = rigidData[i];
      if (!row[0] || String(row[0]).trim() === '') continue;

      const elemId = String(row[0]);
      if (isNumeric(elemId)) {
        const no = parseInt(elemId, 10);
        if (no > maxElemNo) maxElemNo = no;
      }
    }
  }

  // Assign numbers to non-numeric element IDs
  let nextNo = maxElemNo + 1;
  for (const [elemId] of context.elementMapping) {
    if (!isNumeric(elemId)) {
      context.elementMapping.set(elemId, nextNo);
      nextNo++;
    }
  }

  context.maxElementNo = nextNo - 1;
  return maxElemNo;
}

/**
 * Convert ES frame elements to MCT format
 */
export function convertFrames(
  rawData: (string | number)[][],
  context: ConversionContext
): FrameConversionResult {
  const mctElements: MCTElement[] = [];
  const mctLines: string[] = [];
  const hingeElements = new Set<string>();

  // Comments
  mctLines.push('*ELEMENT    ; Elements');
  mctLines.push('; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element');

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    const node1Id = String(row[1]);
    const node2Id = String(row[2]);
    const iSectName = String(row[4] || '');
    const jSectName = String(row[5] || '');
    const coordStr = String(row[6] || 'Y軸');
    const elemType = String(row[8] || '');

    // Check if M-φ hinge element (handle both full-width − and half-width - minus)
    if (elemType === 'M−φ要素' || elemType === 'M-φ要素') {
      hingeElements.add(elemId);
    }

    const elemNo = context.elementMapping.get(elemId) || 0;
    const node1No = context.nodeMapping.get(node1Id) || 0;
    const node2No = context.nodeMapping.get(node2Id) || 0;

    // Get section-material mapping
    const materialName = context.sect2Material.get(iSectName) || '';
    const matNo = context.materialMapping.get(materialName) || 1;
    const sectKey = `${iSectName}-${jSectName}`;
    const sectNo = context.sectionMapping.get(sectKey) || 1;

    // Calculate angle
    const { angle, isHorizontal } = calcAngle(node1No, node2No, coordStr, context);

    // Store element angle (VBA: vAngle(0)=angle, vAngle(1)=nHor)
    context.elementAngles.set(elemNo, [angle, isHorizontal]);

    // Store element-material mapping
    context.elemNo2MaterialNo.set(elemNo, matNo);

    const mctLine = `${elemNo},Beam,${matNo},${sectNo},${node1No},${node2No},${angle},0`;
    mctLines.push(mctLine);

    mctElements.push({
      no: elemNo,
      type: 'Beam',
      materialNo: matNo,
      sectionNo: sectNo,
      nodes: [node1No, node2No],
      angle,
    });
  }

  return { elements: mctElements, mctLines, hingeElements };
}
