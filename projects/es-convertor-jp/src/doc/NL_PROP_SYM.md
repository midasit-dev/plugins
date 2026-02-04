# *NL-PROP (대칭) 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 460-463
If ChangeSheetName.Exists(m_Sheet_SPG6Comp) Then
  If clsSPG6Comp.GetHingeSPG6Comp(dicSPG6Comp) >= 0 Then   ' Line 460: 6성분 개요 읽기
    nCnt = GetSpringData                                     ' Line 461: 전체 스프링 상세 데이터 읽기
    If ChangeSheetName.Exists(m_Sheet_ElmSpr) Then
      Call clsElmSpr.ChangeElemSpring(dicSPG6Comp)           ' Line 462: 스프링 요소 변환
    End If
    Call clsSPGAllSym.ChangeSPGAllSym(dicSPG6Comp)           ' Line 463: 대칭 NL-PROP MCT 출력
    Call clsSPGAllASym.ChangeSPGAllASym(dicSPG6Comp)         ' Line 464: 비대칭 IHINGE-PROP MCT 출력
  End If
End If
```

처리 순서:
1. `Class120_SPG6Comp.GetHingeSPG6Comp()` - 6성분 개요 시트에서 히스테리시스 타입 매핑 읽기
2. `GetSpringData()` (main.bas Line 1060-1290) - 대칭/비대칭/기타 시트에서 상세 데이터 읽기 -> `m_SprCompORG()` 배열에 저장
3. `Class130_SPGAllSym.ChangeSPGAllSym()` - `m_SprComp()` 배열 기반으로 *NL-PROP MCT 출력 생성

### 1.2 데이터 읽기

#### 1.2.1 6성분 개요 (Class120_SPG6Comp.cls)

시트명: `ばね特性表_6成分概要`
읽기 범위: Row 4~, Col B(2)~O(15) → 14열

| 열 (상대) | 내용 |
|-----------|------|
| 0 | 속성명 (strData(0, i)) |
| 1,3,5,7,9,11 | 히스테리시스 타입명 (일본어) |
| 2,4,6,8,10,12 | 상세 타입 (NBI 세부분류) |

**dicData 매핑 (히스테리시스 타입 -> MCT 코드):**
```
自由 → "" (빈값, 처리하지 않음)
固定 → "" (빈값, 처리하지 않음)
線形 → "" (빈값, 처리하지 않음)
名古屋高速ゴム支承 → "LITR"
バイリニア (対称) → "NBI"
バイリニア (非対称) → "NBI"
トリリニア (対称) → "KIN"
トリリニア (非対称) → "KIN"
テトラリニア (対称) → "TTE"
テトラリニア (非対称) → "TTE"
BMR(CD)ダンパー → "VISCOUS-OIL-DAMPER"
```

**dicASymmetric 매핑 (대칭/비대칭 플래그):**
```
名古屋高速ゴム支承 → 0 (대칭)
バイリニア (対称) → 0
バイリニア (非対称) → 1
トリリニア (対称) → 0
トリリニア (非対称) → 1
テトラリニア (対称) → 0
テトラリニア (非対称) → 1
BMR(CD)ダンパー → "" (특수처리)
```

NBI 상세 타입 분기 (`GetSPG6CompDetail` 함수):
```
正方向 → "SLBT"
負方向 → "SLBC"
正負方向 → "NBI"
Gap/Hook → "SLBI" + strHYST2 = ", 0.01, 0.02"
Takeda → "TAK"
cloud/スリップ → "SLBI"
```

결과: `m_SprCompORG(i).SprCompData(compIdx).mct_HYST`, `.mct_HYST2`, `.mct_iSYM`에 저장.
또한 `dicSPG6Comp`에 속성명 -> strType 배열 저장 (ChangeSPGAllSym에서 VISCOUS-OIL-DAMPER 판별용).

#### 1.2.2 상세 데이터 (main.bas GetSpringData)

`GetSpringData()` 함수에서 3개 시트를 순회 (i=0: 대칭, i=1: 비대칭, i=2: 기타):

**i=0 대칭 시트 (`ばね特性表_成分一覧(対称)`):**
- 4개 영역으로 분할:
  - j=0: 선형 (Col 2-13, 12열)
  - j=1: 바이리니어 (Col 15-30, 16열)
  - j=2: 트리리니어 (Col 32-50, 19열)
  - j=3: 테트라리니어 (Col 52-78, 27열)

**선형 (j=0) 데이터 파싱 (Line 1130-1136):**
```vba
dValue = ChangeMM_M(CDbl(strData(3, k)))    ' 변위 mm -> m
m = 4 + i + j + dicType(strData(2, k)) * (i + j + 1)
' i=0, j=0일 때:
'   d-K(0): m = 4+0+0+0*1 = 4 → strData(4, k) = K값 사용
'   d-F(1): m = 4+0+0+1*1 = 5 → strData(5, k) = F값 사용 → F/d로 K계산
strProp = strData(m, k)
If dicType(strData(2, k)) = 1 Then strProp = CDbl(strProp) / dValue
```

**비선형 바이리니어 (j=1) 데이터 파싱 (Line 1143-1151):**
```vba
ReDim strTENS(1, j)   ' (0~1방향, 0~1포인트) = 2방향 x 2포인트
strProp = strData(1, k)    ' 성분명
For m = 0 To j  ' 0~1 (2포인트)
  strTENS(0, m).strD = strData(m + 3, k)      ' D: col 3,4
  strTENS(0, m).strK = strData(m + 4 + j, k)  ' K: col 5,6 (4+1=5)
  strTENS(0, m).strF = strData(m + 5 + j*2, k)' F: col 7,8 (5+2=7)
