# 기타 스프링 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

VBA에서 Class150_SPGAllOther는 직접적으로 MCT를 출력하지 않는다. 역할은 두 가지로 분류된다:

1. **데이터 읽기 단계** (main.bas `GetSpringData` 함수, line 1060~1288):
   - `vCls(2) = clsSPGAllOther` 로 설정 (i=2)
   - `GetArea()` 호출로 2개 테이블 영역(名古屋, BMR) 정보 획득
   - `GetData()` 호출로 각 테이블 데이터를 읽어 `m_SprCompORG()` 배열에 저장

2. **후처리 단계** (main.bas line 478):
   ```vba
   If dicNewSheets.Exists(m_Sheet_SPGAllOther) Then
     Call clsSPGAllOther.FixWriteColor
   End If
   ```
   - `FixWriteColor`는 출력 엑셀의 셀 서식(색상) 처리만 담당하며, MCT 출력과 무관

### 1.2 데이터 읽기

**Class150_SPGAllOther.cls의 시트 영역 정의:**
```
nReadSTRow = 5 (데이터 시작 행)

Table 1 (名古屋高速ゴム支承):
  nRead1STCol = 2  (B열)
  nRead1EDCol = 12 (L열)  → 11열

Table 2 (BMR(CD)ダンパー):
  nRead2STCol = 14 (N열)
  nRead2EDCol = 25 (Y열)  → 12열
```

**main.bas GetSpringData에서의 읽기 (i=2, "その他"):**
- `GetArea()` 호출 → `nST(0)=2, nED(0)=12` / `nST(1)=14, nED(1)=25`
- j=0 루프: 名古屋 테이블 읽기
- j=1 루프: BMR(CD)ダンパー 테이블 읽기

### 1.3 데이터 가공

**GetSpringData 내 i=2 (その他) 분기 (main.bas line 1240~1260):**

#### j=0: 名古屋高速ゴム支承
```vba
ReDim m_SprCompORG(nCnt).SprCompData(n).strData(3)
m_SprCompORG(nCnt).SprCompData(n).strProp = strData(1, k)           ' 성분명
m_SprCompORG(nCnt).SprCompData(n).strData(0) = strData(2, k)        ' 베어링 타입
m_SprCompORG(nCnt).SprCompData(n).strData(1) = ChangeMM_M(strData(3, k))   ' 고무 높이 mm→m
m_SprCompORG(nCnt).SprCompData(n).strData(2) = ChangeMM2_M2(strData(4, k)) ' 면적 mm²→m²
m_SprCompORG(nCnt).SprCompData(n).strData(3) = ChangeMM2_M2(strData(5, k)) ' 면적2 mm²→m²
```
- `nComponent = 2` (その他)
- `nType = 0` (j=0, 名古屋)
- `mct_iTYPE = 1`, `mct_SFType = 5`, `mct_dStiff = 1.0`

#### j=1: BMR(CD)ダンパー
```vba
If j = 1 Then
  msgEnd = msgEnd & Chr(13) & msg_Damper
End If
```
- BMR(CD) 데이터 자체는 `m_SprCompORG`에 기본 저장 (nComponent=2, nType=1)
- 별도 데이터 가공 없음 (strData/strTENS 미사용)
- 경고 메시지만 추가: "BMR(CD)ダンパーはCIVIL NXの粘性ダンパーに変換され、プロパティはデータ変換後に手動で変更してください。"

### 1.4 MCT 출력

**Class150_SPGAllOther 자체는 MCT를 출력하지 않는다.**

MCT 출력은 **Class130_SPGAllSym.ChangeSPGAllSym()** 에서 통합 처리된다:

#### NL-PROP 출력 (名古屋 → LITR 타입):
```vba
' Class130_SPGAllSym.cls line 160-163
If m_SprComp(n).SprCompData(vBuf).mct_HYST = "LITR" Then
  bAllFree = False
  dValue = dicNAGOYA(strData(0)) * strData(1) / ChangeN_kN(Change_par_MM2_M2(strData(2)))
  strBuf(i) = "YES," & dValue & ", 0, NO"
End If
```

