// Example data for testing
// Based on VBA Class definitions and actual ES Excel structure
// Organized by conversion groups for logical testing

export interface ExampleDataSet {
  id: string;
  label: string;
  description: string;
  sheetKey: string;  // Recoil state key
  data: (string | number)[][];
}

export interface ExampleGroup {
  id: string;
  label: string;
  description: string;
  examples: ExampleDataSet[];
}

// ============================================================================
// NODE example data
// VBA: Class020_Node, row=3, col=2-6 (5 cols: B~F)
// Columns: B(節点名称), C(X:m), D(Y:m), E(Z:m), F(従属)
// Coordinate transform: ES(X,Y,Z) -> MCT(X,-Z,Y)
// ============================================================================
export const NODE_EXAMPLE: ExampleDataSet = {
  id: 'node',
  label: 'NODE',
  description: '節点座標データ',
  sheetKey: 'nodeSheetDataState',
  data: [
    ['節点名称', 'X: (m)', 'Y: (m)', 'Z: (m)', '従属'],
    ['N1', 0, 0, 0, 1],
    ['N2', 10, 0, 0, 1],
    ['N3', 10, 5, 0, 1],
    ['N4', 10, 5, 3, 1],
    ['N5', 0, 8, 0, 1],
    ['N6', 10.5, 0, 0, 1],  // Rigid slave
    ['N7', 10, 0.5, 0, 1],  // Rigid slave
    ['N8', 10, 0, 0.5, 1],  // Rigid slave
    ['N9', 10.5, 5, 3, 1],  // Rigid slave
    ['N10', 0, 0, -5, 1],   // Plane element
    ['N11', 5, 0, -5, 1],
    ['N12', 5, 3, -5, 1],
    ['N13', 0, 3, -5, 1],
  ],
};

// ============================================================================
// MATERIAL example data
// VBA: Class050_Material, row=3, col=2-10 (9 cols: B~J)
// Columns: B(材料名称), C(種類), D(タイプ), E(圧縮強度), F(E), G(γ), H(α), I(色), J(従属)
// ============================================================================
export const MATERIAL_EXAMPLE: ExampleDataSet = {
  id: 'material',
  label: 'MATERIAL',
  description: '材料データ',
  sheetKey: 'materialSheetDataState',
  data: [
    ['材料名称', '種類', 'タイプ', '圧縮強度: (N/mm2)', 'E: (N/mm2)', 'γ: (kN/m3)', 'α: (1/℃)', '色', '従属'],
    ['Concrete-21', 'データベース', 'コンクリート材料', 21, 23500, 24.5, 0.00001, 10527352, 1],
    ['Steel-SS400', 'データベース', '鋼材料', 235, 200000, 77, 0.000012, 2642118, 1],
    ['Rebar-SD295', 'データベース', '鉄筋材料', 295, 200000, 77, 0.00001, 2642118, 1],
  ],
};

// ============================================================================
// FRAME example data
// VBA: Class030_Frame, row=3, col=2-11 (10 cols: B~K)
// Columns: B(要素名称), C(i-節点), D(j-節点), E(長さ), F(i-断面), G(j-断面), H(座標系), I~K
// ============================================================================
export const FRAME_EXAMPLE: ExampleDataSet = {
  id: 'frame',
  label: 'FRAME',
  description: 'フレーム要素データ',
  sheetKey: 'frameSheetDataState',
  data: [
    ['要素名称', 'i-節点', 'j-節点', '長さ(m)', 'i-断面', 'j-断面', '座標系', '', '', ''],
    ['E1', 'N1', 'N2', 10, 'Rect-500', 'Rect-500', 'Y軸', '', '', ''],
    ['E2', 'N2', 'N3', 5, 'Rect-500', 'Rect-400', 'Y軸', '', '', ''],
    ['E3', 'N3', 'N4', 3, 'H-300', 'H-300', 'Y軸', '', '', ''],
    ['E4', 'N1', 'N5', 8, 'Rect-500', 'Rect-500', 'Y軸', '', '', ''],
  ],
};

