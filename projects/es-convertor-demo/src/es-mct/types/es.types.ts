// ES(Engineer's Studio) 데이터 관련 타입 정의

export const TAB_IDS = [
  'node', 'frame', 'plnelm', 'rigid',
  'material', 'numbsect', 'sectelem', 'sect', 'plnsect',
  'hinge_zp', 'hinge_yp', 'hinge_ass',
  'spring_elem', 'spg6comp',
  'spg_sym_lin', 'spg_sym_bi', 'spg_sym_tri', 'spg_sym_tet',
  'spg_asym_bi', 'spg_asym_tri', 'spg_asym_tet',
  'spg_other_rub', 'spg_other_bmr',
  'fulcrum', 'fulcdetail',
  'nodalmass', 'load', 'intforce',
] as const;

export type TabId = typeof TAB_IDS[number];

/** 각 탭의 원시 데이터: 2D 문자열 배열 (행 × 열) */
export type TabData = Record<TabId, string[][]>;