LITR 강성 계산식:
```
dValue = NAGOYA_RATIO * rubberHeight_m / (area_m2 / 0.001 / 0.001 * 0.001)
       = NAGOYA_RATIO * rubberHeight_m / (area_mm2 * 0.001)
       = NAGOYA_RATIO * rubberHeight_m * 1000 / area_mm2
```

여기서:
- `strData(0)` = 베어링 타입 → `dicNAGOYA` 딕셔너리에서 비율 조회 (1.0 또는 1.2)
- `strData(1)` = 고무 높이 (이미 m 단위로 변환됨)
- `strData(2)` = 면적 (이미 m² 단위로 변환됨)
- `Change_par_MM2_M2(strData(2))` = m² → mm² 역변환
- `ChangeN_kN(...)` = N → kN 변환 (×0.001)

#### VISCOUS-OIL-DAMPER 출력 (BMR → 댐퍼 타입):
```vba
' Class130_SPGAllSym.cls line 207-239
If dicDamper.Count > 0 Then
  ' *VISCOUS-OIL-DAMPER 헤더 출력
  For j = 0 To dicDamper.Count - 1
    ' 댐퍼 번호, 이름, 기본 파라미터 출력
    ' 6 DOF 라인: "YES/NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100"
  Next j
End If
```

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

MCTGenerator.ts line 393-412에서 호출:
```typescript
const spgOtherNagoya = parseResult.subTables.get('SPG_ALL_OTHER_NAGOYA') || [];
const spgOtherBmr = parseResult.subTables.get('SPG_ALL_OTHER_BMR') || [];
if (spgOtherNagoya.length > 0 || spgOtherBmr.length > 0) {
  const otherResult = convertOtherSpringsWithTables(
    { nagoyaData: spgOtherNagoya, bmrData: spgOtherBmr },
    context,
    spg6Result.spg6CompMapping
  );
}
```

**호출 순서 핵심:**
1. SPG6Comp 파싱 → `spg6CompMapping` 생성
2. 대칭/비대칭 데이터 파싱 → `springCompData` 채움
3. ElemSpring 변환
4. **NL-PROP 출력** (`convertSymmetricSprings`)
5. IHINGE-PROP 출력 (`convertAsymmetricSprings`)
6. **Other 스프링 파싱** (`convertOtherSpringsWithTables`) ← 여기

### 2.2 데이터 읽기

`SPGAllOtherConverter.ts`에서 엑셀 파서가 분리한 2개 subTable을 직접 수신:
```typescript
const TABLE_OFFSETS = {
  NAGOYA: { start: 0, end: 10 },   // cols 2-12 → 0-10 (11 cols)
  BMR: { start: 12, end: 23 },     // cols 14-25 → 12-23 (12 cols)
};
```
- `convertOtherSpringsWithTables`는 이미 분리된 `nagoyaData`와 `bmrData`를 직접 받음
- `convertOtherSprings`는 결합된 rawData에서 `extractTableData`로 분리하는 방식도 지원

### 2.3 데이터 가공

#### parseNagoyaTable (line 74-96):
```typescript
const propName = String(row[0]);           // 속성명
const componentStr = String(row[1] || ''); // 성분 (xl, yl, zl, ...)
const bearingType = String(row[2] || '');  // 베어링 타입
const rubberHeight = safeParseNumber(row[3]); // 고무 높이
const area = safeParseNumber(row[4]);      // 면적
```
- `updateSpringCompData`로 `context.springCompData`에 저장
- `hystType = 'LITR'`, `componentType = 2` (Other)
- data 배열: `[bearingType, rubberHeight(문자열), area(문자열)]`

#### parseBmrTable (line 110-137):
```typescript
const damperType = String(row[2] || 'BMR(CD)ダンパー');
const c = safeParseNumber(row[3]);     // 감쇠 계수
const alpha = safeParseNumber(row[4]); // 속도 지수
```
- `hystType = 'VISCOUS-OIL-DAMPER'`, `componentType = 2`
- `hasDamper = true` 반환

### 2.4 MCT 출력

**SPGAllOtherConverter 자체는 MCT 라인을 출력하지 않는다** (`mctLines: []` 반환).

MCT 출력은 **SPGAllSymConverter.convertSymmetricSprings()** 에서 통합 처리:

#### NL-PROP 출력 (LITR 처리, SPGAllSymConverter.ts line 517-533):
```typescript
if (compData && compData.mctHyst === 'LITR') {
  const bearingType = String(compData.data[0] || '');
  const rubberHeight = safeParseNumber(compData.data[1]);
  const area = safeParseNumber(compData.data[2]);
  const bearingRatio = NAGOYA_BEARING_RATIOS[bearingType] || 1;
  const dValue = bearingRatio * rubberHeight / changeN_kN(changeMM2_M2(area));
  dofLine = `YES,${dValue}, 0, NO`;
}
```

#### VISCOUS-OIL-DAMPER 출력 (SPGAllSymConverter.ts line 608-625):
```typescript
if (dicDamper.size > 0) {
  oilDamperLines.push('*VISCOUS-OIL-DAMPER ...');
  for (const [damperName, damperNo] of dicDamper) {
    oilDamperLines.push(`${damperNo},${chgComma(damperName)}, , 0, , , , , 0, 2, 0, 1`);
    // 6 DOF lines
    oilDamperLines.push(`YES/NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100`);
  }
}
```

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 여부 |
|------|-----|-----------|----------|
| 역할 분담 | Class150은 데이터 읽기만, MCT 출력은 Class130에서 | SPGAllOtherConverter는 파싱만, MCT 출력은 SPGAllSymConverter에서 | O |
| 테이블 영역 | Table1: col 2-12, Table2: col 14-25 | NAGOYA: 0-10 (11cols), BMR: 12-23 (12cols) | O |
| 名古屋 데이터 구조 | strData(0)=베어링타입, strData(1)=높이(m), strData(2)=면적(m²), strData(3)=면적2(m²) | data[0]=bearingType, data[1]=rubberHeight, data[2]=area | 부분 일치 (아래 참조) |
| NAGOYA 딕셔너리 | 6개 항목 (H15.10 HDR-G12:1.2, ...) | 동일 6개 항목 | O |
| BMR 경고 메시지 | msg_Damper 경고 추가 | warnings.push 경고 추가 | O |
| LITR 강성 계산식 | `dicNAGOYA * rubberHeight / ChangeN_kN(Change_par_MM2_M2(area))` | `bearingRatio * rubberHeight / changeN_kN(changeMM2_M2(area))` | **차이** (아래 참조) |
| NL-PROP 헤더/코멘트 | 14행 주석 | 동일 14행 주석 | O |
| VISCOUS-OIL-DAMPER 포맷 | `nDamper,name, ,0,,,,0,2,0,1` + 6 DOF | 동일 포맷 | O |
| getComponentIndex | dicComponent 딕셔너리 (xl→1, ..., θzl→6) | 동일 매핑 (+ 추가 변형 처리) | O |
| FixWriteColor | 셀 서식 처리 | 해당 없음 (엑셀 출력 아님) | N/A |

### 3.2 차이점

#### 차이점 1: 名古屋 데이터 단위 변환 시점과 LITR 계산식

**VBA:**
- `GetSpringData`에서 데이터 저장 시 **미리 단위 변환**:
  ```vba
  strData(1) = ChangeMM_M(strData(3, k))      ' mm → m
  strData(2) = ChangeMM2_M2(strData(4, k))     ' mm² → m²
  strData(3) = ChangeMM2_M2(strData(5, k))     ' mm² → m²
  ```
- MCT 출력 시 (Class130) LITR 계산:
  ```vba
  dValue = dicNAGOYA(strData(0)) * strData(1) / ChangeN_kN(Change_par_MM2_M2(strData(2)))
  ```
  - `strData(1)` = rubberHeight (m 단위)
  - `strData(2)` = area (m² 단위)
  - `Change_par_MM2_M2(m² 값)` = m² → mm² 역변환 (값 × 1,000,000)
  - `ChangeN_kN(mm² 값)` = × 0.001
  - 결과: `ratio * height_m / (area_m2 * 1000000 * 0.001)` = `ratio * height_m / (area_m2 * 1000)`

**TypeScript (SPGAllSymConverter.ts line 527-529):**
- `parseNagoyaTable`에서 **단위 변환 없이** 원본 값 저장:
  ```typescript
  const rubberHeight = safeParseNumber(row[3]); // mm 그대로
  const area = safeParseNumber(row[4]);         // mm² 그대로
  ```
