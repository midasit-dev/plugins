# *NODALMASS 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 470
If ChangeSheetName.Exists(m_Sheet_NodalMass) Then Call clsNodalMass.ChangeNodalMass
```

- `m_Sheet_NodalMass = "節点質量"` (main.bas Line 49)
- 시트가 존재할 경우에만 `ChangeNodalMass` 호출
- 인자 없이 호출 (다른 컨버터와 달리 딕셔너리 등 외부 의존성 없음)

### 1.2 데이터 읽기

```vba
' Class180_NodalMass.cls
Private Const nReadSTRow = 4    ' 데이터 시작 행 (4행부터)
Private Const nReadSTCol = 2    ' B열
Private Const nReadEDCol = 11   ' K열
```

- `GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)` 호출
- `strData(열인덱스, 행인덱스)` 형태의 2차원 배열로 읽음 (열-행 순서 주의)
- 열 매핑 (B~K, 인덱스 0~9):
  - `strData(0, j)` = 절점 이름 (B열)
  - `strData(1, j)` ~ `strData(3, j)` = 기타 정보 (C~E열, 사용하지 않음)
  - `strData(4, j)` = mX (F열)
  - `strData(5, j)` = mY (G열, ES 좌표계)
  - `strData(6, j)` = mZ (H열, ES 좌표계)
  - `strData(7, j)` = rmX (I열)
  - `strData(8, j)` = rmY (J열, ES 좌표계)
  - `strData(9, j)` = rmZ (K열, ES 좌표계)

### 1.3 데이터 가공

**비숫자 값 처리 (Lines 48-54):**
```vba
For j = 0 To nCnt
  For i = 4 To 9
    If Not IsNumeric(strData(i, j)) Then
      strData(i, j) = 0#
    End If
  Next i
Next j
```
- 열 4~9(질량/회전질량 값)에 대해 비숫자 값을 0으로 치환

**좌표 변환 (Lines 64-70):**
```vba
strBuf(0) = m_NodeData(strData(0, j))   ' 절점 이름 → 절점 번호 변환
strBuf(1) = strData(4, j)               ' ES mX  → MCT mX (변환 없음)
strBuf(2) = strData(6, j)               ' ES mZ  → MCT mY (Y/Z 교환)
strBuf(3) = strData(5, j)               ' ES mY  → MCT mZ (Y/Z 교환)
strBuf(4) = strData(7, j)               ' ES rmX → MCT rmX (변환 없음)
strBuf(5) = strData(9, j)               ' ES rmZ → MCT rmY (Y/Z 교환)
strBuf(6) = strData(8, j)               ' ES rmY → MCT rmZ (Y/Z 교환)
```

- **절점 이름 → 절점 번호**: `m_NodeData` 글로벌 딕셔너리 사용 (Class010_Node에서 구축)
- **좌표 변환**: ES(X,Y,Z) → MIDAS(X,Z,Y) — Y와 Z를 교환
  - 부호 반전은 없음 (질량은 스칼라이므로 방향 부호 불필요)

### 1.4 MCT 출력

```vba
' 헤더 (Lines 56-57)
vWriteData(0, 0) = "*NODALMASS    ; Nodal Masses"
vWriteData(1, 0) = "; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ"

' 데이터 (Lines 72-75)
' 형식: 절점번호,mX,mY,mZ,rmX,rmY,rmZ
vWriteData(nRowCnt, 0) = strBuf(0) & "," & strBuf(1) & "," & ... & "," & strBuf(6)
```

- MCT 시트의 `m_NODALMASS_COL` 열에 기록
- 출력 형식: `nodeNo,mX,mY,mZ,rmX,rmY,rmZ` (7개 필드, 콤마 구분)
- 주석 헤더에는 rAngX, rAngY, rAngZ가 표시되지만, 실제 데이터에는 포함되지 않음 (7개 필드만 출력)

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Lines 442-451
report(85, '節点質量を変換中...');
if (hasSheet(sheets, SHEET_NAMES.NODAL_MASS)) {
  const massData = getSheetDataForConversion(sheets, SHEET_NAMES.NODAL_MASS);
  const massResult = convertNodalMass(massData, context);
  if (massResult.mctLines.length > 2) {
    mctLines.push(...massResult.mctLines);
    mctLines.push('');
  }
}
```

- `SHEET_NAMES.NODAL_MASS = '節点質量'` (sheetNames.ts Line 26)
- `getSheetDataForConversion`으로 데이터를 가져옴 (헤더 행은 이미 제거됨)
- `mctLines.length > 2` 체크: 헤더 2줄(주석)만 있는 경우 출력하지 않음

### 2.2 데이터 읽기

```typescript
// NodalMassConverter.ts - convertNodalMass 함수
const row = rawData[j];
const nodeId = String(row[0]);
```

- `rawData`는 `(string | number)[][]` 형태
- `row[0]`이 비어있으면 해당 행 건너뜀
- 시트 설정: `startRow: 4, startCol: 2, endCol: 11` (sheetNames.ts Line 214) — VBA와 동일

### 2.3 데이터 가공

**비숫자 값 처리:**
```typescript
const esMx = safeParseNumber(row[4]);   // 비숫자 → 0 (기본값)
const esMy = safeParseNumber(row[5]);
const esMz = safeParseNumber(row[6]);
const esRmx = safeParseNumber(row[7]);
const esRmy = safeParseNumber(row[8]);
const esRmz = safeParseNumber(row[9]);
```

