# *CONSTRAINT / *GSPRING 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 189 - 클래스 선언
Private clsFulcrum As Class160_Fulcrum

' main.bas Line 296 - 인스턴스 생성
Set clsFulcrum = New Class160_Fulcrum

' main.bas Line 468 - 변환 실행
If ChangeSheetName.Exists(m_Sheet_Fulcrum) Then Call clsFulcrum.ChangeFulcrum(dicSprType)
' main.bas Line 469 - 후속: 지점 상세 변환
If ChangeSheetName.Exists(m_Sheet_FulcDetail) Then Call clsFulcDetail.ChangeFulcDetail(dicSprType)
```

- `dicSprType`은 `ChangeFulcrum` 내부에서 채워지며, `ChangeFulcDetail`에 전달되어 스프링 타입 여부를 판별하는 데 사용된다.
- 시트 이름: `m_Sheet_Fulcrum = "支点"` (main.bas Line 47)

### 1.2 데이터 읽기

```vba
Private Const nReadSTRow = 3    ' 데이터 시작 행
Private Const nReadSTCol = 2    ' 데이터 시작 열
Private Const nReadEDCol = 13   ' 데이터 종료 열

nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
```

`GetData` 호출로 "支点" 시트의 Row 3부터, Col 2~13 범위의 데이터를 `strData(col_offset, row_index)` 형태로 읽어온다.

**strData 열 매핑 (0-based offset from Col 2):**

| strData index | Excel Col | 의미 |
|---|---|---|
| 0 | B (2) | 지점명 (支点名) |
| 1 | C (3) | (미사용) |
| 2 | D (4) | 절점명 (節点名) |
| 3 | E (5) | DX 구속조건 |
| 4 | F (6) | DY 구속조건 |
| 5 | G (7) | DZ 구속조건 |
| 6 | H (8) | RX 구속조건 |
| 7 | I (9) | RY 구속조건 |
| 8 | J (10) | RZ 구속조건 |
| 9-11 | K-M | 추가 열 |

### 1.3 데이터 가공

#### 1.3.1 자유도 매핑 (dicFreeFixt)
```vba
dicFreeFixt.Add "自由", 0    ' 자유 = 0
dicFreeFixt.Add "固定", 1    ' 고정 = 1
```

#### 1.3.2 스프링 판별
```vba
Private Const strSpring = "ばね"

For k = 3 To 8       ' strData(3)~strData(8) = DX~RZ
  If strData(k, j) = strSpring Then
    bOutput = True   ' 하나라도 "ばね"이면 스프링 타입
    Exit For
  End If
Next k
```

#### 1.3.3 스프링 지점 (*GSPRING) 출력 생성
```vba
If bOutput Then
  dicSprType.Add strData(0, j), True   ' 스프링 타입으로 등록
  ' 출력: 노드번호, 지점명, (빈 그룹)
  strBuf(0) = m_NodeData(strData(2, j))  ' 절점명 -> 노드번호
  strBuf(1) = strData(0, j)              ' 지점명
  strBuf(2) = ""                         ' 빈 그룹
  ' 결과: "노드번호,지점명,"
```

#### 1.3.4 고정/자유 구속 (*CONSTRAINT) 출력 생성
```vba
Else
  dicSprType.Add strData(0, j), False   ' 비스프링 타입으로 등록
  strBuf(0) = m_NodeData(strData(2, j)) ' 절점명 -> 노드번호
  ' DOF 문자열 (좌표계 변환 적용):
  strBuf(1) = dicFreeFixt(strData(3, j)) & _   ' ES DX -> MCT DX
              dicFreeFixt(strData(5, j)) & _   ' ES DZ -> MCT DY
              dicFreeFixt(strData(4, j)) & _   ' ES DY -> MCT DZ
              dicFreeFixt(strData(6, j)) & _   ' ES RX -> MCT RX
              dicFreeFixt(strData(8, j)) & _   ' ES RZ -> MCT RY
              dicFreeFixt(strData(7, j))       ' ES RY -> MCT RZ
  strBuf(2) = ""                               ' 빈 그룹
  ' 결과: "노드번호,011010,"  (예시)
