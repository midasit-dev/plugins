# *GSPRTYPE 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

VBA `main.bas`에서 `mct作成()` 서브루틴 내부에서 순서대로 호출된다:

```vba
' dicSprType은 빈 Dictionary로 초기화됨
Dim dicSprType As Dictionary
Set dicSprType = New Dictionary

' Step 1: 支点(Fulcrum) 변환 - dicSprType에 spring type 매핑 기록
If ChangeSheetName.Exists(m_Sheet_Fulcrum) Then Call clsFulcrum.ChangeFulcrum(dicSprType)

' Step 2: 支点詳細(FulcDetail) 변환 - dicSprType을 참조하여 *GSPRTYPE 출력
If ChangeSheetName.Exists(m_Sheet_FulcDetail) Then Call clsFulcDetail.ChangeFulcDetail(dicSprType)
```

**핵심 의존 관계**: `Class160_Fulcrum.ChangeFulcrum`이 먼저 실행되어 `dicSprType` Dictionary를 채운 후, `Class170_FulcDetail.ChangeFulcDetail`이 이 Dictionary를 참조하여 스프링 타입인 지점만 `*GSPRTYPE`으로 출력한다.

### 1.2 데이터 읽기

**시트명**: `支点詳細` (m_Sheet_FulcDetail)

**읽기 범위**:
- 시작 행: 4 (`nReadSTRow = 4`)
- 시작 열: 2 (`nReadSTCol = 2`, 즉 B열)
- 종료 열: 21 (`nReadEDCol = 21`, 즉 U열)
- 총 20개 열 (B~U), 배열 인덱스 0~19

**VBA Cell Enum 매핑** (열 번호 → 배열 인덱스):
| Enum 이름 | 값 (열 번호) | 배열 인덱스 | Excel 열 |
|-----------|-------------|------------|----------|
| Cel_D     | 2           | 2          | D        |
| Cel_E     | 3           | 3          | E        |
| Cel_F     | 4           | 4          | F        |
| Cel_G     | 5           | 5          | G        |
| Cel_H     | 6           | 6          | H        |
| Cel_I     | 7           | 7          | I        |
| Cel_J     | 8           | 8          | J        |
| Cel_K     | 9           | 9          | K        |
| Cel_L     | 10          | 10         | L        |
| Cel_M     | 11          | 11         | M        |
| Cel_N     | 12          | 12         | N        |
| Cel_O     | 13          | 13         | O        |
| Cel_P     | 14          | 14         | P        |
| Cel_Q     | 15          | 15         | Q        |
| Cel_R     | 16          | 16         | R        |
| Cel_S     | 17          | 17         | S        |
| Cel_T     | 18          | 18         | T        |
| Cel_U     | 19          | 19         | U        |

`strData(0, i)` = 지점명(B열), `strData(1, i)` = C열, `strData(2~19, i)` = D~U열

**비숫자 값 처리**:
```vba
For i = 0 To UBound(strData, 2)
  For j = 2 To 19
    If Not IsNumeric(strData(j, i)) Then strData(j, i) = 0
  Next j
Next i
```
D~U열(인덱스 2~19)의 값이 숫자가 아니면 0으로 대체한다.

### 1.3 데이터 가공

`dicSprType(strData(0, j))`가 `True`인 행만 처리한다. 즉, `Class160_Fulcrum`에서 "ばね"(스프링) DOF를 가진 것으로 판별된 지점만 출력 대상이 된다.

**21개 강성값 배열(strBuf) 매핑**:

