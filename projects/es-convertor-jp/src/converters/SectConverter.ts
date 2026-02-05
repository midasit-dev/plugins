// Section Converter - Class070_Sect equivalent
// Converts ES section data to MCT *SECTION format

import { SectionData } from '../types/excel.types';
import { MCTSectionProp } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { changeN_kN, changeMM2_M2, safeParseNumber, vbaFormatNumber } from '../utils/unitConversion';
import { replaceComma } from '../utils/stringUtils';

export interface SectionConversionResult {
  sections: MCTSectionProp[];
  mctLinesValue: string[];
  mctLinesTapered: string[];
}

// Section shape mapping (VBA dicSectList - Class070_Sect.cls lines 498-514)
export const SECTION_SHAPES: Record<string, string> = {
  '山形断面': 'L',
  '溝形断面': 'C',
  'H-断面': 'H',
  'T-断面': 'T',
  'ボックス断面': 'B',
  'パイプ断面': 'P',
  '2山形断面': '2L',
  '2溝形断面': '2C',
  '矩形': 'SB',
  '円形': 'SR',
  '中空八角形': 'OCT',
  '八角形': 'SOCT',
  '矩形-八角形': 'ROCT',
  '中空小判形': 'TRK',
  '小判形': 'STRK',
  '半小判形': 'HTRK',
  '': 'SB',
};

/**
 * Parse section data from Excel sheet
 */
export function parseSectionData(rawData: (string | number)[][]): SectionData[] {
  const sections: SectionData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const section: SectionData = {
      name: String(row[0]),
      type: 'VALUE',
      shape: String(row[28] || '矩形'),
      area: safeParseNumber(row[4]),
      iyy: safeParseNumber(row[5]),
      izz: safeParseNumber(row[6]),
      ixx: safeParseNumber(row[24]),
      cy: safeParseNumber(row[12]),
      cz: safeParseNumber(row[11]),
    };

    sections.push(section);
  }

  return sections;
}

/**
 * Read section names for section mapping
 * Based on Class070_Sect.ReadSect_SectName
 */
export function readSectSectionNames(
  rawData: (string | number)[][],
  sectionNames: Map<string, boolean>,
  context: ConversionContext
): Map<string, { young: number; shape: string }> {
  const sectYoung = new Map<string, { young: number; shape: string }>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectName = String(row[0]);

    if (sectionNames.has(sectName)) {
      sectYoung.set(sectName, {
        young: safeParseNumber(row[2]),
        shape: String(row[28] || ''),
      });
    }
  }

  return sectYoung;
}

/**
 * Truncate section name if needed
 */
function truncateSectionName(
  name: string,
  name2: string,
  usedNames: Set<string>,
  nameMapping: Map<string, string>,
  maxLength: number = 23
): string {
  const key = `${name}=*=${name2}`;

  if (nameMapping.has(key)) {
    return nameMapping.get(key)!;
  }

  let result = name;
  let baseName = result + '~';
  let counter = 0;

  if (result.length > 28) {
    baseName = name.substring(0, maxLength) + '~';
    result = baseName + '1';
  }

  while (usedNames.has(result)) {
    counter++;
    result = baseName + counter;
  }

  usedNames.add(result);
  nameMapping.set(key, result);

  return result;
}

/**
 * Convert ES sections to MCT format
 * Based on Class070_Sect.ChangeSect
 */