// ============================================================================
// SECTION example data (断面特性ｵﾌﾟｼｮﾝ)
// VBA: Class070_Sect, row=4, col=2-30 (29 cols: B~AD)
// Key columns: 0:名称, 2:E, 4:A, 5:Iyy, 6:Izz, 10:czP, 11:czM, 12:cyM, 13:cyP, 24:Ixx, 28:形状
// ============================================================================
const createSectionRow = (
  name: string, young: number, area: number, iyy: number, izz: number,
  cyP: number, cyM: number, czP: number, czM: number,
  ixx: number, shape: string
): (string | number)[] => {
  const row: (string | number)[] = new Array(29).fill('');
  row[0] = name;
  row[2] = young;
  row[4] = area;
  row[5] = iyy;
  row[6] = izz;
  row[10] = czP;
  row[11] = czM;
  row[12] = cyM;
  row[13] = cyP;
  row[17] = 'FALSE';
  row[18] = 0;
  row[19] = 0;
  row[24] = ixx;
  row[28] = shape;
  return row;
};

const createSectionHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(29).fill('');
  header[0] = '断面名称';
  header[2] = 'ヤング係数';
  header[4] = 'A(m²)';
  header[5] = 'Iyy(m⁴)';
  header[6] = 'Izz(m⁴)';
  header[10] = 'CzP';
  header[11] = 'CzM';
  header[12] = 'CyM';
  header[13] = 'CyP';
  header[17] = 'オフセット';
  header[24] = 'Ixx(m⁴)';
  header[28] = '形状';
  return header;
};

export const SECTION_EXAMPLE: ExampleDataSet = {
  id: 'section',
  label: 'SECTION',
  description: '断面特性データ',
  sheetKey: 'sectionSheetDataState',
  data: [
    createSectionHeader(),
    createSectionHeader(),
    createSectionRow('Rect-500', 23500, 0.25, 0.00521, 0.00521, 0.25, 0.25, 0.25, 0.25, 0.00694, '矩形'),
    createSectionRow('Rect-400', 23500, 0.16, 0.00213, 0.00213, 0.2, 0.2, 0.2, 0.2, 0.00284, '矩形'),
    createSectionRow('H-300', 200000, 0.0119, 0.000201, 0.0000675, 0.15, 0.15, 0.15, 0.15, 0.000000985, 'H-断面'),
  ],
};

// ============================================================================
// PLN_SECT example data (平板断面)
// VBA: Class080_PlnSect, row=3, col=2-7 (6 cols: B~G)
// Columns: B(断面名称), C(?), D(?), E(?), F(厚さ), G(材料名称)
// ============================================================================
export const PLN_SECT_EXAMPLE: ExampleDataSet = {
  id: 'plnSect',
  label: 'PLN_SECT',
  description: '平板断面データ',
  sheetKey: 'plnSectSheetDataState',
  data: [
    ['断面名称', '', '', '', '厚さ：(m)', '材料'],
    ['Slab-200', '', '', '', 0.2, 'Concrete-21'],
    ['Slab-150', '', '', '', 0.15, 'Concrete-21'],
  ],
};

// ============================================================================
// PLANE_ELEMENT example data (平板要素)
// VBA: Class030_PlnElm, row=3, col=2-9 (8 cols: B~I)
// Columns: B(要素名称), C(タイプ), D(節点リスト), E(ov.), F(断面名称), G(鉄筋断面), H(Cx), I(Cy)
// ============================================================================
export const PLANE_ELEMENT_EXAMPLE: ExampleDataSet = {
  id: 'planeElement',
  label: 'PLANE_ELEMENT',
  description: '平板要素データ',
  sheetKey: 'planeElementSheetDataState',
  data: [
    ['要素名称', 'タイプ', '節点リスト', 'ov.', '断面名称', '鉄筋断面', 'Cx', 'Cy'],
    ['P101', 'PLATE', 'N10,N11,N12,N13', '', 'Slab-200', '', '', ''],
  ],
};

