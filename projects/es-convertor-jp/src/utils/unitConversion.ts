// Unit conversion utilities
// Based on UNIT.bas

/**
 * Convert N to kN
 */
export const changeN_kN = (value: number): number => {
  return value * 0.001;
};

/**
 * Convert kN to N
 */
export const changeKN_N = (value: number): number => {
  return value * 1000;
};

/**
 * Convert mm to m
 */
export const changeMM_M = (value: number): number => {
  return value * 0.001;
};

/**
 * Convert m to mm
 */
export const changeM_MM = (value: number): number => {
  return value * 1000;
};

/**
 * Convert mm² to m²
 */
export const changeMM2_M2 = (value: number): number => {
  return value * 0.001 * 0.001;
};

/**
 * Convert m² to mm²
 */
export const changeM2_MM2 = (value: number): number => {
  return value / 0.001 / 0.001;
};

/**
 * Convert mm³ to m³
 */
export const changeMM3_M3 = (value: number): number => {
  return value * 0.001 * 0.001 * 0.001;
};

/**
 * Convert m³ to mm³
 */
export const changeM3_MM3 = (value: number): number => {
  return value / 0.001 / 0.001 / 0.001;
};

/**
 * Convert mm⁴ to m⁴
 */
export const changeMM4_M4 = (value: number): number => {
  return value * Math.pow(0.001, 4);
};

/**
 * Convert m⁴ to mm⁴
 */
export const changeM4_MM4 = (value: number): number => {
  return value / Math.pow(0.001, 4);
};

/**
 * Convert N/mm² to kN/m² (stress)
 */
export const changeNMM2_KNM2 = (value: number): number => {
  return changeN_kN(value) / changeMM2_M2(1);
};

/**
 * Convert kN/m² to N/mm² (stress)
 */
export const changeKNM2_NMM2 = (value: number): number => {
  return changeKN_N(value) * changeMM2_M2(1);
};

/**
 * Convert N/mm to kN/m (line load)
 */
export const changeNMM_KNM = (value: number): number => {
  return changeN_kN(value) / changeMM_M(1);
};

/**
 * Convert kN/m to N/mm (line load)
 */
export const changeKNM_NMM = (value: number): number => {
  return changeKN_N(value) * changeMM_M(1);
};

/**
 * Convert N·mm to kN·m (moment)
 */
export const changeNMM_KNM_Moment = (value: number): number => {
  return changeN_kN(value) * changeMM_M(1);
};

/**
 * Convert kN·m to N·mm (moment)
 */
export const changeKNM_NMM_Moment = (value: number): number => {
  return changeKN_N(value) * changeM_MM(1);
};

/**
 * Safe number parsing with default value
 */
export const safeParseNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

/**
 * Format number to fixed decimal places, removing trailing zeros
 */
export const formatNumber = (value: number, decimals: number = 6): string => {
  const fixed = value.toFixed(decimals);
  // Remove trailing zeros after decimal point
  return fixed.replace(/\.?0+$/, '') || '0';
};

/**
 * Check if value is numeric
 */
export const isNumeric = (value: unknown): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  return false;
};

/**
 * Format a number like VBA's implicit CStr(Double) conversion.
 * VBA uses E-notation for small numbers (abs < 0.1) when the decimal string
 * would be too long (> 17 characters). Uses the shortest unique representation
 * (no trailing zero padding). Format: X.XXXXXXXXXXXXXXE±DD
 * For larger numbers or short decimals, uses JavaScript's default String() format.
 */
export const vbaFormatNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num) || num === 0) return String(value);

  const abs = Math.abs(num);
  const defaultStr = String(num);

  // For numbers >= 0.1, use default JS formatting (matches VBA behavior)
  if (abs >= 0.1) return defaultStr;

  // For small numbers (abs < 0.1), check if the decimal representation is short enough.
  // VBA keeps decimal notation when the absolute value string is ≤ 17 characters.
  // e.g. "0.01902733188529" (16 chars) → decimal, "0.0191004727476889" (18 chars) → E-notation
  const absStr = String(abs);
  if (absStr.length <= 17 && !absStr.includes('e')) return defaultStr;

  // Use VBA-style E-notation with shortest unique representation (no trailing zeros).
  // toExponential() without argument gives minimum digits needed to uniquely identify the float64.
  const expStr = num.toExponential();
  // Convert lowercase 'e' to uppercase 'E' and pad exponent to 2 digits
  return expStr.replace(/e([+-])(\d+)$/, (_, sign, digits) => {
    return 'E' + sign + digits.padStart(2, '0');
  });
};
