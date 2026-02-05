// Element Spring Converter - Class110_ElemSpring equivalent
// Converts ES spring element data to MCT *NL-LINK format

import { SpringElementData } from '../types/excel.types';
import { MCTNLLink } from '../types/mct.types';
import { ConversionContext, Point3D } from '../types/converter.types';
import { calculateElementAngle, crossProduct, normalizeVector, vectorMagnitude, subtractVectors } from '../utils/coordinateSystem';
import { formatNumber } from '../utils/formatUtils';

export interface ElemSpringConversionResult {
  nlLinks: MCTNLLink[];
  mctLines: string[];
  doublePointNodes: Set<string>;
}

// Vector transformation dictionary (VBA 415-500) - 36 vector mappings
// Format: 'Plane1,Plane2,Align,Axis' -> 'v1x,v1y,v1z,v2x,v2y,v2z'
// Based on VBA strVect array and dicChangeVecter dictionary
const VECTOR_TRANSFORMATIONS: Record<string, string> = {
  // Align=v1,Axis=xl (VBA 453-458)
  'X,Y,v1,xl': '1,0,0,0,-1,0',
  'X,Z,v1,xl': '1,0,0,0,0,-1',
  'Y,Z,v1,xl': '0,0,1,1,0,0',
  'Y,X,v1,xl': '0,0,1,0,1,0',
  'Z,X,v1,xl': '0,-1,0,0,0,1',
  'Z,Y,v1,xl': '0,-1,0,-1,0,0',

  // Align=v1,Axis=yl (VBA 461-466)
  'X,Y,v1,yl': '0,-1,0,0,0,1',
  'X,Z,v1,yl': '0,0,-1,0,-1,0',
  'Y,Z,v1,yl': '1,0,0,0,-1,0',
  'Y,X,v1,yl': '0,1,0,1,0,0',
  'Z,X,v1,yl': '0,0,1,1,0,0',
  'Z,Y,v1,yl': '-1,0,0,0,0,1',

  // Align=v1,Axis=zl (VBA 469-474)
  'X,Y,v1,zl': '0,0,1,1,0,0',
  'X,Z,v1,zl': '0,-1,0,1,0,0',
  'Y,Z,v1,zl': '0,-1,0,0,0,1',
  'Y,X,v1,zl': '1,0,0,0,0,1',
  'Z,X,v1,zl': '1,0,0,0,-1,0',
  'Z,Y,v1,zl': '0,0,1,0,-1,0',

  // Align=v2,Axis=xl (VBA 477-482)
  'X,Y,v2,xl': '0,0,1,1,0,0',
  'X,Z,v2,xl': '0,-1,0,1,0,0',
  'Y,Z,v2,xl': '0,-1,0,0,0,1',
  'Y,X,v2,xl': '1,0,0,0,0,1',
  'Z,X,v2,xl': '1,0,0,0,-1,0',
  'Z,Y,v2,xl': '0,0,1,0,-1,0',

  // Align=v2,Axis=yl (VBA 485-490)
  'X,Y,v2,yl': '1,0,0,0,-1,0',
  'X,Z,v2,yl': '1,0,0,0,0,-1',
  'Y,Z,v2,yl': '0,0,1,1,0,0',
  'Y,X,v2,yl': '0,0,1,0,1,0',
  'Z,X,v2,yl': '0,-1,0,0,0,1',
  'Z,Y,v2,yl': '0,-1,0,-1,0,0',

  // Align=v2,Axis=zl (VBA 493-498)
  'X,Y,v2,zl': '0,-1,0,0,0,1',
  'X,Z,v2,zl': '0,0,-1,0,-1,0',
  'Y,Z,v2,zl': '1,0,0,0,-1,0',
  'Y,X,v2,zl': '0,1,0,1,0,0',
  'Z,X,v2,zl': '0,0,1,1,0,0',
  'Z,Y,v2,zl': '-1,0,0,0,0,1',
};

