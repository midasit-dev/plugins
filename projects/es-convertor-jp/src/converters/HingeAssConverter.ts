// Hinge Assignment Converter - Class100_Hinge_Ass equivalent
// Prepares hystZp/hystYp data for HingePropConverter
// MCT *IHINGE-ASSIGN output is generated in HingePropConverter

import { ConversionContext } from '../types/converter.types';
import { truncateHingeName } from '../utils/stringUtils';

export interface HingeAssConversionResult {
  hystYp: Map<string, string>;
  hystZp: Map<string, string>;
  hingeElements: Set<string>;
}

/**
 * Convert ES hinge assignments to prepare data for HingePropConverter
 * Based on Class100_Hinge_Ass.ChangeHinge_Ass (lines 45-48)
 *
 * VBA logic:
 *   dicHYST_zp.Add strData(0, i), strData(4, i) & strData(5, i)
 *   dicHYST_yp.Add strData(0, i), strData(7, i) & strData(8, i)
 */
export function convertHingeAssignments(
  rawData: (string | number)[][],
  context: ConversionContext,
  hingePropertyMapping: Map<string, number>
): HingeAssConversionResult {
  const hystYp = new Map<string, string>();
  const hystZp = new Map<string, string>();
  const hingeElements = new Set<string>();

  // Column mapping (0-based):
  // 0 = Property name
  // 4+5 = zp hyst type (concatenated)
  // 7+8 = yp hyst type (concatenated)
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);

    // VBA: dicHYST_zp.Add strData(0, i), strData(4, i) & strData(5, i)
    // VBA: dicHYST_yp.Add strData(0, i), strData(7, i) & strData(8, i)
    const hystZpType = String(row[4] || '') + String(row[5] || '');
    const hystYpType = String(row[7] || '') + String(row[8] || '');

    hystZp.set(propName, hystZpType);
    hystYp.set(propName, hystYpType);

    // Track property names that have hinges
    hingeElements.add(propName);

    // VBA: ChangeHinge_Ass calls HingeName(strData(0, i)) for each row (line 62),
    // pre-populating m_LongHingeNameBuf before ChangeHinge_Prop runs.
    // This ensures ChangeHinge_Prop's HingeName calls generate ~1, ~2, etc.
    truncateHingeName(propName, context.longHingeNameUsed, context.longHingeNames);
  }

  return { hystYp, hystZp, hingeElements };
}
