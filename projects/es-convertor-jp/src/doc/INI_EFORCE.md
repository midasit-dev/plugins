# *INI-EFORCE 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 472
If ChangeSheetName.Exists(m_Sheet_InternalForce) Then Call clsInternalForce.ChangeInternalForce
```

- `m_Sheet_InternalForce = "内力"` (main.bas Line 50)
- MCT 출력 컬럼: `m_INTERFORCE = 91` (main.bas Line 128)
- 시트가 존재할 경우에만 호출

### 1.2 데이터 읽기

```vba
' Class200_InternalForce.cls
Private Const nReadSTRow = 3    ' 데이터 시작 행 (1,2행은 헤더)
Private Const nReadSTCol = 2    ' B열부터
Private Const nReadEDCol = 12   ' L열까지 (11개 컬럼)
```

`GetData` 함수(main.bas Line 541-606)를 통해 데이터 읽기:
- `strData(컬럼인덱스, 행인덱스)` 형태의 2차원 배열로 반환
- 컬럼 인덱스: `j - nSTCol` 이므로 `0 ~ 10` (B열=0, C열=1, ... L열=10)
- `nCnt`: 0부터 시작하는 데이터 행 수 (실제 행 수 - 1)
- 빈 행은 건너뜀

**컬럼 매핑 (nReadSTCol=2 기준):**

| strData 인덱스 | Excel 컬럼 | 내용 |
|---|---|---|
| 0 | B | (미사용) |
| 1 | C | (미사용) |
| 2 | D | 요소 ID |
| 3 | E | Axial-i |
| 4 | F | Axial-j |
| 5 | G | Moment-z-i (부호 반전) |
| 6 | H | Moment-y-i |
| 7 | I | Moment-z-j (부호 반전) |
| 8 | J | Moment-y-j |
| 9 | K | Torsion-i |
| 10 | L | Torsion-j |

### 1.3 데이터 가공

VBA에서의 출력 배열 구성 (Lines 57-72):

```vba
strBuf(0) = "BEAM"                      ' 타입 고정
strBuf(1) = strData(2, j)               ' 요소 ID
strBuf(2) = strData(3, j)               ' Axial-i
strBuf(3) = "0,0"                       ' Shear-y-i, Shear-z-i (ES에 없음)
strBuf(4) = strData(9, j)               ' Torsion-i
strBuf(5) = strData(6, j)               ' Moment-y-i
strBuf(6) = -1 * strData(5, j)          ' Moment-z-i (부호 반전!)

strBuf(7) = strData(4, j)               ' Axial-j
strBuf(8) = "0,0"                       ' Shear-y-j, Shear-z-j (ES에 없음)
strBuf(9) = strData(10, j)              ' Torsion-j
strBuf(10) = strData(8, j)              ' Moment-y-j
strBuf(11) = -1 * strData(7, j)         ' Moment-z-j (부호 반전!)
```

**좌표 변환 핵심:**
1. ES의 전단력(Shear) 데이터는 시트에 없으므로 `0,0`으로 패딩
2. Moment-z (strData(5), strData(7))에 `-1`을 곱하여 부호 반전
3. 힘 성분 순서 재배열: ES 순서 -> MIDAS `[Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z]`

### 1.4 MCT 출력

```
*INI-EFORCE    ; Initial Element Force
; TYPE, ID, Axial-i, Axial-j     ; TRUSS
; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK
; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z
BEAM,요소ID,Axial-i,0,0,Torsion-i,Moment-y-i,-Moment-z-i,Axial-j,0,0,Torsion-j,Moment-y-j,-Moment-z-j
```

- 쉼표로 구분된 CSV 형식
- `strBuf(3)="0,0"` 은 단일 문자열이지만 쉼표가 포함되어 있어 결합 시 2개 필드로 출력됨
- 결과적으로 1행당 14개 필드 (TYPE + ID + 6 i-end + 6 j-end)

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Lines 481-490
// Step 18: Convert internal forces
report(95, '内力を変換中...');
if (hasSheet(sheets, SHEET_NAMES.INTERNAL_FORCE)) {
  const forceData = getSheetDataForConversion(sheets, SHEET_NAMES.INTERNAL_FORCE);
  const forceResult = convertInternalForce(forceData, context);
  if (forceResult.mctLines.length > 2) {
    mctLines.push(...forceResult.mctLines);
    mctLines.push('');
  }
}
```

