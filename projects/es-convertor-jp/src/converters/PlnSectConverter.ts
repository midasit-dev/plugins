// Plane Section Converter - Class080_PlnSect equivalent
// Converts ES plane section data to MCT *THICKNESS format
//
// VBA Reference: Class080_PlnSect.cls
// - nReadSTRow = 3, nReadSTCol = 2, nReadEDCol = 7 (B~G, 6 cols)
// - strData(0) = Section name (B)
// - strData(1) = ? (C)
// - strData(2) = ? (D)
// - strData(3) = ? (E)
// - strData(4) = Thickness (F)
// - strData(5) = Material name (G)

import { PlnSectData } from '../types/excel.types';
import { MCTThickness } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { safeParseNumber } from '../utils/unitConversion';

export interface PlnSectConversionResult {
  thicknesses: MCTThickness[];
  mctLines: string[];
  plnSectMapping: Map<string, { sectNo: number; materialName: string }>;
}

/**
 * Parse plane section data from Excel sheet
 * VBA: strData(4) = thickness, strData(5) = material
 */
export function parsePlnSectData(rawData: (string | number)[][]): PlnSectData[] {
  const plnSections: PlnSectData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const plnSect: PlnSectData = {
      name: String(row[0]),
      thickness: safeParseNumber(row[4]), // VBA strData(4)
      type: 'VALUE',
    };

    plnSections.push(plnSect);
  }

  return plnSections;
}

/**
 * Convert ES plane sections to MCT format
 * Based on Class080_PlnSect.ChangePlnSect
 *
 * Output format: iTHK, VALUE, iTHK, YES, thickness, 0, NO, 0, 0
 */
export function convertPlnSections(
  rawData: (string | number)[][],
  context: ConversionContext
): PlnSectConversionResult {
  const thicknesses: MCTThickness[] = [];
  const mctLines: string[] = [];
  const plnSectMapping = new Map<string, { sectNo: number; materialName: string }>();

  // VBA line 51: Comment
  mctLines.push('*THICKNESS    ; Thickness');

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectNo = i + 1;
    const sectName = String(row[0]);
    const thickness = safeParseNumber(row[4]); // VBA strData(4)
    const materialName = String(row[5] || ''); // VBA strData(5)

    // VBA line 59: Store mapping with all data
    plnSectMapping.set(sectName, { sectNo, materialName });

    // VBA line 60: Generate MCT line
    // Format: iTHK, VALUE, iTHK, YES, thickness, 0, NO, 0, 0
    const mctLine = `${sectNo}, VALUE,${sectNo}, YES,${thickness}, 0, NO, 0, 0`;
    mctLines.push(mctLine);

    thicknesses.push({
      no: sectNo,
      name: sectName,
      type: 'VALUE',
      thickness,
    });
  }

  return { thicknesses, mctLines, plnSectMapping };
}