- `safeParseNumber`은 숫자가 아닌 값을 기본값 0으로 변환 (VBA의 `IsNumeric` 체크와 동일)

**좌표 변환 (Lines 98-105):**
```typescript
const mctMx = esMx;    // ES mX  → MCT mX (변환 없음)
const mctMy = esMz;    // ES mZ  → MCT mY (Y/Z 교환)
const mctMz = esMy;    // ES mY  → MCT mZ (Y/Z 교환)
const mctRmx = esRmx;  // ES rmX → MCT rmX (변환 없음)
const mctRmy = esRmz;  // ES rmZ → MCT rmY (Y/Z 교환)
const mctRmz = esRmy;  // ES rmY → MCT rmZ (Y/Z 교환)
```

**절점 번호 변환:**
```typescript
const nodeNo = context.nodeMapping.get(nodeId) || 0;
if (nodeNo === 0) continue;  // 매핑 실패 시 건너뜀
```

### 2.4 MCT 출력

```typescript
// 헤더 (Lines 77-78)
mctLines.push('*NODALMASS    ; Nodal Masses');
mctLines.push('; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ');

// 데이터 (Line 108)
const mctLine = `${nodeNo},${mctMx},${mctMy},${mctMz},${mctRmx},${mctRmy},${mctRmz}`;
mctLines.push(mctLine);
```

- 출력 형식: `nodeNo,mX,mY,mZ,rmX,rmY,rmZ` (7개 필드, 콤마 구분)
- VBA와 동일한 헤더 주석 사용

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 여부 |
|------|-----|-----------|----------|
| 시트 이름 | `"節点質量"` | `SHEET_NAMES.NODAL_MASS = '節点質量'` | 일치 |
| 데이터 시작 행 | `nReadSTRow = 4` | `startRow: 4` | 일치 |
| 데이터 열 범위 | `B~K (2~11)` | `startCol: 2, endCol: 11` | 일치 |
| 비숫자 처리 | `IsNumeric → 0` | `safeParseNumber → 0` | 일치 |
| 좌표 교환 | `ES(X,Y,Z) → MCT(X,Z,Y)` | `ES(X,Y,Z) → MCT(X,Z,Y)` | 일치 |
| 절점 번호 | `m_NodeData(이름)` | `context.nodeMapping.get(이름)` | 일치 |
| MCT 헤더 | `*NODALMASS    ; Nodal Masses` | `*NODALMASS    ; Nodal Masses` | 일치 |
| 주석 행 | `; NODE_LIST, mX, mY, ...` | `; NODE_LIST, mX, mY, ...` | 일치 |
| 출력 형식 | `nodeNo,mX,mY,mZ,rmX,rmY,rmZ` | `nodeNo,mX,mY,mZ,rmX,rmY,rmZ` | 일치 |
| 필드 수 | 7개 (rAng 미포함) | 7개 (rAng 미포함) | 일치 |

### 3.2 차이점

| 항목 | VBA | TypeScript | 영향도 |
|------|-----|-----------|--------|
| 절점 매핑 실패 시 | `m_NodeData`에 키가 없으면 런타임 에러 | `nodeNo === 0`이면 해당 행 건너뜀 (skip) | 낮음 |
| 빈 행 처리 | 모든 행을 처리 (빈 행도 출력 가능) | `row[0]`이 비어있으면 건너뜀 | 낮음 |
| 단위 변환 | 없음 (Excel에서 이미 변환된 값 사용) | 없음 | 없음 |
| 시트 존재 체크 | `ChangeSheetName.Exists` (main.bas) | `hasSheet(sheets, ...)` | 없음 |

### 3.3 차이로 인한 MCT 결과 영향

1. **절점 매핑 실패 처리**: VBA에서는 매핑되지 않은 절점 이름으로 `m_NodeData` 딕셔너리를 조회하면 런타임 에러가 발생할 수 있으나, TypeScript에서는 해당 행을 건너뛴다. 정상적인 데이터에서는 이 차이가 발생하지 않으므로, MCT 결과에 영향 없음.

2. **빈 행 처리**: VBA는 `nCnt`가 `GetData`의 반환값으로 설정되어 유효 데이터 건수만큼만 순회하므로, 실질적으로 빈 행이 처리되지 않는다. TypeScript도 `row[0]` 빈 체크로 동일한 효과. MCT 결과 영향 없음.

3. **숫자 포맷**: VBA는 원본 문자열을 그대로 출력하고, TypeScript는 `safeParseNumber`로 파싱한 숫자를 출력한다. 이로 인해 소수점 표기(예: `0.000` vs `0`)가 다를 수 있으나, MCT 파서가 수치적으로 동일하게 인식하므로 실질적 영향 없음.

---

## 4. 결론

- **PASS**

핵심 로직이 완전히 일치한다:
- 데이터 읽기 범위 (행 4, 열 B~K)
- 비숫자 값의 0 치환
- ES → MIDAS 좌표 변환 (Y/Z 교환)
- 절점 이름 → 절점 번호 매핑
- MCT 출력 형식 (헤더 + 데이터 7필드)

NodalMass는 단순한 구조의 변환기로, 단위 변환이나 복잡한 가공 없이 좌표 교환과 절점 번호 매핑만 수행한다. VBA와 TypeScript의 로직이 동일하며, MCT 출력 결과가 일치할 것으로 판단된다.