// Coordinate system type mapping
const COORD_SYS_TYPES = {
  GLOBAL: 0,
  ALPHA_BETA: 1,
  VECTOR: 2,
  CELL: 3,
  REFERENCE_ELEM: 4,
};

/**
 * Get double point nodes from spring element data
 * Based on Class110_ElemSpring.GetSpringElem
 */
export function getSpringDoublePoints(rawData: (string | number)[][]): Set<string> {
  const doublePoints = new Set<string>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const node1 = String(row[1] || '');
    const node2 = String(row[2] || '');
    const refType = String(row[4] || '');

    // Check if reference type starts with "参照要素" (VBA: Left(strData(4,i), Len("参照要素")) = "参照要素")
    if (refType.startsWith('参照要素')) {
      // Add both nodes as potential double points
      if (node1) doublePoints.add(node1);
      if (node2) doublePoints.add(node2);
    }
  }

  return doublePoints;
}

/**
 * Parse spring element data from Excel sheet
 */
export function parseSpringElementData(rawData: (string | number)[][]): SpringElementData[] {
  const springElements: SpringElementData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const springElement: SpringElementData = {
      id: String(row[0]),
      node1: String(row[1] || ''),
      node2: String(row[2] || ''),
      propertyName: String(row[3] || ''),
      type: String(row[4] || ''),
      refDirection: String(row[5] || ''),
    };

    springElements.push(springElement);
  }

  return springElements;
}

/**
 * Split coordinate system string (VBA 348-413)
 * Parses various coordinate system formats:
 * - Global: "Global X", "Global Y", "Global Z"
 * - Alpha/Beta: "Alpha=30, Beta=45"
 * - Vector: "ベクトル:X=1,Y=0,Z=0" or "(1,0,0)"
 * - Cell reference: "セル:セル"
 * - Element reference: "参照要素:要素名"
 */
