// Load Converter - Class190_Load equivalent
// Converts ES load data to MCT *STLDCASE, *CONLOAD, *SPDISP, *BEAMLOAD, *ELTEMPER format
// Based on VBA Class190_Load.ChangeLoad (lines 82-352)

import { ConversionContext } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';
import { generateNumberRangeString } from '../utils/stringUtils';

export interface LoadConversionResult {
  mctLinesLoadCase: string[];
  mctLinesConLoad: string[];
  mctLinesSpDisp: string[];
  mctLinesBeamLoad: string[];
  mctLinesElTemper: string[];
}

// VBA Column structure (nReadSTRow=3, nReadSTCol=2, nReadEDCol=20)
// strData indices 0-18 (19 columns, B-T)
const COL = {
  UNKNOWN: 0,
  LOAD_TYPE: 1,      // 하중 유형 (ノード-集中荷重, etc.)
  LOAD_CASE: 2,      // 하중 케이스명
  ACTION_TYPE: 3,    // 작용 유형 (並進荷重/モーメント)
  TARGET: 4,         // 대상 노드/요소명 (comma-separated)
  VALUE1: 5,         // P1 값
  VALUE2: 6,         // P2 값
  VALUE3: 7,
  VALUE4: 8,
  VALUE5: 9,
  VALUE6: 10,
  ECCENTRICITY: 11,  // 편심값
  COORD_TYPE: 12,    // 좌표 유형 (座標指定/ベクトル指定)
  DIRECTION: 13,     // 방향 (全体 X/Y/Z, 要素 X/Y/Z)
  VECTOR_X: 14,      // X성분 또는 "モーメント"
  VECTOR_Y: 15,      // Y성분
  VECTOR_Z: 16,      // Z성분
  ALPHA: 17,         // Alpha 각도
  BETA: 18,          // Beta 각도
};

// Load type dictionary (VBA lines 106-113)
// IMPORTANT: VBA uses exact string matching (Dictionary lookup).
// Keys must use the EXACT same characters as VBA's dicType:
//   - Dash: U+002D (ASCII hyphen-minus)
//   - Parentheses: U+FF08/U+FF09 (full-width) for types 5 and 6
// If the Excel data uses different characters (e.g., U+2212 minus sign),
// VBA's lookup fails silently (returns 0) and the row is skipped.
// TypeScript must match this exact behavior.
const LOAD_TYPES: Record<string, number> = {
  // Type 1: Node concentrated load
  '節点-集中荷重': 1,             // VBA original
  'ノード-集中荷重': 1,           // katakana variant
  // Type 2: Rigid element load
  '剛体要素荷重': 2,
  // Type 3: Node forced displacement
  '節点-強制変位': 3,             // VBA original
  'ノード-強制変位': 3,           // katakana variant
  // Type 4: Frame element concentrated load
  'フレーム要素-集中荷重': 4,
  // Type 5: Frame element distributed load (single) - FULL-WIDTH parens （）
  'フレーム要素-分布荷重（単独）': 5,
  // Type 6: Frame element distributed load (continuous) - FULL-WIDTH parens （）
  'フレーム要素-分布荷重（連続）': 6,
  // Type 7: Frame element projected load
  'フレーム要素-射影長荷重': 7,   // VBA original (射影長)
  // Type 8: Temperature load
  '温度荷重': 8,
};

/**
 * Normalize Japanese text by converting various dash/hyphen and parenthesis characters
 * to standard ASCII equivalents for consistent matching
 *
 * Dash/Hyphen variants:
 * - U+002D: - (hyphen-minus) [standard]
 * - U+2010: ‐ (hyphen)
 * - U+2012: ‒ (figure dash)
 * - U+2013: – (en dash)
 * - U+2014: — (em dash)
 * - U+2212: − (minus sign)
 * - U+30FC: ー (katakana prolonged sound mark)
 * - U+FF0D: ー (fullwidth hyphen-minus)
 *
 * Parentheses variants:
 * - U+0028/U+0029: () [standard]
 * - U+FF08/U+FF09: （）(fullwidth)
 */
function normalizeJapaneseText(text: string): string {
  return text
    // Normalize dashes/hyphens to standard hyphen (U+002D)
    // NOTE: U+30FC (ー, katakana prolonged sound mark) is NOT included
    //       because it's part of Japanese words like "フレーム"
    .replace(/[\u2010\u2012\u2013\u2014\u2212\uFF0D]/g, '-')
    // Normalize fullwidth parentheses to ASCII
    .replace(/\uFF08/g, '(')
    .replace(/\uFF09/g, ')')
    // Normalize fullwidth space (U+3000) to ASCII space
    .replace(/\u3000/g, ' ')
    // Trim whitespace
    .trim();
}

