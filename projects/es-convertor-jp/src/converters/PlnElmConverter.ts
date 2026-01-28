// Plane Element Converter - Class030_PlnElm equivalent
// Converts ES plane element data to MCT *ELEMENT (PLATE) format
//
// VBA Reference: Class030_PlnElm.cls
// - nReadSTRow = 3, nReadSTCol = 2, nReadEDCol = 9 (B~I, 8 cols)
// - strData(0) = Element ID (B)
// - strData(1) = Type (C)
// - strData(2) = Node list comma-separated (D) e.g. "N1,N15,N8,N16,N9,N17,N2,N18"
// - strData(3) = ov. (E)
// - strData(4) = Section name (F)
// - strData(5) = Rebar section (G)
// - strData(6) = Cx (H)
// - strData(7) = Cy (I)

import { PlaneElementData } from '../types/excel.types';
import { MCTElement } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { isNumeric } from '../utils/unitConversion';

export interface PlnElmConversionResult {
  elements: MCTElement[];
  mctLines: string[];
}

/**
 * Parse plane element data from Excel sheet
 * VBA: strData(2, i) contains comma-separated node list
 */
export function parsePlaneElementData(rawData: (string | number)[][]): PlaneElementData[] {
  const elements: PlaneElementData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    // row[0] = Element ID (B)
    // row[1] = Type (C)
    // row[2] = Node list comma-separated (D)
    // row[3] = ov. (E)
    // row[4] = Section name (F)
    // row[5] = Rebar section (G)

    const nodeListStr = String(row[2] || '');
    const nodes = nodeListStr.split(',').map(n => n.trim()).filter(n => n.length > 0);

    const element: PlaneElementData = {
      id: String(row[0]),
      nodes,
      materialName: '', // Will be retrieved from section
      sectionName: String(row[4] || ''),
      type: 'PLATE',
    };

    elements.push(element);
  }

  return elements;
}

/**
 * Convert ES plane elements to MCT format
 * Based on VBA Class030_PlnElm.ChangePlnElm
 *
 * @param rawData - Raw Excel data
 * @param context - Conversion context
 * @param plnSectData - Map of section name to [sectNo, ..., materialName]
 */
export function convertPlaneElements(
  rawData: (string | number)[][],
  context: ConversionContext,
  plnSectData: Map<string, { sectNo: number; materialName: string }>
): PlnElmConversionResult {
  const mctElements: MCTElement[] = [];
  const mctLines: string[] = [];

  // Comments - VBA line 50-51
  mctLines.push('*ELEMENT    ; Elements');
  mctLines.push('; iEL, TYPE, iMAT, iPRO, iN1, iN2, iN3, iN4, iSUB, iWID , LCAXIS    ; Planar Element');

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);

    // VBA line 57: If IsNumeric(strData(0, i)) Then
    if (!isNumeric(elemId)) {
      continue;
    }

    // VBA line 58: nElemMax = nElemMax + 1
    context.maxElementNo++;
    const elemNo = context.maxElementNo;

    // VBA line 59: vBuf = dicPlnSect(strData(4, i))
    const sectName = String(row[4] || '');
    const sectInfo = plnSectData.get(sectName);

    if (!sectInfo) {
      continue; // Skip if section not found
    }

    // VBA line 61: vBuf(5) = ChangeMatlName(CStr(vBuf(5)))
    // VBA line 67: strBuf(j) = m_MaterialData(vBuf(5))
    const matNo = context.materialMapping.get(sectInfo.materialName) || 1;

    // VBA line 68: strBuf(j) = vBuf(0) - section number
    const sectNo = sectInfo.sectNo;

    // VBA line 70-77: Parse node list from comma-separated string
    const nodeListStr = String(row[2] || '');
    const allNodes = nodeListStr.split(',').map(n => n.trim()).filter(n => n.length > 0);

    // VBA line 71-73: n = 1, If UBound(vBuf) > 4 Then n = n + 1
    // If more than 5 nodes (0-indexed > 4), step by 2 (use corner nodes only)
    let step = 1;
    if (allNodes.length > 5) {
      step = 2;
    }

    // VBA line 75-77: Extract nodes with step
    const nodeIds: string[] = [];
    for (let k = 0; k < allNodes.length; k += step) {
      nodeIds.push(allNodes[k]);
    }

    // Convert node IDs to numbers
    const nodeNos = nodeIds.map(id => context.nodeMapping.get(id) || 0);

    // Build MCT line
    // VBA line 64-68: elemNo, "PLATE", matNo, sectNo
    const parts: (string | number)[] = [elemNo, 'PLATE', matNo, sectNo];

    // VBA line 75-77: Add node numbers
    for (const nodeNo of nodeNos) {
      parts.push(nodeNo);
    }

    // VBA line 79: If j < 8 Then j = j + 1 (pad for triangle)
    // j starts at 4 (after sectNo), adds up to 4 nodes = 8
    // If less than 4 nodes, need padding
    while (parts.length < 8) {
      parts.push(0);
    }

    // VBA line 81: strBuf(j) = "1, 0" (iSUB, iWID/LCAXIS)
    parts.push('1, 0');

    // VBA line 83-86: Join with commas
    const mctLine = parts.join(',');
    mctLines.push(mctLine);

    mctElements.push({
      no: elemNo,
      type: 'PLATE',
      materialNo: matNo,
      sectionNo: sectNo,
      nodes: nodeNos,
    });
  }

  return { elements: mctElements, mctLines };
}