// ============================================================================
// RIGID example data (剛体要素)
// VBA: Class040_Rigid, row=3, col=2-4 (3 cols: B~D)
// Columns: B(要素名称), C(マスター節点), D(スレーブ節点リスト)
// ============================================================================
export const RIGID_EXAMPLE: ExampleDataSet = {
  id: 'rigid',
  label: 'RIGID',
  description: '剛体要素データ',
  sheetKey: 'rigidSheetDataState',
  data: [
    ['要素名称', 'マスター節点', 'スレーブ節点'],
    ['R1', 'N2', 'N6,N7,N8'],
    ['R2', 'N4', 'N9'],
  ],
};

// ============================================================================
// FULCRUM example data (支点)
// VBA: Class160_Fulcrum, row=3, col=2-13 (12 cols: B~M)
// Columns: B(支点名), C(?), D(節点名), E(Dx), F(Dy), G(Dz), H(Rx), I(Ry), J(Rz), K-M
// DOF values: 自由, 固定, ばね
// ============================================================================
export const FULCRUM_EXAMPLE: ExampleDataSet = {
  id: 'fulcrum',
  label: 'FULCRUM',
  description: '支点データ',
  sheetKey: 'fulcrumSheetDataState',
  data: [
    ['支点名', '', '節点名', 'Dx', 'Dy', 'Dz', 'Rx', 'Ry', 'Rz', '', '', ''],
    ['Fix1', '', 'N1', '固定', '固定', '固定', '固定', '固定', '固定', '', '', ''],
    ['Pin1', '', 'N5', '固定', '固定', '固定', '自由', '自由', '自由', '', '', ''],
    ['Spr1', '', 'N10', 'ばね', 'ばね', 'ばね', '自由', '自由', '自由', '', '', ''],
  ],
};

// ============================================================================
// FULC_DETAIL example data (支点詳細)
// VBA: Class170_FulcDetail, row=4, col=2-21 (20 cols: B~U)
// For spring supports (ばね)
// ============================================================================
const createFulcDetailHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(20).fill('');
  header[0] = '支点名';
  header[1] = 'SDx';
  header[2] = 'SDy';
  header[3] = 'SDz';
  header[4] = 'SRx';
  header[5] = 'SRy';
  header[6] = 'SRz';
  return header;
};

