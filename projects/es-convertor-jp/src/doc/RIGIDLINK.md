# *RIGIDLINK 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- Line 434: `clsRigid.ReadRigid(strRigid)` (데이터 읽기 → strRigid 배열에 저장)
- Line 457: `clsRigid.ChangeRigid` (MCT 출력)

### 1.2 데이터 읽기
- 시트명: `"剛体要素"`
- 읽기 범위: Row 3~, Col 2~4 (B~D, 3개 열)
  - strData(0) = 요소 ID
  - strData(1) = 마스터 노드명
  - strData(2) = 슬레이브 노드 리스트 (쉼표 구분)

### 1.3 데이터 가공 (ChangeRigid)

#### 매핑
- `m_dicRigidElem.Add strData(0, j), strData(1, j)` → 요소ID-마스터노드 매핑

#### 슬레이브 노드 처리
- `If Len(strData(2, j)) > 0 Then` → 슬레이브가 있는 경우만 출력
- `vBuf = Split(strData(2, j), ",")` → 슬레이브 노드 파싱
- 슬레이브 노드들을 공백으로 연결

#### DOF
- 항상 `"111111"` (고정)

### 1.4 MCT 출력
```
*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
{마스터노드번호},111111,{슬레이브1} {슬레이브2} {슬레이브3},
```
- GROUP은 빈 문자열 (마지막 쉼표 뒤 빈값)

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 206-208: `readRigidData()` → 유효 데이터 필터링
- Line 241-249: `convertRigid()` → MCT 출력

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.RIGID)` → `readRigidData()`로 필터링

### 2.3 데이터 가공

#### 매핑
- `context.rigidMasterNode.set(elemId, masterNodeId)` → 요소ID-마스터노드 매핑
- `context.rigidElements.set(elemNo, { masterNode, slaveNodes })` → 요소 상세 저장

#### 슬레이브 노드 처리
- `slaveNodesStr.length === 0` → skip (VBA와 동일)
- `slaveNodesStr.split(',')` → 슬레이브 파싱
- `slaveNodeNos.join(' ')` → 공백으로 연결

#### DOF
- 항상 `'111111'` (고정)

### 2.4 MCT 출력
```
*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
{마스터노드번호},111111,{슬레이브1} {슬레이브2} {슬레이브3},
```

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| MCT 헤더/코멘트 | 동일 | 동일 | O |
| 데이터 형식 | `마스터,111111,슬레이브,` | 동일 | O |
| DOF | 항상 111111 | 항상 111111 | O |
| 슬레이브 구분자 | 공백 | 공백 | O |
| 슬레이브 없는 경우 | skip | skip | O |
| GROUP 필드 | 빈 문자열 | 빈 문자열 (trailing comma) | O |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| 마스터노드 변환 실패 | 오류 무시(On Error Resume Next) | `masterNodeNo === 0`이면 skip | **없음** - TS가 더 안전 |
| 슬레이브 노드 변환 실패 | 오류 무시 | 0인 슬레이브 skip | **없음** - TS가 더 안전 |
| 추가 context 저장 | `m_dicRigidElem`만 | `rigidElements` + `rigidMasterNode` | **없음** - 내부 참조용 |

### 3.3 차이로 인한 MCT 결과 영향
- 정상적인 입력 데이터에서는 동일한 MCT 출력 생성
- 잘못된 노드 참조 시 VBA는 On Error Resume Next로 무시, TS는 명시적 skip → 동일 효과

---

## 4. 결론
**PASS** - *RIGIDLINK 변환 로직은 VBA와 TypeScript가 기능적으로 동일. DOF, 슬레이브 노드 처리, MCT 출력 형식 모두 일치.
