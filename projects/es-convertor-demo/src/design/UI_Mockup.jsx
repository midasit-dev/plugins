import { useState, useRef, useCallback } from "react";

// ── Tab Configuration ──
const TAB_GROUPS = [
  {
    group: "기하",
    icon: "◇",
    tabs: [
      { id: "node", label: "節点座標", cols: ["節点名", "X", "Y", "Z", "備考"], esRange: "B~F" },
    ],
  },
  {
    group: "요소",
    icon: "▣",
    tabs: [
      { id: "frame", label: "フレーム要素", cols: ["要素名","節点i","節点j","グループ","断面i","断面j","要素座標系","参照節点","要素タイプ","備考"], esRange: "B~K" },
      { id: "plnelm", label: "平板要素", cols: ["要素名","節点1","節点2","節点3","節点4","断面","グループ","備考"], esRange: "B~I" },
      { id: "rigid", label: "剛体要素", cols: ["要素名","Master","Slave"], esRange: "B~D" },
    ],
  },
  {
    group: "재료/단면",
    icon: "▤",
    tabs: [
      { id: "material", label: "材料", cols: ["材料名","タイプ","強度","ヤング係数","単位重量","降伏強度","引張強度","伸び","備考"], esRange: "B~J" },
      { id: "numbsect", label: "数値断面", cols: ["断面名","A","Asy","Asz","Ixx","Iyy","Izz","材料","..."], esRange: "B~Q" },
      { id: "sectelem", label: "断面要素", cols: ["断面名","i端","j端","材料","タイプ","..."], esRange: "B~M" },
      { id: "sect", label: "断面特性ｵﾌﾟｼｮﾝ", cols: ["断面名","材料","...","断面形状(AD列)"], esRange: "B~AD" },
      { id: "plnsect", label: "平板断面", cols: ["断面名","タイプ","材料","厚さ","材料","備考"], esRange: "B~G" },
    ],
  },
  {
    group: "비선형",
    icon: "⟟",
    tabs: [
      { id: "hinge_zp", label: "M-φ詳細(zp)", cols: ["要素名","M1","M2","φ1","φ2","..."], esRange: "B~Y", parent: "M-φ要素詳細" },
      { id: "hinge_yp", label: "M-φ詳細(yp)", cols: ["要素名","M1","M2","φ1","φ2","..."], esRange: "AA~AX", parent: "M-φ要素詳細" },
      { id: "hinge_ass", label: "M-φ特性表", cols: ["要素名","タイプ","特性1","..."], esRange: "B~O" },
    ],
  },
  {
    group: "스프링",
    icon: "⌇",
    tabs: [
      { id: "spring_elem", label: "ばね要素", cols: ["要素名","節点i","節点j","特性","座標系","..."], esRange: "B~I" },
      { id: "spg6comp", label: "6成分概要", cols: ["特性名","成分","タイプ","..."], esRange: "B~O" },
      { id: "spg_sym_lin", label: "対称:線形", cols: ["特性名","成分","d-K/d-F","剛性","..."], esRange: "B~M", parent: "対称" },
      { id: "spg_sym_bi", label: "対称:ﾊﾞｲﾘﾆｱ", cols: ["特性名","成分","d1","d2","K1","K2","F1","F2"], esRange: "O~Z", parent: "対称" },
      { id: "spg_sym_tri", label: "対称:ﾄﾘﾘﾆｱ", cols: ["特性名","成分","d1","d2","d3","K1","K2","K3","F1","F2","F3"], esRange: "AF~AX", parent: "対称" },
      { id: "spg_sym_tet", label: "対称:ﾃﾄﾗﾘﾆｱ", cols: ["特性名","成分","..."], esRange: "AZ~BZ", parent: "対称" },
      { id: "spg_asym_bi", label: "非対称:ﾊﾞｲﾘﾆｱ", cols: ["特性名","成分","引張d","引張K","引張F","圧縮d","圧縮K","圧縮F"], esRange: "B~Z", parent: "非対称" },
      { id: "spg_asym_tri", label: "非対称:ﾄﾘﾘﾆｱ", cols: ["特性名","成分","..."], esRange: "AB~BD", parent: "非対称" },
      { id: "spg_asym_tet", label: "非対称:ﾃﾄﾗﾘﾆｱ", cols: ["特性名","成分","..."], esRange: "BF~CX", parent: "非対称" },
      { id: "spg_other_rub", label: "ゴム支承", cols: ["特性名","成分","G","t","A","I"], esRange: "B~L", parent: "その他" },
      { id: "spg_other_bmr", label: "BMRﾀﾞﾝﾊﾟー", cols: ["特性名","成分","..."], esRange: "N~Y", parent: "その他" },
    ],
  },
  {
    group: "경계조건",
    icon: "▽",
    tabs: [
      { id: "fulcrum", label: "支点", cols: ["節点名","グループ","タイプ","Dx","Dy","Dz","Rx","Ry","Rz","..."], esRange: "B~M" },
      { id: "fulcdetail", label: "支点詳細", cols: ["タイプ名","Dx剛性","Dy剛性","Dz剛性","..."], esRange: "B~U" },
    ],
  },
  {
    group: "질량/하중",
    icon: "↓",
    tabs: [
      { id: "nodalmass", label: "節点質量", cols: ["節点名","Mx","My","Mz","Ix","Iy","Iz","..."], esRange: "B~K" },
      { id: "load", label: "荷重値", cols: ["荷重名","タイプ","要素/節点","方向","値","..."], esRange: "B~T" },
    ],
  },
  {
    group: "결과",
    icon: "═",
    tabs: [
      { id: "intforce", label: "内力", cols: ["要素名","荷重","N","Vy","Vz","T","My","Mz","..."], esRange: "B~L" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs.map((t) => ({ ...t, group: g.group, icon: g.icon })));

// ── Mock Data Generator ──
function mockRows(cols, count = 5) {
  return Array.from({ length: count }, (_, r) =>
    Object.fromEntries(cols.map((c, ci) => [c, r === 0 ? "" : `val_${r}_${ci}`]))
  );
}

// ── Sidebar ──
function Sidebar({ activeTab, onSelect, tabDataCounts }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (g) => setCollapsed((p) => ({ ...p, [g]: !p[g] }));

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <span style={styles.logoText}>ES</span>
        <span style={styles.logoArrow}>→</span>
        <span style={styles.logoText}>MCT</span>
      </div>
      <div style={styles.sidebarScroll}>
        {TAB_GROUPS.map((g) => (
          <div key={g.group}>
            <div style={styles.groupHeader} onClick={() => toggle(g.group)}>
              <span style={styles.groupIcon}>{g.icon}</span>
              <span style={styles.groupLabel}>{g.group}</span>
              <span style={styles.chevron}>{collapsed[g.group] ? "▸" : "▾"}</span>
            </div>
            {!collapsed[g.group] &&
              g.tabs.map((t) => {
                const isActive = activeTab === t.id;
                const count = tabDataCounts[t.id] || 0;
                return (
                  <div
                    key={t.id}
                    style={{
                      ...styles.tabItem,
                      ...(isActive ? styles.tabItemActive : {}),
                    }}
                    onClick={() => onSelect(t.id)}
                  >
                    <span style={styles.tabLabel}>{t.label}</span>
                    {count > 0 && <span style={styles.badge}>{count}</span>}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mock AG-Grid ──
function MockGrid({ tab }) {
  const cols = tab.cols;
  const rows = mockRows(cols, 8);

  return (
    <div style={styles.gridWrapper}>
      <div style={styles.gridContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thRowNum }}>#</th>
              {cols.map((c) => (
                <th key={c} style={styles.th}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={ri % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={{ ...styles.td, ...styles.tdRowNum }}>{ri + 1}</td>
                {cols.map((c) => (
                  <td key={c} style={styles.td}>
                    <span style={styles.cellText}>{row[c]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MCT Modal ──
function MctModal({ onClose }) {
  const [version, setVersion] = useState("2025");
  const mctSample2025 = `*NODE    ; Nodes
; iNO, X, Y, Z
1, 0.000, 0.000, 0.000
2, 10.000, 0.000, 0.000
3, 20.000, 0.000, 5.000

*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB
1, Beam, 1, 1, 1, 2, 0.00, 0
2, Beam, 1, 1, 2, 3, 0.00, 0

*MATERIAL    ; Material
; ...`;

  const mctSample2026 = `; MCT Format v2026
*NODE
; iNO, X, Y, Z
1, 0.000, 0.000, 0.000
2, 10.000, 0.000, 0.000

*ELEMENT
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE
1, BEAM, 1, 1, 1, 2, 0.00
...`;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>MCT Convert Result</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Version Tabs */}
        <div style={styles.versionTabs}>
          {["2025", "2026"].map((v) => (
            <button
              key={v}
              style={{
                ...styles.versionTab,
                ...(version === v ? styles.versionTabActive : {}),
              }}
              onClick={() => setVersion(v)}
            >
              MIDAS {v}
            </button>
          ))}
        </div>

        {/* MCT Content */}
        <div style={styles.mctContent}>
          <pre style={styles.mctPre}>
            {version === "2025" ? mctSample2025 : mctSample2026}
          </pre>
        </div>

        {/* Actions */}
        <div style={styles.modalActions}>
          <button style={styles.btnSave}>
            <span style={styles.btnIcon}>📄</span> Save as .mct
          </button>
          <button style={styles.btnApi}>
            <span style={styles.btnIcon}>🔗</span> Send to MIDAS API
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [activeTab, setActiveTab] = useState("node");
  const [showMctModal, setShowMctModal] = useState(false);
  const [tabDataCounts] = useState({ node: 124, frame: 89, material: 6, fulcrum: 12, load: 45 });

  const currentTab = ALL_TABS.find((t) => t.id === activeTab);

  return (
    <div style={styles.app}>
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} tabDataCounts={tabDataCounts} />

      <div style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.tabInfo}>
            <span style={styles.tabInfoIcon}>{currentTab?.icon}</span>
            <span style={styles.tabInfoGroup}>{currentTab?.group}</span>
            <span style={styles.tabInfoSep}>›</span>
            <span style={styles.tabInfoName}>{currentTab?.label}</span>
            {currentTab?.parent && (
              <span style={styles.tabInfoParent}>({currentTab.parent})</span>
            )}
          </div>
          <div style={styles.tabMeta}>
            <span style={styles.metaLabel}>ES Range:</span>
            <code style={styles.metaCode}>{currentTab?.esRange}</code>
            <span style={styles.metaDivider}>|</span>
            <span style={styles.metaLabel}>Rows:</span>
            <span style={styles.metaValue}>{tabDataCounts[activeTab] || 0}</span>
          </div>
        </div>

        {/* Grid Area */}
        <div style={styles.gridArea}>
          <MockGrid tab={currentTab} />
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottomBar}>
          <div style={styles.bottomLeft}>
            <button style={styles.btnImport}>
              <span style={styles.btnIcon}>📥</span> Excel Import
            </button>
            <button style={styles.btnExport}>
              <span style={styles.btnIcon}>📤</span> Excel Export
            </button>
          </div>
          <div style={styles.bottomRight}>
            <button style={styles.btnConvert} onClick={() => setShowMctModal(true)}>
              <span style={styles.btnIcon}>⚡</span> MCT Convert
            </button>
          </div>
        </div>
      </div>

      {showMctModal && <MctModal onClose={() => setShowMctModal(false)} />}
    </div>
  );
}

// ── Styles ──
const C = {
  bg: "#0f1117",
  sidebar: "#161822",
  sidebarHover: "#1e2030",
  surface: "#1a1d2e",
  surfaceAlt: "#141625",
  border: "#252840",
  borderLight: "#2d3154",
  text: "#c8cde0",
  textDim: "#6b7194",
  textBright: "#e8ecf8",
  accent: "#4f8ff7",
  accentDim: "#2a4a8a",
  green: "#3ddc84",
  greenDim: "#1a4d30",
  orange: "#f59e42",
  orangeDim: "#5a3a12",
  red: "#ff6b6b",
};

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: C.bg,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
    color: C.text,
    fontSize: 13,
  },

  // Sidebar
  sidebar: {
    width: 220,
    minWidth: 220,
    background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "16px 16px 12px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: C.accent,
    letterSpacing: 1,
  },
  logoArrow: {
    fontSize: 14,
    color: C.textDim,
  },
  sidebarScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px 4px",
    cursor: "pointer",
    userSelect: "none",
  },
  groupIcon: {
    fontSize: 11,
    color: C.textDim,
    width: 16,
    textAlign: "center",
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: C.textDim,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    flex: 1,
  },
  chevron: {
    fontSize: 10,
    color: C.textDim,
  },
  tabItem: {
    display: "flex",
    alignItems: "center",
    padding: "5px 14px 5px 28px",
    cursor: "pointer",
    transition: "background 0.15s",
    borderLeft: "2px solid transparent",
  },
  tabItemActive: {
    background: C.sidebarHover,
    borderLeft: `2px solid ${C.accent}`,
    color: C.textBright,
  },
  tabLabel: {
    flex: 1,
    fontSize: 12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  badge: {
    fontSize: 10,
    background: C.accentDim,
    color: C.accent,
    padding: "1px 6px",
    borderRadius: 8,
    fontWeight: 600,
  },

  // Main
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  // Top Bar
  topBar: {
    padding: "12px 20px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: C.surfaceAlt,
  },
  tabInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tabInfoIcon: {
    fontSize: 14,
    color: C.accent,
  },
  tabInfoGroup: {
    fontSize: 11,
    color: C.textDim,
    fontWeight: 600,
  },
  tabInfoSep: {
    color: C.textDim,
    fontSize: 12,
  },
  tabInfoName: {
    fontSize: 14,
    fontWeight: 600,
    color: C.textBright,
  },
  tabInfoParent: {
    fontSize: 11,
    color: C.textDim,
    marginLeft: 4,
  },
  tabMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    fontSize: 10,
    color: C.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaCode: {
    fontSize: 11,
    background: C.surface,
    padding: "2px 8px",
    borderRadius: 4,
    color: C.orange,
    border: `1px solid ${C.border}`,
  },
  metaDivider: {
    color: C.border,
  },
  metaValue: {
    fontSize: 12,
    color: C.green,
    fontWeight: 600,
  },

  // Grid
  gridArea: {
    flex: 1,
    overflow: "auto",
    padding: 12,
  },
  gridWrapper: {
    height: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    overflow: "auto",
    background: C.surface,
  },
  gridContainer: {
    minWidth: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    position: "sticky",
    top: 0,
    background: "#1e2038",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    color: C.textDim,
    borderBottom: `2px solid ${C.border}`,
    whiteSpace: "nowrap",
    letterSpacing: 0.5,
    zIndex: 1,
  },
  thRowNum: {
    width: 40,
    textAlign: "center",
    color: C.textDim,
  },
  td: {
    padding: "6px 12px",
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  },
  tdRowNum: {
    textAlign: "center",
    color: C.textDim,
    fontSize: 10,
  },
  trEven: {},
  trOdd: {
    background: "rgba(255,255,255,0.015)",
  },
  cellText: {
    color: C.text,
  },

  // Bottom Bar
  bottomBar: {
    padding: "10px 20px",
    borderTop: `1px solid ${C.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: C.surfaceAlt,
  },
  bottomLeft: {
    display: "flex",
    gap: 8,
  },
  bottomRight: {
    display: "flex",
    gap: 8,
  },
  btnImport: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "transparent",
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  btnExport: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "transparent",
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btnConvert: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 20px",
    background: `linear-gradient(135deg, ${C.accent}, #3d6fd5)`,
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: `0 2px 12px ${C.accentDim}`,
    letterSpacing: 0.5,
  },
  btnIcon: {
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: 720,
    maxWidth: "90vw",
    maxHeight: "85vh",
    background: C.sidebar,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: C.textBright,
    letterSpacing: 0.5,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: C.textDim,
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 4,
  },
  versionTabs: {
    display: "flex",
    padding: "0 20px",
    borderBottom: `1px solid ${C.border}`,
  },
  versionTab: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: C.textDim,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: 0.5,
  },
  versionTabActive: {
    color: C.accent,
    borderBottomColor: C.accent,
  },
  mctContent: {
    flex: 1,
    overflow: "auto",
    padding: 20,
  },
  mctPre: {
    background: C.bg,
    padding: 16,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    color: C.green,
    fontSize: 12,
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-wrap",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "14px 20px",
    borderTop: `1px solid ${C.border}`,
  },
  btnSave: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    background: "transparent",
    border: `1px solid ${C.borderLight}`,
    borderRadius: 6,
    color: C.text,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btnApi: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    background: `linear-gradient(135deg, ${C.green}, #28a060)`,
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: `0 2px 12px ${C.greenDim}`,
  },
};