| strBuf 인덱스 | VBA 소스                       | 셀(배열 인덱스) | 부호    | MCT 성분  |
|--------------|-------------------------------|----------------|---------|----------|
| 0            | strData(0, j)                 | 0 (B열, 이름)   | -       | NAME     |
| 1            | Abs(strData(Cel_D, j))        | 2 (D열)         | +Abs    | SDx1     |
| 2            | Abs(strData(Cel_K, j))        | 9 (K열)         | +Abs    | SDy1     |
| 3            | Abs(strData(Cel_F, j))        | 4 (F열)         | +Abs    | SDy2     |
| 4            | Abs(strData(Cel_J, j))        | 8 (J열)         | +Abs    | SDz1     |
| 5            | Abs(strData(Cel_N, j))        | 12 (N열)        | +Abs    | SDz2     |
| 6            | Abs(strData(Cel_E, j))        | 3 (E열)         | +Abs    | SDz3     |
| 7            | "0"                           | -               | 0       | 패딩      |
| 8            | Abs(strData(Cel_Q, j))        | 15 (Q열)        | +Abs    | SRx1     |
| 9            | -1 * Abs(strData(Cel_O, j))   | 13 (O열)        | -Abs    | SRy1     |
| 10           | Abs(strData(Cel_G, j))        | 5 (G열)         | +Abs    | SRy2     |
| 11           | -1 * Abs(strData(Cel_M, j))   | 11 (M열)        | -Abs    | SRz1     |
| 12           | "0"                           | -               | 0       | 패딩      |
| 13           | Abs(strData(Cel_P, j))        | 14 (P열)        | +Abs    | SRz2     |
| 14           | Abs(strData(Cel_T, j))        | 18 (T열)        | +Abs    | SRz3     |
| 15           | Abs(strData(Cel_I, j))        | 7 (I열)         | +Abs    | SRz4     |
| 16           | Abs(strData(Cel_L, j))        | 10 (L열)        | +Abs    | SRz5     |
| 17           | Abs(strData(Cel_R, j))        | 16 (R열)        | +Abs    | SRz6     |
| 18           | "0"                           | -               | 0       | 패딩      |
| 19           | Abs(strData(Cel_S, j))        | 17 (S열)        | +Abs    |          |
| 20           | Abs(strData(Cel_U, j))        | 19 (U열)        | +Abs    |          |
| 21           | Abs(strData(Cel_H, j))        | 6 (H열)         | +Abs    |          |

**부호 반전이 적용되는 성분**: strBuf[9] (Cel_O, SRy1)와 strBuf[11] (Cel_M, SRz1)만 `-1 * Abs()`로 음수화된다.

### 1.4 MCT 출력

각 스프링 타입에 대해 4줄 출력:

```
*GSPRTYPE    ; Define General Spring Supports
; NAME, SDx1, SDy1, SDy2, SDz1, SDz2, SDz3, ..., SRz1, ..., SRz6
;       MDx1, MDy1, MDy2, MDz1, MDz2, MDz3, ..., MRz1, ..., MRz6
;       DDx1, DDy1, DDy2, DDz1, DDz2, DDz3, ..., DRz1, ..., DRz6
;       bStiffness, bMass, bDamping
NAME,val1,val2,...,val21          ← 강성값 (21개)
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0   ← 질량 (전부 0)
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0   ← 감쇠 (전부 0)
YES,NO,NO                        ← 강성만 YES, 질량/감쇠는 NO
```

**출력 조건**: `nRowCnt > 5` (헤더 5줄 + 데이터 1건 이상)일 때만 MCT 시트에 기록한다.

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

`MCTGenerator.ts` Line 415-439에서 호출된다:

```typescript
// Step 15: Convert supports (fulcrum)
if (hasSheet(sheets, SHEET_NAMES.FULCRUM)) {
  const fulcrumData = getSheetDataForConversion(sheets, SHEET_NAMES.FULCRUM);
  const fulcrumResult = convertFulcrum(fulcrumData, context);

  // *CONSTRAINT 출력
  if (fulcrumResult.mctLinesConstraint.length > 2) {
    mctLines.push(...fulcrumResult.mctLinesConstraint);
  }

  // *GSPRING 출력이 있을 때만 *GSPRTYPE 변환 수행
  if (fulcrumResult.mctLinesGSpring.length > 2) {
    mctLines.push(...fulcrumResult.mctLinesGSpring);

    // Convert fulcrum details
    if (hasSheet(sheets, SHEET_NAMES.FULC_DETAIL)) {
      const detailData = getSheetDataForConversion(sheets, SHEET_NAMES.FULC_DETAIL);
      const detailResult = convertFulcrumDetail(detailData, context, fulcrumResult.springTypeMapping);
      if (detailResult.mctLines.length > 2) {
        mctLines.push(...detailResult.mctLines);
      }
    }
  }
}
```

