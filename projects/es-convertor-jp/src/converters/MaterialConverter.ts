// Material Converter - Class050_Material equivalent
// Converts ES material data to MCT *MATERIAL format

import { MaterialData } from '../types/excel.types';
import { MCTMaterial } from '../types/mct.types';
import { ConversionContext } from '../types/converter.types';
import { changeN_kN, changeMM2_M2, safeParseNumber, isNumeric } from '../utils/unitConversion';
import { truncateMaterialName } from '../utils/stringUtils';
import {
  MATERIAL_TYPES,
  MATERIAL_STANDARDS,
  CONCRETE_STRENGTH_MAP,
  STEEL_STRENGTH_MAP,
  POISSON_RATIO_MAP,
  INPUT_TYPES,
  MATERIAL_CATEGORIES,
} from '../constants/mctKeywords';

export interface MaterialConversionResult {
  materials: MCTMaterial[];
  mctLines: string[];
}

/**
 * Parse material data from Excel sheet
 * Based on Class050_Material.ChangeMaterial
 */
export function parseMaterialData(rawData: (string | number)[][]): MaterialData[] {
  const materials: MaterialData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0] || String(row[0]).trim() === '') continue;

    const material: MaterialData = {
      name: String(row[0]),
      type: String(row[1] || ''),  // データベース or ユーザー
      category: String(row[2] || ''), // コンクリート材料, 鋼材料, etc.
      strength: safeParseNumber(row[3]),
      elasticModulus: safeParseNumber(row[4]),
      density: safeParseNumber(row[5]),
      thermalCoeff: safeParseNumber(row[6]),
      poissonRatio: safeParseNumber(row[7]),
    };

    // Validate numeric values
    for (let j = 3; j <= 6; j++) {
      if (!isNumeric(row[j])) {
        (material as any)[['strength', 'elasticModulus', 'density', 'thermalCoeff'][j - 3]] = 0;
      }
    }

    materials.push(material);
  }

  return materials;
}

/**
 * Convert ES materials to MCT format
 */