// Direction mapping (VBA lines 654-659) - with Y-Z swap
const DIR_MAP: Record<string, string> = {
  '全体 X': 'GX',
  '全体 Y': 'GZ',  // ES Y → MIDAS Z
  '全体 Z': 'GY',  // ES Z → MIDAS Y
  '要素 X': 'LX',
  '要素 Y': 'LZ',  // ES Y → MIDAS Z
  '要素 Z': 'LY',  // ES Z → MIDAS Y
};

// SpDisp vector type mapping (VBA lines 455-460)
const SPDISP_VECTOR_TYPE: Record<string, number> = {
  '並進荷重全体 X': 0,
  '並進荷重全体 Y': 1,
  '並進荷重全体 Z': 2,
  'モーメント全体 X': 3,
  'モーメント全体 Y': 4,
  'モーメント全体 Z': 5,
};

// Element-node type for sorting
interface ElemNodeType {
  vElem: string;
  vElem_I?: number;
  vElem_J?: number;
  vNode_I: number;
  vNode_J: number;
  dLength: number;
}

/**
 * Calculate load vector from direction components or Alpha/Beta angles
 * Based on VBA CalcVecter (lines 354-400)
 */
function calcVecter(
  row: (string | number)[],
  valueCol: number = COL.VALUE1
): { strLoad: string; strFlag: string } {
  const vBuf: number[] = [0, 0, 0];
  const vFlagBuf: number[] = [0, 0, 0];

  // Get vector components (VBA lines 367-369)
  vBuf[0] = safeParseNumber(row[COL.VECTOR_X]);
  vBuf[1] = safeParseNumber(row[COL.VECTOR_Y]);
  vBuf[2] = safeParseNumber(row[COL.VECTOR_Z]);

  // Check for angle-based direction (VBA lines 371-378)
  const coordType = normalizeJapaneseText(String(row[COL.COORD_TYPE] || ''));
  if (coordType === '球座標指定') {
    const dAlpha = safeParseNumber(row[COL.ALPHA]);
    const dBeta = safeParseNumber(row[COL.BETA]);

    vBuf[0] = Math.cos(dBeta) * Math.cos(dAlpha);
    vBuf[1] = Math.cos(dBeta) * Math.sin(dAlpha);
    vBuf[2] = Math.sin(dBeta);
  }

  // Normalize and apply value (VBA lines 380-387)
  const dBasVect = Math.sqrt(vBuf[0] * vBuf[0] + vBuf[1] * vBuf[1] + vBuf[2] * vBuf[2]);
  const loadValue = safeParseNumber(row[valueCol]);

  for (let i = 0; i < 3; i++) {
    if (dBasVect > 0) {
      vBuf[i] = vBuf[i] / dBasVect;
    }
    vBuf[i] = vBuf[i] * loadValue;
    if (Math.abs(vBuf[i]) > 0) vFlagBuf[i] = 1;
  }

  // Check if moment or force (VBA lines 390-396)
  const strNoData = '0.0, 0.0, 0.0';
  let strLoad: string;
  let strFlag: string;

  // VBA preserves -0 sign in string output; JavaScript's String(-0) returns "0".
  // Use helper to match VBA behavior.
  const fmtVal = (v: number): string => Object.is(v, -0) ? '-0' : String(v);

  const vectorX = normalizeJapaneseText(String(row[COL.VECTOR_X] || ''));
  if (vectorX === 'モーメント') {
    // Moment: coordinate swap (x, -z, y)
    strLoad = `${strNoData},${fmtVal(vBuf[0])},${fmtVal(-1 * vBuf[2])},${fmtVal(vBuf[1])}`;
    strFlag = `000${vFlagBuf[0]}${vFlagBuf[2]}${vFlagBuf[1]}`;
  } else {
    // Force: coordinate swap (x, -z, y)
    strLoad = `${fmtVal(vBuf[0])},${fmtVal(-1 * vBuf[2])},${fmtVal(vBuf[1])},${strNoData}`;
    strFlag = `${vFlagBuf[0]}${vFlagBuf[2]}${vFlagBuf[1]}000`;
  }

  return { strLoad, strFlag };
}