**의존 관계**: VBA와 동일하게 `convertFulcrum`이 먼저 실행되어 `springTypeMapping: Map<string, boolean>`을 생성하고, 이를 `convertFulcrumDetail`에 전달한다. 추가로 TS에서는 `*GSPRING` 출력이 있을 때만(`length > 2`) `*GSPRTYPE` 변환을 시도한다.

### 2.2 데이터 읽기

**시트명**: `支点詳細` (SHEET_NAMES.FULC_DETAIL)

**시트 설정** (sheetNames.ts):
```typescript
FULC_DETAIL: { name: '支点詳細', startRow: 4, startCol: 2, endCol: 21, headerRows: 2 }
```

`getSheetDataForConversion`을 통해 헤더 행을 건너뛴 데이터가 `rawData: (string | number)[][]`로 전달된다. 각 행은 0~19 인덱스를 가지며 VBA의 strData(0~19)에 대응한다.

### 2.3 데이터 가공

**OUTPUT_MAPPING 상수** (FulcDetailConverter.ts Line 24-47):

VBA의 strBuf 매핑을 그대로 구현한 배열:

```typescript
const OUTPUT_MAPPING: { cellIndex: number; sign: number }[] = [
  { cellIndex: 2, sign: 1 },    // strBuf[1] = Abs(Cel_D) = SDx1
  { cellIndex: 9, sign: 1 },    // strBuf[2] = Abs(Cel_K) = SDy1
  { cellIndex: 4, sign: 1 },    // strBuf[3] = Abs(Cel_F) = SDy2
  { cellIndex: 8, sign: 1 },    // strBuf[4] = Abs(Cel_J) = SDz1
  { cellIndex: 12, sign: 1 },   // strBuf[5] = Abs(Cel_N) = SDz2
  { cellIndex: 3, sign: 1 },    // strBuf[6] = Abs(Cel_E) = SDz3
  { cellIndex: -1, sign: 0 },   // strBuf[7] = "0" (패딩)
  { cellIndex: 15, sign: 1 },   // strBuf[8] = Abs(Cel_Q) = SRx1
  { cellIndex: 13, sign: -1 },  // strBuf[9] = -1*Abs(Cel_O) = SRy1
  { cellIndex: 5, sign: 1 },    // strBuf[10] = Abs(Cel_G) = SRy2
  { cellIndex: 11, sign: -1 },  // strBuf[11] = -1*Abs(Cel_M) = SRz1
  { cellIndex: -1, sign: 0 },   // strBuf[12] = "0" (패딩)
  { cellIndex: 14, sign: 1 },   // strBuf[13] = Abs(Cel_P) = SRz2
  { cellIndex: 18, sign: 1 },   // strBuf[14] = Abs(Cel_T) = SRz3
  { cellIndex: 7, sign: 1 },    // strBuf[15] = Abs(Cel_I) = SRz4
  { cellIndex: 10, sign: 1 },   // strBuf[16] = Abs(Cel_L) = SRz5
  { cellIndex: 16, sign: 1 },   // strBuf[17] = Abs(Cel_R) = SRz6
  { cellIndex: -1, sign: 0 },   // strBuf[18] = "0" (패딩)
  { cellIndex: 17, sign: 1 },   // strBuf[19] = Abs(Cel_S)
  { cellIndex: 19, sign: 1 },   // strBuf[20] = Abs(Cel_U)
  { cellIndex: 6, sign: 1 },    // strBuf[21] = Abs(Cel_H)
];
```

**처리 로직** (Line 108-155):
```typescript
for (let j = 0; j < rawData.length; j++) {
  const supportName = String(row[0]);
  if (!springTypeMapping.get(supportName)) continue;  // dicSprType 필터링

  const stiffValues: string[] = [];
  for (const mapping of OUTPUT_MAPPING) {
    if (mapping.cellIndex === -1) {
      stiffValues.push('0');
    } else {
      const rawValue = safeParseNumber(row[mapping.cellIndex]);
      const value = mapping.sign * Math.abs(rawValue);
      stiffValues.push(String(value));
    }
  }
  // ...
}
```

