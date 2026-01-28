// Coordinate system transformation utilities
// ES (Engineer Studio) to MIDAS Civil NX coordinate conversion
// Based on main.bas:693-836

import { Point3D } from '../types/converter.types';

/**
 * Transform ES coordinate to MIDAS Civil NX coordinate
 * ES: (X, Y, Z) → MIDAS: (X, -Z, Y)
 * VBA: vect.y = -1# * vectES.z, vect.z = vectES.y
 */
export function transformCoordinate(es: Point3D): Point3D {
  return {
    x: es.x,
    y: -es.z,
    z: es.y,
  };
}

/**
 * Transform MIDAS coordinate back to ES coordinate
 * MIDAS: (X, Y, Z) → ES: (X, Z, -Y)
 */
export function transformToES(midas: Point3D): Point3D {
  return {
    x: midas.x,
    y: midas.z,
    z: -midas.y,
  };
}

/**
 * Calculate vector magnitude
 */
export function vectorMagnitude(v: Point3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize vector to unit vector
 */
export function normalizeVector(v: Point3D): Point3D {
  const mag = vectorMagnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  };
}

/**
 * Calculate cross product of two vectors
 */
export function crossProduct(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Subtract two vectors (a - b)
 */
export function subtractVectors(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/**
 * Check if two points have the same horizontal position (X and Y in MIDAS system)
 * Returns 0 if horizontal (vertical element), 1 otherwise
 */
export function checkHorizontalPoints(
  node1Coords: Point3D,
  node2Coords: Point3D
): number {
  if (node1Coords.x === node2Coords.x && node1Coords.y === node2Coords.y) {
    return 0; // Vertical element
  }
  return 1; // Not vertical
}

/**
 * Calculate element angle based on reference vector
 * Based on main.bas GetAngle function (lines 693-836)
 * @param node1 - Start node coordinates (in MIDAS coordinate system)
 * @param node2 - End node coordinates (in MIDAS coordinate system)
 * @param refVectorES - Reference vector in ES coordinate system
 * @returns Angle in degrees
 */
export function calculateElementAngle(
  node1: Point3D,
  node2: Point3D,
  refVectorES: Point3D
): number {
  // Transform reference vector from ES to MIDAS coordinate system
  const refVector: Point3D = {
    x: refVectorES.x,
    y: -refVectorES.z,
    z: refVectorES.y,
  };

  // Calculate element direction (unit vector along x-axis of element)
  const dist: Point3D = {
    x: node2.x - node1.x,
    y: node2.y - node1.y,
    z: node2.z - node1.z,
  };

  const elementLength = vectorMagnitude(dist);
  if (elementLength === 0) {
    return 0;
  }

  const baseX = normalizeVector(dist);

  // Calculate reference vector unit vector
  const refMag = vectorMagnitude(refVector);
  if (refMag === 0) {
    return 0;
  }
  const refBase = normalizeVector(refVector);

  // Calculate transformed element coordinate system Y-axis
  // Cross product of element X-axis and reference vector
  const crsProd = crossProduct(baseX, refBase);

  // Get unit vector of cross product result to calculate Y-axis unit vector
  const basYMag = vectorMagnitude(crsProd);
  if (basYMag === 0) {
    return 0;
  }
  const baseY = normalizeVector(crsProd);

  // Calculate transformed Z-axis (cross product of Y and X)
  const baseZ: Point3D = {
    x: baseY.y * baseX.z - baseY.z * baseX.y,
    y: baseY.z * baseX.x - baseY.x * baseX.z,
    z: baseY.x * baseX.y - baseY.y * baseX.x,
  };

  // Default reference vectors
  const beforeRefVect: Point3D[] = [
    { x: 1, y: 0, z: 0 }, // Vertical element
    { x: 0, y: 0, z: 1 }, // Non-vertical element
  ];

  // Determine which reference vector to use based on element orientation
  const n = (dist.x === 0 && dist.y === 0) ? 0 : 1;

  // Calculate before Y-axis (cross product of element X-axis and default reference vector)
  const beforeY: Point3D = {
    x: baseX.y * beforeRefVect[n].z - baseX.z * beforeRefVect[n].y,
    y: baseX.z * beforeRefVect[n].x - baseX.x * beforeRefVect[n].z,
    z: baseX.x * beforeRefVect[n].y - baseX.y * beforeRefVect[n].x,
  };

  // Unit vector calculation
  const befBaseYMag = vectorMagnitude(beforeY);
  if (befBaseYMag === 0) {
    return 0;
  }
  const befBaseY = normalizeVector(beforeY);

  // Calculate default Z-axis (cross product of before Y and X)
  const defBaseZ: Point3D = {
    x: befBaseY.y * baseX.z - befBaseY.z * baseX.y,
    y: befBaseY.z * baseX.x - befBaseY.x * baseX.z,
    z: befBaseY.x * baseX.y - befBaseY.y * baseX.x,
  };

  // Determine cross product reference based on element orientation
  let crossProductRef: Point3D;
  if (baseX.x === 0 && baseX.y === 0) {
    crossProductRef = beforeRefVect[0];
  } else {
    crossProductRef = defBaseZ;
  }

  // Calculate cosine of angle using dot product
  const baseZMag = vectorMagnitude(baseZ);
  const crossProdMag = vectorMagnitude(crossProductRef);

  if (baseZMag === 0 || crossProdMag === 0) {
    return 0;
  }

  const dCos = dotProduct(baseZ, crossProductRef) / (baseZMag * crossProdMag);

  // Clamp cosine value to [-1, 1] to handle floating point errors
  const clampedCos = Math.max(-1, Math.min(1, dCos));

  // Calculate angle
  let angle = 0;
  if (crsProd.z >= 0) {
    angle = Math.acos(clampedCos);
  } else {
    angle = -Math.acos(clampedCos);
  }

  // Convert from radians to degrees
  return (angle * 180) / Math.PI;
}

/**
 * Calculate angle using three node positions
 * @param node1No - First node number
 * @param node2No - Second node number
 * @param refNodeNo - Reference node number
 * @param nodeCoords - Map of node coordinates
 */
export function getNodeNo2Angle(
  node1No: number,
  node2No: number,
  refNodeNo: number,
  nodeCoords: Map<number, Point3D>
): number {
  const node1 = nodeCoords.get(node1No);
  const node2 = nodeCoords.get(node2No);
  const refNode = nodeCoords.get(refNodeNo);

  if (!node1 || !node2 || !refNode) {
    return 0;
  }

  return calculateElementAngle(node1, node2, refNode);
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point3D, p2: Point3D): number {
  return vectorMagnitude(subtractVectors(p2, p1));
}

/**
 * Check if a point is at origin (0, 0, 0)
 */
export function isOrigin(p: Point3D, tolerance: number = 1e-10): boolean {
  return Math.abs(p.x) < tolerance && Math.abs(p.y) < tolerance && Math.abs(p.z) < tolerance;
}