export function convertMaterials(
  materials: MaterialData[],
  context: ConversionContext,
  additionalMaterials?: Map<string, { young: number; thermal: number }>
): MaterialConversionResult {
  const mctMaterials: MCTMaterial[] = [];
  const mctLines: string[] = [];

  // Comments
  mctLines.push('*MATERIAL    ; Material');
  mctLines.push('; iMAT, TYPE, MNAME, SPHEAT, HEATCO, PLAST, TUNIT, bMASS, DAMPRATIO, [DATA1]           ; STEEL, CONC, USER');
  mctLines.push('; [DATA1] : 1, STANDARD, CODE/PRODUCT, DB, USEELAST, ELAST');
  mctLines.push('; [DATA1] : 2, ELAST, POISN, THERMAL, DEN, MASS');

  let maxMatNo = 0;

  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];

    // Convert elastic modulus: N/mm² to kN/m²
    let elasticModulus = changeN_kN(mat.elasticModulus) / changeMM2_M2(1);

    // VBA line 112: If dValue = 0# Then dValue = 1#
    if (elasticModulus === 0) elasticModulus = 1;

    const matNo = i + 1;
    if (matNo > maxMatNo) maxMatNo = matNo;

    context.materialMapping.set(mat.name, matNo);

    // Determine material type (S or RC)
    // VBA line 117-121: 鋼材料 = STEEL, others = RC
    const isSteel = mat.category === MATERIAL_CATEGORIES.REINFORCEMENT;
    context.matNo2SorRC.set(matNo, isSteel ? 'STEEL' : 'RC');

    // Truncate material name if needed
    const mctName = truncateMaterialName(
      mat.name,
      context.longMaterialNameUsed,
      context.longMaterialNames
    );

    let mctLine: string;

    // VBA line 87-90: Check if using database or user-defined
    // VBA: If strData(1, i) = "データベース" Or strData(2, i) = "鋼板材料" Then
    //        If Not dicConc.Exists(CInt(strData(3, i))) Then strData(1, i) = "ユーザー"
    const shouldTryDatabase = mat.type === INPUT_TYPES.DATABASE || mat.category === MATERIAL_CATEGORIES.STEEL;
    const strengthKey = mat.strength;

    // Check if strength exists in database (dicConc)
    let hasDbMatch = false;
    if (shouldTryDatabase && mat.category !== MATERIAL_CATEGORIES.FRP) {
      hasDbMatch = CONCRETE_STRENGTH_MAP[strengthKey] !== undefined ||
                   STEEL_STRENGTH_MAP[strengthKey] !== undefined;
    }

    // VBA line 88: If Not dicConc.Exists Then type = "ユーザー"
    const useDatabase = shouldTryDatabase && hasDbMatch;

    if (useDatabase) {
      // Database material
      // VBA dicStandard: コンクリート材料 → (JIS-Civil(RC), CONC), 鋼板材料 → (JIS-Civil(S), STEEL), 鉄筋材料 → (JIS-Civil(S), STEEL)
      const isSteelCategory = mat.category === MATERIAL_CATEGORIES.REINFORCEMENT || mat.category === MATERIAL_CATEGORIES.STEEL;
      const standard = isSteelCategory ? MATERIAL_STANDARDS.STEEL : MATERIAL_STANDARDS.CONCRETE;
      const mctType = isSteelCategory ? MATERIAL_TYPES.STEEL : MATERIAL_TYPES.CONC;

      const strengthName = CONCRETE_STRENGTH_MAP[strengthKey] ||
                          STEEL_STRENGTH_MAP[strengthKey] ||
                          `Fc${strengthKey}`;

      mctLine = `${matNo},${mctType},${mctName},0,0,,C,NO,0.0,1,${standard},,${strengthName},NO,${mat.elasticModulus}`;
    } else {
      // User-defined material
      const poissonRatio = POISSON_RATIO_MAP[mat.category] || 0.3;

      mctLine = `${matNo},USER,${mctName},0,0,,C,NO,0.0,2,${elasticModulus},${poissonRatio},${mat.thermalCoeff},${mat.density},0`;
    }

    mctLines.push(mctLine);

    mctMaterials.push({
      no: matNo,
      type: isSteel ? MATERIAL_TYPES.STEEL : MATERIAL_TYPES.CONC,
      name: mctName,
      data: mctLine,
    });
  }

  // Add additional materials for sections without material assignment
  if (additionalMaterials) {
    let nextMatNo = maxMatNo + 1;

    for (const [sectName, data] of additionalMaterials) {
      let materialName = 'Material';

      // Generate unique material name
      if (context.materialMapping.has(materialName)) {
        let counter = 2;
        while (context.materialMapping.has(`${materialName}~${counter}`)) {
          counter++;
        }
        materialName = `${materialName}~${counter}`;
      }

      context.materialMapping.set(materialName, nextMatNo);

      const elasticModulus = changeN_kN(data.young) / changeMM2_M2(1);

      const mctLine = `${nextMatNo},USER,${materialName},0,0,,C,NO,0.0,2,${elasticModulus},0.3,${data.thermal},0,0`;
      mctLines.push(mctLine);

      mctMaterials.push({
        no: nextMatNo,
        type: MATERIAL_TYPES.USER,
        name: materialName,
        data: mctLine,
      });

      // Update additional materials map with the material name for section reference
      additionalMaterials.set(sectName, { ...data, young: nextMatNo } as any);

      nextMatNo++;
    }

    context.maxMaterialNo = nextMatNo - 1;
  } else {
    context.maxMaterialNo = maxMatNo;
  }

  return { materials: mctMaterials, mctLines };
}

/**
 * Get material number by name
 */
export function getMaterialNumber(name: string, context: ConversionContext): number | undefined {
  return context.materialMapping.get(name);
}