/**
 * Calculate distance between two nodes
 * Based on VBA dist (lines 547-555)
 */
function dist(
  node1: string,
  node2: string,
  context: ConversionContext
): number {
  const coord1 = context.originalNodeCoords.get(node1);
  const coord2 = context.originalNodeCoords.get(node2);

  if (!coord1 || !coord2) return 0;

  return Math.sqrt(
    Math.pow(coord1.x - coord2.x, 2) +
    Math.pow(coord1.y - coord2.y, 2) +
    Math.pow(coord1.z - coord2.z, 2)
  );
}

/**
 * Sort elements for distributed load chain
 * Based on VBA SortElem (lines 557-617)
 */
function sortElem(
  vElem: string[],
  context: ConversionContext
): { vElemNode: ElemNodeType[]; dAll: number } {
  const vElemNode: ElemNodeType[] = [];
  let dAll = 0;

  // Build element-node data (VBA lines 563-570)
  for (let i = 0; i < vElem.length; i++) {
    const elemName = vElem[i];
    const elemNodes = context.elemNodeNames.get(elemName);

    if (elemNodes) {
      // Use elemNodeNames if available
      const nodeI = elemNodes.nodeI;
      const nodeJ = elemNodes.nodeJ;
      const nodeINo = context.nodeMapping.get(nodeI) || 0;
      const nodeJNo = context.nodeMapping.get(nodeJ) || 0;
      const dLength = dist(nodeI, nodeJ, context);

      vElemNode.push({
        vElem: elemName,
        vNode_I: nodeINo,
        vNode_J: nodeJNo,
        dLength,
      });
      dAll += dLength;
    } else {
      // Fallback: try to get from elementNodes using element number
      const elemNo = context.elementMapping.get(elemName);
      if (elemNo) {
        const nodes = context.elementNodes.get(elemNo);
        if (nodes) {
          vElemNode.push({
            vElem: elemName,
            vNode_I: nodes.node1,
            vNode_J: nodes.node2,
            dLength: 1, // Default length if coordinates not available
          });
          dAll += 1;
        }
      }
    }
  }

  // Find connections (VBA lines 574-590)
  let nStart = 0;
  for (let i = 0; i < vElemNode.length - 1; i++) {
    for (let j = i + 1; j < vElemNode.length; j++) {
      if (vElemNode[i].vNode_I === vElemNode[j].vNode_J) {
        vElemNode[i].vElem_I = j;
        vElemNode[j].vElem_J = i;
      }
      if (vElemNode[i].vNode_J === vElemNode[j].vNode_I) {
        vElemNode[i].vElem_J = j;
        vElemNode[j].vElem_I = i;
      }
    }
    if (vElemNode[i].vElem_I === undefined) nStart = i;
  }

  // Sort by chain (VBA lines 597-614)
  const sortedElem: string[] = [];
  let j = nStart;
  for (let i = 0; i < vElemNode.length; i++) {
    sortedElem.push(vElemNode[j].vElem);
    j = vElemNode[j].vElem_J ?? 0;
  }

  // Reorder vElemNode to match sorted order
  const sortedElemNode: ElemNodeType[] = [];
  for (const elem of sortedElem) {
    const found = vElemNode.find(e => e.vElem === elem);
    if (found) sortedElemNode.push(found);
  }

  return { vElemNode: sortedElemNode, dAll };
}

/**
 * Get eccentricity string
 * Based on VBA GetECCEN (lines 500-545)
 */
function getECCEN(
  vDir: string,
  vElem: string,
  vEccentricity: number,
  context: ConversionContext
): string {
  if (vEccentricity === 0 || isNaN(vEccentricity)) {
    return 'NO,,,,';
  }

  // Get element number to look up angle
  const elemNo = context.elementMapping.get(vElem);
  if (!elemNo) {
    return `YES,0,LY,${vEccentricity},${vEccentricity},NO`;
  }

  const elemAngle = context.elementAngles.get(elemNo);
  if (elemAngle === undefined) {
    return `YES,0,LY,${vEccentricity},${vEccentricity},NO`;
  }

  let strEccDir = '';
  // Handle both number and number[] types
  const angle0 = Array.isArray(elemAngle) ? (elemAngle[0] || 0) : elemAngle;
  const angle1 = Array.isArray(elemAngle) ? (elemAngle[1] || 0) : 0;

  switch (vDir) {
    case 'GX':
      if ((angle0 === 0 && angle1 === 0) || (angle0 !== 0 && angle1 === 1)) {
        strEccDir = 'LY';
      } else {
        strEccDir = 'LZ';
      }
      break;
    case 'GZ':
      if (angle1 === 1) {
        strEccDir = angle0 === 0 ? 'LY' : 'LZ';
      }
      break;
    case 'GY':
      if ((angle0 === 0 && angle1 === 0) || (angle0 === 0 && angle1 === 1)) {
        strEccDir = 'LZ';
      } else {
        strEccDir = 'LY';
      }
      break;
    case 'LY':
    case 'LZ':
      strEccDir = vDir;
      break;
    default:
      strEccDir = 'LY';
  }

  return `YES,0,${strEccDir},${vEccentricity},${vEccentricity},NO`;
}

