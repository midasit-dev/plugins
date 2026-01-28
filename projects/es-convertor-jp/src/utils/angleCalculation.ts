// Angle calculation utilities for frame elements

import { Point3D } from '../types/converter.types';
import {
  vectorMagnitude,
  normalizeVector,
  crossProduct,
  dotProduct,
  subtractVectors,
} from './coordinateSystem';

/**
 * Calculate beta angle for frame element
 * Beta angle defines the rotation of the element's local coordinate system
 * around the element's longitudinal axis
 */
export function calculateBetaAngle(
  node1: Point3D,
  node2: Point3D,
  refVector?: Point3D
): number {
  // Default reference vector (global Z-axis for horizontal elements)
  const defaultRef: Point3D = { x: 0, y: 0, z: 1 };
  const ref = refVector || defaultRef;

  // Element direction vector
  const elemDir = subtractVectors(node2, node1);
  const elemLength = vectorMagnitude(elemDir);

  if (elemLength < 1e-10) {
    return 0;
  }

  // Unit vector along element
  const xLocal = normalizeVector(elemDir);

  // Check if element is vertical (parallel to global Z)
  const isVertical = Math.abs(xLocal.z) > 0.9999;

  if (isVertical) {
    // For vertical elements, use X-axis as reference
    const xAxis: Point3D = { x: 1, y: 0, z: 0 };
    const yLocal = normalizeVector(crossProduct(xAxis, xLocal));
    const zLocal = crossProduct(xLocal, yLocal);

    // Calculate angle from reference vector
    const cos = dotProduct(ref, zLocal);
    const sin = dotProduct(ref, yLocal);

    return Math.atan2(sin, cos) * (180 / Math.PI);
  } else {
    // For non-vertical elements, use global Z as reference
    const zAxis: Point3D = { x: 0, y: 0, z: 1 };
    const yLocalRaw = crossProduct(zAxis, xLocal);
    const yLocal = normalizeVector(yLocalRaw);
    const zLocal = crossProduct(xLocal, yLocal);

    // Calculate angle from reference vector
    const cos = dotProduct(ref, zLocal);
    const sin = dotProduct(ref, yLocal);

    return Math.atan2(sin, cos) * (180 / Math.PI);
  }
}

/**
 * Calculate rotation matrix for local coordinate system
 */
export function calculateRotationMatrix(
  node1: Point3D,
  node2: Point3D,
  betaAngle: number = 0
): number[][] {
  // Element direction vector
  const elemDir = subtractVectors(node2, node1);
  const elemLength = vectorMagnitude(elemDir);

  if (elemLength < 1e-10) {
    // Return identity matrix if element has zero length
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  // Unit vector along element (local x-axis)
  const xLocal = normalizeVector(elemDir);

  // Check if element is vertical
  const isVertical = Math.abs(xLocal.z) > 0.9999;

  let yLocal: Point3D;
  let zLocal: Point3D;

  if (isVertical) {
    // For vertical elements, use global X-axis
    const xAxis: Point3D = { x: 1, y: 0, z: 0 };
    yLocal = normalizeVector(crossProduct(xAxis, xLocal));
    zLocal = crossProduct(xLocal, yLocal);
  } else {
    // For non-vertical elements, use global Z-axis
    const zAxis: Point3D = { x: 0, y: 0, z: 1 };
    yLocal = normalizeVector(crossProduct(zAxis, xLocal));
    zLocal = crossProduct(xLocal, yLocal);
  }

  // Apply beta rotation if needed
  if (Math.abs(betaAngle) > 1e-10) {
    const rad = (betaAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const yNew: Point3D = {
      x: cos * yLocal.x + sin * zLocal.x,
      y: cos * yLocal.y + sin * zLocal.y,
      z: cos * yLocal.z + sin * zLocal.z,
    };

    const zNew: Point3D = {
      x: -sin * yLocal.x + cos * zLocal.x,
      y: -sin * yLocal.y + cos * zLocal.y,
      z: -sin * yLocal.z + cos * zLocal.z,
    };

    yLocal = yNew;
    zLocal = zNew;
  }

  return [
    [xLocal.x, xLocal.y, xLocal.z],
    [yLocal.x, yLocal.y, yLocal.z],
    [zLocal.x, zLocal.y, zLocal.z],
  ];
}

/**
 * Transform a vector from global to local coordinate system
 */
export function globalToLocal(
  globalVector: Point3D,
  rotationMatrix: number[][]
): Point3D {
  return {
    x:
      rotationMatrix[0][0] * globalVector.x +
      rotationMatrix[0][1] * globalVector.y +
      rotationMatrix[0][2] * globalVector.z,
    y:
      rotationMatrix[1][0] * globalVector.x +
      rotationMatrix[1][1] * globalVector.y +
      rotationMatrix[1][2] * globalVector.z,
    z:
      rotationMatrix[2][0] * globalVector.x +
      rotationMatrix[2][1] * globalVector.y +
      rotationMatrix[2][2] * globalVector.z,
  };
}

/**
 * Transform a vector from local to global coordinate system
 */
export function localToGlobal(
  localVector: Point3D,
  rotationMatrix: number[][]
): Point3D {
  // Transpose of rotation matrix (for orthogonal matrices, transpose = inverse)
  return {
    x:
      rotationMatrix[0][0] * localVector.x +
      rotationMatrix[1][0] * localVector.y +
      rotationMatrix[2][0] * localVector.z,
    y:
      rotationMatrix[0][1] * localVector.x +
      rotationMatrix[1][1] * localVector.y +
      rotationMatrix[2][1] * localVector.z,
    z:
      rotationMatrix[0][2] * localVector.x +
      rotationMatrix[1][2] * localVector.y +
      rotationMatrix[2][2] * localVector.z,
  };
}

/**
 * Normalize angle to range [-180, 180]
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized > 180) {
    normalized -= 360;
  } else if (normalized < -180) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