Next m
' D값 mm->m 변환 후 방향1에 동일 데이터 복사
```

**비선형 트리리니어 (j=2) 데이터 파싱:**
```vba
ReDim strTENS(1, j)   ' (0~1방향, 0~2포인트) = 2방향 x 3포인트
For m = 0 To j  ' 0~2 (3포인트)
  strTENS(0, m).strD = strData(m + 3, k)       ' D: col 3,4,5
  strTENS(0, m).strK = strData(m + 4 + j, k)   ' K: col 6,7,8
  strTENS(0, m).strF = strData(m + 5 + j*2, k) ' F: col 9,10,11
Next m
```

**비선형 테트라리니어 (j=3) 데이터 파싱:**
```vba
ReDim strTENS(1, j)   ' (0~1방향, 0~3포인트) = 2방향 x 4포인트
For m = 0 To j  ' 0~3 (4포인트)
  strTENS(0, m).strD = strData(m + 5, k)   ' D: col 5,6,7,8
  strTENS(0, m).strK = strData(m + 9, k)   ' K: col 9,10,11,12
  strTENS(0, m).strF = strData(m + 16, k)  ' F: col 16,17,18,19
Next m
```

모든 비선형에서: D값 mm->m 변환 + 방향1(strTENS(1,m))에 방향0 데이터 복사 (대칭이므로).

공통: `mct_iTYPE = 1` (d-F 모드 고정), `mct_SFType = 5`, `mct_dStiff = 1.0`

### 1.3 데이터 가공 (Class130_SPGAllSym.ChangeSPGAllSym)

**1행 (속성 헤더) 생성 (Line 113-140):**
```vba
strBuf = ChgCamma(strSprName) & ",ELEMENT," & strType & ",0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0," & nDamper & ","
' strType = "SPG" (기본) 또는 "AI" (VISCOUS-OIL-DAMPER일 때)
' nDamper = dicDamper 인덱스 (AI일 때만 유효)
```

**2~7행 (6 DOF) 생성 (Line 143-199):**

정렬 순서 결정:
```vba
vSPG = Array(1, 3, -2, 4, 6, -5)
vSort(0) = Array(0, 1, 2, 3, 4, 5)   ' 기본 순서
vSort(1) = Array(1, 0, 2, 4, 3, 5)   ' 참조 부재 있을 때 순서