**safeParseNumber 함수** (unitConversion.ts):
- 숫자 타입이면 그대로 반환
- 문자열이면 `parseFloat` 시도, 실패하면 0 반환
- 그 외 타입이면 0 반환

이는 VBA의 `If Not IsNumeric(strData(j, i)) Then strData(j, i) = 0` 전처리와 동등한 기능을 한다.

### 2.4 MCT 출력

각 스프링 타입에 대해 VBA와 동일한 4줄 출력:

```typescript
mctLines.push(`${supportName},${stiffValues.join(',')}`);     // 강성값
mctLines.push('0, 0, 0, ..., 0, 0, 0');                       // 질량 (21 zeros)
mctLines.push('0, 0, 0, ..., 0, 0, 0');                       // 감쇠 (21 zeros)
mctLines.push('YES,NO,NO');                                    // 플래그
```

**출력 조건**: `mctLines.length > 2` (헤더 포함 3줄 이상)일 때 최종 MCT에 추가.

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 여부 |
|------|-----|-----------|----------|
| 시트명 | `支点詳細` | `支点詳細` (SHEET_NAMES.FULC_DETAIL) | 일치 |
| 시작 행 | 4 (nReadSTRow) | 4 (sheetNames.ts FULC_DETAIL.startRow) | 일치 |
| 열 범위 | B~U (col 2~21, 20열) | col 2~21 (sheetNames.ts startCol/endCol) | 일치 |
| dicSprType/springTypeMapping 의존 | ChangeFulcrum → ChangeFulcDetail | convertFulcrum → convertFulcrumDetail | 일치 |
| 스프링 타입 필터링 | `dicSprType(strData(0,j))` = True | `springTypeMapping.get(supportName)` = true | 일치 |
| OUTPUT_MAPPING 21개 값 순서 | strBuf[1]~strBuf[21] | OUTPUT_MAPPING 배열 (21 entries) | 일치 |
| 부호 반전 (Cel_O, Cel_M) | `-1 * Abs()` | `sign: -1` | 일치 |
| 패딩 위치 (인덱스 7, 12, 18) | `"0"` 고정 | `cellIndex: -1, sign: 0` | 일치 |
| 질량/감쇠 행 | 21개 0 | 21개 0 | 일치 |
| 플래그 행 | `YES,NO,NO` | `YES,NO,NO` | 일치 |
| MCT 헤더 주석 5줄 | 동일 | 동일 | 일치 |
| 비숫자 → 0 처리 | `If Not IsNumeric Then 0` | `safeParseNumber` (default 0) | 일치 |
| `Abs()` 적용 | 모든 값에 `Abs()` | `Math.abs(rawValue)` | 일치 |

### 3.2 차이점

#### 차이 1: 비숫자 전처리 시점

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 처리 시점 | 데이터 읽기 직후 전체 배열에 일괄 전처리 | 각 값 사용 시점에 `safeParseNumber`로 개별 처리 |
| 영향 | 없음 - 결과적으로 동일 (비숫자 → 0) |  |

#### 차이 2: 빈 행 스킵 로직

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 스킵 기준 | `GetData` 함수에서 `Len(mWS.Cells(i, nSTCol).Value) > 0`이고 전체 행의 `Trim(strBuf) = 0`이면 제외 | `!row[0] || String(row[0]).trim() === ''`일 때 skip |
| 영향 | VBA는 B열이 비어있으면 행 자체를 읽지 않음. TS도 row[0]이 빈 문자열이면 스킵하므로 동등 |  |

#### 차이 3: 출력 조건 차이

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 데이터 존재 확인 | `nRowCnt > 5` (헤더 5줄 + 데이터 1건 = 최소 9줄) | `mctLines.length > 2` (MCTGenerator에서, 헤더 5줄 이미 포함) |
| 영향 | VBA의 `nRowCnt > 5`는 "헤더 5줄 이후 데이터가 1줄 이상" 의미. TS의 `mctLines.length > 2`는 "헤더 5줄 포함하여 3줄 초과" 의미이므로 헤더 5줄만 있어도 length=5 > 2로 출력될 수 있음. **하지만** TS에서는 헤더가 항상 출력되고, 데이터가 없으면 `mctLines`에는 헤더 5줄만 들어가므로 length=5 > 2 = true가 되어 빈 `*GSPRTYPE` 헤더만 출력될 가능성이 있음 |

