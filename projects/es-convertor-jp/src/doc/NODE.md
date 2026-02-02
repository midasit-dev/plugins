# \*NODE MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `節点座標` 시트를 MIDAS Civil NX의 `*NODE` 섹션으로 변환

## 1. 필요한 데이터 시트

| 항목    | VBA            | TypeScript | 상태 |
| ------- | -------------- | ---------- | ---- |
| 시트명  | `m_Sheet_Node` | `節点座標` | ✓    |
| 시작 행 | 3 (nReadSTRow) | 3          | ✓    |
| 열 범위 | B~F (2~6)      | B~F (2~6)  | ✓    |

### 열 구조

| 열  | 인덱스 | VBA 변수      | 설명    |
| --- | ------ | ------------- | ------- |
| B   | row[0] | strData(0, i) | 노드 ID |
| C   | row[1] | strData(1, i) | X 좌표  |
| D   | row[2] | strData(2, i) | Y 좌표  |
| E   | row[3] | strData(3, i) | Z 좌표  |
| F   | row[4] | strData(4, i) | 미사용  |

## 2. 처리 경로

### VBA (Class010_Node.cls)

```
1. GetData() → 시트에서 B3:F~ 데이터 읽기
2. 최대 노드 번호 검출 (IsNumeric 체크)
3. 비숫자 ID에 번호 할당 (nMax + 1부터)
4. 좌표 변환: ES(X,Y,Z) → MIDAS(X,-Z,Y)
5. Double point 처리: Y좌표 0.001씩 감소
6. MCT 출력
```

### TypeScript (NodeConverter.ts)

```
1. getSheetDataForConversion() → 시트 데이터 가져오기
2. 최대 노드 번호 검출 (isNumeric 체크)
3. 비숫자 ID에 번호 할당 (nextNo = maxNo + 1)
4. 좌표 변환: transformCoordinate()
5. Double point 처리: adjustedY -= 0.001
6. 노드 번호순 정렬
7. MCT 출력
```

### 처리 경로 비교

| 단계                | VBA                     | TypeScript                | 상태 |
| ------------------- | ----------------------- | ------------------------- | ---- |
| 데이터 읽기         | GetData                 | getSheetDataForConversion | ✓    |
| 최대 번호 검출      | IsNumeric 체크          | isNumeric 체크            | ✓    |
| 비숫자 ID 번호 할당 | nMax + 1                | nextNo = maxNo + 1        | ✓    |
| 좌표 변환           | X, -Z, Y                | transformCoordinate       | ✓    |
| Double point 처리   | Y -= 0.001              | adjustedY -= 0.001        | ✓    |
| 결과 저장           | m_NodeData, m_dicESNode | nodeMapping, esNodeCoords | ✓    |

## 3. 좌표 변환

ES와 MIDAS의 좌표계가 다름:

```
ES:    (X, Y, Z)
MIDAS: (X, -Z, Y)
```

### VBA 코드 (lines 78-80)

```vba
BufP(0) = CDbl(strData(1, i))          ' X → X
BufP(1) = -1# * CDbl(strData(3, i))    ' Z → -Z (MIDAS Y)
BufP(2) = CDbl(strData(2, i))          ' Y → Y (MIDAS Z)
```

### TypeScript 코드 (coordinateSystem.ts)

```typescript
export function transformCoordinate(es: Point3D): Point3D {
  return {
    x: es.x,
    y: -es.z,
    z: es.y,
  };
}
```

## 4. VBA와 차이점

| 항목           | VBA                    | TypeScript                | 영향      |
| -------------- | ---------------------- | ------------------------- | --------- |
| 출력 정렬      | 입력 순서 유지         | 노드 번호순 정렬          | 개선      |
| 원본 좌표 저장 | m_DicOrgNode ("X_Y_Z") | originalNodeCoords (객체) | 동일 기능 |
| 변환 좌표 저장 | m_dicESNode            | esNodeCoords              | 동일 기능 |
| 노드 매핑 저장 | m_NodeData             | nodeMapping               | 동일 기능 |