export function convertSections(
  rawData: (string | number)[][],
  context: ConversionContext,
  sectionPairs: Map<string, string[]>,
  sectYoung: Map<string, number>
): SectionConversionResult {
  const mctSections: MCTSectionProp[] = [];
  const mctLinesValue: string[] = [];
  const mctLinesTapered: string[] = [];

  // Track section indices by name
  const sectOptionIndex = new Map<string, number>();
  const sectNameUsed = new Set<string>();
  const sectNameMapping = new Map<string, string>();

  // Build index map
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const sectName = String(row[0]);
    sectOptionIndex.set(sectName, i);

    // Store Young's modulus
    const young = safeParseNumber(row[2]);
    const youngKNM2 = changeN_kN(young) / changeMM2_M2(1);
    sectYoung.set(sectName, youngKNM2);
  }

  // Comments for VALUE sections
  mctLinesValue.push('*SECTION    ; Section');
  mctLinesValue.push('; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - VALUE');
  mctLinesValue.push(';       AREA, ASy, ASz, Ixx, Iyy, Izz                                               ; 2nd line');
  mctLinesValue.push(';       CyP, CyM, CzP, CzM, QyB, QzB, PERI_OUT, PERI_IN, Cy, Cz                     ; 3rd line');
  mctLinesValue.push(';       Y1, Y2, Y3, Y4, Z1, Z2, Z3, Z4, Zyy, Zzz                                    ; 4th line');
  mctLinesValue.push('; [OFFSET] : OFFSET, iCENT, iREF, iHORZ, HUSER, iVERT, VUSER');

  // Comments for TAPERED sections
  mctLinesTapered.push('*SECTION    ; Section');
  mctLinesTapered.push('; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - VALUE');
  mctLinesTapered.push(';       D11, D12, D13, D14, D15, D16, D17, D18                                      ; 2nd line (STYPE=VALUE)');
  mctLinesTapered.push(';       AREA1, ASy1, ASz1, Ixx1, Iyy1, Izz1                                         ; 3rd line (STYPE=VALUE)');
  mctLinesTapered.push(';       CyP1, CyM1, CzP1, CzM1, QyB1, QzB1, PERI_OUT1, PERI_IN1, Cy1, Cz1           ; 4th line (STYPE=VALUE)');
  mctLinesTapered.push(';       Y11, Y12, Y13, Y14, Z11, Z12, Z13, Z14, Zyy1, Zzz1                          ; 5th line (STYPE=VALUE)');
  mctLinesTapered.push(';       D21, D22, D23, D24, D25, D26, D27, D28                                      ; 6th line (STYPE=VALUE)');
  mctLinesTapered.push(';       AREA2, ASy2, ASz2, Ixx2, Iyy2, Izz2                                         ; 7th line (STYPE=VALUE)');
  mctLinesTapered.push(';       CyP2, CyM2, CzP2, CzM2, QyB2, QzB2, PERI_OUT2, PERI_IN2, Cy2, Cz2           ; 8th line (STYPE=VALUE)');
  mctLinesTapered.push(';       Y21, Y22, Y23, Y24, Z21, Z22, Z23, Z24, Zyy2, Zzz2                          ; 9th line (STYPE=VALUE)');
  mctLinesTapered.push('; [OFFSET2]: OFFSET, iCENT, iREF, iHORZ, HUSERI, HUSERJ, iVERT, VUSERI, VUSERJ');

  let sectNo = 0;

  // Process section pairs
  for (const [iSectName, jSectNames] of sectionPairs) {
    for (const jSectName of jSectNames) {
      sectNo++;

      const iIdx = sectOptionIndex.get(iSectName);
      if (iIdx === undefined) continue;

      const iRow = rawData[iIdx];

      if (iSectName === jSectName) {
        // VALUE section (same i and j)
        const lines = generateValueSection(sectNo, iRow, jSectName, sectNameUsed, sectNameMapping);
        mctLinesValue.push(...lines);
      } else {
        // TAPERED section (different i and j)
        const jIdx = sectOptionIndex.get(jSectName);
        if (jIdx === undefined) continue;

        const jRow = rawData[jIdx];
        const lines = generateTaperedSection(sectNo, iRow, jRow, jSectName, sectNameUsed, sectNameMapping);
        mctLinesTapered.push(...lines);
      }

      // Store section mapping
      const sectKey = `${iSectName}-${jSectName}`;
      context.sectionMapping.set(sectKey, sectNo);

      mctSections.push({
        no: sectNo,
        type: iSectName === jSectName ? 'VALUE' : 'TAPERED',
        name: iSectName,
        data: '',
      });
    }
  }

  context.maxSectionNo = sectNo;

  return { sections: mctSections, mctLinesValue, mctLinesTapered };
}

/**
 * Generate VALUE section lines
 */
function generateValueSection(
  sectNo: number,
  row: (string | number)[],
  jSectName: string,
  usedNames: Set<string>,
  nameMapping: Map<string, string>
): string[] {
  const lines: string[] = [];
  const sectName = String(row[0]);

  const mctName = replaceComma(truncateSectionName(sectName, jSectName, usedNames, nameMapping, 23));
  const shape = SECTION_SHAPES[String(row[28] || '')] || 'SB';

  // Check for offset
  let offsetStr = 'CC,0,0,0,0,0,0';
  if (String(row[17]) === 'TRUE') {
    offsetStr = `LT,0,0,1,,${row[18]},1,,${row[19]}`;
  }

  // Line 1
  lines.push(`${sectNo},VALUE,${mctName},${offsetStr},NO,NO,${shape},BUILT,0,0,0,0,0,0,0,0,0`);

  // Line 2: AREA, ASy, ASz, Ixx, Iyy, Izz
  const area = safeParseNumber(row[4]);
  const ixx = safeParseNumber(row[24]);
  const iyy = safeParseNumber(row[5]);
  const izz = safeParseNumber(row[6]);
  lines.push(`${vbaFormatNumber(area)},0,0,${vbaFormatNumber(ixx)},${vbaFormatNumber(iyy)},${vbaFormatNumber(izz)}`);

  // Line 3: CyP, CyM, CzP, CzM, QyB, QzB, PERI_OUT, PERI_IN, Cy, Cz
  const cyP = safeParseNumber(row[13]);
  const cyM = safeParseNumber(row[12]);
  const czP = safeParseNumber(row[10]);
  const czM = safeParseNumber(row[11]);
  lines.push(`${cyP},${cyM},${czP},${czM},0,0,0,0,${cyM},${czM}`);

  // Line 4: Y1, Y2, Y3, Y4, Z1, Z2, Z3, Z4, Zyy, Zzz
  // VBA preserves -0 sign; JavaScript's String(-0) returns "0".
  const fmtVal = (v: number): string => Object.is(v, -0) ? '-0' : String(v);
  const y1 = -cyM;
  const y2 = cyP;
  const y3 = cyP;
  const y4 = -cyM;
  const z1 = czP;
  const z2 = czP;
  const z3 = -czM;
  const z4 = -czM;
  lines.push(`${fmtVal(y1)},${fmtVal(y2)},${fmtVal(y3)},${fmtVal(y4)},${fmtVal(z1)},${fmtVal(z2)},${fmtVal(z3)},${fmtVal(z4)},0,0`);

  return lines;
}