/**
 * Get string with node number generation for multiple nodes
 * Parses comma-separated numbers and generates range string (e.g. "'1to3 5to7 10")
 */
function getStringGen(nodeList: string): string {
  // If single node, return as-is
  if (!nodeList.includes(',')) {
    return nodeList;
  }
  // Parse numbers and generate range string
  const numbers = nodeList.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  return generateNumberRangeString(numbers);
}

/**
 * Convert ES load data to MCT format
 * Based on VBA Class190_Load.ChangeLoad (lines 82-352)
 */
export function convertLoads(
  rawData: (string | number)[][],
  context: ConversionContext
): LoadConversionResult {
  const mctLinesLoadCase: string[] = [];
  const mctLinesConLoad: string[] = [];
  const mctLinesSpDisp: string[] = [];
  const mctLinesBeamLoad: string[] = [];
  const mctLinesElTemper: string[] = [];

  console.log('=== LoadConverter Debug ===');
  console.log('rawData rows:', rawData.length);
  console.log('nodeMapping size:', context.nodeMapping.size);
  console.log('elementMapping size:', context.elementMapping.size);

  if (rawData.length === 0) {
    console.log('No load data - returning empty');
    return { mctLinesLoadCase, mctLinesConLoad, mctLinesSpDisp, mctLinesBeamLoad, mctLinesElTemper };
  }

  // Build load case dictionary (VBA lines 118-132)
  const dicLoadName = new Map<string, string>();
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const loadCase = String(row[COL.LOAD_CASE] || '');
    const loadType = String(row[COL.LOAD_TYPE] || '');
    if (loadCase && !dicLoadName.has(loadCase)) {
      dicLoadName.set(loadCase, loadType);
    }
  }

  // Data structures for each load type
  interface LoadData {
    dicName: Map<string, number>;
    strDat: string[][];
  }

  const tConLoad: LoadData = { dicName: new Map(), strDat: [] };
  const tSpDisp: LoadData = { dicName: new Map(), strDat: [] };
  const tBeamLoad: LoadData = { dicName: new Map(), strDat: [] };
  const tElTemper: LoadData = { dicName: new Map(), strDat: [] };

  // Process each row (VBA lines 187-254)
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[COL.LOAD_TYPE] || String(row[COL.LOAD_TYPE]).trim() === '') continue;

    const loadTypeStr = String(row[COL.LOAD_TYPE]);
    // VBA uses exact string matching (Dictionary lookup). Do NOT normalize.
    // If the raw load type doesn't match any key, n=0 and the row is skipped,
    // matching VBA's On Error Resume Next + Dictionary auto-create behavior.
    const n = LOAD_TYPES[loadTypeStr] || 0;

    if (n === 0) {
      // Log unknown load types with character codes for debugging
      const charCodes = loadTypeStr.split('').map(c => c.charCodeAt(0).toString(16)).join(',');
      console.log(`Row ${i}: UNKNOWN loadType="${loadTypeStr}" (charCodes: ${charCodes})`);
    } else {
      console.log(`Row ${i}: loadType="${loadTypeStr}" -> n=${n}`);
    }

    // Get node numbers for node-based loads (VBA lines 192-216)
    let strNode = '';
    if (n === 1 || n === 2 || n === 3) {
      const targetStr = String(row[COL.TARGET] || '');
      const vNode = targetStr.split(',');
      console.log(`  -> Target: "${targetStr}", parsed nodes: [${vNode.join(', ')}]`);

      if (n === 2) {
        // Rigid element load - get master node from rigid element
        const nodeNos: number[] = [];
        for (const nodeName of vNode) {
          const trimmedName = nodeName.trim();
          // Try rigidMasterNode map first
          const rigidMaster = context.rigidMasterNode.get(trimmedName);
          if (rigidMaster) {
            const masterNo = context.nodeMapping.get(rigidMaster);
            if (masterNo) nodeNos.push(masterNo);
          } else {
            // Fallback: try to get from rigidElements using element number
            const elemNo = context.elementMapping.get(trimmedName);
            if (elemNo) {
              const rigid = context.rigidElements.get(elemNo);
              if (rigid) {
                nodeNos.push(rigid.masterNode);
              }
            }
          }
        }
        if (nodeNos.length === 0) {
          console.log(`  -> Skipped: no rigid element nodes found`);
          continue;
        }
        strNode = nodeNos.join(',');
      } else {
        // Regular node load
        const nodeNos: number[] = [];
        for (const nodeName of vNode) {
          const trimmedName = nodeName.trim();
          const nodeNo = context.nodeMapping.get(trimmedName);
          if (nodeNo) {
            nodeNos.push(nodeNo);
          } else {
            console.log(`  -> Node "${trimmedName}" not found in nodeMapping`);
          }
        }
        if (nodeNos.length === 0) {
          console.log(`  -> Skipped: no valid nodes found`);
          continue;
        }
        strNode = nodeNos.join(',');
      }
    }

    const value1 = safeParseNumber(row[COL.VALUE1]);

    switch (n) {
      case 1: // ノード-集中荷重
      case 2: // 剛体要素荷重
        console.log(`  -> Case ${n}: strNode="${strNode}", value1=${value1}`);
        if (value1 !== 0) {
          setConLoad(tConLoad, row, strNode);
          console.log(`  -> Added to CONLOAD`);
        } else {
          console.log(`  -> Skipped: value1 is 0`);
        }
        break;

      case 3: // ノード-強制変位
        console.log(`  -> Case 3: strNode="${strNode}", value1=${value1}`);
        if (value1 !== 0) {
          setSpDisp(tSpDisp, row, strNode);
          console.log(`  -> Added to SPDISP`);
        } else {
          console.log(`  -> Skipped: value1 is 0`);
        }
        break;

      case 4: // フレーム要素-集中荷重
      case 5: // フレーム要素-分布荷重(単独)
      case 6: // フレーム要素-分布荷重(連続)
      case 7: // フレーム要素-射影面荷重
        console.log(`  -> Case ${n}: calling setBeamLoad`);
        setBeamLoad(tBeamLoad, row, n, context);
        break;

      case 8: // 温度荷重
        if (value1 !== 0) {
          // Get element numbers
          const targetStr = String(row[COL.TARGET] || '');
          const vElem = targetStr.split(',');
          const elemNos: number[] = [];
          for (const elemName of vElem) {
            const elemNo = context.elementMapping.get(elemName.trim());
            if (elemNo) elemNos.push(elemNo);
          }
          if (elemNos.length === 0) continue;
          const strElem = elemNos.join(',');
          setElTemper(tElTemper, row, strElem);
        }
        break;
    }
  }

  // Generate *STLDCASE (VBA lines 262-269)
  mctLinesLoadCase.push('*STLDCASE    ; Static Load Cases');
  mctLinesLoadCase.push('; LCNAME, LCTYPE, DESC');
  for (const [lcName] of dicLoadName) {
    mctLinesLoadCase.push(`${lcName},USER,`);
  }

  // Generate *CONLOAD with *USE-STLD wrapper (VBA lines 271-288)
  if (tConLoad.dicName.size > 0) {
    for (const [sName, idx] of tConLoad.dicName) {
      mctLinesConLoad.push(`*USE-STLD, ${sName}`);
      mctLinesConLoad.push('');
      mctLinesConLoad.push('*CONLOAD    ; Nodal Loads');
      mctLinesConLoad.push('; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME');

      const datLines = tConLoad.strDat[idx] || [];
      for (const line of datLines) {
        mctLinesConLoad.push(`${line}`);
      }

      mctLinesConLoad.push('');
      mctLinesConLoad.push(`; End of data for load case [${sName}] -------------------------`);
      mctLinesConLoad.push('');
    }
  }

  // Generate *SPDISP with *USE-STLD wrapper (VBA lines 290-307)
  if (tSpDisp.dicName.size > 0) {
    for (const [sName, idx] of tSpDisp.dicName) {
      mctLinesSpDisp.push(`*USE-STLD, ${sName}`);
      mctLinesSpDisp.push('');
      mctLinesSpDisp.push('*SPDISP    ; Specified Displacement of Supports');
      mctLinesSpDisp.push('; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP');

      const datLines = tSpDisp.strDat[idx] || [];
      for (const line of datLines) {
        mctLinesSpDisp.push(`${line}`);
      }

      mctLinesSpDisp.push('');
      mctLinesSpDisp.push(`; End of data for load case [${sName}] -------------------------`);
      mctLinesSpDisp.push('');
    }
  }

  // Generate *BEAMLOAD with *USE-STLD wrapper (VBA lines 309-328)
  if (tBeamLoad.dicName.size > 0) {
    for (const [sName, idx] of tBeamLoad.dicName) {
      mctLinesBeamLoad.push(`*USE-STLD, ${sName}`);
      mctLinesBeamLoad.push('');
      // 6-line comment (VBA lines 166-173)
      mctLinesBeamLoad.push('*BEAMLOAD    ; Element Beam Loads');
      mctLinesBeamLoad.push('; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP');
      mctLinesBeamLoad.push('; ELEM_LIST, CMD, TYPE, TYPE, DIR, VX, VY, VZ, bPROJ, [ECCEN], [VALUE], GROUP');
      mctLinesBeamLoad.push('; [VALUE]       : D1, P1, D2, P2, D3, P3, D4, P4');
      mctLinesBeamLoad.push('; [ECCEN]       : bECCEN, ECCDIR, I-END, J-END, bJ-END');
      mctLinesBeamLoad.push('; [ADDITIONAL]  : bADDITIONAL, ADDITIONAL_I-END, ADDITIONAL_J-END, bADDITIONAL_J-END');

      const datLines = tBeamLoad.strDat[idx] || [];
      for (const line of datLines) {
        mctLinesBeamLoad.push(`${line}`);
      }

      mctLinesBeamLoad.push('');
      mctLinesBeamLoad.push(`; End of data for load case [${sName}] -------------------------`);
      mctLinesBeamLoad.push('');
    }
  }

  // Generate *ELTEMPER with *USE-STLD wrapper (VBA lines 330-347)
  if (tElTemper.dicName.size > 0) {
    for (const [sName, idx] of tElTemper.dicName) {
      mctLinesElTemper.push(`*USE-STLD, ${sName}`);
      mctLinesElTemper.push('');
      mctLinesElTemper.push('*ELTEMPER    ; Element Temperatures');
      mctLinesElTemper.push('; ELEM_LIST, TEMPER, GROUP');

      const datLines = tElTemper.strDat[idx] || [];
      for (const line of datLines) {
        mctLinesElTemper.push(`${line}`);
      }

      mctLinesElTemper.push('');
      mctLinesElTemper.push(`; End of data for load case [${sName}] -------------------------`);
      mctLinesElTemper.push('');
    }
  }

  console.log('=== LoadConverter Summary ===');
  console.log(`tConLoad.dicName.size: ${tConLoad.dicName.size}`);
  console.log(`tSpDisp.dicName.size: ${tSpDisp.dicName.size}`);
  console.log(`tBeamLoad.dicName.size: ${tBeamLoad.dicName.size}`);
  console.log(`tElTemper.dicName.size: ${tElTemper.dicName.size}`);
  console.log(`mctLinesLoadCase.length: ${mctLinesLoadCase.length}`);
  console.log(`mctLinesConLoad.length: ${mctLinesConLoad.length}`);
  console.log(`mctLinesBeamLoad.length: ${mctLinesBeamLoad.length}`);

  return { mctLinesLoadCase, mctLinesConLoad, mctLinesSpDisp, mctLinesBeamLoad, mctLinesElTemper };
}