## 5. MCT 출력 형식

```
*NODE    ; Nodes
; iNO, X, Y, Z
1,0,0,0
2,10,0,0
3,10,-5,3
```

## 6. Context에 저장되는 데이터

| Map                | Key                | Value                 | 용도                           |
| ------------------ | ------------------ | --------------------- | ------------------------------ |
| nodeMapping        | 노드 ID (string)   | 노드 번호 (number)    | 다른 변환기에서 노드 번호 조회 |
| esNodeCoords       | 노드 번호 (number) | Point3D (변환된 좌표) | 요소 각도 계산 등              |
| originalNodeCoords | 노드 ID (string)   | Point3D (원본 좌표)   | 하중 거리 계산 등              |

## 7. 결론

**✓ \*NODE 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `節点座標`
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **중요**: `節点座標` 시트는 MCT 변환의 **필수 기반 시트**입니다. 다른 모든 변환기(MATERIAL, FRAME, LOAD 등)는 노드 매핑 정보를 참조하므로, MCT 파일 생성 시 반드시 NODE 데이터가 필요합니다.

---

## 데이터 입력 예제

### Excel 시트 (`節点座標`)

|     | B        | C      | D      | E      | F    |
| --- | -------- | ------ | ------ | ------ | ---- |
| 2   | 節点名称 | X: (m) | Y: (m) | Z: (m) | 従属 |
| 3   | N1       | 0      | 0      | 0      | 1    |
| 4   | N2       | 10     | 0      | 0      | 1    |
| 5   | N3       | 10     | 5      | 0      | 1    |
| 6   | N4       | 10     | 5      | -3     | 1    |
| 7   | N5       | 0      | 8      | 4      | 1    |

### 설명

- 행 2: 헤더 (변환 시 무시됨)
- 행 3~: 데이터 시작 (nReadSTRow = 3)
- 열 범위: B~F (nReadSTCol=2, nReadEDCol=6)
- 노드 ID: 문자열(N1, NG1 등) 또는 숫자 가능
- 좌표: ES 좌표계 (X, Y, Z) 단위: m
- 従属: 종속 노드 플래그 (미사용)

### MCT 출력 결과

```
*NODE    ; Nodes
; iNO, X, Y, Z
1,0,0,0
2,10,0,0
3,10,0,5
4,10,3,5
5,0,-4,8
```

### 비숫자 노드 ID 처리

문자열 노드 ID는 자동으로 숫자 ID로 변환됨:
- N1 → 1, N2 → 2, N3 → 3, N4 → 4, N5 → 5

숫자 ID가 섞여 있는 경우:
- 숫자 ID 최대값을 찾음 (예: 100)
- 문자열 ID는 최대값+1부터 순차 할당 (N1 → 101, N2 → 102)

### 좌표 변환 상세

| 노드   | ES (X,Y,Z)   | MIDAS (X,-Z,Y) | 설명                     |
| ------ | ------------ | -------------- | ------------------------ |
| N1 → 1 | (0, 0, 0)    | (0, 0, 0)      | 원점                     |
| N2 → 2 | (10, 0, 0)   | (10, 0, 0)     | X만 있음                 |
| N3 → 3 | (10, 5, 0)   | (10, 0, 5)     | Y=5 → Z=5                |
| N4 → 4 | (10, 5, -3)  | (10, 3, 5)     | Y=5→Z=5, Z=-3→Y=3        |
| N5 → 5 | (0, 8, 4)    | (0, -4, 8)     | Y=8→Z=8, Z=4→Y=-4        |

### 좌표 변환 공식

```
MIDAS.X = ES.X
MIDAS.Y = -ES.Z
MIDAS.Z = ES.Y
```

예: ES(10, 5, -3) → MIDAS(10, -(-3), 5) = MIDAS(10, 3, 5)
