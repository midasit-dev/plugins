# VBA vs TypeScript MCT Format Audit Report

> **Date**: 2026-02-04
> **Scope**: 21 VBA 클래스 + main.bas ↔ 21 TypeScript 컨버터 + MCTGenerator.ts
> **Method**: VBA Shift_JIS 디코딩 후 MCT 출력 로직 1:1 비교

---

## Executive Summary

| Category | Count |
|----------|-------|
| **CRITICAL** | 27 |
| **MEDIUM** | 8 |
| **LOW** | 3 |
| **Total Discrepancies** | **38** |
| Converters PASS | 9/21 |
| Converters FAIL | 12/21 |
| Orchestrator FAIL | Yes (4 CRITICAL) |

---

## Batch 1: Node, Material, Unit

### Pair 1: Class010_Node.cls ↔ NodeConverter.ts — **PASS**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 1 | `esNodeCoords` stores post-adjustment coords; VBA stores pre-adjustment | cls:101-107 | NodeConverter.ts:116-128 | LOW |
| 2 | TS sorts output by node number; VBA preserves Excel row order | cls:133-137 | NodeConverter.ts:141 | MEDIUM |

### Pair 2: Class050_Material.cls ↔ MaterialConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 3 | Category key missing "板": `"鋼板材料"` (VBA) vs `"鋼材料"` (TS) | cls:62,81 | mctKeywords.ts:91,99 | **CRITICAL** |
| 4 | FRP key space: `"（FRP） 材料"` (VBA, with space) vs `"（FRP）材料"` (TS, no space) | cls:63 | mctKeywords.ts:92,100 | **CRITICAL** |
| 5 | DB/User logic: VBA triggers DB on category=="鋼板材料" regardless of type; TS requires type=="データベース" | cls:85-89 | MaterialConverter.ts:108-120 | **CRITICAL** |
| 6 | S_or_RC: VBA only 鉄筋材料=STEEL (鋼板材料=RC); TS classifies 鋼材料 as STEEL too | cls:115-119 | MaterialConverter.ts:93-95 | **CRITICAL** |
| 7 | Poisson: VBA always from category dict; TS prefers Excel value if non-zero | cls:123-128 | MaterialConverter.ts:134-139 | **CRITICAL** |
| 8 | Tilde char: Shift_JIS overline ‾ (U+203E) vs ASCII ~ (U+007E) | main.bas:864 | stringUtils.ts:39 | MEDIUM |

### Pair 3: UNIT.bas ↔ unitConversion.ts — **PASS**

No discrepancies. All 4 unit conversion formulas match exactly.

---

## Batch 2: Section Properties

### Pair 4: Class055_NumbSect.cls ↔ SectElemConverter.ts (numbering) — **PASS**

No discrepancies. Internal mapping logic matches.

### Pair 5: Class060_SectElem.cls ↔ SectElemConverter.ts (element) — **PASS**

No discrepancies. Internal mapping logic matches.

### Pair 6: Class070_Sect.cls ↔ SectConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 9 | TAPERED comment line 2: VBA says `; 1st line - VALUE`, TS says `; 1st line - TAPERED` | cls:130 | SectConverter.ts:172 | **CRITICAL** |
| 10 | TAPERED comment lines 3-10: VBA has `(STYPE=VALUE)` suffix, TS missing | cls:131-138 | SectConverter.ts:173-180 | **CRITICAL** |
| 11 | VALUE LT OFFSET: VBA produces `LT,0,0,1,,` (double comma), TS `LT,0,0,1,` (single) | cls:258-261 | SectConverter.ts:246 | **CRITICAL** |
| 12 | TAPERED LT OFFSET: same double comma issue | cls:352-357 | SectConverter.ts:300 | **CRITICAL** |
| 13 | MCTGenerator TAPERED guard `> 10` should be `> 11` (11 comment lines) | cls:183 | MCTGenerator.ts:183 | **CRITICAL** |

### Pair 7: Class080_PlnSect.cls ↔ PlnSectConverter.ts — **PASS**

No discrepancies. Header, data format, and field order all match.

---

## Batch 3: Element Data

### Pair 8: Class020_Frame.cls ↔ FrameConverter.ts — **PASS**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 14 | M-φ要素 detection: TS accepts both full-width and half-width minus (more permissive) | cls:241 | FrameConverter.ts:268 | LOW |