- `SHEET_NAMES.INTERNAL_FORCE = '内力'` (sheetNames.ts Line 28)
- `SHEET_CONFIGS.INTERNAL_FORCE`: startRow=3, startCol=2, endCol=12
- `mctLines.length > 2` 조건: 헤더 4줄 중 데이터가 없으면(헤더만 있으면) 출력하지 않음

### 2.2 데이터 읽기

`getSheetDataForConversion` (ExcelParser.ts Lines 212-222):
- `parseWorksheetData`에서 startRow=3, startCol=2, endCol=12로 파싱
- 헤더 행은 이미 제외된 상태로 반환
- 각 행은 `(string | number)[]` 형태, 인덱스 0~10 (B열~L열)

**COL 상수 매핑 (InternalForceConverter.ts Lines 29-38):**

```typescript
const COL = {
  ELEM_ID: 2,        // strData(2) = 요소 ID
  AXIAL_I: 3,        // strData(3) = Axial-i
  AXIAL_J: 4,        // strData(4) = Axial-j
  MOMENT_Z_I: 5,     // strData(5) = Moment-z-i (부호 반전)
  MOMENT_Y_I: 6,     // strData(6) = Moment-y-i
  MOMENT_Z_J: 7,     // strData(7) = Moment-z-j (부호 반전)
  MOMENT_Y_J: 8,     // strData(8) = Moment-y-j
  TORSION_I: 9,      // strData(9) = Torsion-i
  TORSION_J: 10,     // strData(10) = Torsion-j
};
```

### 2.3 데이터 가공

```typescript
// InternalForceConverter.ts Lines 117-156
const strBuf: string[] = [];
strBuf.push('BEAM');                                          // [0] TYPE
strBuf.push(elemIdOut);                                       // [1] 요소 ID (매핑된 번호)
strBuf.push(String(safeParseNumber(row[COL.AXIAL_I])));       // [2] Axial-i
strBuf.push('0');                                             // [3] Shear-y-i
strBuf.push('0');                                             // [4] Shear-z-i
strBuf.push(String(safeParseNumber(row[COL.TORSION_I])));     // [5] Torsion-i
strBuf.push(String(safeParseNumber(row[COL.MOMENT_Y_I])));    // [6] Moment-y-i
strBuf.push(String(-1 * safeParseNumber(row[COL.MOMENT_Z_I])));// [7] -Moment-z-i
strBuf.push(String(safeParseNumber(row[COL.AXIAL_J])));       // [8] Axial-j
strBuf.push('0');                                             // [9] Shear-y-j
strBuf.push('0');                                             // [10] Shear-z-j
strBuf.push(String(safeParseNumber(row[COL.TORSION_J])));     // [11] Torsion-j
strBuf.push(String(safeParseNumber(row[COL.MOMENT_Y_J])));    // [12] Moment-y-j
strBuf.push(String(-1 * safeParseNumber(row[COL.MOMENT_Z_J])));// [13] -Moment-z-j
```

- `safeParseNumber`: 숫자 파싱 실패 시 기본값 0 반환
- `context.elementMapping`을 사용하여 요소 이름을 요소 번호로 변환

### 2.4 MCT 출력

```typescript
// Lines 99-103: 헤더 주석 (VBA와 동일)
mctLines.push('*INI-EFORCE    ; Initial Element Force');
mctLines.push('; TYPE, ID, Axial-i, Axial-j     ; TRUSS');
mctLines.push('; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK');
mctLines.push('; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z');

// Line 159: 쉼표 구분 결합
const mctLine = strBuf.join(',');
```