/**
 * Generate TAPERED section lines
 */
function generateTaperedSection(
  sectNo: number,
  iRow: (string | number)[],
  jRow: (string | number)[],
  jSectName: string,
  usedNames: Set<string>,
  nameMapping: Map<string, string>
): string[] {
  const lines: string[] = [];
  const iSectName = String(iRow[0]);

  const mctName = replaceComma(truncateSectionName(iSectName + '(TAP)', jSectName, usedNames, nameMapping, 18));
  const shape = SECTION_SHAPES[String(iRow[28] || '')] || 'SB';

  // Check for offset
  let offsetStr = 'CC,0,0,0,0,0,0,0,0';
  if (String(iRow[17]) === 'TRUE') {
    offsetStr = `LT,0,0,1,,${iRow[18]},${jRow[18]},1,,${iRow[19]},${jRow[19]}`;
  }

  // Line 1
  lines.push(`${sectNo},TAPERED,${mctName},${offsetStr},NO,NO,NO,${shape},1,1,VALUE`);

  // Line 2: D11-D18 (all zeros for VALUE type)
  lines.push('0,0,0,0,0,0,0,0');

  // Line 3: i-section properties
  const iArea = safeParseNumber(iRow[4]);
  const iIxx = safeParseNumber(iRow[24]);
  const iIyy = safeParseNumber(iRow[5]);
  const iIzz = safeParseNumber(iRow[6]);
  lines.push(`${vbaFormatNumber(iArea)},0,0,${vbaFormatNumber(iIxx)},${vbaFormatNumber(iIyy)},${vbaFormatNumber(iIzz)}`);

  // Line 4: i-section C values
  const iCyP = safeParseNumber(iRow[13]);
  const iCyM = safeParseNumber(iRow[12]);
  const iCzP = safeParseNumber(iRow[10]);
  const iCzM = safeParseNumber(iRow[11]);
  lines.push(`${iCyP},${iCyM},${iCzP},${iCzM},0,0,0,0,0,0`);

  // Line 5: i-section Y, Z values
  // VBA preserves -0 sign; JavaScript's String(-0) returns "0".
  const fmtVal = (v: number): string => Object.is(v, -0) ? '-0' : String(v);
  lines.push(`${fmtVal(-iCyM)},${fmtVal(iCyP)},${fmtVal(iCyP)},${fmtVal(-iCyM)},${fmtVal(iCzP)},${fmtVal(iCzP)},${fmtVal(-iCzM)},${fmtVal(-iCzM)},0,0`);

  // Line 6: D21-D28 (all zeros for VALUE type)
  lines.push('0,0,0,0,0,0,0,0');

  // Line 7: j-section properties
  const jArea = safeParseNumber(jRow[4]);
  const jIxx = safeParseNumber(jRow[24]);
  const jIyy = safeParseNumber(jRow[5]);
  const jIzz = safeParseNumber(jRow[6]);
  lines.push(`${vbaFormatNumber(jArea)},0,0,${vbaFormatNumber(jIxx)},${vbaFormatNumber(jIyy)},${vbaFormatNumber(jIzz)}`);

  // Line 8: j-section C values
  const jCyP = safeParseNumber(jRow[13]);
  const jCyM = safeParseNumber(jRow[12]);
  const jCzP = safeParseNumber(jRow[10]);
  const jCzM = safeParseNumber(jRow[11]);
  lines.push(`${jCyP},${jCyM},${jCzP},${jCzM},0,0,0,0,0,0`);

  // Line 9: j-section Y, Z values
  lines.push(`${fmtVal(-jCyM)},${fmtVal(jCyP)},${fmtVal(jCyP)},${fmtVal(-jCyM)},${fmtVal(jCzP)},${fmtVal(jCzP)},${fmtVal(-jCzM)},${fmtVal(-jCzM)},0,0`);

  return lines;
}