export const FULC_DETAIL_EXAMPLE: ExampleDataSet = {
  id: 'fulcDetail',
  label: 'FULC_DETAIL',
  description: '支点詳細データ',
  sheetKey: 'fulcrumDetailSheetDataState',
  data: [
    createFulcDetailHeader(),
    createFulcDetailHeader(),
    ['Spr1', 1000000, 1000000, 1000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

// ============================================================================
// NODAL_MASS example data (節点質量)
// VBA: Class180_NodalMass, row=4, col=2-11 (10 cols: B~K)
// Coordinate transform: ES(mX,mY,mZ) -> MCT(mX,mZ,mY)
// ============================================================================
const createNodalMassRow = (
  nodeName: string,
  mX: number, mY: number, mZ: number,
  rmX: number = 0, rmY: number = 0, rmZ: number = 0
): (string | number)[] => {
  const row: (string | number)[] = new Array(10).fill('');
  row[0] = nodeName;
  row[4] = mX;
  row[5] = mY;
  row[6] = mZ;
  row[7] = rmX;
  row[8] = rmY;
  row[9] = rmZ;
  return row;
};

const createNodalMassHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(10).fill('');
  header[0] = '節点名称';
  header[4] = 'mX(tonf)';
  header[5] = 'mY(tonf)';
  header[6] = 'mZ(tonf)';
  header[7] = 'rmX';
  header[8] = 'rmY';
  header[9] = 'rmZ';
  return header;
};

export const NODAL_MASS_EXAMPLE: ExampleDataSet = {
  id: 'nodalMass',
  label: 'NODAL_MASS',
  description: '節点質量データ',
  sheetKey: 'nodalMassSheetDataState',
  data: [
    createNodalMassHeader(),
    createNodalMassHeader(),
    createNodalMassRow('N2', 100, 150, 200),
    createNodalMassRow('N3', 50, 75, 100),
    createNodalMassRow('N4', 25, 30, 35, 1, 2, 3),
  ],
};

// ============================================================================
// LOAD example data (荷重値)
// VBA: Class190_Load, row=3, col=2-20 (19 cols: B~T)
// Load types: ノード-集中荷重, フレーム要素-分布荷重(単独), 温度荷重, etc.
// ============================================================================
const createLoadRow = (
  loadType: string,
  loadCase: string,
  actionType: string,
  target: string,
  value1: number | string,
  value2: number | string = '',
  direction: string = '',
  eccentricity: number | string = ''
): (string | number)[] => {
  const row: (string | number)[] = new Array(19).fill('');
  row[1] = loadType;
  row[2] = loadCase;
  row[3] = actionType;
  row[4] = target;
  row[5] = value1;
  row[6] = value2;
  row[11] = eccentricity;
  row[13] = direction;
  return row;
};

const createLoadHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(19).fill('');
  header[1] = '荷重タイプ';
  header[2] = 'ケース名';
  header[3] = '作用タイプ';
  header[4] = '対象';
  header[5] = 'P1';
  header[6] = 'P2';
  header[11] = '偏心';
  header[12] = '座標タイプ';
  header[13] = '方向';
  return header;
};

export const LOAD_EXAMPLE: ExampleDataSet = {
  id: 'load',
  label: 'LOAD',
  description: '荷重データ',
  sheetKey: 'loadSheetDataState',
  data: [
    createLoadHeader(),
    createLoadRow('ノード-集中荷重', 'Dead', '並進荷重', 'N2', -100, '', '全体 Z'),
    createLoadRow('ノード-集中荷重', 'Dead', '並進荷重', 'N3,N4', -50, '', '全体 Z'),
    createLoadRow('フレーム要素-分布荷重(単独)', 'Live', '並進荷重', 'E1', -10, -10, '全体 Z'),
    createLoadRow('フレーム要素-分布荷重(単独)', 'Live', '並進荷重', 'E2', -10, -10, '全体 Z'),
    createLoadRow('温度荷重', 'Temp', '', 'E1', 30),
  ],
};

// ============================================================================
// INTERNAL_FORCE example data (内力)
// VBA: Class200_InternalForce, row=3, col=2-12 (11 cols: B~L)
// Mz values are sign-inverted in conversion
// ============================================================================
const createInternalForceRow = (
  elemId: string,
  axialI: number, axialJ: number,
  momentZI: number, momentYI: number,
  momentZJ: number, momentYJ: number,
  torsionI: number, torsionJ: number
): (string | number)[] => {
  const row: (string | number)[] = new Array(11).fill('');
  row[2] = elemId;
  row[3] = axialI;
  row[4] = axialJ;
  row[5] = momentZI;
  row[6] = momentYI;
  row[7] = momentZJ;
  row[8] = momentYJ;
  row[9] = torsionI;
  row[10] = torsionJ;
  return row;
};

const createInternalForceHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(11).fill('');
  header[2] = '要素';
  header[3] = '軸力-i';
  header[4] = '軸力-j';
  header[5] = 'Mz-i';
  header[6] = 'My-i';
  header[7] = 'Mz-j';
  header[8] = 'My-j';
  header[9] = 'T-i';
  header[10] = 'T-j';
  return header;
};

export const INTERNAL_FORCE_EXAMPLE: ExampleDataSet = {
  id: 'internalForce',
  label: 'INTERNAL_FORCE',
  description: '内力データ',
  sheetKey: 'internalForceSheetDataState',
  data: [
    createInternalForceHeader(),
    createInternalForceRow('E1', 100, 100, 30, 50, 30, 50, 10, 10),
    createInternalForceRow('E2', 200, 200, 60, 80, 60, 80, 20, 20),
  ],
};