- 14개 요소를 쉼표로 결합하여 1행 생성
- 결과 형식: `BEAM,ID,Axial-i,0,0,Torsion-i,Moment-y-i,-Moment-z-i,Axial-j,0,0,Torsion-j,Moment-y-j,-Moment-z-j`

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 여부 |
|---|---|---|---|
| 시트 이름 | `"内力"` | `SHEET_NAMES.INTERNAL_FORCE = '内力'` | O |
| 데이터 시작 행 | nReadSTRow = 3 | startRow = 3 | O |
| 데이터 범위 | B열~L열 (col 2~12) | startCol=2, endCol=12 | O |
| 컬럼 인덱스 매핑 | strData(0~10) | COL 상수 (0~10) | O |
| 타입 고정값 | `"BEAM"` | `'BEAM'` | O |
| Axial-i 소스 | strData(3) | row[COL.AXIAL_I=3] | O |
| Axial-j 소스 | strData(4) | row[COL.AXIAL_J=4] | O |
| Moment-z-i 부호 반전 | `-1 * strData(5)` | `-1 * safeParseNumber(row[5])` | O |
| Moment-y-i 소스 | strData(6) | row[COL.MOMENT_Y_I=6] | O |
| Moment-z-j 부호 반전 | `-1 * strData(7)` | `-1 * safeParseNumber(row[7])` | O |
| Moment-y-j 소스 | strData(8) | row[COL.MOMENT_Y_J=8] | O |
| Torsion-i 소스 | strData(9) | row[COL.TORSION_I=9] | O |
| Torsion-j 소스 | strData(10) | row[COL.TORSION_J=10] | O |
| Shear 패딩 (i-end) | `"0,0"` | `'0','0'` | O |
| Shear 패딩 (j-end) | `"0,0"` | `'0','0'` | O |
| 출력 필드 순서 | BEAM,ID,Ax-i,0,0,T-i,My-i,-Mz-i,Ax-j,0,0,T-j,My-j,-Mz-j | 동일 | O |
| 헤더 주석 4줄 | 동일한 문자열 | 동일한 문자열 | O |
| 빈 행 건너뛰기 | `Len(strBuf) = 0` 또는 첫 열 비어있으면 | `!row[COL.ELEM_ID]` 확인 | O |

### 3.2 차이점

#### 차이점 1: 요소 ID 매핑

| | VBA | TypeScript |
|---|---|---|
| 동작 | `strData(2, j)` 값을 그대로 사용 | `context.elementMapping.get(elemId)`로 요소 번호 변환 시도 |
| 매핑 없는 경우 | 해당 없음 (원본 값 그대로) | 원본 요소 ID 사용 (fallback) |

**분석:** VBA에서는 "内力" 시트의 D열 값을 그대로 요소 ID로 출력한다. TypeScript에서는 `elementMapping`을 통해 요소 이름 -> 요소 번호 변환을 시도하고, 매핑이 없으면 원본 값을 사용한다. ES 엑셀 파일의 "内力" 시트 D열에 이미 숫자 요소 ID가 들어있다면 결과는 동일하다. 요소 이름(문자열)이 들어있는 경우, VBA는 문자열 그대로 출력하고 TypeScript는 매핑된 번호를 출력하므로 차이가 발생할 수 있다.

#### 차이점 2: 숫자 포맷

| | VBA | TypeScript |
|---|---|---|
| 숫자 처리 | 셀 값을 문자열로 직접 사용 (`strData`는 String 배열) | `safeParseNumber`로 파싱 후 `String()`으로 변환 |
| `"-0"` 처리 | VBA의 `-1 * "0"` = `0` (숫자로 변환 후 연산) | `-1 * 0` = `-0`, `String(-0)` = `"0"` (JavaScript) |
| 소수점 표현 | Excel 셀 표시 형식에 의존 | JavaScript 기본 숫자 형식 |