' nSort = 1 if m_dicSpgRef.Exists(strSprName)  (20250924 수정)
' 출력 순서: vSort(nSort) 인덱스로 vSPG 참조하여 성분 인덱스 결정
' 기본(nSort=0): vSPG[0]=1, vSPG[1]=3, vSPG[2]=-2, vSPG[3]=4, vSPG[4]=6, vSPG[5]=-5
'   → Abs: 1(Dx), 3(Dz), 2(Dy), 4(Rx), 6(Rz), 5(Ry)
' 참조(nSort=1): vSPG[1]=3, vSPG[0]=1, vSPG[2]=-2, vSPG[4]=6, vSPG[3]=4, vSPG[5]=-5
'   → Abs: 3(Dz), 1(Dx), 2(Dy), 6(Rz), 4(Rx), 5(Ry)
```

각 DOF 라인 분기:
- **LITR (名古屋高速ゴム支承):**
  ```
  dValue = dicNAGOYA(strData(0)) * strData(1) / ChangeN_kN(Change_par_MM2_M2(strData(2)))
  → "YES," & dValue & ", 0, NO"
  ```
- **strProp가 있는 경우:**
  - strProp가 숫자가 아니면 → `mct_iTYPE`에 따라 strTENS에서 값 추출
    - `mct_iTYPE = 1` → `strTENS(o, 0).strK` 사용
    - `mct_iTYPE = 0` → `strTENS(o, 0).strF` 사용
    - `mct_HYST = "SLBC"`이면 o=1 (음방향), 그 외 o=0 (양방향)
  - → `"YES," & strProp & ",0,NO"`
- **데이터 없음:**
  - → `"NO, 0, 0, NO"`

**bAllFree 처리 (Line 195-199):**
모든 6 DOF가 자유(NO)이면 → 전부 `"YES,0.00001,0,NO"`로 대체

**8행 (제로 행):**
```
"0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
```

### 1.4 MCT 출력

출력 위치: `m_Sheet_MCT`의 `m_SPGALLSYM_COL` (=61) 컬럼.

**MCT 헤더 (14줄):**
```
*NL-PROP    ; General Link Property
; NAME, APPTYPE, TYPE, TW, TWRATIO_I, bUSEMASS, TM, TMRATIO_I, bSSL, DY, DZ, SIESKEY(if APPTYPE=2), DESC
; bLDX, DX, EFFDAMP, bNDX, [NL_PROP]
; bLDY, DY, EFFDAMP, bNDY, [NL_PROP]
... (6 DOF 코멘트)
; [NL_PROP] : ... (각 타입 프로퍼티 설명 7줄)
```

**각 속성당 8줄:**
```
속성명,ELEMENT,SPG,0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,0,      ← 1행(헤더)
YES,강성값,0,NO                                                  ← 2행(Dx)
YES,강성값,0,NO                                                  ← 3행(Dy)
YES,강성값,0,NO                                                  ← 4행(Dz)
YES,강성값,0,NO                                                  ← 5행(Rx)
YES,강성값,0,NO                                                  ← 6행(Ry)
YES,강성값,0,NO                                                  ← 7행(Rz)
0, 0, 0, ..., 0 (31개)                                           ← 8행(제로)
```

**VISCOUS-OIL-DAMPER 추가 출력 (해당시):**
별도 컬럼 (`m_OILDAMPER_COL` = 56)에 출력:
```
*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper
; ...
키,속성명, , 0, , , , , 0, 2, 0, 1
YES , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
... (총 6 DOF)
```

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Line 289-374

// Step 14: Convert spring elements
if (hasSheet(sheets, SHEET_NAMES.SPG_6COMP)) {
  // 1) 6성분 개요 파싱 → context.springCompData에 mctHyst 정보 저장
  const spg6Result = parseSPG6CompData(spg6Data, context);          // Line 291

  // 2) subTable에서 4개 대칭 테이블 추출
  const spgSymLinear = parseResult.subTables.get('SPG_ALL_SYM_LINEAR') || [];
  const spgSymBilinear = parseResult.subTables.get('SPG_ALL_SYM_BILINEAR') || [];
  const spgSymTrilinear = parseResult.subTables.get('SPG_ALL_SYM_TRILINEAR') || [];
  const spgSymTetralinear = parseResult.subTables.get('SPG_ALL_SYM_TETRALINEAR') || [];

  // 3) 대칭 테이블 파싱 → context.springCompData에 tensionData 저장
  parseSymmetricSpringTables({ linearData, bilinearData, ... }, context);  // Line 322

  // 4) 비대칭 테이블 파싱 (대칭 데이터 덮어쓰기 가능)
  parseAsymmetricSpringTables({ ... }, context);                     // Line 336

  // 5) ElemSpring 변환 (springCompData 활용)
  convertSpringElements(springElmData, context, spg6Result.spg6CompMapping);  // Line 350

  // 6) NL-PROP MCT 출력 생성 (빈 rawData, springCompData 기반)
  const symResult = convertSymmetricSprings([], context, spg6Result.spg6CompMapping);  // Line 364

  // 7) VISCOUS-OIL-DAMPER 출력
  if (symResult.oilDamperLines.length > 0) { ... }                   // Line 370
}
```