// ============================================================================
// ELEM_SPRING example data (ばね要素)
// VBA: Class110_ElemSpring, row=4, col=2-9 (8 cols: B~I)
// Columns: B(要素名), C(i-節点), D(j-節点), E(参照要素/座標系), F(ばね名), G(?), H(?), I(?)
// ============================================================================
const createSpringHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(8).fill('');
  header[0] = '要素名';
  header[1] = 'i-節点';
  header[2] = 'j-節点';
  header[3] = '座標系';
  header[4] = 'ばね名';
  return header;
};

export const ELEM_SPRING_EXAMPLE: ExampleDataSet = {
  id: 'elemSpring',
  label: 'ELEM_SPRING',
  description: 'ばね要素データ',
  sheetKey: 'springSheetDataState',
  data: [
    createSpringHeader(),
    createSpringHeader(),
    ['SPR1', 'N2', 'N6', 'X,Y,v1,xl', 'Spring-A', '', '', ''],
    ['SPR2', 'N3', 'N7', 'X,Y,v1,xl', 'Spring-B', '', '', ''],
  ],
};

// ============================================================================
// SPG_6COMP example data (ばね特性表_6成分概要)
// VBA: Class120_SPG6Comp, row=4, col=2-15 (14 cols: B~O)
// Defines hysteresis type for each DOF component
// ============================================================================
const createSpg6CompHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(14).fill('');
  header[0] = 'ばね名';
  header[1] = 'Dx成分';
  header[2] = 'Dx詳細';
  header[3] = 'Dy成分';
  header[4] = 'Dy詳細';
  header[5] = 'Dz成分';
  header[6] = 'Dz詳細';
  header[7] = 'Rx成分';
  header[8] = 'Rx詳細';
  header[9] = 'Ry成分';
  header[10] = 'Ry詳細';
  header[11] = 'Rz成分';
  header[12] = 'Rz詳細';
  return header;
};

export const SPG_6COMP_EXAMPLE: ExampleDataSet = {
  id: 'spg6Comp',
  label: 'SPG_6COMP',
  description: 'ばね特性6成分概要データ',
  sheetKey: 'spg6CompSheetDataState',
  data: [
    createSpg6CompHeader(),
    createSpg6CompHeader(),
    ['Spring-A', 'バイリニア (対称)', '', '自由', '', '自由', '', '自由', '', '自由', '', '自由', '', ''],
    ['Spring-B', '線形', '', 'バイリニア (対称)', '', '自由', '', '自由', '', '自由', '', '自由', '', ''],
  ],
};

// ============================================================================
// SPG_ALL_SYM_LINEAR example data (ばね特性表_成分一覧(対称) - 線形)
// VBA: Class130_SPGAllSym, Linear table: col 2-13 (12 cols: B~M)
// ============================================================================
const createSpgSymLinearHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(12).fill('');
  header[0] = 'ばね名';
  header[1] = '成分';
  header[2] = 'K';
  return header;
};

export const SPG_ALL_SYM_LINEAR_EXAMPLE: ExampleDataSet = {
  id: 'spgAllSymLinear',
  label: 'SPG_SYM_LINEAR',
  description: 'ばね成分一覧(対称・線形)',
  sheetKey: 'spgAllSymLinearSheetDataState',
  data: [
    createSpgSymLinearHeader(),
    createSpgSymLinearHeader(),
    ['Spring-B', 'Dx', 10000, '', '', '', '', '', '', '', '', ''],
  ],
};

// ============================================================================
// SPG_ALL_SYM_BILINEAR example data (ばね特性表_成分一覧(対称) - バイリニア)
// VBA: Class130_SPGAllSym, Bilinear table: col 15-30 (16 cols: O~AD)
// ============================================================================
const createSpgSymBilinearHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(16).fill('');
  header[0] = 'ばね名';
  header[1] = '成分';
  header[2] = 'K1';
  header[3] = 'D1';
  header[4] = 'K2';
  return header;
};

