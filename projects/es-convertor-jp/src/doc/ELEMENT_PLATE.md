# *ELEMENT (Plate) 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- Line 447: `clsPlnElm.ChangePlnElm(dicPlnSect, nElemMax)` (MCT 출력)
- `nElemMax`는 `SetElemNo`에서 프레임+강체 요소까지 포함한 최대 번호

### 1.2 데이터 읽기
- 시트명: `"平板要素"`
- 읽기 범위: Row 3~, Col 2~9 (B~I, 8개 열)
  - strData(0) = 요소 ID
  - strData(1) = 타입
  - strData(2) = 노드 리스트 (쉼표 구분, 예: "N1,N15,N8,N16,N9,N17,N2,N18")
  - strData(3) = ov.
  - strData(4) = 단면명
  - strData(5) = 철근 단면
  - strData(6) = Cx
  - strData(7) = Cy

### 1.3 데이터 가공

#### 요소 번호
- `nElemMax = nElemMax + 1` (프레임 요소 이후 순번)
- 숫자형 ID만 처리 (`IsNumeric(strData(0, i))`)

#### 노드 처리
- `vBuf = Split(strData(2, i), ",")`
- `n = 1` 기본 step
- `If UBound(vBuf) > 4 Then n = n + 1` (5개 초과 노드면 step=2, 모서리 노드만 사용)
- `For k = 0 To UBound(vBuf) Step n` → 노드 번호 변환

#### 삼각 요소 패딩
- `If j < 8 Then j = j + 1` (3절점이면 빈 칸 추가)

#### 단면/재료 매핑
- `dicPlnSect(strData(4, i))`에서 단면 정보 획득
- `vBuf(0)` = 단면번호, `vBuf(5)` = 재료명
- `ChangeMatlName()`으로 재료명 변환 후 `m_MaterialData`에서 번호 조회

### 1.4 MCT 출력
```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, iN3, iN4, iSUB, iWID , LCAXIS    ; Planar Element
{요소번호},PLATE,{재료번호},{단면번호},{N1},{N2},{N3},{N4},1, 0
```

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 224-236: `convertPlaneElements()` 호출

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.PLANE_ELEMENT)` 사용

### 2.3 데이터 가공

#### 요소 번호
- `context.maxElementNo++` (프레임+강체 이후 순번)
- `isNumeric(elemId)` 체크 → 비숫자형은 skip

#### 노드 처리
- `allNodes = nodeListStr.split(',')` → step 결정
- `allNodes.length > 5` → step=2 (모서리 노드만)
- 동일한 로직

#### 삼각 요소 패딩
- `while (parts.length < 8) parts.push(0)` → 빈 칸을 0으로 채움

#### 단면/재료 매핑
- `plnSectData.get(sectName)` → `{ sectNo, materialName }` 구조

### 2.4 MCT 출력
```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, iN3, iN4, iSUB, iWID , LCAXIS    ; Planar Element
{요소번호},PLATE,{재료번호},{단면번호},{N1},{N2},{N3},{N4},1, 0
```

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| MCT 헤더/코멘트 | 동일 | 동일 | O |
| 요소 번호 할당 | nElemMax + 1 | context.maxElementNo++ | O |
| 숫자형 ID만 처리 | IsNumeric 체크 | isNumeric 체크 | O |
| 노드 step 결정 | UBound > 4 → step=2 | length > 5 → step=2 | O |
| 삼각 요소 패딩 | j < 8 처리 | parts.length < 8 처리 | O |
| 마지막 필드 | "1, 0" | "1, 0" | O |
| 데이터 형식 | 쉼표 구분 | 쉼표 구분 | O |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| 삼각 패딩 값 | 빈 문자열 | 0 | **낮음** - MCT 파서가 동일하게 처리 |
| step 판별 조건 | `UBound(vBuf) > 4` (0-indexed, 5개 초과 = 6개 이상) | `allNodes.length > 5` (1-indexed, 5개 초과 = 6개 이상) | **없음** - 동일 결과 |

### 3.3 차이로 인한 MCT 결과 영향
- 삼각 요소 패딩에서 VBA는 빈 문자열, TS는 0이지만, MCT에서 빈/0 모두 동일하게 처리
- 노드 리스트의 step 판별 조건은 동일 (VBA의 UBound가 0-indexed이므로 > 4는 5개 초과 = 6개 이상)

---

## 4. 결론
**PASS** - *ELEMENT (Plate) 변환 로직은 VBA와 TypeScript가 기능적으로 동일. 노드 step 처리, 요소 번호 할당, MCT 출력 형식 모두 일치.