### 2.2 데이터 읽기

#### 2.2.1 6성분 개요 (SPG6CompConverter.ts)

`parseSPG6CompData()` 함수:

**HYSTERESIS_TYPES 매핑 (VBA dicData + dicASymmetric 통합):**
```typescript
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
```

**NBI_DETAIL_TYPES 매핑 (VBA GetSPG6CompDetail):**
```typescript
const NBI_DETAIL_TYPES: Record<string, { mct: string; hyst2: string }> = {
  '正方向': { mct: 'SLBT', hyst2: '' },
  '負方向': { mct: 'SLBC', hyst2: '' },
  '正負方向': { mct: 'NBI', hyst2: '' },
  'Gap/Hook': { mct: 'SLBI', hyst2: ', 0.01, 0.02' },
  'Takeda': { mct: 'TAK', hyst2: '' },
  'cloud/スリップ': { mct: 'SLBI', hyst2: '' },
};
```

처리: 각 행에서 6개 성분(j=1~11 step 2)을 순회하며 `SpringComponentData` 객체 생성 → `context.springCompData`에 저장.

#### 2.2.2 상세 데이터 (SPGAllSymConverter.ts)

`parseSymmetricSpringTables()` 함수에서 4개 테이블 개별 파싱:

**선형 (`parseLinearTable`):**
```typescript
const typeStr = String(row[2] || '').toLowerCase();
const isDF = typeStr.includes('d-f') || typeStr.includes('f');
const d = safeParseNumber(row[3]) / 1000;  // mm -> m
if (isDF && d !== 0) {
  stiffness = safeParseNumber(row[5]) / d;  // F/d = K
} else {
  stiffness = safeParseNumber(row[4]);       // K 직접 사용
}
```

**바이리니어 (`parseBilinearTable`):**
```typescript
// col 3,4: d값 / col 5,6: K값 / col 7,8: F값
const d1 = safeParseNumber(row[3]); const d2 = safeParseNumber(row[4]);
const k1 = safeParseNumber(row[5]); const k2 = safeParseNumber(row[6]);
const f1 = safeParseNumber(row[7]); const f2 = safeParseNumber(row[8]);
dataPoints.push({ d: d1/1000, k: k1, f: f1 });
dataPoints.push({ d: d2/1000, k: k2, f: f2 });
```

**트리리니어 (`parseTrilinearTable`):**
```typescript
for (let m = 0; m < 3; m++) {
  const d = safeParseNumber(row[3 + m]);   // col 3,4,5
  const k = safeParseNumber(row[6 + m]);   // col 6,7,8
  const f = safeParseNumber(row[9 + m]);   // col 9,10,11
  dataPoints.push({ d: d/1000, k, f });
}
```

**테트라리니어 (`parseTetralinearTable`):**
```typescript
for (let m = 0; m < 4; m++) {
  const d = safeParseNumber(row[5 + m]);   // col 5,6,7,8
  const k = safeParseNumber(row[9 + m]);   // col 9,10,11,12
  const f = safeParseNumber(row[16 + m]);  // col 16,17,18,19
  dataPoints.push({ d: d/1000, k, f });
}
```

`updateSpringCompData()`에서 `tensionData[0]`(양방향)에 저장하고 `tensionData[1]`(음방향)에 복사 (대칭이므로 동일 데이터).

### 2.3 데이터 가공

`convertSymmetricSprings()` 함수:

**1행 (속성 헤더):**
```typescript
const line1 = `${chgComma(sprName)},ELEMENT,${strType},0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,${nDamper},`;
// strType = "SPG" 기본 / "AI" VISCOUS-OIL-DAMPER 시
```

**2~7행 (6 DOF):**

정렬 로직:
```typescript
const V_SPG = [1, 3, -2, 4, 6, -5];
const V_SORT = [
  [0, 1, 2, 3, 4, 5],    // 기본
  [1, 0, 2, 4, 3, 5],    // 참조 부재 있을 때
];
const nSort = context.springRefElements?.has(sprName) ? 1 : 0;
// sortedIdx = V_SORT[nSort][m] → compIdx = Math.abs(V_SPG[sortedIdx])
```