export const SPG_ALL_SYM_BILINEAR_EXAMPLE: ExampleDataSet = {
  id: 'spgAllSymBilinear',
  label: 'SPG_SYM_BILINEAR',
  description: 'ばね成分一覧(対称・バイリニア)',
  sheetKey: 'spgAllSymBilinearSheetDataState',
  data: [
    createSpgSymBilinearHeader(),
    createSpgSymBilinearHeader(),
    ['Spring-A', 'Dx', 50000, 0.01, 5000, '', '', '', '', '', '', '', '', '', '', ''],
    ['Spring-B', 'Dy', 30000, 0.02, 3000, '', '', '', '', '', '', '', '', '', '', ''],
  ],
};

// ============================================================================
// HINGE_ASS example data (M-φ特性表)
// VBA: Class100_Hinge_Ass, row=4, col=2-15 (14 cols: B~O)
// ============================================================================
const createHingeAssHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(14).fill('');
  header[0] = '特性名';
  header[1] = '要素';
  header[2] = 'yp';
  header[3] = 'zp';
  return header;
};

export const HINGE_ASS_EXAMPLE: ExampleDataSet = {
  id: 'hingeAss',
  label: 'HINGE_ASS',
  description: 'M-φ特性表データ',
  sheetKey: 'hingeAssSheetDataState',
  data: [
    createHingeAssHeader(),
    createHingeAssHeader(),
    ['Hinge-A', 'E1', 'トリリニア(対称)Takeda', 'トリリニア(対称)Takeda', '', '', '', '', '', '', '', '', '', ''],
    ['Hinge-B', 'E2', 'バイリニア(対称)', 'バイリニア(対称)', '', '', '', '', '', '', '', '', '', ''],
  ],
};

// ============================================================================
// HINGE_PROP_ZP example data (M-φ要素詳細 - zp)
// VBA: Class090_Hinge_Prop, zp region: row=4, col=2-25 (24 cols: B~Y)
// ============================================================================
const createHingePropHeader = (): (string | number)[] => {
  const header: (string | number)[] = new Array(24).fill('');
  header[0] = '特性名';
  header[1] = 'M1';
  header[2] = 'φ1';
  header[3] = 'M2';
  header[4] = 'φ2';
  header[5] = 'M3';
  header[6] = 'φ3';
  return header;
};

export const HINGE_PROP_ZP_EXAMPLE: ExampleDataSet = {
  id: 'hingePropZp',
  label: 'HINGE_PROP_ZP',
  description: 'M-φ要素詳細(zp軸)',
  sheetKey: 'hingePropZpSheetDataState',
  data: [
    createHingePropHeader(),
    createHingePropHeader(),
    (() => {
      const row: (string | number)[] = new Array(24).fill('');
      row[0] = 'Hinge-A';
      row[1] = 100; row[2] = 0.001;
      row[3] = 200; row[4] = 0.005;
      row[5] = 250; row[6] = 0.02;
      return row;
    })(),
    (() => {
      const row: (string | number)[] = new Array(24).fill('');
      row[0] = 'Hinge-B';
      row[1] = 80; row[2] = 0.001;
      row[3] = 150; row[4] = 0.01;
      return row;
    })(),
  ],
};