```

**좌표계 변환 규칙 (ES -> MIDAS Civil):**
- ES X -> MCT X (변환 없음)
- ES Z -> MCT Y (2번째 자리)
- ES Y -> MCT Z (3번째 자리)
- ES RX -> MCT RX (변환 없음)
- ES RZ -> MCT RY (5번째 자리)
- ES RY -> MCT RZ (6번째 자리)

### 1.4 MCT 출력

#### *GSPRING 섹션
```
*GSPRING    ; General Spring Supports
; NODE_LIST, TYPE-NAME, GROUP
노드번호,지점명,
```

#### *CONSTRAINT 섹션
```
*CONSTRAINT    ; Supports
; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP
노드번호,DOF문자열,
```

**빈 데이터 처리:**
```vba
' 헤더만 있고 데이터가 없으면 헤더 자체를 삭제
If nRowCnt(0) = 2 Then    ' GSPRING 데이터 없음
  vWriteData(0, 0) = ""
  vWriteData(1, 0) = ""
End If
If nRowCnt(1) = 2 Then    ' CONSTRAINT 데이터 없음
  vWriteData(0, m_nInterval) = ""
  vWriteData(1, m_nInterval) = ""
End If
```

VBA는 GSPRING과 CONSTRAINT를 MCT 시트의 다른 열 영역에 동시에 기록한다:
- GSPRING: `m_FULCRUM_COL` (Col 71)
- CONSTRAINT: `m_FULCRUM_COL + m_nInterval` = `m_FULCRUM2_COL` (Col 76)

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Lines 417-440
if (hasSheet(sheets, SHEET_NAMES.FULCRUM)) {
  const fulcrumData = getSheetDataForConversion(sheets, SHEET_NAMES.FULCRUM);
  const fulcrumResult = convertFulcrum(fulcrumData, context);

  if (fulcrumResult.mctLinesConstraint.length > 2) {
    mctLines.push(...fulcrumResult.mctLinesConstraint);
    mctLines.push('');
  }

  if (fulcrumResult.mctLinesGSpring.length > 2) {
    mctLines.push(...fulcrumResult.mctLinesGSpring);
    mctLines.push('');

    // GSPRING이 있을 때만 FulcrumDetail 변환 수행
    if (hasSheet(sheets, SHEET_NAMES.FULC_DETAIL)) {
      const detailData = getSheetDataForConversion(sheets, SHEET_NAMES.FULC_DETAIL);
      const detailResult = convertFulcrumDetail(detailData, context, fulcrumResult.springTypeMapping);
      if (detailResult.mctLines.length > 2) {
        mctLines.push(...detailResult.mctLines);
        mctLines.push('');
      }
    }
  }
}
```

- 시트명: `SHEET_NAMES.FULCRUM = '支点'`
- `springTypeMapping`을 `Map<string, boolean>`으로 반환하여 FulcrumDetail에 전달

### 2.2 데이터 읽기

```typescript
// ExcelParser.ts - SHEET_CONFIGS
FULCRUM: { name: '支点', startRow: 3, startCol: 2, endCol: 13 }
```

`getSheetDataForConversion`이 `sheet.data`를 반환한다. `parseWorksheetData`가 Row 3부터 Col 2~13 범위의 데이터를 읽되, 첫 번째 열(Col 2)이 비어있는 행은 건너뛴다. 결과적으로 `rawData[j]`의 인덱스 매핑은 VBA의 `strData` 인덱스와 동일하다:

| rawData[j][idx] | Excel Col | VBA strData(idx) |
|---|---|---|
| row[0] | B (2) | strData(0) = 지점명 |
| row[1] | C (3) | strData(1) |
| row[2] | D (4) | strData(2) = 절점명 |
| row[3] | E (5) | strData(3) = DX |
| row[4] | F (6) | strData(4) = DY |
| row[5] | G (7) | strData(5) = DZ |
| row[6] | H (8) | strData(6) = RX |
| row[7] | I (9) | strData(7) = RY |
| row[8] | J (10) | strData(8) = RZ |

### 2.3 데이터 가공

#### 2.3.1 자유도 매핑
```typescript
const FREE_FIXT_MAP: Record<string, string> = {
  '自由': '0',
  '固定': '1',
  'Free': '0',    // 추가 지원 (VBA에는 없음)
  'Fixed': '1',   // 추가 지원 (VBA에는 없음)
  '': '0',        // 빈 값 = 자유 (VBA에는 없음)
};
```