/**
 * Set concentrated load data
 * Based on VBA SetConLoad (lines 402-431)
 */
function setConLoad(
  tConLoad: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  strNode: string
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');

  let i: number;
  let j: number;
  if (tConLoad.dicName.has(loadCase)) {
    i = tConLoad.dicName.get(loadCase)!;
    j = tConLoad.strDat[i].length;
  } else {
    i = tConLoad.dicName.size;
    tConLoad.dicName.set(loadCase, i);
    tConLoad.strDat[i] = [];
    j = 0;
  }

  const { strLoad } = calcVecter(row);
  const nodeStr = getStringGen(strNode);

  tConLoad.strDat[i][j] = `${nodeStr},${strLoad},,`;
}

/**
 * Set specified displacement data
 * Based on VBA SetSpDisp (lines 433-498)
 */
function setSpDisp(
  tSpDisp: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  strNode: string
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');

  let i: number;
  let j: number;
  if (tSpDisp.dicName.has(loadCase)) {
    i = tSpDisp.dicName.get(loadCase)!;
    j = tSpDisp.strDat[i].length;
  } else {
    i = tSpDisp.dicName.size;
    tSpDisp.dicName.set(loadCase, i);
    tSpDisp.strDat[i] = [];
    j = 0;
  }

  // VBA line 466: strVecterType = strData(13, nCnt) - uses DIRECTION column, not COORD_TYPE
  const strVecterType = normalizeJapaneseText(String(row[COL.DIRECTION] || ''));
  let strFlag = '';
  let strLoad = '';

  if (strVecterType === 'ベクトル指定' || strVecterType === '球座標指定') {
    // Vector or coordinate specification (VBA lines 474-476)
    const result = calcVecter(row, COL.VALUE1);
    strLoad = result.strLoad + ',';
    strFlag = result.strFlag;
  } else {
    // Direction-based (VBA lines 477-490)
    const vVect = [0, 0, 0, 0, 0, 0];
    const actionType = normalizeJapaneseText(String(row[COL.ACTION_TYPE] || ''));
    const actionDir = actionType + strVecterType;
    const vecTypeIdx = SPDISP_VECTOR_TYPE[actionDir];

    if (vecTypeIdx !== undefined) {
      vVect[vecTypeIdx] = 1;
    }

    for (let k = 0; k < 6; k++) {
      strFlag += String(vVect[k]);
    }

    const value = safeParseNumber(row[COL.VALUE1]);
    const strBuf: string[] = [];
    for (let k = 0; k < 6; k++) {
      strBuf[k] = String(vVect[k] * value);
    }
    strLoad = strBuf.join(',') + ',';
  }

  const nodeStr = getStringGen(strNode);
  tSpDisp.strDat[i][j] = `${nodeStr},${strFlag},${strLoad}`;
}