DOF 라인 분기:
- **LITR:** `bearingRatio * rubberHeight / changeN_kN(changeMM2_M2(area))` → `YES,값, 0, NO`
- **강성값 있음:** `YES,stiffValue,0,NO`
  - tensionData에서 값 추출: `mctType=1`이면 K값, `mctType=0`이면 F값
  - `mctHyst === 'SLBC'`이면 o=1 (음방향), 그 외 o=0
- **데이터 없음:** `NO, 0, 0, NO`

**bAllFree 처리:**
```typescript
if (bAllFree) {
  for (let m = 0; m < 6; m++) {
    dofLines[m] = 'YES,0.00001,0,NO';
  }
}
```

### 2.4 MCT 출력

MCT 헤더 14줄 + 속성당 8줄 (VBA와 동일 구조).

VISCOUS-OIL-DAMPER는 `oilDamperLines` 배열로 별도 반환하여 MCTGenerator에서 합침.

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 여부 |
|------|-----|-----------|----------|
| 히스테리시스 타입 매핑 (dicData) | 11개 타입 | HYSTERESIS_TYPES 11개 | **일치** |
| 대칭/비대칭 플래그 (dicASymmetric) | 8개 매핑 | HYSTERESIS_TYPES.sym | **일치** |
| NBI 상세 타입 (GetSPG6CompDetail) | 6개 매핑 | NBI_DETAIL_TYPES 6개 | **일치** |
| Gap/Hook HYST2 값 | ", 0.01, 0.02" | ", 0.01, 0.02" | **일치** |
| 나고야 지진받침 비율 (dicNAGOYA) | 6개 항목 | NAGOYA_BEARING_RATIOS 6개 | **일치** |
| vSPG 배열 | Array(1,3,-2,4,6,-5) | [1,3,-2,4,6,-5] | **일치** |
| vSort 배열 | (0,1,2,3,4,5)/(1,0,2,4,3,5) | V_SORT 동일 | **일치** |
| nSort 판정 | m_dicSpgRef.Exists → nSort=1 | springRefElements.has → nSort=1 | **일치** |
| mct_iTYPE 고정값 | 1 (d-F 모드) | mctType = 1 | **일치** |
| mct_SFType | 3 + iTYPE*2 = 5 | mctSFType = 5 | **일치** |
| NL-PROP 헤더 코멘트 | 14줄 | 14줄 | **일치** |
| 속성 헤더 1행 형식 | Name,ELEMENT,SPG/AI,... | 동일 형식 | **일치** |
| bAllFree 처리 | YES,0.00001,0,NO | YES,0.00001,0,NO | **일치** |
| 제로 행 (31개 0) | 동일 | 동일 | **일치** |
| VISCOUS-OIL-DAMPER 타입 판별 | dicSPG6Comp(strSprName)(0) | components.some(c => c.mctHyst === 'VISCOUS-OIL-DAMPER') | **일치** |
| 오일댐퍼 DOF 출력 | YES/NO, 0,0,0,0,0,1,1,0.1,1,NO,100 | 동일 | **일치** |
| 선형 D값 mm->m | ChangeMM_M() | /1000 | **일치** |
| 비선형 D값 mm->m | ChangeMM_M() 후 strTENS에 저장 | /1000 후 dataPoints에 저장 | **일치** |
| 대칭 방향1 데이터 복사 | strTENS(1,m) = strTENS(0,m) | tensionData[1] = [...tensionData[0]] | **일치** |
| SLBC일 때 o=1 | mct_HYST = "SLBC" → o=1 | mctHyst === 'SLBC' → o=1 | **일치** |
| K/F 선택 (strProp 결정) | iTYPE=1→strK / iTYPE=0→strF | iType=1→k / iType=0→f | **일치** |

### 3.2 차이점

#### 차이점 1: 데이터 구조

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 데이터 저장 | `m_SprCompORG()` 고정 배열 (1-based index) | `Map<string, SpringCompData>` (키 기반) |
| 성분 인덱스 | `SprCompData(1 To 6)` (1-based) | `components[]` 배열 (find로 검색) |
| 속성키 매핑 | `m_dicSprProp` (이름 -> 인덱스) | `springCompData` Map 자체 |

**영향**: MCT 출력에 영향 없음. 내부 데이터 접근 방식 차이일 뿐, 동일한 데이터를 참조.