#### 2.3.2 스프링 판별
```typescript
const SPRING_STRING = 'ばね';

let bOutput = false;
for (let k = 3; k <= 8; k++) {
  const dofValue = String(row[k] || '');
  if (dofValue === SPRING_STRING) {
    bOutput = true;
    break;
  }
}
```

#### 2.3.3 스프링 지점 (*GSPRING)
```typescript
if (bOutput) {
  springTypeMapping.set(supportName, true);
  gspringLines.push(`${nodeNo},${supportName},`);
  gspringCount++;
}
```

#### 2.3.4 고정/자유 구속 (*CONSTRAINT)
```typescript
else {
  springTypeMapping.set(supportName, false);

  const dofValues: string[] = [];
  for (let k = 3; k <= 8; k++) {
    const dofStr = String(row[k] || '');
    dofValues.push(FREE_FIXT_MAP[dofStr] ?? '0');
  }

  // 좌표계 변환 (ES -> MIDAS)
  const dofString =
    dofValues[0] +  // ES DX -> MCT DX
    dofValues[2] +  // ES DZ -> MCT DY
    dofValues[1] +  // ES DY -> MCT DZ
    dofValues[3] +  // ES RX -> MCT RX
    dofValues[5] +  // ES RZ -> MCT RY
    dofValues[4];   // ES RY -> MCT RZ

  constraintLines.push(`${nodeNo},${dofString},`);
  constraintCount++;
}
```

### 2.4 MCT 출력

#### *GSPRING 섹션
```
*GSPRING    ; General Spring Supports
; NODE_LIST, TYPE-NAME, GROUP
노드번호,지점명,
```

#### *CONSTRAINT 섹션
```
*CONSTRAINT    ; Supports
; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP
노드번호,DOF문자열,
```

**빈 데이터 처리:**
```typescript
// 데이터가 있을 때만 헤더+데이터를 출력 배열에 추가
if (gspringCount > 0) {
  mctLinesGSpring.push(...gspringLines);    // 헤더 2줄 + 데이터
}
if (constraintCount > 0) {
  mctLinesConstraint.push(...constraintLines); // 헤더 2줄 + 데이터
}
```

MCTGenerator에서 `length > 2` 조건으로 한 번 더 확인 후 최종 MCT 문자열에 추가한다.

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 |
|---|---|---|---|
| 시트명 | "支点" | `SHEET_NAMES.FULCRUM = '支点'` | O |
| 데이터 범위 | Row 3+, Col 2~13 | `startRow: 3, startCol: 2, endCol: 13` | O |
| 스프링 판별 문자열 | `"ばね"` | `'ばね'` | O |
| 스프링 판별 범위 | strData(3)~strData(8) | row[3]~row[8] | O |
| *GSPRING 헤더 | `*GSPRING    ; General Spring Supports` | 동일 | O |
| *GSPRING 주석 | `; NODE_LIST, TYPE-NAME, GROUP` | 동일 | O |
| *CONSTRAINT 헤더 | `*CONSTRAINT    ; Supports` | 동일 | O |
| *CONSTRAINT 주석 | `; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP` | 동일 | O |
| 좌표계 변환 DX | strData(3) -> 1번째 | dofValues[0] -> 1번째 | O |
| 좌표계 변환 DZ->DY | strData(5) -> 2번째 | dofValues[2] -> 2번째 | O |
| 좌표계 변환 DY->DZ | strData(4) -> 3번째 | dofValues[1] -> 3번째 | O |
| 좌표계 변환 RX | strData(6) -> 4번째 | dofValues[3] -> 4번째 | O |
| 좌표계 변환 RZ->RY | strData(8) -> 5번째 | dofValues[5] -> 5번째 | O |
| 좌표계 변환 RY->RZ | strData(7) -> 6번째 | dofValues[4] -> 6번째 | O |
| GSPRING 출력 포맷 | `노드번호,지점명,` | `` `${nodeNo},${supportName},` `` | O |
| CONSTRAINT 출력 포맷 | `노드번호,DOF문자열,` | `` `${nodeNo},${dofString},` `` | O |
| 데이터 없을 때 처리 | 헤더 삭제 | 헤더 미추가 (동일 효과) | O |
| springTypeMapping | `dicSprType.Add name, True/False` | `springTypeMapping.set(name, true/false)` | O |
| 노드번호 조회 | `m_NodeData(strData(2,j))` | `context.nodeMapping.get(nodeName)` | O |

### 3.2 차이점