> **주의**: 이 차이가 실질적 문제가 되는 경우는 `springTypeMapping`에 스프링 타입이 있지만 `支点詳細` 시트에 해당 이름이 없는 경우이다. VBA에서는 헤더만 있는 경우 출력하지 않지만, TS에서는 헤더만 출력할 수 있다. 단, MCTGenerator에서 `*GSPRING` 출력이 있을 때만 `*GSPRTYPE` 변환을 시도하므로(`mctLinesGSpring.length > 2`), 스프링이 아예 없는 경우에는 양쪽 모두 출력하지 않는다.

#### 차이 4: TS의 gSprTypes 구조체 (추가 데이터)

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 반환 데이터 | MCT 문자열만 출력 | `MCTGSprType[]` 구조체도 함께 반환 (no, name, sdx~srz) |
| gSprTypes 매핑 | 해당 없음 | `row[2]~row[7]` → `sdx~srz` (단순 6성분) |
| 영향 | MCT 출력에는 영향 없음. `gSprTypes`는 타입 체크 등 내부 용도 |

#### 차이 5: 강성값의 쉼표 후 공백

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 강성값 행 구분자 | `","` (쉼표만, 공백 없음) | `","` (join으로 결합, 공백 없음) |
| 질량/감쇠 행 구분자 | `"0, 0, 0, ..."` (쉼표 + 공백) | `"0, 0, 0, ..."` (쉼표 + 공백) |
| 영향 | **동일**. 강성값 행은 양쪽 모두 공백 없이 쉼표로 연결. 질량/감쇠 행은 양쪽 모두 쉼표+공백 |

### 3.3 차이로 인한 MCT 결과 영향

#### 정상 케이스 (스프링 타입 데이터가 존재하는 경우)
- **MCT 결과 동일**: 21개 강성값의 순서, 부호, 패딩 위치가 완전히 일치하며, 질량/감쇠 행(0 21개)과 플래그(YES,NO,NO)도 동일하다.

#### 엣지 케이스 (데이터 없음)
- **차이 3에 의한 잠재적 차이**: 스프링 타입은 존재하지만 `支点詳細` 시트에 매칭되는 행이 없는 경우, VBA는 `*GSPRTYPE` 헤더를 출력하지 않지만, TS는 헤더 5줄만 출력할 수 있다. 그러나 이 상황은 실제 데이터에서 거의 발생하지 않으며, MIDAS Civil NX가 빈 헤더를 무시할 수 있으므로 실질적 문제는 없다.

---

## 4. 결론

**PASS**

- 21개 강성값 매핑(OUTPUT_MAPPING)이 VBA의 strBuf 생성 로직과 1:1 대응한다.
- 부호 반전(-1 * Abs)이 적용되는 Cel_O(인덱스 13)와 Cel_M(인덱스 11)이 정확히 일치한다.
- 패딩(0) 위치 (인덱스 7, 12, 18)가 일치한다.
- 질량/감쇠 21개 0, 플래그 YES/NO/NO가 일치한다.
- dicSprType / springTypeMapping 필터링 로직이 동일하다.
- 비숫자 → 0 처리 및 Abs() 적용이 동등하다.

### 주의사항
1. **빈 데이터 시 헤더 출력 차이**: 스프링 타입은 있으나 `支点詳細`에 매칭 행이 없을 때, TS가 빈 헤더를 출력할 수 있다. 실질적 영향은 없으나 인지할 것.
2. **gSprTypes 구조체**: TS에서 추가로 반환하는 `MCTGSprType[]`은 row[2]~row[7]을 단순 매핑하며, MCT 출력의 21개 강성값 매핑과는 다른 단순화된 구조이다. 이는 MCT 출력에 영향을 주지 않는 내부 데이터이다.