Angle formatting confirmed PASS: VBA `Format(dAngle,"0.00")` assigns to Double return → `CStr` strips trailing zeros. TS `toFixed(2)` + `parseFloat` achieves identical result.

### Pair 9: Class030_PlnElm.cls ↔ PlnElmConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 15 | Triangle padding: VBA `,,` (empty field), TS `,0,` (zero field) | cls:ChangePlnElm | PlnElmConverter.ts:142-144 | **CRITICAL** |

**Fix**: Change `while (parts.length < 8) { parts.push(0); }` to `if (parts.length < 8) { parts.push(''); }`

### Pair 10: Class040_Rigid.cls ↔ RigidConverter.ts — **PASS**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 16 | TS filters invalid slave nodes (defensive); VBA passes through | cls:ChangeRigid | RigidConverter.ts:121-133 | LOW |

---

## Batch 4: Hinge System

### Pair 11: Class090_Hinge_Prop.cls ↔ HingePropConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 17 | Overline ‾ (U+203E) vs tilde ~ (U+007E) in truncated hinge names | main.bas HingeName | stringUtils.ts:77 | **CRITICAL** |
| 18 | `hingeElements` data source: VBA uses Frame-derived set; TS uses HingeAss-derived set | main.bas:446 | MCTGenerator.ts:271 | **CRITICAL** |
| 19 | UseData duplicate guard: VBA checks marker column; TS unconditional overwrite | cls UseData | HingePropConverter.ts:129 | MEDIUM |
| 20 | Name carry-forward: VBA persistent across all rows; TS only looks back 1 row | cls UseData | HingePropConverter.ts:119-124 | MEDIUM |
| 21 | Numeric check: VBA `IsNumeric()` accepts strings; TS `typeof !== 'number'` rejects | cls:208-209 | HingePropConverter.ts:243 | MEDIUM |

HYST map (18 items): PASS. SYM map (18 items): PASS. CheckeHingeType: PASS. IHINGE-PROP/ASSIGN headers: PASS.

### Pair 12: Class100_Hinge_Ass.cls ↔ HingeAssConverter.ts — **PASS**

No local discrepancies. Integration issue (hingeElements source) documented in Pair 11 #18.

---

## Batch 5: Spring System

### Pair 13: Class110_ElemSpring.cls ↔ ElemSpringConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 22 | Suffix char `‾` (U+203E) vs `~` (U+007E) in property names | cls:226,229 | ElemSpringConverter.ts:646,649 | **CRITICAL** |
| 23 | vAngle not set for suffixed properties: VBA sets `[1,3,-2,4,6,-5]`, TS omits | cls:237 | ElemSpringConverter.ts:660-678 | **CRITICAL** |

Vector transformation table (36 items): PASS. NL-LINK header: PASS.

### Pair 14: Class120_SPG6Comp.cls ↔ SPG6CompConverter.ts — **PASS**

All 11 hysteresis type entries and 6 NBI detail entries match exactly.

### Pair 15: Class130_SPGAllSym.cls ↔ SPGAllSymConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 24 | vAngle ignored: TS always uses V_SPG; VBA checks vAngle first → identity mapping for non-ref elements | cls:149-156 | SPGAllSymConverter.ts:506-510 | **CRITICAL** |
| 25 | Comment tilde ‾ vs ~ in `STIFF(1‾4)` | cls:86 | SPGAllSymConverter.ts:464 | MEDIUM |

V_SPG `[1,3,-2,4,6,-5]`: PASS. V_SORT: PASS. Nagoya ratios (6 values): PASS.

### Pair 16: Class140_SPGAllASym.cls ↔ SPGAllASymConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 26 | V_SORT k=6 OOB: VBA retains k=5 value; TS accesses index 6 directly | cls:92-93,107,112 | SPGAllASymConverter.ts:42-45 | **CRITICAL** |
| 27 | J-end extra `NO,NO,...` line not in VBA output | cls:218-225 | SPGAllASymConverter.ts:601-614 | **CRITICAL** |

### Pair 17: Class150_SPGAllOther.cls ↔ SPGAllOtherConverter.ts — **PASS**

Pure data parsing class. No MCT output. Nagoya/BMR data parsing matches.

---

## Batch 6: Support/Constraint

### Pair 18: Class160_Fulcrum.cls ↔ FulcrumConverter.ts — **PASS**