| 항목 | VBA | TypeScript | 영향도 |
|---|---|---|---|
| 자유도 매핑 확장 | `"自由"`, `"固定"` 만 지원 | `"Free"`, `"Fixed"`, `""` 추가 지원 | 없음 (하위 호환) |
| 빈 행 처리 | `GetData`가 반환하는 범위만큼 순회 | `row[0]` 빈 값 체크로 건너뜀 | 없음 (동일 효과) |
| nodeNo 미존재 시 | `m_NodeData`에서 에러 또는 0 반환 | `nodeNo === undefined \|\| nodeNo === 0` 시 `continue` | 방어적 (안전함) |
| 출력 순서 | MCT 시트에 GSPRING(Col 71), CONSTRAINT(Col 76) 동시 기록 | MCT 문자열에 CONSTRAINT 먼저, GSPRING 나중 순서로 push | 아래 참조 |
| 헤더 행 포함 여부 | `GetData`는 데이터만 반환 | `parseWorksheetData`가 헤더 1행을 포함할 수 있으나, `row[0]` 빈 값 체크로 건너뜀 | 없음 |

### 3.3 차이로 인한 MCT 결과 영향

#### 3.3.1 출력 순서 차이
- **VBA**: GSPRING과 CONSTRAINT를 MCT 시트의 서로 다른 열 영역에 동시에 기록하므로, MCT 파일 생성 시 시트를 열 순서대로 읽으면 GSPRING이 먼저 나온다 (Col 71 < Col 76).
- **TypeScript**: MCTGenerator.ts에서 `mctLinesConstraint`를 먼저 push하고, `mctLinesGSpring`을 나중에 push한다 (Lines 421-424 vs 426-428).
- **영향**: MCT 파일 내에서 `*CONSTRAINT`와 `*GSPRING` 섹션의 순서만 다르다. MIDAS Civil은 MCT 키워드 기반으로 파싱하므로 섹션 순서에 무관하게 동일하게 동작한다. **실질적 영향 없음.**

#### 3.3.2 자유도 매핑 확장
- TypeScript는 `"Free"`, `"Fixed"`, `""` (빈 문자열)에 대한 추가 매핑을 포함한다.
- 이는 VBA에서 처리하지 않던 엣지 케이스에 대한 방어적 처리이며, 기존 "自由"/"固定" 입력에 대해서는 동일한 결과를 생성한다.
- **실질적 영향 없음.**

#### 3.3.3 노드 미존재 방어 처리
- VBA는 `m_NodeData`에 존재하지 않는 키를 조회하면 런타임 에러가 발생하거나 (`On Error Resume Next`가 활성화된 경우) 빈 값이 들어간다.
- TypeScript는 명시적으로 `continue`하여 해당 행을 건너뛴다.
- **동작 차이 있으나**, VBA에서도 `On Error Resume Next`가 활성화되어 있으므로 실질적으로는 빈 노드번호가 출력되거나 에러가 무시되는 것이 TypeScript의 skip 동작과 유사하다. MCT 결과에 실질적 차이를 만들 가능성은 극히 낮다.

---

## 4. 결론

**PASS**

TypeScript의 `FulcrumConverter.ts`는 VBA `Class160_Fulcrum.cls`의 핵심 로직을 정확히 재현하고 있다.

- 데이터 읽기 범위 (Row 3+, Col 2~13) 동일
- 스프링 판별 로직 ("ばね" 문자열 매칭, 인덱스 3~8) 동일
- 좌표계 변환 (ES Y/Z -> MCT Z/Y 스왑) 정확히 일치
- *GSPRING 및 *CONSTRAINT 출력 포맷 동일
- `springTypeMapping` (VBA `dicSprType`) 생성 및 전달 구조 동일
- 빈 데이터 처리 방식은 구현 방법이 다르나 결과적으로 동일 효과

**주의사항:**
- MCT 파일 내 섹션 순서가 VBA와 다르다 (TS: CONSTRAINT -> GSPRING, VBA: GSPRING -> CONSTRAINT). MIDAS Civil의 MCT 파서가 키워드 기반이므로 문제 없으나, 바이트 단위 비교 시에는 차이가 발생한다.
- TypeScript는 `"Free"`, `"Fixed"`, `""` 등 추가 입력값을 지원하므로, 비표준 입력이 들어왔을 때 VBA와 다른 동작을 보일 수 있다 (VBA는 에러, TS는 정상 처리).