#### 차이점 2: 선형 데이터 열 인덱스 계산

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| d-K 모드 K열 | `m = 4 + i + j + 0 = 4` → `strData(4, k)` | `row[4]` (직접 참조) |
| d-F 모드 F열 | `m = 4 + i + j + 1*(i+j+1) = 5` → `strData(5, k)` | `row[5]` (직접 참조) |
| K 계산 (d-F) | `strProp = CDbl(strProp) / dValue` | `stiffness = f / d` |

**영향**: 동일 결과. VBA의 수식 `4 + i + j + dicType * (i+j+1)`은 i=0,j=0일 때 4 또는 5로 평가되므로 TS의 직접 참조와 동일.

#### 차이점 3: 비선형 바이리니어 열 인덱스

| 항목 | VBA (i=0, j=1) | TypeScript |
|------|-----------------|-----------|
| D열 | `strData(m+3, k)` → col 3,4 | `row[3], row[4]` |
| K열 | `strData(m+4+j, k)` = `m+5` → col 5,6 | `row[5], row[6]` |
| F열 | `strData(m+5+j*2, k)` = `m+7` → col 7,8 | `row[7], row[8]` |

**영향**: 동일 결과. 열 인덱스가 정확히 일치.

#### 차이점 4: 비선형 트리리니어 열 인덱스

| 항목 | VBA (i=0, j=2) | TypeScript |
|------|-----------------|-----------|
| D열 | `strData(m+3, k)` → col 3,4,5 | `row[3+m]` |
| K열 | `strData(m+4+j, k)` = `m+6` → col 6,7,8 | `row[6+m]` |
| F열 | `strData(m+5+j*2, k)` = `m+9` → col 9,10,11 | `row[9+m]` |

**영향**: 동일 결과. 열 인덱스가 정확히 일치.

#### 차이점 5: 비선형 테트라리니어 열 인덱스

| 항목 | VBA (i=0, j=3) | TypeScript |
|------|-----------------|-----------|
| D열 | `strData(m+5, k)` → col 5,6,7,8 | `row[5+m]` |
| K열 | `strData(m+9, k)` → col 9,10,11,12 | `row[9+m]` |
| F열 | `strData(m+16, k)` → col 16,17,18,19 | `row[16+m]` |

**영향**: 동일 결과. 열 인덱스가 정확히 일치.

#### 차이점 6: strProp 비숫자 판별 로직

**VBA (Class130_SPGAllSym.cls Line 164-180):**
```vba
If Not IsNumeric(m_SprComp(n).SprCompData(vBuf).strProp) Then
  ' strProp가 숫자가 아니면 → strTENS에서 K 또는 F 추출
  o = 0
  k = m_SprComp(n).SprCompData(vBuf).mct_iTYPE
  If mct_HYST = "SLBC" Then o = 1
  If k = 1 Then strProp = strTENS(o, 0).strK
  Else strProp = strTENS(o, 0).strF
End If
```

**TypeScript (SPGAllSymConverter.ts Line 548-576):**
```typescript
if (compData.tensionData && compData.tensionData.length > 0) {
  const o = (compData.mctHyst === 'SLBC') ? 1 : 0;
  const tensData = compData.tensionData[o];
  if (tensData && tensData.length > 0) {
    const iType = compData.mctType ?? 1;
    if (iType === 1) stiffValue = firstPoint.k;
    else stiffValue = firstPoint.f;
  }
}
```

**영향**: 기능적으로 동일. VBA에서 `strProp`는 비선형일 때 성분명(문자열)으로 설정되므로 `IsNumeric`이 False → strTENS에서 값을 추출. TS에서는 tensionData가 존재하면 항상 해당 값을 사용하므로 동일한 동작.

#### 차이점 7: 선형 strProp 설정 경로

**VBA:** 선형(j=0)일 때 `strProp`에 K값 또는 F/d 계산값을 직접 숫자로 저장. `ChangeSPGAllSym`에서 `IsNumeric(strProp)=True` → strTENS 접근 없이 `strProp` 값 그대로 사용.

**TypeScript:** 선형일 때도 `updateSpringCompData()`에서 `mctStiff`에 강성값 저장 + `tensionData`에 dataPoints 저장. `convertSymmetricSprings()`에서 tensionData가 있으면 tensionData[0][0].k를 사용.

