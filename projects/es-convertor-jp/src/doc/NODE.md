# *NODE 変환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- `mct作成` 서브루틴 내에서 호출
- Line 277: `Set clsNode = New Class010_Node` (초기화)
- Line 396: `Call clsNode.GetNode(dicDblNode_Z)` (데이터 읽기 - 2중 노드 Z좌표 감지용)
- Line 427: `Call clsNode.ChangeNode(dicDblPnt)` (MCT 변환 출력)
- `dicDblPnt`는 `clsElmSpr.GetSpringElem()`에서 채워진 스프링 요소 2중 노드 집합

### 1.2 데이터 읽기 (GetNode)
- 시트명: `"節点座標"` (Class_Initialize에서 설정)
- 읽기 범위: Row 3부터, Col 2~6 (즉, B3:F열)
  - strData(0,i) = 노드명(ID)
  - strData(1,i) = X좌표
  - strData(2,i) = Y좌표
  - strData(3,i) = Z좌표
- `dicDblNode_Z`에 노드명 → Array(X&"_"&Z, Y) 형태로 저장 (스프링 2중노드 검출용)

### 1.3 데이터 가공 (ChangeNode)

#### 노드 번호 매핑
1. 최대 숫자 번호(`nMax`) 검출 - 숫자형 ID만 대상
2. 숫자가 아닌 노드 ID에는 `nMax+1`부터 순번 부여
3. `m_NodeData` 딕셔너리에 노드명 → 노드번호 매핑

#### 좌표 변환 (ES → MIDAS)
```
MIDAS_X = ES_X          (strData(1,i))
MIDAS_Y = -1 * ES_Z     (-1# * strData(3,i))
MIDAS_Z = ES_Y          (strData(2,i))
```

#### 2중 노드 처리 (좌표 중복 방지)
- `dicDblPnt`에 포함된 노드의 경우, 좌표가 이미 존재하면 Y좌표(ES 기준)를 -0.001씩 감소시켜 중복 해소
- 좌표 키: `"X-Y-Z"` (ES 좌표 기준)

#### ES 노드 좌표 저장
- `m_dicESNode`에 노드번호 → BufP(3) 배열로 변환된 MIDAS 좌표 저장
  - BufP(0) = X, BufP(1) = -Z, BufP(2) = Y

### 1.4 MCT 출력
```
*NODE    ; Nodes
; iNO, X, Y, Z
{노드번호},{X},{-Z},{Y}
```
- 출력 순서: 원본 데이터 순서 그대로 (정렬 없음)

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 86-90: `getSpringDoublePoints()`로 2중 노드 Set 생성
- Line 94-106: `convertNodes()` 호출
  - nodeData를 `{id, x, y, z}` 객체 배열로 변환하여 전달
  - `doublePointNodes` Set 전달

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.NODE)`로 데이터 획득
- MCTGenerator에서 row 배열을 NodeData 형태로 매핑:
  - row[0] → id, row[1] → x, row[2] → y, row[3] → z

### 2.3 데이터 가공

#### 노드 번호 매핑 (convertNodes)
1. 숫자형 ID의 최대값(`maxNo`) 검출
2. 비숫자형 ID에 `nextNo = maxNo + 1`부터 순번 부여
3. `context.nodeMapping`에 저장

#### 좌표 변환
- `transformCoordinate()` 함수 사용:
```typescript
MIDAS_X = ES_X
MIDAS_Y = -ES_Z
MIDAS_Z = ES_Y
```

#### 2중 노드 처리
- `doublePointNodes` Set에 포함된 노드의 경우:
  - ES 좌표 기준 `"X-Y-Z"` 키로 중복 검사
  - 중복 시 `adjustedY -= 0.001` (ES Y좌표 감소)
  - 조정된 좌표로 `transformCoordinate()` 재호출

#### 변환 좌표 저장
- `context.esNodeCoords`에 노드번호 → Point3D 저장

### 2.4 MCT 출력
```
*NODE    ; Nodes
; iNO, X, Y, Z
{노드번호},{X},{Y},{Z}
```
- 출력 순서: **노드 번호 순으로 정렬** (`mctNodes.sort((a, b) => a.no - b.no)`)

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| 좌표 변환 공식 | X, -Z, Y | X, -Z, Y | O |
| 노드 번호 매핑 | 숫자형 유지, 비숫자형 maxNo+1부터 | 동일 | O |
| MCT 헤더 | `*NODE    ; Nodes` | 동일 | O |
| MCT 코멘트 | `; iNO, X, Y, Z` | 동일 | O |
| MCT 데이터 형식 | `번호,X,Y,Z` | 동일 | O |
| 2중 노드 Y 조정 | -0.001씩 감소 | -0.001씩 감소 | O |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| 출력 순서 | 원본 데이터 순서 | 노드 번호 오름차순 정렬 | **낮음** - MCT 파서는 순서 무관 |
| 숫자형 판별 시 매핑 타이밍 | 첫 번째 루프에서 m_NodeData에 동일값 저장 후 두 번째 루프에서 번호 할당 | 첫 번째 루프에서 바로 nodeMapping에 저장 | **없음** - 결과 동일 |
| 2중 노드 조건 분기 | `dicDblPnt.Exists(strData(0,i))` 체크 후 While 루프 | `doublePointNodes?.has(node.id)` 체크 후 While 루프 | **없음** - 로직 동일 |
| 2중 노드 아닌 경우 | `dicNodeData.Exists(s)` 체크 없이 바로 추가 | `usedCoords.add(coordKey)` 무조건 추가 | **없음** - VBA도 While Not으로 추가 |
| originalNodeCoords 저장 | 없음 (m_DicOrgNode에 문자열로 저장) | `context.originalNodeCoords`에 Point3D로 저장 | **없음** - 내부 참조용 |

### 3.3 차이로 인한 MCT 결과 영향
- **출력 순서 차이**: TypeScript는 노드 번호 순으로 정렬하여 출력하지만, VBA는 원본 순서대로 출력. MIDAS Civil NX의 MCT 파서는 노드 순서에 의존하지 않으므로 기능적 차이 없음.
- 좌표 값, 노드 번호 할당, 2중 노드 처리 로직은 완전히 일치.

---

## 4. 결론
**PASS** - *NODE 변환 로직은 VBA와 TypeScript가 기능적으로 완전히 동일. 출력 순서만 다르나 MCT 결과에 영향 없음.