export function splitCoordSys(
  coordStr: string
): {
  type: number;
  alpha?: number;
  beta?: number;
  vector?: Point3D;
  refElementId?: string;
  plane?: string;
  axis?: string;
} {
  if (!coordStr || coordStr.trim() === '') {
    return { type: COORD_SYS_TYPES.GLOBAL };
  }

  const str = coordStr.trim();

  // Global axis reference
  if (str.includes('Global') || str.includes('グローバル')) {
    if (str.includes('X')) {
      return { type: COORD_SYS_TYPES.GLOBAL, vector: { x: 1, y: 0, z: 0 } };
    } else if (str.includes('Y')) {
      return { type: COORD_SYS_TYPES.GLOBAL, vector: { x: 0, y: 1, z: 0 } };
    } else if (str.includes('Z')) {
      return { type: COORD_SYS_TYPES.GLOBAL, vector: { x: 0, y: 0, z: 1 } };
    }
  }

  // Alpha/Beta angle format
  const alphaMatch = str.match(/Alpha[=:]?\s*([-\d.]+)/i);
  const betaMatch = str.match(/Beta[=:]?\s*([-\d.]+)/i);
  if (alphaMatch || betaMatch) {
    return {
      type: COORD_SYS_TYPES.ALPHA_BETA,
      alpha: alphaMatch ? parseFloat(alphaMatch[1]) : 0,
      beta: betaMatch ? parseFloat(betaMatch[1]) : 0,
    };
  }

  // Vector format: "ベクトル:X=1,Y=0,Z=0" or explicit coordinates
  if (str.includes('ベクトル') || str.includes('Vector')) {
    const xMatch = str.match(/X[=:]?\s*([-\d.]+)/i);
    const yMatch = str.match(/Y[=:]?\s*([-\d.]+)/i);
    const zMatch = str.match(/Z[=:]?\s*([-\d.]+)/i);
    if (xMatch || yMatch || zMatch) {
      return {
        type: COORD_SYS_TYPES.VECTOR,
        vector: {
          x: xMatch ? parseFloat(xMatch[1]) : 0,
          y: yMatch ? parseFloat(yMatch[1]) : 0,
          z: zMatch ? parseFloat(zMatch[1]) : 0,
        },
      };
    }
  }

  // Tuple format: (x, y, z)
  const tupleMatch = str.match(/\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
  if (tupleMatch) {
    return {
      type: COORD_SYS_TYPES.VECTOR,
      vector: {
        x: parseFloat(tupleMatch[1]),
        y: parseFloat(tupleMatch[2]),
        z: parseFloat(tupleMatch[3]),
      },
    };
  }

  // Cell reference (double point)
  if (str.includes('セル') || str.includes('Cell')) {
    return { type: COORD_SYS_TYPES.CELL };
  }

  // Reference element
  if (str.includes('参照') || str.includes('要素')) {
    const elemMatch = str.match(/(?:参照要素|要素)[=:]?\s*(.+)/);
    if (elemMatch) {
      return {
        type: COORD_SYS_TYPES.REFERENCE_ELEM,
        refElementId: elemMatch[1].trim(),
      };
    }
  }

  // Plane/Axis format: "X-Y面, X軸"
  const planeMatch = str.match(/([XYZ])-([XYZ])(?:面|平面|Plane)/i);
  const axisMatch = str.match(/([XYZ])(?:軸|Axis)/i);
  if (planeMatch && axisMatch) {
    return {
      type: COORD_SYS_TYPES.GLOBAL,
      plane: `${planeMatch[1]},${planeMatch[2]}`,
      axis: axisMatch[1],
    };
  }

  return { type: COORD_SYS_TYPES.GLOBAL };
}

/**
 * Calculate angle for spring element (VBA 191-272)
 * Determines the rotation angle based on reference element or vector
 */
export function calcAngle(
  node1No: number,
  node2No: number,
  coordSysStr: string,
  context: ConversionContext
): number {
  const coordSys = splitCoordSys(coordSysStr);

  const node1Coords = context.esNodeCoords.get(node1No);
  const node2Coords = context.esNodeCoords.get(node2No);

  if (!node1Coords || !node2Coords) {
    return 0;
  }

  // Calculate element direction vector
  const elemDir = subtractVectors(node2Coords, node1Coords);
  const elemLength = vectorMagnitude(elemDir);

  if (elemLength === 0) {
    return 0;
  }

  switch (coordSys.type) {
    case COORD_SYS_TYPES.GLOBAL:
      if (coordSys.vector) {
        // Transform ES coordinate to MIDAS
        const refVectorMidas: Point3D = {
          x: coordSys.vector.x,
          y: -coordSys.vector.z, // ES Z -> MIDAS -Y
          z: coordSys.vector.y,  // ES Y -> MIDAS Z
        };
        return calculateElementAngle(node1Coords, node2Coords, refVectorMidas);
      }
      return 0;

    case COORD_SYS_TYPES.ALPHA_BETA:
      {
        const alpha = coordSys.alpha || 0;
        const beta = coordSys.beta || 0;
        const alphaRad = (alpha * Math.PI) / 180;
        const betaRad = (beta * Math.PI) / 180;

        // Calculate reference vector from angles
        const refVector: Point3D = {
          x: Math.cos(alphaRad) * Math.cos(betaRad),
          y: -Math.sin(betaRad), // Transformed for MIDAS
          z: Math.sin(alphaRad) * Math.cos(betaRad),
        };

        return calculateElementAngle(node1Coords, node2Coords, refVector);
      }

    case COORD_SYS_TYPES.VECTOR:
      if (coordSys.vector) {
        // Transform ES coordinate to MIDAS
        const refVectorMidas: Point3D = {
          x: coordSys.vector.x,
          y: -coordSys.vector.z,
          z: coordSys.vector.y,
        };
        return calculateElementAngle(node1Coords, node2Coords, refVectorMidas);
      }
      return 0;

    case COORD_SYS_TYPES.CELL:
      // For double point (cell:cell), element is essentially a point spring
      // Return 0 angle and let the spring orientation be determined by local axes
      return 0;

    case COORD_SYS_TYPES.REFERENCE_ELEM:
      if (coordSys.refElementId) {
        // Get reference element coordinates
        const refElemNo = context.elementMapping.get(coordSys.refElementId);
        if (refElemNo) {
          const refNodes = context.elementNodes.get(refElemNo);
          if (refNodes) {
            const refNode1 = context.esNodeCoords.get(refNodes.node1);
            const refNode2 = context.esNodeCoords.get(refNodes.node2);
            if (refNode1 && refNode2) {
              // Use reference element direction as reference vector
              const refDir = subtractVectors(refNode2, refNode1);
              const refDirNorm = normalizeVector(refDir);
              return calculateElementAngle(node1Coords, node2Coords, refDirNorm);
            }
          }
        }
      }
      return 0;

    default:
      return 0;
  }
}

/**
 * Get transformed vector based on plane and axis configuration
 */
export function getTransformedVector(
  plane: string,
  axis: string,
  component: string,
  localAxis: string
): string {
  const key = `${plane},${axis},${component},${localAxis}`;
  return VECTOR_TRANSFORMATIONS[key] || '1,0,0,0,1,0';
}

/**
 * Parse reference direction string to vector
 */
function parseReferenceDirection(refStr: string): { x: number; y: number; z: number } | null {
  const coordSys = splitCoordSys(refStr);

  if (coordSys.vector) {
    return coordSys.vector;
  }

  if (coordSys.type === COORD_SYS_TYPES.ALPHA_BETA) {
    const alpha = coordSys.alpha || 0;
    const beta = coordSys.beta || 0;
    const alphaRad = (alpha * Math.PI) / 180;
    const betaRad = (beta * Math.PI) / 180;

    return {
      x: Math.cos(alphaRad) * Math.cos(betaRad),
      y: Math.sin(alphaRad) * Math.cos(betaRad),
      z: Math.sin(betaRad),
    };
  }

  // Handle different reference direction formats (legacy)
  if (refStr.includes('Global X')) {
    return { x: 1, y: 0, z: 0 };
  } else if (refStr.includes('Global Y')) {
    return { x: 0, y: 1, z: 0 };
  } else if (refStr.includes('Global Z')) {
    return { x: 0, y: 0, z: 1 };
  }

  // Try to parse vector format: ベクトル:X=x,y=z,w=value
  const match = refStr.match(/=([^,]+),([^,]+)=([^,]+),([^,]+)=(.+)/);
  if (match) {
    return {
      x: parseFloat(match[2]) || 0,
      y: parseFloat(match[4]) || 0,
      z: parseFloat(match[5]) || 0,
    };
  }

  return null;
}

/**
 * Parse coordinate system string and calculate angle values
 * VBA CalcAngle (191-272) + Split_CoordSys (348-413)
 * Returns comma-separated angle string like "1,2,1,0,0,0,-1,0"
 */
function calcAngleString(
  strCoordSys: string,
  context: ConversionContext,
  isRefElement: boolean
): string {
  // Reference element case (VBA 256-262)
  if (isRefElement) {
    // Format: "参照要素:ElementName"
    const parts = strCoordSys.split(':');
    if (parts.length === 2) {
      const refElemName = parts[1].trim();
      // Get element number from name, then get angle
      const refElemNo = context.elementMapping?.get(refElemName);
      if (refElemNo !== undefined) {
        const refAngle = context.elementAngles?.get(refElemNo);
        if (refAngle !== undefined) {
          // VBA: m_ElemAngle(vBuf(1))(0) — only the angle value, not nHor
          const angleVal = Array.isArray(refAngle) ? refAngle[0] : refAngle;
          return `0,${angleVal}`;
        }
      }
    }
    return '0,0';
  }

  // Vector case (VBA 263-268)
  // Format: "ベクトル:v1=...,v2=...,Align=...,Axis=..."
  const anglePrefix = '1,2,';

  // Parse coordinate system string (VBA Split_CoordSys 348-413)
  const str = strCoordSys.replace(/ /g, '');
  const colonParts = str.split(':');

  if (colonParts.length !== 2) {
    return anglePrefix + '1,0,0,0,1,0';
  }

  const content = colonParts[1];

  // Check if v1=Global and v2=Global pattern (VBA 367-379)
  const globalCount = (content.match(/Global/g) || []).length;
  if (globalCount === 2) {
    // Extract plane and axis info
    // Remove v1=, v2=, Align=, Axis=, quotes
    let key = content
      .replace(/v1=/g, '')
      .replace(/v2=/g, '')
      .replace(/Align=/g, '')
      .replace(/Axis=/g, '')
      .replace(/"/g, '');

    // Try to find in VECTOR_TRANSFORMATIONS
    if (VECTOR_TRANSFORMATIONS[key]) {
      return anglePrefix + VECTOR_TRANSFORMATIONS[key];
    }
  }

  // Non-Global case - parse v1 and v2 vectors (VBA 381-407)
  const quoteParts = content.split('"');
  if (quoteParts.length >= 5) {
    const v1Str = quoteParts[1];
    const v2Str = quoteParts[3];
    const alignAxis = quoteParts[4].replace(/^,/, '').replace(/Align=/g, '').replace(/Axis=/g, '');

    const v1 = parseVectorString(v1Str);
    const v2 = parseVectorString(v2Str);

    if (v1 && v2) {
      // Calculate based on Align/Axis (VBA 400-407)
      // Use formatNumber to preserve -0 (VBA outputs -0 when result is negative zero)
      // VBA uses string concatenation: ",-" & value
      // When value is -1, this produces ",--1" (not ",-1" from -(-1)=1)
      // This is intentional VBA behavior that we must replicate
      if (alignAxis.includes('v1,xl') || alignAxis.includes('v2,yl')) {
        const cross = calcVectorCross(v1, v2);
        return anglePrefix + `${formatNumber(v1[0])},-${v1[2]},${formatNumber(v1[1])},${cross}`;
      } else if (alignAxis.includes('v1,yl') || alignAxis.includes('v2,zl')) {
        const cross = calcVectorCross(v1, v2);
        return anglePrefix + `${cross},${formatNumber(v2[0])},-${v2[2]},${formatNumber(v2[1])}`;
      } else if (alignAxis.includes('v1,zl') || alignAxis.includes('v2,xl')) {
        return anglePrefix + `${formatNumber(v1[0])},-${v1[2]},${formatNumber(v1[1])},${formatNumber(v2[0])},-${v2[2]},${formatNumber(v2[1])}`;
      }
    }
  }

  return anglePrefix + '1,0,0,0,1,0';
}

/**
 * Parse vector string like "GlobalX", "Alpha=30,Beta=45", "X=1,Y=0,Z=0"
 */
function parseVectorString(str: string): number[] | null {
  // Global case
  if (str.includes('GlobalX')) return [1, 0, 0];
  if (str.includes('GlobalY')) return [0, 1, 0];
  if (str.includes('GlobalZ')) return [0, 0, 1];

  // Alpha/Beta case (VBA Change_Alpha 284-303)
  if (str.includes('Alpha')) {
    const alphaMatch = str.match(/Alpha[=:]?([\d.-]+)/);
    const betaMatch = str.match(/Beta[=:]?([\d.-]+)/);
    if (alphaMatch || betaMatch) {
      const alpha = alphaMatch ? parseFloat(alphaMatch[1]) * Math.PI / 180 : 0;
      const beta = betaMatch ? parseFloat(betaMatch[1]) * Math.PI / 180 : 0;
      return [
        Math.cos(beta) * Math.cos(alpha),
        Math.cos(beta) * Math.sin(alpha),
        Math.sin(beta)
      ];
    }
  }

  // X=,Y=,Z= case (VBA Change_Vect 304-321)
  const xMatch = str.match(/X[=:]?([\d.-]+)/);
  const yMatch = str.match(/Y[=:]?([\d.-]+)/);
  const zMatch = str.match(/Z[=:]?([\d.-]+)/);
  if (xMatch || yMatch || zMatch) {
    return [
      xMatch ? parseFloat(xMatch[1]) : 0,
      yMatch ? parseFloat(yMatch[1]) : 0,
      zMatch ? parseFloat(zMatch[1]) : 0
    ];
  }

  return null;
}

/**
 * Calculate cross product and return formatted string (VBA Calc_Vecter 322-345)
 */
function calcVectorCross(v1: number[], v2: number[]): string {
  // Normalize vectors
  const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
  const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);

  if (len1 !== 0) {
    v1 = v1.map(x => x / len1);
  }
  if (len2 !== 0) {
    v2 = v2.map(x => x / len2);
  }

  // Cross product with sign inversions as in VBA
  const ret = [
    v2[1] * (-v1[2]) - v1[1] * (-v2[2]),
    v2[2] * (-v1[0]) - v1[2] * (-v2[2]),
    v2[0] * v1[1] - v1[0] * (-v2[1])
  ];

  // VBA: Calc_Vecter = vRet(0) & "," & -vRet(2) & "," & vRet(1)
  // Use formatNumber to preserve -0 (VBA outputs -0 when result is negative zero)
  return `${formatNumber(ret[0])},${formatNumber(-ret[2])},${formatNumber(ret[1])}`;
}

/**
 * Replace comma with dash in property name (VBA ChgCamma)
 * VBA: ChgCamma = Replace(strORG, ",", "-")
 */
function chgComma(str: string): string {
  return str.replace(/,/g, '-');
}

/**
 * Convert ES spring elements to MCT format
 * Based on Class110_ElemSpring.ChangeElemSpring (VBA 86-189)
 */
export function convertSpringElements(
  rawData: (string | number)[][],
  context: ConversionContext,
  spg6CompMapping: Map<string, number>
): ElemSpringConversionResult {
  const nlLinks: MCTNLLink[] = [];
  const mctLines: string[] = [];
  const doublePointNodes = getSpringDoublePoints(rawData);

  // Comments (VBA 137-141)
  mctLines.push('*NL-LINK  ; General Link');
  mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP');
  mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, ANGLE-x, ANGLE-y, ANGLE-z, GROUP');
  mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, P0X, P0Y, P0Z, P1X, P1Y, P1Z, P2X, P2Y, P2Z, GROUP');
  mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, V1X, V1Y, V1Z, V2X, V2Y, V2Z, GROUP');

  // Build element ID mapping (VBA 102-116)
  const elemIdMapping = new Map<string, number>();
  let maxElemNo = 0;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    const numId = parseInt(elemId, 10);

    if (!isNaN(numId) && numId > maxElemNo) {
      maxElemNo = numId;
    }
    elemIdMapping.set(elemId, isNaN(numId) ? 0 : numId);
  }

  // Assign numbers to non-numeric element IDs
  maxElemNo++;
  for (const [key, value] of elemIdMapping.entries()) {
    if (value === 0 || isNaN(value)) {
      elemIdMapping.set(key, maxElemNo);
      maxElemNo++;
    }
  }

  // VBA dicComponent (line 149, 221-254): tracks propName -> (coordSys + samePoint)
  // Used to detect when same propName has different coordinate systems
  const dicComponent = new Map<string, string>();
  // Track all used property names (including ones with ~1, ~2 suffixes)
  const usedPropNames = new Set<string>();

  // Generate MCT lines (VBA 153-184)
  const refElementPrefix = '参照要素';

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    const node1Id = String(row[1] || '');
    const node2Id = String(row[2] || '');
    const origPropName = String(row[3] || '');  // Original property name (for spg6CompMapping lookup)
    const coordSysStr = String(row[4] || '');

    const elemNo = elemIdMapping.get(elemId) || 1;
    const node1No = context.nodeMapping.get(node1Id) || 0;
    const node2No = context.nodeMapping.get(node2Id) || 0;

    if (node1No === 0 || node2No === 0) continue;

    // VBA CalcAngle line 215-218: Determine if same point (2重節点)
    // Check if original node coordinates are the same
    const origNode1 = context.originalNodeCoords.get(node1Id);
    const origNode2 = context.originalNodeCoords.get(node2Id);
    let strSprPnt = '_NotSame';
    if (origNode1 && origNode2 &&
        origNode1.x === origNode2.x &&
        origNode1.y === origNode2.y &&
        origNode1.z === origNode2.z) {
      strSprPnt = '_Same';
    }

    // VBA CalcAngle line 221-254: dicComponent logic for ~1, ~2 suffix
    let propName = origPropName;
    const componentKey = coordSysStr + strSprPnt;

    if (dicComponent.has(propName)) {
      // Already exists, check if coordinate system is different
      if (dicComponent.get(propName) !== componentKey) {
        // Different coordinate system - need to add ~1, ~2, etc. suffix
        let suffixNum = 1;
        let newName = `${propName}~${suffixNum}`;
        while (usedPropNames.has(newName)) {
          suffixNum++;
          newName = `${propName}~${suffixNum}`;
        }
        // Register the new name with its coordinate system
        dicComponent.set(newName, componentKey);
        usedPropNames.add(newName);

        // Copy spg6CompMapping for the new name if original exists
        if (spg6CompMapping.has(origPropName)) {
          spg6CompMapping.set(newName, spg6CompMapping.get(origPropName)!);
        }

        // CRITICAL: Copy springCompData for the new name (VBA line 239-240)
        // VBA: m_SprCompORG(n) = m_SprCompORG(k); m_SprComp(n) = m_SprCompORG(k)
        const origSprData = context.springCompData.get(origPropName);
        if (origSprData) {
          // Deep copy the component data
          const newSprData = {
            angle: origSprData.angle,
            vAngle: [1, 3, -2, 4, 6, -5] as number[],
            components: origSprData.components.map(comp => ({
              ...comp,
              propertyName: newName,
              tensionData: comp.tensionData ? comp.tensionData.map(arr =>
                arr ? arr.map(pt => ({ ...pt })) : []
              ) : undefined,
            })),
          };
          context.springCompData.set(newName, newSprData);
        }

        propName = newName;
      }
    } else {
      // First occurrence - register it
      dicComponent.set(propName, componentKey);
      usedPropNames.add(propName);
    }

    // Check if reference element type
    const isRefElement = coordSysStr.startsWith(refElementPrefix);

    // Calculate angle string (VBA CalcAngle)
    const angleStr = calcAngleString(coordSysStr, context, isRefElement);

    // Build MCT line (VBA 162-181)
    // GPROP uses modified propName (with ~1 suffix if applicable)
    const gprop = chgComma(propName);
    // IEPROP: check with ORIGINAL name, but output with modified name
    const ieprop = spg6CompMapping.has(origPropName) ? `NL_${propName}` : '';

    const mctLine = `${elemNo},${node1No},${node2No},${gprop},${ieprop},${angleStr},`;
    mctLines.push(mctLine);

    nlLinks.push({
      no: elemNo,
      type: 'NLLINK',
      node1: node1No,
      node2: node2No,
      propertyNo: spg6CompMapping.get(origPropName) || 1,
      angle: 0,  // angle is now in the string
    });
  }

  return { nlLinks, mctLines, doublePointNodes };
}
