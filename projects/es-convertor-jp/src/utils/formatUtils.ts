// Format utilities for MCT output
// Handles special cases like negative zero that JavaScript's template literals don't preserve

/**
 * Format number preserving negative zero
 * JavaScript's template literal converts -0 to "0", but VBA preserves "-0"
 */
export function formatNumber(value: number): string {
  if (Object.is(value, -0)) {
    return '-0';
  }
  return String(value);
}