// ============================================================================
// HINGE_PROP_YP example data (M-φ要素詳細 - yp)
// VBA: Class090_Hinge_Prop, yp region: row=4, col=27-50 (24 cols: AA~AX)
// ============================================================================
export const HINGE_PROP_YP_EXAMPLE: ExampleDataSet = {
  id: 'hingePropYp',
  label: 'HINGE_PROP_YP',
  description: 'M-φ要素詳細(yp軸)',
  sheetKey: 'hingePropYpSheetDataState',
  data: [
    createHingePropHeader(),
    createHingePropHeader(),
    (() => {
      const row: (string | number)[] = new Array(24).fill('');
      row[0] = 'Hinge-A';
      row[1] = 80; row[2] = 0.001;
      row[3] = 160; row[4] = 0.005;
      row[5] = 200; row[6] = 0.02;
      return row;
    })(),
    (() => {
      const row: (string | number)[] = new Array(24).fill('');
      row[0] = 'Hinge-B';
      row[1] = 60; row[2] = 0.001;
      row[3] = 120; row[4] = 0.01;
      return row;
    })(),
  ],
};

// ============================================================================
// Example Groups for UI organization
// ============================================================================
export const EXAMPLE_GROUPS: ExampleGroup[] = [
  {
    id: 'basic',
    label: '基本',
    description: 'NODE, MATERIAL',
    examples: [NODE_EXAMPLE, MATERIAL_EXAMPLE],
  },
  {
    id: 'section',
    label: '断面',
    description: 'SECTION, PLN_SECT',
    examples: [SECTION_EXAMPLE, PLN_SECT_EXAMPLE],
  },
  {
    id: 'element',
    label: '要素',
    description: 'FRAME, PLANE, RIGID',
    examples: [FRAME_EXAMPLE, PLANE_ELEMENT_EXAMPLE, RIGID_EXAMPLE],
  },
  {
    id: 'support',
    label: '支点',
    description: 'FULCRUM, FULC_DETAIL',
    examples: [FULCRUM_EXAMPLE, FULC_DETAIL_EXAMPLE],
  },
  {
    id: 'spring',
    label: 'ばね',
    description: 'ELEM_SPRING, SPG_6COMP, SPG_ALL_SYM',
    examples: [ELEM_SPRING_EXAMPLE, SPG_6COMP_EXAMPLE, SPG_ALL_SYM_LINEAR_EXAMPLE, SPG_ALL_SYM_BILINEAR_EXAMPLE],
  },
  {
    id: 'hinge',
    label: 'ヒンジ',
    description: 'HINGE_PROP, HINGE_ASS',
    examples: [HINGE_ASS_EXAMPLE, HINGE_PROP_ZP_EXAMPLE, HINGE_PROP_YP_EXAMPLE],
  },
  {
    id: 'load',
    label: '荷重',
    description: 'LOAD, NODAL_MASS, INTERNAL_FORCE',
    examples: [LOAD_EXAMPLE, NODAL_MASS_EXAMPLE, INTERNAL_FORCE_EXAMPLE],
  },
];

// All example data sets (flat list for backward compatibility)
export const EXAMPLE_DATA_SETS: ExampleDataSet[] = [
  NODE_EXAMPLE,
  MATERIAL_EXAMPLE,
  FRAME_EXAMPLE,
  SECTION_EXAMPLE,
  PLN_SECT_EXAMPLE,
  PLANE_ELEMENT_EXAMPLE,
  RIGID_EXAMPLE,
  FULCRUM_EXAMPLE,
  FULC_DETAIL_EXAMPLE,
  LOAD_EXAMPLE,
  NODAL_MASS_EXAMPLE,
  INTERNAL_FORCE_EXAMPLE,
  ELEM_SPRING_EXAMPLE,
  SPG_6COMP_EXAMPLE,
  SPG_ALL_SYM_LINEAR_EXAMPLE,
  SPG_ALL_SYM_BILINEAR_EXAMPLE,
  HINGE_ASS_EXAMPLE,
  HINGE_PROP_ZP_EXAMPLE,
  HINGE_PROP_YP_EXAMPLE,
];

// Get example data by id
export function getExampleDataById(id: string): ExampleDataSet | undefined {
  return EXAMPLE_DATA_SETS.find(set => set.id === id);
}

// Get example group by id
export function getExampleGroupById(id: string): ExampleGroup | undefined {
  return EXAMPLE_GROUPS.find(group => group.id === id);
}
