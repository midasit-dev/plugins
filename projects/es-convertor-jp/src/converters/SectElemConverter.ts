// Section Element Converter - Class055_NumbSect and Class060_SectElem equivalent
// Handles section-material mapping and section element data
//
// VBA Reference: Class060_SectElem.cls
// - nReadSTRow = 3, nReadSTCol = 2, nReadEDCol = 13 (B~M, 12 cols)
// - strData(0) = Section name (B)
// - strData(1) = ? (C)
// - strData(2) = ? (D)
// - strData(3) = Material name (E) ← Important!

import { SectionElementData } from '../types/excel.types';
import { ConversionContext } from '../types/converter.types';
import { truncateMaterialName } from '../utils/stringUtils';

/**
 * Parse numbered section data (数値断面) - Class055_NumbSect
 * Creates section to material mapping
 *
 * VBA Reference: Class055_NumbSect.cls
 * - nReadSTRow = 3, nReadSTCol = 2, nReadEDCol = 17 (B~Q, 16 cols)
 * - strData(0) = Section name (B)
 * - strData(1) = Material name (C)
 */
export function parseNumbSectData(
  rawData: (string | number)[][],
  context: ConversionContext
): void {
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectName = String(row[0]);
    const materialName = String(row[1] || '');

    // VBA line 38-40: Only add if not already exists
    if (sectName && materialName && !context.sect2Material.has(sectName)) {
      context.sect2Material.set(sectName, materialName);
    }
  }
}

/**
 * Parse section element data from Excel sheet
 */
export function parseSectionElementData(rawData: (string | number)[][]): SectionElementData[] {
  const sectionElements: SectionElementData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectionElement: SectionElementData = {
      elementId: String(row[0]),
      iSectionName: String(row[1] || ''),
      jSectionName: String(row[2] || row[1] || ''),
    };

    sectionElements.push(sectionElement);
  }

  return sectionElements;
}

/**
 * Read section element data for section name collection
 * Based on Class060_SectElem.ReadSectElem_SectName
 *
 * VBA behavior: REMOVE section names from dicSect if they exist in SectElem sheet
 */
export function readSectElemSectionNames(
  rawData: (string | number)[][],
  existingSectionNames: Map<string, boolean>
): number {
  let count = -1;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    count++;

    const sectName = String(row[0] || '');

    // VBA line 44-47: Remove section name if it exists in dicSect
    if (sectName && existingSectionNames.has(sectName)) {
      existingSectionNames.delete(sectName);
    }
  }

  return count;
}

/**
 * Convert section element data with material/section mapping
 * Based on Class060_SectElem.ReadSectElem
 *
 * VBA column mapping:
 * - strData(0) = Section name (B)
 * - strData(3) = Material name (E)
 */
export function convertSectionElements(
  rawData: (string | number)[][],
  context: ConversionContext,
  matlYoung: Map<string, number>,
  sectYoung: Map<string, number>,
  dicSect: Map<string, string>, // Additional section-material mapping
  processAll: boolean = true
): void {
  // VBA line 77-81: Process each row
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectName = String(row[0] || '');
    // VBA: strData(3) = Material name (E column, index 3)
    let materialName = String(row[3] || '');

    // VBA line 78: strData(3, i) = ChangeMatlName(strData(3, i))
    materialName = truncateMaterialName(
      materialName,
      context.longMaterialNameUsed,
      context.longMaterialNames
    );

    // VBA line 83-86: Store section to material mapping (only if not already exists)
    if (sectName && materialName && !context.sect2Material.has(sectName)) {
      context.sect2Material.set(sectName, materialName);
    }
  }

  // VBA line 89-95: Add remaining items from dicSect to m_Sect2Material
  for (const [sectName, materialName] of dicSect) {
    if (!context.sect2Material.has(sectName)) {
      context.sect2Material.set(sectName, materialName);
    }
  }
}

/**
 * Get section to material mapping
 */
export function getSectionMaterialMapping(context: ConversionContext): Map<string, string> {
  return context.sect2Material;
}