- MCT 출력 시 LITR 계산:
  ```typescript
  const dValue = bearingRatio * rubberHeight / changeN_kN(changeMM2_M2(area));
  ```
  - `rubberHeight` = mm 단위 (변환 안 됨)
  - `area` = mm² 단위 (변환 안 됨)
  - `changeMM2_M2(area)` = mm² → m² (값 × 0.000001)
  - `changeN_kN(m² 값)` = × 0.001
  - 결과: `ratio * height_mm / (area_mm2 * 0.000001 * 0.001)` = `ratio * height_mm / (area_mm2 * 0.000000001)`

**수학적 등가 검증:**
- VBA: `ratio * height_m / (area_m2 * 1000)` = `ratio * (height_mm * 0.001) / (area_mm2 * 0.000001 * 1000)` = `ratio * height_mm * 0.001 / (area_mm2 * 0.001)` = `ratio * height_mm / area_mm2`
- TS: `ratio * height_mm / (area_mm2 * 0.000000001)` = `ratio * height_mm * 1,000,000,000 / area_mm2`

**결론: VBA와 TS의 LITR 계산 결과가 다르다.**

- VBA에서 `Change_par_MM2_M2`는 m² → mm² **역변환** (값 ÷ 0.001 ÷ 0.001 = 값 × 1,000,000)
- TS에서 `changeMM2_M2`는 mm² → m² **정변환** (값 × 0.001 × 0.001 = 값 × 0.000001)
- VBA는 **이미 m² 변환된 값**에 역변환을 적용하여 원래 mm²로 되돌린 뒤, N→kN 변환
- TS는 **원본 mm² 값**에 정변환을 적용하여 m²로 만든 뒤, N→kN 변환

VBA 최종 계산 (원본 값 기준):
```
= ratio * (height_mm / 1000) / ((area_mm2 / 1000000) * 1000000 * 0.001)
= ratio * (height_mm / 1000) / (area_mm2 * 0.001)
= ratio * height_mm / (1000 * area_mm2 * 0.001)
= ratio * height_mm / area_mm2
```

TS 최종 계산 (원본 값 기준):
```
= ratio * height_mm / (area_mm2 * 0.000001 * 0.001)
= ratio * height_mm / (area_mm2 * 0.000000001)
= ratio * height_mm * 1000000000 / area_mm2
```

**10^9 배의 차이가 발생한다.**

이는 TS에서 `Change_par_MM2_M2` (역변환) 대신 `changeMM2_M2` (정변환)을 사용하기 때문이다.

#### 차이점 2: 名古屋 strData(3) 미사용

**VBA:**
- `strData(3) = ChangeMM2_M2(strData(5, k))` → 4번째 데이터 항목도 저장
- 단, MCT 출력에서 `strData(3)`는 사용되지 않음 (strData(0), strData(1), strData(2)만 참조)

**TypeScript:**
- `data[2] = area` (row[4])만 저장하고 row[5] 데이터는 저장하지 않음
- MCT 출력에도 영향 없음

**결과:** MCT 출력에 영향 없음 (VBA에서도 미사용)

#### 차이점 3: Other 스프링 파싱 순서

**VBA (main.bas):**
- `GetSpringData()`에서 대칭(i=0), 비대칭(i=1), 기타(i=2) 순서로 **동시에** 데이터를 읽어 `m_SprCompORG`에 저장
- 이후 `ChangeSPGAllSym()` 호출 시 모든 데이터가 이미 준비됨

**TypeScript (MCTGenerator.ts):**
- 대칭/비대칭 파싱 → ElemSpring 변환 → **NL-PROP 출력** → IHINGE-PROP 출력 → **Other 파싱**
- Other 파싱(`convertOtherSpringsWithTables`)이 NL-PROP 출력(`convertSymmetricSprings`) **이후에** 호출됨

**결과:** TS에서 Other 데이터(LITR, VISCOUS-OIL-DAMPER)가 NL-PROP 출력 시점에 `springCompData`에 존재하지 않을 수 있다. 이 경우 名古屋 베어링과 BMR 댐퍼가 NL-PROP 출력에서 누락될 수 있다.

#### 차이점 4: BMR(CD) 데이터 저장 방식

