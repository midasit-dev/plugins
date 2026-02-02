// SPG6Comp Converter - Class120_SPG6Comp equivalent
// Handles spring 6-component summary data

import { ConversionContext, SpringCompData, SpringComponentData } from '../types/converter.types';

export interface SPG6CompResult {
  spg6CompMapping: Map<string, number>;
  mctLines: string[];
}

// Hysteresis type dictionary (VBA dicData 46-56)
// Maps Japanese hysteresis type names to MCT format
// Note: 自由, 固定, 線形 return empty string (not processed)
const HYSTERESIS_TYPES: Record<string, { mct: string; sym: number }> = {
  '自由': { mct: '', sym: 0 },
  '固定': { mct: '', sym: 0 },
  '線形': { mct: '', sym: 0 },
  '名古屋高速ゴム支承': { mct: 'LITR', sym: 0 },
  'バイリニア (対称)': { mct: 'NBI', sym: 0 },
  'バイリニア (非対称)': { mct: 'NBI', sym: 1 },
  'トリリニア (対称)': { mct: 'KIN', sym: 0 },
  'トリリニア (非対称)': { mct: 'KIN', sym: 1 },
  'テトラリニア (対称)': { mct: 'TTE', sym: 0 },
  'テトラリニア (非対称)': { mct: 'TTE', sym: 1 },
  'BMR(CD)ダンパー': { mct: 'VISCOUS-OIL-DAMPER', sym: 0 },
};

// NBI detail type dictionary (VBA GetSPG6CompDetail 101-128)
const NBI_DETAIL_TYPES: Record<string, { mct: string; hyst2: string }> = {
  '正方向': { mct: 'SLBT', hyst2: '' },
  '負方向': { mct: 'SLBC', hyst2: '' },
  '正負方向': { mct: 'NBI', hyst2: '' },
  'Gap/Hook': { mct: 'SLBI', hyst2: ', 0.01, 0.02' },
  'Takeda': { mct: 'TAK', hyst2: '' },
  'cloud/スリップ': { mct: 'SLBI', hyst2: '' },
};


/**
 * Get SPG6Comp detail data for NBI type (VBA GetSPG6CompDetail 101-128)
 * Only called when hystType is NBI
 */
export function getSPG6CompDetail(
  detailStr: string
): { hyst: string; hyst2: string } {
  const detail = NBI_DETAIL_TYPES[detailStr];
  if (detail) {
    return { hyst: detail.mct, hyst2: detail.hyst2 };
  }
  return { hyst: 'NBI', hyst2: '' };
}

/**
 * Parse SPG6Comp data from Excel sheet
 * Based on Class120_SPG6Comp.GetHingeSPG6Comp (VBA 23-99)
 *
 * VBA column structure:
 * - Column 0: Property name
 * - Columns 1,3,5,7,9,11: Hysteresis types for components 1-6
 * - Columns 2,4,6,8,10,12: Detail strings for components 1-6
 */
export function parseSPG6CompData(
  rawData: (string | number)[][],
  context: ConversionContext
): SPG6CompResult {
  const spg6CompMapping = new Map<string, number>();
  const mctLines: string[] = [];

  console.log('=== parseSPG6CompData ===');
  console.log('Input rows:', rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const propName = String(row[0]);
    console.log(`Property "${propName}":`);

    // Add to mapping (VBA line 76: m_dicSprProp.Add strData(0, i), i)
    if (!spg6CompMapping.has(propName)) {
      spg6CompMapping.set(propName, i);
    }

    // Initialize spring component data
    const springData: SpringCompData = {
      angle: 0,
      components: [],
    };

    // Process 6 components (VBA line 78: For j = 1 To 11 Step 2)
    // j=1,3,5,7,9,11 → component indices 1,2,3,4,5,6
    for (let j = 1; j <= 11; j += 2) {
      const hystTypeStr = String(row[j] || '');
      const detailStr = String(row[j + 1] || '');
      const componentIndex = (j + 1) / 2; // 1,2,3,4,5,6

      console.log(`  Component ${componentIndex}: type="${hystTypeStr}", detail="${detailStr}"`);

      // Get hysteresis type info (VBA line 79-81)
      const hystInfo = HYSTERESIS_TYPES[hystTypeStr];

      // Skip if no valid hysteresis type (VBA: If Len(dicData(strData(j, i))) > 0 Then)
      if (!hystInfo || hystInfo.mct === '') {
        console.log(`    SKIPPED (empty mct)`);
        continue;
      }

      let mctHyst = hystInfo.mct;
      let mctHyst2 = '';
      const mctSym = hystInfo.sym;

      // Special handling for NBI type (VBA lines 83-85)
      if (mctHyst === 'NBI') {
        const detail = getSPG6CompDetail(detailStr);
        mctHyst = detail.hyst;
        mctHyst2 = detail.hyst2;
      }

      // VBA main.bas line 280-282:
      // mct_iTYPE = 1 (d-F mode fixed)
      // mct_SFType = 3 + mct_iTYPE * 2 = 5
      // mct_dStiff = 1
      const mctTypeValue = 1;
      const mctSFTypeValue = 3 + mctTypeValue * 2; // = 5

      const component: SpringComponentData = {
        componentIndex,
        componentType: mctSym, // 0: symmetric, 1: asymmetric
        subType: 0,
        propertyName: propName,
        rotate: 0,
        mctHyst,
        mctHyst2,
        mctSym,
        mctType: mctTypeValue,
        mctSFType: mctSFTypeValue,
        mctStiff: 1,
        category: [hystTypeStr],
        data: [],
      };

      springData.components.push(component);

      // Add to dicSPG6Comp if not exists (VBA lines 90-92)
      if (!spg6CompMapping.has(propName)) {
        spg6CompMapping.set(propName, i);
      }
    }

    context.springCompData.set(propName, springData);
  }

  return { spg6CompMapping, mctLines };
}

/**
 * Get hysteresis type info by name
 */
export function getHysteresisType(typeName: string): { mct: string; sym: number } | undefined {
  return HYSTERESIS_TYPES[typeName];
}

/**
 * Get all available hysteresis types
 */
export function getAvailableHysteresisTypes(): string[] {
  return Object.keys(HYSTERESIS_TYPES);
}

/**
 * Get spring property number by name
 */
export function getSpringPropertyNumber(
  name: string,
  mapping: Map<string, number>
): number | undefined {
  return mapping.get(name);
}

/**
 * Check if a hysteresis type requires special handling
 */
export function requiresSpecialHandling(hystType: string): boolean {
  const specialTypes = ['GAP', 'HOOK', 'FRICTION', 'VISCOUS-OIL-DAMPER'];
  const hystInfo = HYSTERESIS_TYPES[hystType];
  return hystInfo ? specialTypes.includes(hystInfo.mct) : false;
}