/**
 * Set beam load data
 * Based on VBA SetBeamLoad (lines 620-796)
 */
function setBeamLoad(
  tBeamLoad: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  nType: number,
  context: ConversionContext
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');

  let i: number;
  let j: number;
  if (tBeamLoad.dicName.has(loadCase)) {
    i = tBeamLoad.dicName.get(loadCase)!;
    j = tBeamLoad.strDat[i].length;
  } else {
    i = tBeamLoad.dicName.size;
    tBeamLoad.dicName.set(loadCase, i);
    tBeamLoad.strDat[i] = [];
    j = 0;
  }

  // Command and projection type (VBA lines 639-668)
  let strCMD = ',BEAM,';
  let strPROJ = ',NO,';
  if (nType > 4) strCMD = ',LINE,';
  if (nType === 6) strPROJ = ',YES,';

  // Action and type (VBA lines 648-674)
  const actionType = normalizeJapaneseText(String(row[COL.ACTION_TYPE] || ''));
  const dicAction: Record<string, number> = { '並進荷重': 0, 'モーメント': 1 };
  const vType = ['UNILOAD,', 'UNIMOMENT,'];
  const nAction = dicAction[actionType] || 0;

  const strType = vType[nAction];

  // Get elements and values (VBA lines 683-739)
  const targetStr = String(row[COL.TARGET] || '');
  const vElem = targetStr.split(',').map(s => s.trim()).filter(s => s);

  console.log(`  setBeamLoad: loadCase="${loadCase}", target="${targetStr}"`);

  const dP1: number[] = [];
  const dP2: number[] = [];
  for (let k = 0; k < vElem.length; k++) {
    dP1[k] = 0;
    dP2[k] = 0;
  }

  // Sort elements and get total length
  const { vElemNode, dAll } = sortElem(vElem, context);

  const p1Str = String(row[COL.VALUE1] || '');
  const p2Str = String(row[COL.VALUE2] || '');
  const p1Num = safeParseNumber(row[COL.VALUE1]);
  const p2Num = safeParseNumber(row[COL.VALUE2]);

  // Handle triangular load (P1=0, P2≠0) - VBA lines 700-739
  const direction = normalizeJapaneseText(String(row[COL.DIRECTION] || ''));
  console.log(`  direction="${direction}", DIR_MAP[direction]="${DIR_MAP[direction]}"`);
  let useVectorLoad = false;
  const dBaseLoads: number[] = [0, 0, 0, 0, 0, 0];
  const dLoads: number[] = [0, 0, 0, 0, 0, 0];
  let strFlag = '';

  if (!isNaN(p1Num) && !isNaN(p2Num)) {
    if (p1Num === 0 && p2Num !== 0) {
      // Triangular load
      if (DIR_MAP[direction]) {
        // Coordinate direction
        const dBaseLoad = p2Num / dAll;
        let dLoad = 0;
        for (let k = 0; k < vElemNode.length; k++) {
          dP1[k] = dLoad * dBaseLoad;
          dLoad += vElemNode[k].dLength;
          dP2[k] = dLoad * dBaseLoad;
        }
      } else {
        // Vector direction
        useVectorLoad = true;
        const result = calcVecter(row, COL.VALUE2);
        strFlag = result.strFlag;
        const vCoordLoad = result.strLoad.split(',').map(s => parseFloat(s) || 0);
        for (let k = 0; k < 6; k++) {
          dLoads[k] = 0;
          dBaseLoads[k] = vCoordLoad[k] / dAll;
        }
      }
    } else {
      // Uniform or trapezoidal load
      for (let k = 0; k < vElemNode.length; k++) {
        dP1[k] = p1Num;
        dP2[k] = p2Num;
      }
    }
  } else {
    if (!isNaN(p1Num)) {
      for (let k = 0; k < vElem.length; k++) dP1[k] = p1Num;
    }
    if (!isNaN(p2Num)) {
      for (let k = 0; k < vElem.length; k++) dP2[k] = p2Num;
    }
  }

  const strAdd = ', 0, 0, 0, 0,, NO, 0, 0, NO,';
  const eccentricity = safeParseNumber(row[COL.ECCENTRICITY]);

  // Direction items for vector load
  const vLoadDir = ['GX', 'GZ', 'GY', 'LX', 'LZ', 'LY']; // With Y-Z swap

  // Generate output for each element (VBA lines 747-794)
  console.log(`  vElemNode.length=${vElemNode.length}`);
  for (let k = 0; k < vElemNode.length; k++) {
    const elemNo = context.elementMapping.get(vElemNode[k].vElem);
    if (!elemNo) {
      console.log(`  -> Element "${vElemNode[k].vElem}" not found in elementMapping`);
      continue;
    }

    if (DIR_MAP[direction]) {
      // Coordinate direction (VBA lines 749-766)
      const strDir = DIR_MAP[direction];
      const strECCEN = getECCEN(strDir, vElemNode[k].vElem, eccentricity, context);

      // Sign change for GY/LY (VBA lines 756-759)
      let p1Val = dP1[k];
      let p2Val = dP2[k];
      if (strDir === 'GY' || strDir === 'LY') {
        p1Val = p1Val * -1;
        p2Val = p2Val * -1;
      }

      const strValue = `,0,${p1Val},1,${p2Val}`;
      tBeamLoad.strDat[i][j] = `${elemNo}${strCMD}${strType}${strDir}${strPROJ}${strECCEN}${strValue}${strAdd}`;
      j++;
    } else if (useVectorLoad) {
      // Vector load (VBA lines 768-793)
      const dLen = vElemNode[k].dLength;

      for (let n = 0; n < strFlag.length; n++) {
        if (strFlag[n] === '1') {
          const dVect1 = dLoads[n] * dBaseLoads[n];
          dLoads[n] += dLen;
          const dVect2 = dLoads[n] * dBaseLoads[n];

          const strValue = `,0,${dVect1},1,${dVect2}`;
          const strDir = vLoadDir[n];
          const strECCEN = getECCEN(strDir, vElemNode[k].vElem, eccentricity, context);

          tBeamLoad.strDat[i][j] = `${elemNo}${strCMD}${strType}${strDir}${strPROJ}${strECCEN}${strValue}${strAdd}`;
          j++;
        }
      }
    }
  }
}

/**
 * Set element temperature data
 * Based on VBA SetElTemper (lines 798-822)
 */
function setElTemper(
  tElTemper: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  strElem: string
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');

  let i: number;
  let j: number;
  if (tElTemper.dicName.has(loadCase)) {
    i = tElTemper.dicName.get(loadCase)!;
    j = tElTemper.strDat[i].length;
  } else {
    i = tElTemper.dicName.size;
    tElTemper.dicName.set(loadCase, i);
    tElTemper.strDat[i] = [];
    j = 0;
  }

  const elemStr = getStringGen(strElem);
  const temp = safeParseNumber(row[COL.VALUE1]);

  tElTemper.strDat[i][j] = `${elemStr},${temp},`;
}
