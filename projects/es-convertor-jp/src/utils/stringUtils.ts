// String utilities for name handling
// Based on main.bas functions for material and hinge name truncation

import { MAX_LENGTHS } from '../constants/mctKeywords';

/**
 * Replace commas with hyphens (MCT format requirement)
 * Based on main.bas ChgCamma function
 */
export function replaceComma(str: string): string {
  return str.replace(/,/g, '-');
}

/**
 * Truncate material name to maximum length
 * If name exceeds max length, append ~1, ~2, etc.
 * Based on main.bas ChangeMatlName function (lines 844-878)
 */
export function truncateMaterialName(
  name: string,
  usedNames: Set<string>,
  nameMapping: Map<string, string>,
  maxLength: number = MAX_LENGTHS.MATERIAL_NAME
): string {
  const cleanName = replaceComma(name);

  // If within limit, just register and return
  if (cleanName.length <= maxLength) {
    usedNames.add(cleanName);
    return cleanName;
  }

  // Check if already mapped
  if (nameMapping.has(cleanName)) {
    return nameMapping.get(cleanName)!;
  }

  // Create truncated name with suffix
  const baseName = cleanName.substring(0, maxLength) + '~';
  let counter = 1;
  let newName = baseName + counter;

  while (usedNames.has(newName)) {
    counter++;
    newName = baseName + counter;
  }

  usedNames.add(newName);
  nameMapping.set(cleanName, newName);

  return newName;
}

/**
 * Truncate hinge name to maximum length
 * If name exceeds max length (20), append ~1, ~2, etc.
 * Based on main.bas HingeName function (lines 881-908)
 */
export function truncateHingeName(
  name: string,
  usedNames: Set<string>,
  nameMapping: Map<string, string>,
  maxLength: number = MAX_LENGTHS.HINGE_NAME
): string {
  // If within limit and not used, just register and return
  if (name.length < maxLength && !usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  // Check if already mapped
  if (nameMapping.has(name)) {
    return nameMapping.get(name)!;
  }

  // Create truncated name with suffix
  const baseName = name.substring(0, 15) + '~';
  let counter = 1;
  let newName = baseName + counter;

  while (usedNames.has(newName)) {
    counter++;
    newName = baseName + counter;
  }

  usedNames.add(newName);
  nameMapping.set(name, newName);

  return newName;
}

/**
 * Generate string representation for node/element number ranges
 * Converts "1,2,3,5,6,7,10" to "'1to3 5to7 10"
 * Based on main.bas GetStringGen function (lines 910-970)
 */
export function generateNumberRangeString(numbers: number[]): string {
  if (numbers.length === 0) {
    return '';
  }

  if (numbers.length === 1) {
    return numbers[0].toString();
  }

  // Sort numbers
  const sorted = [...numbers].sort((a, b) => a - b);

  let result = "'" + sorted[0];
  let rangeStart = 0;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] + 1 !== sorted[i]) {
      // Gap found, close previous range if any
      if (rangeStart < i - 1 && i - 1 - rangeStart > 0) {
        result += 'to' + sorted[i - 1];
      }
      result += ' ' + sorted[i];
      rangeStart = i;
    }
  }

  // Close final range if needed
  if (rangeStart < sorted.length - 1) {
    result += 'to' + sorted[sorted.length - 1];
  }

  return result;
}

/**
 * Parse number range string back to array
 * Converts "'1to3 5to7 10" to [1, 2, 3, 5, 6, 7, 10]
 */
export function parseNumberRangeString(str: string): number[] {
  const result: number[] = [];
  const cleanStr = str.replace(/'/g, '').trim();

  if (!cleanStr) {
    return result;
  }

  const parts = cleanStr.split(/\s+/);

  for (const part of parts) {
    if (part.includes('to')) {
      const [start, end] = part.split('to').map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        result.push(num);
      }
    }
  }

  return result;
}

/**
 * Pad string to specified length
 */
export function padString(str: string, length: number, padChar: string = ' '): string {
  if (str.length >= length) {
    return str;
  }
  return str + padChar.repeat(length - str.length);
}

/**
 * Pad number to specified length with leading zeros
 */
export function padNumber(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

/**
 * Clean string for MCT format (remove special characters)
 */
export function cleanForMCT(str: string): string {
  return str
    .replace(/[,\t\n\r]/g, '-')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Safe string conversion
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Join array elements with comma for MCT format
 */
export function joinWithComma(...values: (string | number)[]): string {
  return values.join(',');
}