DOF swap (DX,DZ,DY,RX,RZ,RY): PASS. 自由/固定 mapping: PASS. ばね detection: PASS. Headers: PASS.

### Pair 19: Class170_FulcDetail.cls ↔ FulcDetailConverter.ts — **PASS**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 28 | Empty section guard: VBA `nRowCnt > 5`, TS MCTGenerator `> 2` outputs headers-only | cls:130 | MCTGenerator.ts:433 | LOW→should be `> 5` |

All 21 stiffness cell mappings: PASS. Sign inversions (Cel_O, Cel_M): PASS. Headers: PASS.

---

## Batch 7: Mass/Load/Internal Force

### Pair 20: Class180_NodalMass.cls ↔ NodalMassConverter.ts — **PASS**

Coordinate swap (mY↔mZ, rmY↔rmZ): PASS. Headers: PASS. Field order: PASS.

### Pair 21: Class190_Load.cls ↔ LoadConverter.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 29 | Beam concentrated load strType: VBA uses `UNILOAD,`; TS uses `CONLOAD,` | cls:SetBeamLoad 648-668 | LoadConverter.ts:756-760 | **CRITICAL** |
| 30 | Projection flag: VBA assigns YES for nType=6 (continuous); TS for nType=7 (projected) | cls:656 | LoadConverter.ts:747 | **CRITICAL** |
| 31 | CalcVecter: VBA no deg→rad conversion; TS converts (wrong if data is radians) | cls:372-377 | LoadConverter.ts:148-149 | **CRITICAL** |
| 32 | `getStringGen`: TS stub doesn't sort/compress ranges; proper util exists but unused | main.bas:910-968 | LoadConverter.ts:355-362 | **CRITICAL** |
| 33 | `vLoadDir[3-5]`: VBA `LX,LZ,LY` (local); TS `GX,GZ,GY` (global) | cls:654-660 | LoadConverter.ts:834 | **CRITICAL** |
| 34 | STLDCASE data line: TS adds 3 leading spaces | cls:267 | LoadConverter.ts:534 | MEDIUM |
| 35 | All load data lines: TS adds 3 leading spaces not in VBA | cls:various | LoadConverter.ts:547,565,589,609 | MEDIUM |

### Pair 22: Class200_InternalForce.cls ↔ InternalForceConverter.ts — **PASS**

Moment-z sign inversion: PASS. Field order (14 fields): PASS. Headers: PASS.

---

## Orchestration: main.bas ↔ MCTGenerator.ts — **FAIL**

| # | Description | VBA | TS | Severity |
|---|-------------|-----|-----|----------|
| 36 | Section order: VBA outputs ELEMENT before MATERIAL; TS outputs MATERIAL before ELEMENT | main.bas:133-141 | MCTGenerator.ts:137-248 | **CRITICAL** |
| 37 | Fulcrum order: VBA GSPRING(col71) before CONSTRAINT(col76); TS reversed | main.bas:152-153 | MCTGenerator.ts:420-438 | **CRITICAL** |
| 38 | INI-EFORCE position: VBA col91 (before loads); TS Step 18 (after loads) | main.bas:157 | MCTGenerator.ts:480-489 | **CRITICAL** |
| 39 | Missing rigid node CONSTRAINT section from RigidConverter | cls:86-87 | MCTGenerator.ts:241-249 | **CRITICAL** |
| 40 | Header/Unit format unverifiable (VBA uses template file) | -- | MCTGenerator.ts:71-76 | MEDIUM |

Converter dependency order: PASS. `*ENDDATA`: PASS. Empty section skipping: PASS. Spring parsing order (SYM→ASYM→OTHER): PASS.

---

## Consolidated CRITICAL Fixes Required

### Priority 1: MCT Output Order (Orchestration)

**File: `src/generators/MCTGenerator.ts`**

MCT 섹션 출력 순서를 VBA 컬럼 레이아웃에 맞게 변경:

```
*NODE (col 1)
*ELEMENT frame (col 6)        ← 현재 TS: MATERIAL 다음
*ELEMENT plane (col 11)
*RIGIDLINK (col 16)
*MATERIAL (col 21)            ← 현재 TS: ELEMENT 이전
*SECTION value (col 26)
*SECTION tapered (col 31)
*THICKNESS (col 36)
*IHINGE-PROP m-phi (col 41)
*IHINGE-ASSIGN (col 46)
*NL-LINK (col 51)
*VISCOUS-OIL-DAMPER (col 56)
*NL-PROP (col 61)
*IHINGE-PROP spring (col 66)
*GSPRING (col 71)             ← 현재 TS: CONSTRAINT 다음
*CONSTRAINT fulcrum (col 76)  ← 현재 TS: GSPRING 이전
*GSPRTYPE (col 81)
*NODALMASS (col 86)
*INI-EFORCE (col 91)          ← 현재 TS: 하중 섹션 이후
*STLDCASE (col 96)
*CONLOAD (col 101)
*SPDISP (col 106)
*BEAMLOAD (col 111)
*ELTEMPER (col 116)
*CONSTRAINT rigid (col 121)   ← 현재 TS: 누락
```

### Priority 2: Material Converter

**File: `src/constants/mctKeywords.ts`**
- Line 91: `'鋼材料'` → `'鋼板材料'`
- Line 92: `'炭素繊維シート（FRP）材料'` → `'炭素繊維シート（FRP） 材料'` (add space)
- Line 99: `'鋼材料'` → `'鋼板材料'`
- Line 100: Same FRP space fix

**File: `src/converters/MaterialConverter.ts`**
- Lines 93-95: Only `鉄筋材料` = STEEL; `鋼板材料` = RC
- Lines 108-120: DB trigger on `category === "鋼板材料"` OR `type === "データベース"`
- Lines 134-139: Always use category dict for Poisson ratio, ignore Excel input

### Priority 3: Load Converter

**File: `src/converters/LoadConverter.ts`**
- Lines 756-760: Remove `if (nType === 4)` branch → always use `vType[nAction]`
- Line 747: Change `nType === 7` to `nType === 6` for projection flag
- Lines 148-149: Remove `* Math.PI / 180` (VBA uses radians directly)
- Lines 355-362: Replace stub `getStringGen` with `generateNumberRangeString` from stringUtils
- Line 834: Change `['GX','GZ','GY','GX','GZ','GY']` to `['GX','GZ','GY','LX','LZ','LY']`
- Lines 534, 547, 565, 589, 609: Remove 3-space indentation prefix

### Priority 4: Section Converter

**File: `src/converters/SectConverter.ts`**
- Line 172: `; 1st line - TAPERED` → `; 1st line - VALUE`
- Lines 173-180: Add `(STYPE=VALUE)` suffix to all 8 lines
- Line 246: `LT,0,0,1,${row[18]}` → `LT,0,0,1,,${row[18]}` (add extra comma)
- Line 300: Same double comma fix for TAPERED LT offset

**File: `src/generators/MCTGenerator.ts`**
- Line 183: `> 10` → `> 11`

### Priority 5: Spring System

**File: `src/converters/ElemSpringConverter.ts`**
- Lines 646, 649: `~` → `‾` (U+203E) — or keep `~` if MCT reader treats them equivalently
- Lines 660-678: Set `vAngle = [1,3,-2,4,6,-5]` on copied springCompData for suffixed properties

**File: `src/converters/SPGAllSymConverter.ts`**
- Lines 506-510: Check vAngle on spring data; if set, use it instead of V_SPG

**File: `src/converters/SPGAllASymConverter.ts`**
- Lines 42-45: V_SORT should be `[[0,1,2,3,4,5,5],[0,2,1,3,5,4,4]]` to emulate VBA OOB
- Lines 601-614: Remove extra `NO,NO,...` line from J-end section

### Priority 6: Plane Element Converter

**File: `src/converters/PlnElmConverter.ts`**
- Lines 142-144: `while (parts.length < 8) { parts.push(0); }` → `if (parts.length < 8) { parts.push(''); }`

### Priority 7: Hinge System

**File: `src/converters/HingePropConverter.ts`**
- Line 129: Add marker column guard for duplicate name handling
- Lines 119-124: Use persistent name carry-forward (not just previous row)
- Line 243: Use `isNaN(Number(rowZp[i]))` instead of `typeof !== 'number'`

**File: `src/generators/MCTGenerator.ts`**
- Line 271: Wire Frame-derived `hingeElements` instead of HingeAss-derived set

### Priority 8: Tilde Character (Global)

**File: `src/utils/stringUtils.ts`**
- Lines 39, 77: Consider using `‾` (U+203E) instead of `~` (U+007E)
- Applies to: `truncateMaterialName`, `truncateHingeName`
- Also in `ElemSpringConverter.ts` lines 646, 649