**영향**: 동일 결과. 두 경우 모두 같은 K값이 출력됨. VBA에서 선형의 strProp는 이미 숫자이므로 IsNumeric=True → 그대로 출력. TS에서도 같은 값이 tensionData[0][0].k에 저장되어 출력.

#### 차이점 8: BMR(CD)ダンパー sym 값

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| dicASymmetric | `""` (빈 문자열) | `sym: 0` |

**영향**: MCT 출력에 영향 없음. BMR(CD)ダンパー는 별도 `*VISCOUS-OIL-DAMPER` 섹션으로 출력되며, sym 플래그는 NL-PROP의 대칭/비대칭 분기에만 사용. 해당 타입은 항상 별도 경로(AI 타입)로 처리되므로 실질적 영향 없음.

### 3.3 차이로 인한 MCT 결과 영향

| 차이점 | MCT 결과 영향 |
|--------|-------------|
| 데이터 구조 (배열 vs Map) | 없음 - 접근 방식만 다름 |
| 선형 열 인덱스 계산 방식 | 없음 - 동일 열 참조 |
| 비선형 열 인덱스 | 없음 - 동일 열 참조 |
| strProp 비숫자 판별 | 없음 - 동일 값 추출 |
| 선형 strProp 경로 | 없음 - 동일 K값 출력 |
| BMR sym 값 | 없음 - AI 경로로 별도 처리 |

---

## 4. 결론

**PASS**

TypeScript 구현은 VBA의 `Class120_SPG6Comp.GetHingeSPG6Comp()`, `GetSpringData()` (대칭 부분, i=0), `Class130_SPGAllSym.ChangeSPGAllSym()` 로직을 정확히 재현하고 있다.

- **히스테리시스 타입 매핑**: 11개 타입, 6개 NBI 상세 타입 모두 일치
- **6성분 개요 파싱**: 성분 인덱스 계산 `(j+1)/2`, mct_HYST/HYST2/iSYM 저장 로직 일치
- **상세 데이터 파싱**: 4개 테이블(선형/바이리니어/트리리니어/테트라리니어) 열 인덱스 및 단위 변환 일치
- **NL-PROP MCT 출력**: 헤더 14줄, 속성당 8줄(헤더 + 6 DOF + 제로행), vSPG/vSort 정렬 로직 일치
- **특수 처리**: LITR(나고야 지진받침), VISCOUS-OIL-DAMPER(오일댐퍼), bAllFree 처리 모두 일치
- **단위 변환**: mm->m (`/1000`), N->kN (`/1000`), mm2->m2 (`/1000000`) 일치

### 수정 이력
- **2025-01 수정 완료**: LITR 단위 수정 — SPGAllSymConverter.ts에서 名古屋 베어링 LITR 강성 계산 시 단위 변환 함수를 VBA의 `Change_par_MM2_M2` (역변환)과 일치하도록 수정. 이전에는 `changeMM2_M2` (정변환)을 사용하여 10^9배 차이가 발생했음.
- **2025-01 수정 완료**: 파싱 순서 변경 — MCTGenerator.ts에서 Other 스프링 파싱(convertOtherSpringsWithTables)이 NL-PROP 출력(convertSymmetricSprings) **이전에** 호출되도록 순서 변경. VBA의 GetSpringData()가 대칭/비대칭/기타 데이터를 모두 읽은 뒤 ChangeSPGAllSym()을 호출하는 순서와 일치.

**잔여 주의사항:**
1. VBA의 `m_SprComp(n).vAngle` 배열은 `Class110_ElemSpring`에서 설정되는 값으로, 본 분석에서는 상세 검토하지 않았음. `vAngle`이 `IsArray`가 아닐 때 vSPG 기본값을 사용하는 로직은 VBA/TS 모두 동일하게 처리됨.
2. VBA에서 `strProp`에 숫자가 아닌 값이 저장되는 케이스(비선형에서 성분명이 strProp에 들어가는 경우)의 처리가 TS에서는 tensionData 존재 여부로 대체되었으나, 결과적으로 같은 K/F 값이 추출되므로 MCT 결과에 차이 없음.
3. VBA의 `On Error Resume Next` 에러 무시 동작은 TS에서 별도 에러 처리로 대체되어야 하며, 잘못된 데이터 입력 시 동작 차이가 발생할 수 있음 (정상 데이터에서는 문제 없음).
