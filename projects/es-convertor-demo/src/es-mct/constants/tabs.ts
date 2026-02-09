// 탭 설정 상수 — VBA 클래스별 읽기 범위(nReadSTRow/STCol/EDCol) 반영
import type { ColDef } from 'ag-grid-community';
import type { TabId } from '../types';

/** 읽기 범위: VBA GetData() 호출 시 사용하는 시트 읽기 좌표 */
export interface ReadRange {
  startRow: number;
  startCol: number;
  endCol: number;
}

/** 탭 설정 인터페이스 */
export interface TabConfig {
  id: TabId;
  labelKey: string;       // i18n 키 (tabs.*)
  groupKey: string;       // i18n 키 (groups.*)
  icon: string;
  esRange: string;        // 표시용 ES 시트 컬럼 범위
  sheetName: string;      // ES 엑셀 시트명 (일본어)
  readRange: ReadRange;   // VBA nReadSTRow, nReadSTCol, nReadEDCol
  colDefs: ColDef[];      // ag-grid 컬럼 정의
  parent?: string;        // 같은 시트의 다른 테이블 구분용 부모명
}

/** 그룹 설정 */
export interface TabGroupConfig {
  groupKey: string;
  icon: string;
  tabs: TabConfig[];
}

// 유틸: 컬럼 헤더 목록으로 ColDef[] 생성
function cols(headers: string[]): ColDef[] {
  return headers.map((h, i) => ({
    headerName: h,
    field: `col${i}`,
    flex: 1,
    minWidth: 80,
  }));
}

