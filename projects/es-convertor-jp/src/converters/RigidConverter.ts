// Rigid Converter - Class040_Rigid equivalent
// Converts ES rigid element data to MCT *RIGIDLINK format
//
// VBA Reference: Class040_Rigid.cls
// - nReadSTRow = 3, nReadSTCol = 2, nReadEDCol = 4 (B~D, 3 cols)
// - strData(0) = Element ID (B)
// - strData(1) = Master node (C)
// - strData(2) = Slave nodes comma-separated (D)

import { RigidData } from '../types/excel.types';
import { MCTRigidLink, MCTConstraint } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';

export interface RigidConversionResult {
  rigidLinks: MCTRigidLink[];
  constraints: MCTConstraint[];
  mctLinesRigid: string[];
  mctLinesConstraint: string[];
}

/**
 * Parse rigid element data from Excel sheet
 * VBA: strData(2, j) contains comma-separated slave node list
 */
export function parseRigidData(rawData: (string | number)[][]): RigidData[] {
  const rigidElements: RigidData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    // VBA line 100: vBuf = Split(strData(2, j), ",")
    const slaveNodesStr = String(row[2] || '');
    const slaveNodes = slaveNodesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);

    const rigid: RigidData = {
      id: String(row[0]),
      masterNode: String(row[1] || ''),
      slaveNodes,
      type: '全自由度', // VBA: Always 111111
      dof: ['111111'],
    };

    rigidElements.push(rigid);
  }

  return rigidElements;
}

/**
 * Read rigid data for element numbering
 */
export function readRigidData(rawData: (string | number)[][]): (string | number)[][] {
  const result: (string | number)[][] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;
    result.push(row);
  }

  return result;
}

/**
 * Convert ES rigid elements to MCT format
 * Based on VBA Class040_Rigid.ChangeRigid
 *
 * Output format: masterNo,111111,slave1 slave2 slave3,
 */
export function convertRigid(
  rawData: (string | number)[][],
  context: ConversionContext
): RigidConversionResult {
  const rigidLinks: MCTRigidLink[] = [];
  const constraints: MCTConstraint[] = [];
  const mctLinesRigid: string[] = [];
  const mctLinesConstraint: string[] = [];

  // VBA line 77-78: Comments
  mctLinesRigid.push('*RIGIDLINK    ; Rigid Link');
  mctLinesRigid.push('; M-NODE, DOF, S-NODE LIST, GROUP');

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const elemId = String(row[0]);
    const masterNodeId = String(row[1] || '');
    const slaveNodesStr = String(row[2] || '');

    // VBA line 92: m_dicRigidElem.Add strData(0, j), strData(1, j)
    // Store element-master mapping

    // VBA line 93: If Len(strData(2, j)) > 0 Then
    if (slaveNodesStr.length === 0) continue;

    // VBA line 97: strBuf(i) = m_NodeData(strData(1, j))
    const masterNodeNo = context.nodeMapping.get(masterNodeId) || 0;
    if (masterNodeNo === 0) continue;

    // VBA line 98: strBuf(i) = "111111"
    const dofString = '111111';

    // VBA line 100-104: Parse and join slave nodes
    const slaveNodeIds = slaveNodesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
    const slaveNodeNos: number[] = [];

    for (const slaveId of slaveNodeIds) {
      const slaveNo = context.nodeMapping.get(slaveId) || 0;
      if (slaveNo > 0) {
        slaveNodeNos.push(slaveNo);
      }
    }

    if (slaveNodeNos.length === 0) continue;

    // VBA line 101-104: Join slaves with space
    const slaveListStr = slaveNodeNos.join(' ');

    // VBA line 107: strBuf(i) = "" (GROUP - empty)
    // VBA line 109-112: Join with commas
    // Format: masterNo,111111,slave1 slave2 slave3,
    const mctLine = `${masterNodeNo},${dofString},${slaveListStr},`;
    mctLinesRigid.push(mctLine);

    // Store rigid element data in context
    const elemNo = parseInt(elemId, 10) || i + 1;
    context.rigidElements.set(elemNo, {
      masterNode: masterNodeNo,
      slaveNodes: slaveNodeNos,
    });

    rigidLinks.push({
      no: rigidLinks.length + 1,
      masterNode: masterNodeNo,
      slaveNodes: slaveNodeNos,
      dof: dofString,
    });
  }

  return { rigidLinks, constraints, mctLinesRigid, mctLinesConstraint };
}

/**
 * Get DOF string - always 111111 for rigid elements per VBA
 */
export function getDofString(_dofType: string): string {
  return '111111';
}

/**
 * Check if a rigid element has translational DOF constraints
 */
export function hasTranslationalDof(dofString: string): boolean {
  return dofString[0] === '1' || dofString[1] === '1' || dofString[2] === '1';
}

/**
 * Check if a rigid element has rotational DOF constraints
 */
export function hasRotationalDof(dofString: string): boolean {
  return dofString[3] === '1' || dofString[4] === '1' || dofString[5] === '1';
}

/**
 * Get rigid element by ID
 */
export function getRigidElement(
  elemId: number,
  context: ConversionContext
): { masterNode: number; slaveNodes: number[] } | undefined {
  return context.rigidElements.get(elemId);
}

/**
 * Check if a node is a slave in any rigid element
 */
export function isSlaveNode(
  nodeNo: number,
  context: ConversionContext
): { isSlave: boolean; masterNode?: number } {
  for (const [, elem] of context.rigidElements) {
    if (elem.slaveNodes.includes(nodeNo)) {
      return { isSlave: true, masterNode: elem.masterNode };
    }
  }
  return { isSlave: false };
}

/**
 * Check if a node is a master in any rigid element
 */
export function isMasterNode(nodeNo: number, context: ConversionContext): boolean {
  for (const [, elem] of context.rigidElements) {
    if (elem.masterNode === nodeNo) {
      return true;
    }
  }
  return false;
}