**분석:** VBA에서는 `strData`가 String 배열이지만, `-1 *` 연산 시 VBA가 암묵적으로 숫자로 변환한 후 다시 문자열로 변환한다. TypeScript에서는 `safeParseNumber`로 명시적으로 파싱한다. 소수점 자릿수 표현에 미세한 차이가 있을 수 있으나(예: `1.0` vs `1`, `0.10` vs `0.1`), MCT 파서가 수치적으로 동일하게 해석하므로 기능적 영향은 없다.

#### 차이점 3: Shear 패딩 방식

| | VBA | TypeScript |
|---|---|---|
| 구현 | `strBuf(3) = "0,0"` (쉼표 포함 단일 문자열) | `strBuf.push('0'); strBuf.push('0')` (2개 별도 요소) |
| 결과 | `...,0,0,...` | `...,0,0,...` |

**분석:** 구현 방식은 다르지만 출력 결과는 완전히 동일하다. VBA는 "0,0" 단일 문자열에 쉼표가 포함되어 있고, 외부에서 `,`로 연결하면 `...,0,0,...`이 된다. TypeScript는 두 개의 `'0'`을 `join(',')`으로 연결하여 동일한 결과를 얻는다.

#### 차이점 4: 빈 데이터 처리

| | VBA | TypeScript |
|---|---|---|
| 시트 없음 | `nCnt < 0` -> 시트 삭제 후 종료 | `rawData.length === 0` -> 빈 결과 반환 |
| 빈 행 감지 | 첫 열 길이 + 모든 열 합산 길이 확인 | `row[COL.ELEM_ID]` 존재 여부만 확인 |
| 출력 조건 | 항상 헤더 출력 (빈 데이터여도) | `mctLines.length > 2` 조건으로 데이터 없으면 출력 안 함 |

**분석:** TypeScript의 `mctLines.length > 2` 조건은 헤더 4줄만 있고 데이터가 없는 경우를 감지하여 MCT에 포함시키지 않는다. VBA에서는 `nCnt < 0`이면 시트를 삭제하고 종료하므로 결과적으로 동일하게 빈 데이터 시 출력하지 않는다.

### 3.3 차이로 인한 MCT 결과 영향

| 차이점 | MCT 결과 영향 | 심각도 |
|---|---|---|
| 요소 ID 매핑 | ES 시트에 숫자 ID가 있으면 영향 없음. 문자열 요소명이 있는 경우 TypeScript가 올바른 번호로 변환하므로 오히려 더 정확함 | 낮음 (TypeScript가 더 적절) |
| 숫자 포맷 | `1.0` vs `1` 등 미세 차이 가능하나 MCT 파서가 동일하게 해석 | 없음 |
| Shear 패딩 | 출력 결과 동일 | 없음 |
| 빈 데이터 처리 | 양쪽 모두 빈 데이터 시 출력하지 않음 | 없음 |

---

## 4. 결론

**PASS**

- 힘 성분 순서 재배열 로직이 VBA와 TypeScript에서 완전히 일치한다.
- Moment-z의 부호 반전(`-1 *`)이 양쪽 모두 동일하게 적용된다.
- 출력 필드 순서 `[BEAM, ID, Axial-i, Shear-y-i(0), Shear-z-i(0), Torsion-i, Moment-y-i, -Moment-z-i, Axial-j, Shear-y-j(0), Shear-z-j(0), Torsion-j, Moment-y-j, -Moment-z-j]`가 완전히 동일하다.
- 헤더 주석 4줄이 문자열 수준에서 동일하다.
- 컬럼 인덱스 매핑(strData 인덱스 0~10)이 정확히 일치한다.

**주의사항:**
- TypeScript의 `context.elementMapping` 매핑은 VBA에 없는 추가 기능이다. ES 시트의 "内力" D열에 요소 이름(문자열)이 들어있는 경우, VBA는 해당 문자열을 그대로 출력하지만 TypeScript는 매핑된 요소 번호를 출력한다. MIDAS Civil NX는 요소 번호(정수)를 기대하므로 TypeScript의 동작이 더 올바르다.
- 숫자 형식의 미세한 차이(소수점 표현)가 있을 수 있으나, MCT 파서의 숫자 해석에는 영향을 주지 않는다.