// ── 탭 그룹 정의 ──
export const TAB_GROUPS: TabGroupConfig[] = [
  {
    groupKey: 'groups.geometry',
    icon: '◇',
    tabs: [
      {
        id: 'node',
        labelKey: 'tabs.node',
        groupKey: 'groups.geometry',
        icon: '◇',
        esRange: 'B~F',
        sheetName: '節点座標',
        readRange: { startRow: 3, startCol: 2, endCol: 6 },
        colDefs: cols(['節点名', 'X', 'Y', 'Z', '備考']),
      },
    ],
  },
  {
    groupKey: 'groups.elements',
    icon: '▣',
    tabs: [
      {
        id: 'frame',
        labelKey: 'tabs.frame',
        groupKey: 'groups.elements',
        icon: '▣',
        esRange: 'B~K',
        sheetName: 'フレーム要素',
        readRange: { startRow: 3, startCol: 2, endCol: 11 },
        colDefs: cols(['要素名', '節点i', '節点j', 'グループ', '断面i', '断面j', '要素座標系', '参照節点', '要素タイプ', '備考']),
      },
      {
        id: 'plnelm',
        labelKey: 'tabs.plnelm',
        groupKey: 'groups.elements',
        icon: '▣',
        esRange: 'B~I',
        sheetName: '平板要素',
        readRange: { startRow: 3, startCol: 2, endCol: 9 },
        colDefs: cols(['要素名', '節点1', '節点2', '節点3', '節点4', '断面', 'グループ', '備考']),
      },
      {
        id: 'rigid',
        labelKey: 'tabs.rigid',
        groupKey: 'groups.elements',
        icon: '▣',
        esRange: 'B~D',
        sheetName: '剛体要素',
        readRange: { startRow: 3, startCol: 2, endCol: 4 },
        colDefs: cols(['要素名', 'Master', 'Slave']),
      },
    ],
  },
  {
    groupKey: 'groups.materialSection',
    icon: '▤',
    tabs: [
      {
        id: 'material',
        labelKey: 'tabs.material',
        groupKey: 'groups.materialSection',
        icon: '▤',
        esRange: 'B~J',
        sheetName: '材料',
        readRange: { startRow: 3, startCol: 2, endCol: 10 },
        colDefs: cols(['材料名', 'タイプ', '強度', 'ヤング係数', '単位重量', '降伏強度', '引張強度', '伸び', '備考']),
      },
      {
        id: 'numbsect',
        labelKey: 'tabs.numbsect',
        groupKey: 'groups.materialSection',
        icon: '▤',
        esRange: 'B~Q',
        sheetName: '数値断面',
        readRange: { startRow: 3, startCol: 2, endCol: 17 },
        colDefs: cols(['断面名', 'A', 'Asy', 'Asz', 'Ixx', 'Iyy', 'Izz', '材料', 'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15']),
      },
      {
        id: 'sectelem',
        labelKey: 'tabs.sectelem',
        groupKey: 'groups.materialSection',
        icon: '▤',
        esRange: 'B~M',
        sheetName: '断面要素',
        readRange: { startRow: 3, startCol: 2, endCol: 13 },
        colDefs: cols(['断面名', 'i端', 'j端', '材料', 'タイプ', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10', 'col11']),
      },
      {
        id: 'sect',
        labelKey: 'tabs.sect',
        groupKey: 'groups.materialSection',
        icon: '▤',
        esRange: 'B~AD',
        sheetName: '断面特性ｵﾌﾟｼｮﾝ',
        readRange: { startRow: 4, startCol: 2, endCol: 30 },
        colDefs: cols(Array.from({ length: 29 }, (_, i) => i === 0 ? '断面名' : `col${i}`)),
      },
      {
        id: 'plnsect',
        labelKey: 'tabs.plnsect',
        groupKey: 'groups.materialSection',
        icon: '▤',
        esRange: 'B~G',
        sheetName: '平板断面',
        readRange: { startRow: 3, startCol: 2, endCol: 7 },
        colDefs: cols(['断面名', 'タイプ', '材料', '厚さ', '材料2', '備考']),
      },
    ],
  },
  {
    groupKey: 'groups.nonlinear',
    icon: '⟟',
    tabs: [
      {
        id: 'hinge_zp',
        labelKey: 'tabs.hinge_zp',
        groupKey: 'groups.nonlinear',
        icon: '⟟',
        esRange: 'B~Y',
        sheetName: 'M-φ要素詳細',
        readRange: { startRow: 4, startCol: 2, endCol: 25 },
        colDefs: cols(Array.from({ length: 24 }, (_, i) => i === 0 ? '要素名' : `col${i}`)),
        parent: 'M-φ要素詳細',
      },
      {
        id: 'hinge_yp',
        labelKey: 'tabs.hinge_yp',
        groupKey: 'groups.nonlinear',
        icon: '⟟',
        esRange: 'AA~AX',
        sheetName: 'M-φ要素詳細',
        readRange: { startRow: 4, startCol: 27, endCol: 50 },
        colDefs: cols(Array.from({ length: 24 }, (_, i) => i === 0 ? '要素名' : `col${i}`)),
        parent: 'M-φ要素詳細',
      },
      {
        id: 'hinge_ass',
        labelKey: 'tabs.hinge_ass',
        groupKey: 'groups.nonlinear',
        icon: '⟟',
        esRange: 'B~O',
        sheetName: 'M-φ特性表',
        readRange: { startRow: 3, startCol: 2, endCol: 15 },
        colDefs: cols(Array.from({ length: 14 }, (_, i) => i === 0 ? '要素名' : `col${i}`)),
      },
    ],
  },
  {
    groupKey: 'groups.spring',
    icon: '⌇',
    tabs: [
      {
        id: 'spring_elem',
        labelKey: 'tabs.spring_elem',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'B~I',
        sheetName: 'ばね要素',
        readRange: { startRow: 4, startCol: 2, endCol: 9 },
        colDefs: cols(['要素名', '節点i', '節点j', '特性', '座標系', 'col5', 'col6', 'col7']),
      },
      {
        id: 'spg6comp',
        labelKey: 'tabs.spg6comp',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'B~O',
        sheetName: 'ばね特性表_6成分概要',
        readRange: { startRow: 3, startCol: 2, endCol: 15 },
        colDefs: cols(Array.from({ length: 14 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
      },
      {
        id: 'spg_sym_lin',
        labelKey: 'tabs.spg_sym_lin',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'B~M',
        sheetName: 'ばね特性表_成分一覧(対称)',
        readRange: { startRow: 3, startCol: 2, endCol: 13 },
        colDefs: cols(Array.from({ length: 12 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '対称',
      },
      {
        id: 'spg_sym_bi',
        labelKey: 'tabs.spg_sym_bi',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'O~Z',
        sheetName: 'ばね特性表_成分一覧(対称)',
        readRange: { startRow: 3, startCol: 15, endCol: 26 },
        colDefs: cols(Array.from({ length: 12 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '対称',
      },
      {
        id: 'spg_sym_tri',
        labelKey: 'tabs.spg_sym_tri',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'AF~AX',
        sheetName: 'ばね特性表_成分一覧(対称)',
        readRange: { startRow: 3, startCol: 32, endCol: 50 },
        colDefs: cols(Array.from({ length: 19 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '対称',
      },
      {
        id: 'spg_sym_tet',
        labelKey: 'tabs.spg_sym_tet',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'AZ~BZ',
        sheetName: 'ばね特性表_成分一覧(対称)',
        readRange: { startRow: 3, startCol: 52, endCol: 78 },
        colDefs: cols(Array.from({ length: 27 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '対称',
      },
      {
        id: 'spg_asym_bi',
        labelKey: 'tabs.spg_asym_bi',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'B~Z',
        sheetName: 'ばね特性表_成分一覧(非対称)',
        readRange: { startRow: 3, startCol: 2, endCol: 26 },
        colDefs: cols(Array.from({ length: 25 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '非対称',
      },
      {
        id: 'spg_asym_tri',
        labelKey: 'tabs.spg_asym_tri',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'AB~BD',
        sheetName: 'ばね特性表_成分一覧(非対称)',
        readRange: { startRow: 3, startCol: 28, endCol: 56 },
        colDefs: cols(Array.from({ length: 29 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '非対称',
      },
      {
        id: 'spg_asym_tet',
        labelKey: 'tabs.spg_asym_tet',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'BF~CX',
        sheetName: 'ばね特性表_成分一覧(非対称)',
        readRange: { startRow: 3, startCol: 58, endCol: 100 },
        colDefs: cols(Array.from({ length: 43 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: '非対称',
      },
      {
        id: 'spg_other_rub',
        labelKey: 'tabs.spg_other_rub',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'B~L',
        sheetName: 'ばね特性表_成分一覧(その他)',
        readRange: { startRow: 3, startCol: 2, endCol: 12 },
        colDefs: cols(Array.from({ length: 11 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: 'その他',
      },
      {
        id: 'spg_other_bmr',
        labelKey: 'tabs.spg_other_bmr',
        groupKey: 'groups.spring',
        icon: '⌇',
        esRange: 'N~Y',
        sheetName: 'ばね特性表_成分一覧(その他)',
        readRange: { startRow: 3, startCol: 14, endCol: 25 },
        colDefs: cols(Array.from({ length: 12 }, (_, i) => i === 0 ? '特性名' : `col${i}`)),
        parent: 'その他',
      },
    ],
  },
  {
    groupKey: 'groups.boundary',
    icon: '▽',
    tabs: [
      {
        id: 'fulcrum',
        labelKey: 'tabs.fulcrum',
        groupKey: 'groups.boundary',
        icon: '▽',
        esRange: 'B~M',
        sheetName: '支点',
        readRange: { startRow: 3, startCol: 2, endCol: 13 },
        colDefs: cols(['節点名', 'グループ', 'タイプ', 'Dx', 'Dy', 'Dz', 'Rx', 'Ry', 'Rz', 'col9', 'col10', 'col11']),
      },
      {
        id: 'fulcdetail',
        labelKey: 'tabs.fulcdetail',
        groupKey: 'groups.boundary',
        icon: '▽',
        esRange: 'B~U',
        sheetName: '支点詳細',
        readRange: { startRow: 3, startCol: 2, endCol: 21 },
        colDefs: cols(Array.from({ length: 20 }, (_, i) => i === 0 ? 'タイプ名' : `col${i}`)),
      },
    ],
  },
  {
    groupKey: 'groups.massLoad',
    icon: '↓',
    tabs: [
      {
        id: 'nodalmass',
        labelKey: 'tabs.nodalmass',
        groupKey: 'groups.massLoad',
        icon: '↓',
        esRange: 'B~K',
        sheetName: '節点質量',
        readRange: { startRow: 4, startCol: 2, endCol: 11 },
        colDefs: cols(['節点名', 'Mx', 'My', 'Mz', 'Ix', 'Iy', 'Iz', 'col7', 'col8', 'col9']),
      },
      {
        id: 'load',
        labelKey: 'tabs.load',
        groupKey: 'groups.massLoad',
        icon: '↓',
        esRange: 'B~T',
        sheetName: '荷重値',
        readRange: { startRow: 3, startCol: 2, endCol: 20 },
        colDefs: cols(Array.from({ length: 19 }, (_, i) => {
          const names: Record<number, string> = { 0: '荷重名', 1: 'タイプ', 2: '要素/節点', 3: '方向', 4: '値' };
          return names[i] ?? `col${i}`;
        })),
      },
    ],
  },
  {
    groupKey: 'groups.results',
    icon: '═',
    tabs: [
      {
        id: 'intforce',
        labelKey: 'tabs.intforce',
        groupKey: 'groups.results',
        icon: '═',
        esRange: 'B~L',
        sheetName: '内力',
        readRange: { startRow: 3, startCol: 2, endCol: 12 },
        colDefs: cols(['要素名', '荷重', 'N', 'Vy', 'Vz', 'T', 'My', 'Mz', 'col8', 'col9', 'col10']),
      },
    ],
  },
];

/** 전체 탭 flat 배열 */
export const ALL_TABS: TabConfig[] = TAB_GROUPS.flatMap(g => g.tabs);

/** TabId로 탭 설정 찾기 */
export function getTabConfig(id: TabId): TabConfig | undefined {
  return ALL_TABS.find(t => t.id === id);
}