> **Note**: If the MCT reader treats byte 0x7E identically regardless of encoding, this is cosmetic. Confirm with MIDAS Civil NX documentation.

---

## Per-Converter Status Summary

| # | VBA Class | TS Converter | Status | CRIT | MED | LOW |
|---|-----------|-------------|--------|------|-----|-----|
| 1 | Class010_Node | NodeConverter | **PASS** | 0 | 1 | 1 |
| 2 | Class020_Frame | FrameConverter | **PASS** | 0 | 0 | 1 |
| 3 | Class030_PlnElm | PlnElmConverter | **FAIL** | 1 | 0 | 0 |
| 4 | Class040_Rigid | RigidConverter | **PASS** | 0 | 0 | 1 |
| 5 | Class050_Material | MaterialConverter | **FAIL** | 5 | 1 | 0 |
| 6 | Class055_NumbSect | SectElemConverter | **PASS** | 0 | 0 | 0 |
| 7 | Class060_SectElem | SectElemConverter | **PASS** | 0 | 0 | 0 |
| 8 | Class070_Sect | SectConverter | **FAIL** | 5 | 0 | 0 |
| 9 | Class080_PlnSect | PlnSectConverter | **PASS** | 0 | 0 | 0 |
| 10 | Class090_Hinge_Prop | HingePropConverter | **FAIL** | 2 | 3 | 0 |
| 11 | Class100_Hinge_Ass | HingeAssConverter | **PASS** | 0 | 0 | 0 |
| 12 | Class110_ElemSpring | ElemSpringConverter | **FAIL** | 2 | 0 | 0 |
| 13 | Class120_SPG6Comp | SPG6CompConverter | **PASS** | 0 | 0 | 0 |
| 14 | Class130_SPGAllSym | SPGAllSymConverter | **FAIL** | 1 | 1 | 0 |
| 15 | Class140_SPGAllASym | SPGAllASymConverter | **FAIL** | 2 | 0 | 0 |
| 16 | Class150_SPGAllOther | SPGAllOtherConverter | **PASS** | 0 | 0 | 0 |
| 17 | Class160_Fulcrum | FulcrumConverter | **PASS** | 0 | 0 | 0 |
| 18 | Class170_FulcDetail | FulcDetailConverter | **PASS** | 0 | 0 | 1 |
| 19 | Class180_NodalMass | NodalMassConverter | **PASS** | 0 | 0 | 0 |
| 20 | Class190_Load | LoadConverter | **FAIL** | 5 | 2 | 0 |
| 21 | Class200_InternalForce | InternalForceConverter | **PASS** | 0 | 0 | 0 |
| -- | main.bas | MCTGenerator.ts | **FAIL** | 4 | 1 | 0 |
| | | **TOTAL** | | **27** | **8** | **3** |

---

## Items Confirmed PASS (No Action Required)

- Unit conversion formulas (N→kN, mm→m, mm²→m²): exact match
- Coordinate transformation ES(X,Y,Z) → MCT(X,-Z,Y): correct
- Node double-point Y -0.001 offset: logic matches
- Section shape map (17 items): all match
- C values (cyP, cyM, czP, czM) column mapping: correct
- Frame angle formatting: VBA `Format→Double→CStr` = TS `toFixed→parseFloat`: same result
- Beta angle table [180,0,180,270]: matches
- HYST map (18 items): matches
- SYM map (18 items): matches
- CheckeHingeType "0.5,1": matches
- V_SPG [1,3,-2,4,6,-5]: matches
- V_SORT arrays: matches
- Nagoya bearing ratios (6 values): matches
- SPG6Comp hysteresis types (11 items): matches
- NBI detail types (6 items): matches
- Fulcrum DOF swap (DX,DZ,DY,RX,RZ,RY): correct
- 自由/固定 → 0/1 mapping: correct
- ばね detection: correct
- FulcDetail 21 cell mappings + sign inversions: all correct
- NodalMass Y-Z swap: correct
- InternalForce Moment-z sign inversion: correct
- InternalForce field order (14 fields): correct
- All 24 MCT section header strings: exact match
- Converter dependency/call order: correct
- Spring parsing order SYM→ASYM→OTHER: correct
- `*ENDDATA` marker: correct
- Empty section skipping: functionally equivalent