**VBA:**
- BMR(CD) 데이터 (j=1)에서는 `strData`/`strTENS`에 별도 가공을 하지 않음
- BMR 여부는 SPG6Comp의 `dicSPG6Comp(strSprName)(0) = "VISCOUS-OIL-DAMPER"` 체크로 판단

**TypeScript:**
- `parseBmrTable`에서 c (감쇠계수), alpha (속도지수)를 읽어 data에 저장
- 그러나 `SPGAllSymConverter`에서 VISCOUS-OIL-DAMPER 판단은 `sprData.components.some(c => c.mctHyst === 'VISCOUS-OIL-DAMPER')`로 수행
- VISCOUS-OIL-DAMPER 출력에서 c, alpha 값은 사용하지 않고 기본값(0, 0, ...)으로 출력

**결과:** BMR(CD) MCT 출력은 양쪽 모두 기본값으로 출력하므로 동일. 단, TS가 추가로 저장하는 c/alpha 값은 미사용.

### 3.3 차이로 인한 MCT 결과 영향

| 차이점 | MCT 영향 | 심각도 |
|--------|---------|--------|
| LITR 강성 계산식 (Change_par_MM2_M2 vs changeMM2_M2) | **10^9 배 차이**, 名古屋 베어링 강성값이 완전히 다른 값으로 출력됨 | **CRITICAL** |
| Other 파싱 순서 (NL-PROP 출력 후 파싱) | LITR/VISCOUS-OIL-DAMPER 속성이 NL-PROP에서 누락될 가능성 | **CRITICAL** |
| strData(3) 미저장 | 없음 (VBA에서도 미사용) | 없음 |
| BMR c/alpha 추가 저장 | 없음 (출력에 사용 안 함) | 없음 |

---

## 4. 결론

### FAIL

**심각한 문제 2건:**

1. **LITR 강성 계산식 불일치 (CRITICAL):**
   - VBA는 `Change_par_MM2_M2` (m² → mm² 역변환)를 사용하나, TS는 `changeMM2_M2` (mm² → m² 정변환)을 사용
   - SPGAllSymConverter.ts line 529에서 `changeMM2_M2(area)` 호출이 VBA의 `Change_par_MM2_M2(strData(2))` 호출과 반대 방향의 변환
   - 단, VBA에서 strData(2)가 이미 m²로 변환된 값이고 TS에서는 원본 mm² 값이므로, 함수 선택의 문제뿐 아니라 입력 단위도 다름
   - 최종 결과에서 10^9 배 차이 발생

2. **파싱 순서 불일치 (CRITICAL):**
   - VBA: GetSpringData()에서 대칭/비대칭/기타 데이터를 모두 읽은 뒤 ChangeSPGAllSym() 호출
   - TS: NL-PROP 출력(convertSymmetricSprings) 이후에 Other 파싱(convertOtherSpringsWithTables) 호출
   - Other 데이터가 NL-PROP 출력 시점에 springCompData에 없으므로 LITR/VISCOUS-OIL-DAMPER 관련 MCT 출력 누락 가능

### 수정 이력
- **2025-01 수정 완료**: LITR 강성 계산 단위 수정 — SPGAllSymConverter.ts에서 名古屋 베어링 강성 계산 시 `changeMM2_M2` (mm²→m² 정변환) 대신 VBA의 `Change_par_MM2_M2` (m²→mm² 역변환)과 동일한 결과를 생성하도록 단위 변환 수정. 이전에는 10^9배 차이 발생.
- **2025-01 수정 완료**: 파싱 순서 변경 — MCTGenerator.ts에서 Other 스프링 파싱이 NL-PROP 출력 이전에 호출되도록 순서 변경. VBA의 GetSpringData()가 기타 데이터를 포함한 모든 데이터를 미리 읽는 순서와 일치하도록 수정.

### 잔여 주의사항

- `FixWriteColor()`는 엑셀 서식 처리로 웹 환경에서는 불필요하며, 미구현이 정상
- `CheckeHingeType()`과 `GetLineType()` 함수는 VBA에 정의되어 있으나 Class150 내에서만 존재하고 외부 호출이 확인되지 않음 (미사용 코드로 추정)
- BMR(CD) 댐퍼의 실제 파라미터(C, Alpha 등)는 VBA/TS 모두 기본값으로 출력하며, 경고 메시지를 통해 사용자에게 수동 수정을 안내
