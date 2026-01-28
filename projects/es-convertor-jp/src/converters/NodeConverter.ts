// Node Converter - Class010_Node equivalent
// Converts ES node data to MCT *NODE format

import { NodeData } from '../types/excel.types';
import { MCTNode } from '../types/mct.types';
import { ConversionContext, Point3D } from '../types/converter.types';
import { transformCoordinate } from '../utils/coordinateSystem';
import { isNumeric, safeParseNumber } from '../utils/unitConversion';

export interface NodeConversionResult {
  nodes: MCTNode[];
  mctLines: string[];
}

/**
 * Parse node data from Excel sheet
 * Based on Class010_Node.GetNode and ChangeNode
 */
export function parseNodeData(
  rawData: (string | number)[][],
  context: ConversionContext
): NodeData[] {
  const nodes: NodeData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const node: NodeData = {
      id: String(row[0]),
      x: safeParseNumber(row[1]),
      y: safeParseNumber(row[2]),
      z: safeParseNumber(row[3]),
    };

    nodes.push(node);

    // Store original coordinates for reference
    context.originalNodeCoords.set(node.id, {
      x: node.x,
      y: node.y,
      z: node.z,
    });
  }

  return nodes;
}

/**
 * Convert ES nodes to MCT format
 * Handles coordinate transformation and node number assignment
 */
export function convertNodes(
  nodes: NodeData[],
  context: ConversionContext,
  doublePointNodes?: Set<string>
): NodeConversionResult {
  const mctNodes: MCTNode[] = [];
  const mctLines: string[] = [];

  // Find maximum numeric node number
  let maxNo = 0;
  for (const node of nodes) {
    if (isNumeric(node.id)) {
      const no = parseInt(node.id, 10);
      if (no > maxNo) maxNo = no;
      context.nodeMapping.set(node.id, no);
    }
  }

  // Assign numbers to non-numeric node IDs
  let nextNo = maxNo + 1;
  for (const node of nodes) {
    if (!isNumeric(node.id)) {
      context.nodeMapping.set(node.id, nextNo);
      nextNo++;
    }
  }

  context.maxNodeNo = nextNo - 1;

  // Track used coordinates to handle duplicates
  const usedCoords = new Set<string>();

  // Generate MCT node data with coordinate transformation
  for (const node of nodes) {
    const nodeNo = context.nodeMapping.get(node.id)!;

    // Transform coordinates: ES (X, Y, Z) → MIDAS (X, -Z, Y)
    let transformed = transformCoordinate({
      x: node.x,
      y: node.y,
      z: node.z,
    });

    // Handle double point nodes (spring elements)
    const coordKey = `${node.x}-${node.y}-${node.z}`;

    if (doublePointNodes?.has(node.id)) {
      // Slightly adjust Y coordinate for double point nodes
      let adjustedY = node.y;
      let coordKeyAdjusted = `${node.x}-${adjustedY}-${node.z}`;

      while (usedCoords.has(coordKeyAdjusted)) {
        adjustedY -= 0.001;
        coordKeyAdjusted = `${node.x}-${adjustedY}-${node.z}`;
      }

      transformed = transformCoordinate({
        x: node.x,
        y: adjustedY,
        z: node.z,
      });

      usedCoords.add(coordKeyAdjusted);
    } else {
      usedCoords.add(coordKey);
    }

    // Store transformed coordinates
    context.esNodeCoords.set(nodeNo, transformed);

    const mctNode: MCTNode = {
      no: nodeNo,
      x: transformed.x,
      y: transformed.y,
      z: transformed.z,
    };

    mctNodes.push(mctNode);
  }

  // Sort by node number
  mctNodes.sort((a, b) => a.no - b.no);

  // Generate MCT output lines
  mctLines.push('*NODE    ; Nodes');
  mctLines.push('; iNO, X, Y, Z');

  for (const node of mctNodes) {
    mctLines.push(`${node.no},${node.x},${node.y},${node.z}`);
  }

  return { nodes: mctNodes, mctLines };
}

/**
 * Get node number from context by node ID
 */
export function getNodeNumber(nodeId: string, context: ConversionContext): number {
  const no = context.nodeMapping.get(nodeId);
  if (no === undefined) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  return no;
}

/**
 * Get node coordinates from context by node number
 */
export function getNodeCoordinates(nodeNo: number, context: ConversionContext): Point3D | undefined {
  return context.esNodeCoords.get(nodeNo);
}
