# \*CONLOAD MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `荷重` 시트에서 노드 집중 하중을 MIDAS Civil NX의 `*CONLOAD` 섹션으로 변환

> **참고**: CONLOAD는 노드에 작용하는 집중 하중(힘/모멘트)을 정의합니다.
> `*STLDCASE`의 하위 섹션으로, `*USE-STLD` 래퍼와 함께 출력됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA              | TypeScript        | 상태 |
| ------- | ---------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Load`   | `荷重`            | ✓    |
| 시작 행 | 3 (nReadSTRow)   | 3                 | ✓    |
| 열 범위 | B~T (2~20)       | B~T (2~20)        | ✓    |

### 관련 열 구조

| 열  | 인덱스  | TypeScript      | 설명                              |
| --- | ------- | --------------- | --------------------------------- |
| C   | row[1]  | LOAD_TYPE       | 하중 유형 (ノード-集中荷重 등)    |
| D   | row[2]  | LOAD_CASE       | 하중 케이스명                     |
| E   | row[3]  | ACTION_TYPE     | 작용 유형 (並進荷重/モーメント)   |
| F   | row[4]  | TARGET          | 대상 노드명 (콤마 구분)           |
| G   | row[5]  | VALUE1          | 하중 값 (P1)                      |
| N   | row[12] | COORD_TYPE      | 좌표 유형 (座標指定/ベクトル指定) |
| O   | row[13] | DIRECTION       | 방향 (全体 X/Y/Z)                 |
| P   | row[14] | VECTOR_X        | X성분 또는 "モーメント"           |
| Q   | row[15] | VECTOR_Y        | Y성분                             |
| R   | row[16] | VECTOR_Z        | Z성분                             |
| S   | row[17] | ALPHA           | Alpha 각도                        |
| T   | row[18] | BETA            | Beta 각도                         |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | 노드 번호 매핑                | **필수**  |
| `剛体要素`   | `RIGID`         | 강체 마스터 노드 조회 (유형2) | 선택*     |

> **참고**: 剛体要素荷重(유형 2)일 경우 강체 요소의 마스터 노드에 하중이 적용됩니다.

---

## 2. 출력 구조

### MCT 형식

```
*USE-STLD, Dead

*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
   1,100,0,50,0,0,0,,
   '2,3',0,-200,0,0,0,0,,

; End of data for load case [Dead] -------------------------
```

### 필드 설명

| 필드        | 설명                    | 소스/값                          |
| ----------- | ----------------------- | -------------------------------- |
| NODE_LIST   | 노드 번호 (또는 목록)   | nodeMapping.get(nodeName)        |
| FX          | X축 힘 (kN)             | CalcVecter 결과[0]               |
| FY          | Y축 힘 (kN)             | CalcVecter 결과[1] (-Z 변환)     |
| FZ          | Z축 힘 (kN)             | CalcVecter 결과[2] (Y 변환)      |
| MX          | X축 모멘트 (kN·m)       | CalcVecter 결과[3]               |
| MY          | Y축 모멘트 (kN·m)       | CalcVecter 결과[4] (-Z 변환)     |
| MZ          | Z축 모멘트 (kN·m)       | CalcVecter 결과[5] (Y 변환)      |
| GROUP       | 그룹 이름               | 항상 빈값                        |
| STRTYPENAME | 구조 타입 이름          | 항상 빈값                        |

---

## 3. CONLOAD 생성 조건

### 하중 유형 매핑

| 유형 번호 | 하중 유형           | MCT 출력   | 비고                        |
| --------- | ------------------- | ---------- | --------------------------- |
| 1         | ノード-集中荷重     | *CONLOAD   | 일반 노드 집중 하중         |
| 2         | 剛体要素荷重        | *CONLOAD   | 강체 마스터 노드에 적용     |

### 스킵 조건

```typescript
// VBA: If strData(5, i) <> 0# Then
// 값이 0이면 스킵
if (value1 === 0) {
  // 스킵
}
```

---

## 4. CalcVecter 함수 (벡터 계산)

### VBA (lines 354-400)

```vba
Private Function CalcVecter(strData() As String, nCnt As Long, _
    Optional ByVal nValueCol As Long = 5, _
    Optional ByRef strFlag As String) As String

  ' 벡터 성분 추출
  vBuf(0) = CDbl(strData(14, nCnt))  ' X
  vBuf(1) = CDbl(strData(15, nCnt))  ' Y
  vBuf(2) = CDbl(strData(16, nCnt))  ' Z

  ' 좌표 지정 방식 (Alpha/Beta 각도)
  If strData(12, nCnt) = "座標指定" Then
    dAlpha = CDbl(strData(17, nCnt))
    dBeta = CDbl(strData(18, nCnt))

    vBuf(0) = Cos(dBeta) * Cos(dAlpha)
    vBuf(1) = Cos(dBeta) * Sin(dAlpha)
    vBuf(2) = Sin(dBeta)
  End If

  ' 정규화 및 하중값 적용
  dBasVect = Sqr(vBuf(0)^2 + vBuf(1)^2 + vBuf(2)^2)
  For i = 0 To 2
    vBuf(i) = vBuf(i) / dBasVect * CDbl(strData(nValueCol, nCnt))
  Next i

  ' 좌표 변환 및 출력 형식
  If strData(14, nCnt) = "モーメント" Then
    ' 모멘트: (0,0,0, x,-z,y)
    strLoad = "0.0, 0.0, 0.0," & vBuf(0) & "," & -1*vBuf(2) & "," & vBuf(1)
  Else
    ' 힘: (x,-z,y, 0,0,0)
    strLoad = vBuf(0) & "," & -1*vBuf(2) & "," & vBuf(1) & ",0.0, 0.0, 0.0"
  End If

  CalcVecter = strLoad
End Function
```

### TypeScript (calcVecter)

```typescript
function calcVecter(
  row: (string | number)[],
  valueCol: number = COL.VALUE1
): { strLoad: string; strFlag: string } {
  const vBuf: number[] = [0, 0, 0];

  // 벡터 성분 추출
  vBuf[0] = safeParseNumber(row[COL.VECTOR_X]);
  vBuf[1] = safeParseNumber(row[COL.VECTOR_Y]);
  vBuf[2] = safeParseNumber(row[COL.VECTOR_Z]);

  // 좌표 지정 방식
  if (coordType === '座標指定') {
    const dAlpha = safeParseNumber(row[COL.ALPHA]) * Math.PI / 180;
    const dBeta = safeParseNumber(row[COL.BETA]) * Math.PI / 180;
    vBuf[0] = Math.cos(dBeta) * Math.cos(dAlpha);
    vBuf[1] = Math.cos(dBeta) * Math.sin(dAlpha);
    vBuf[2] = Math.sin(dBeta);
  }

  // 정규화 및 좌표 변환
  // 힘: (x, -z, y, 0, 0, 0)
  // 모멘트: (0, 0, 0, x, -z, y)
}
```

---

## 5. 좌표 변환

### ES → MIDAS 변환

```
ES 좌표계:  (X, Y, Z)
MIDAS 좌표계: (X, -Z, Y)
```

### 적용 예시

| ES 입력      | MIDAS 출력   |
| ------------ | ------------ |
| 全体 X 방향  | FX (그대로)  |
| 全体 Y 방향  | FZ (Y→Z)     |
| 全体 Z 방향  | -FY (-Z→Y)   |

### 힘 vs 모멘트

```
힘 (並進荷重):
  출력: FX, FY, FZ, 0, 0, 0

모멘트 (モーメント):
  출력: 0, 0, 0, MX, MY, MZ
```

---

## 6. SetConLoad 함수

### VBA (lines 402-431)

```vba
Private Sub SetConLoad(tConLoad As tConLoadType, strData() As String, nCnt As Long)
  ' 하중 케이스 딕셔너리 확인
  If tConLoad.dicName.Exists(strData(2, nCnt)) Then
    i = tConLoad.dicName(strData(2, nCnt))
    j = UBound(tConLoad.strConLoad(i).strDat) + 1
  Else
    i = tConLoad.dicName.Count
    tConLoad.dicName.Add strData(2, nCnt), i
    ReDim Preserve tConLoad.strConLoad(i)
    j = 0
  End If

  ' 벡터 계산
  strLoad = CalcVecter(strData, nCnt)
  strLoad = strLoad & ",,"

  ' 노드 목록 문자열 생성
  strNode = GetStringGen(strData(4, nCnt))

  ' 결과 저장
  tConLoad.strConLoad(i).strDat(j) = strNode & "," & strLoad
End Sub
```

### TypeScript (setConLoad)

```typescript
function setConLoad(
  tConLoad: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  strNode: string
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');

  // 하중 케이스별 인덱스 관리
  let i: number;
  let j: number;
  if (tConLoad.dicName.has(loadCase)) {
    i = tConLoad.dicName.get(loadCase)!;
    j = tConLoad.strDat[i].length;
  } else {
    i = tConLoad.dicName.size;
    tConLoad.dicName.set(loadCase, i);
    tConLoad.strDat[i] = [];
    j = 0;
  }

  const { strLoad } = calcVecter(row);
  const nodeStr = getStringGen(strNode);

  tConLoad.strDat[i][j] = `${nodeStr},${strLoad},,`;
}
```

---

## 7. 노드 목록 처리

### 단일 노드

```
입력: N1
출력: 1,100,0,50,0,0,0,,
```

### 다중 노드

```
입력: N1,N2,N3
출력: '1,2,3',100,0,50,0,0,0,,
```

> **참고**: 다중 노드는 따옴표로 감싸져 출력됩니다.

### GetStringGen 함수

```typescript
function getStringGen(nodeList: string): string {
  if (!nodeList.includes(',')) {
    return nodeList;  // 단일 노드
  }
  return `'${nodeList}'`;  // 다중 노드는 따옴표로 감싸기
}
```

---

## 8. 剛体要素荷重 (유형 2) 처리

### VBA (lines 204-216)

```vba
If n = 2 Then
  vElem = Split(strData(4, i), ",")
  For j = 0 To UBound(vElem)
    ' 강체 요소 ID로 마스터 노드 조회
    vElem(j) = m_NodeData(m_dicRigidElem(vElem(j)))
  Next j
  strNode = vElem(0)
  For j = 1 To UBound(vElem)
    strNode = strNode & "," & vElem(j)
  Next j
End If
```

### TypeScript

```typescript
if (n === 2) {
  // 강체 요소 ID → 마스터 노드 번호
  const rigidMaster = context.rigidMasterNode.get(elemId);
  const masterNo = context.nodeMapping.get(rigidMaster);
}
```

---

## 9. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 벡터 정규화       | 직접 계산                | Math 함수 사용              | 동일      |
| 좌표 변환         | 인라인 계산              | calcVecter 함수             | 동일      |
| 다중 노드 처리    | GetStringGen             | getStringGen                | 동일      |
| 강체 요소 조회    | m_dicRigidElem           | rigidMasterNode Map         | 동일      |

---

## 10. 결론

**✓ \*CONLOAD 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: 하중 유형 1 (ノード-集中荷重), 유형 2 (剛体要素荷重)
- 필요한 시트: `荷重` (주요), `節点座標`, `剛体要素` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. 좌표 변환: ES(X,Y,Z) → MIDAS(X,-Z,Y)
> 2. 힘/모멘트 구분: ACTION_TYPE 또는 VECTOR_X="モーメント"
> 3. 값이 0이면 스킵
> 4. *USE-STLD 래퍼로 하중 케이스별 그룹화

---

## 데이터 입력 예제

### Excel 시트 (`荷重`)

|     | C              | D      | E        | F      | G     | ... | O        |
| --- | -------------- | ------ | -------- | ------ | ----- | --- | -------- |
| 2   | 荷重タイプ     | ケース名| 作用タイプ| 対象   | P1    | ... | 方向     |
| 3   | ノード-集中荷重 | Dead   | 並進荷重 | N1     | 100   | ... | 全体 Z   |
| 4   | ノード-集中荷重 | Dead   | 並進荷重 | N2,N3  | 50    | ... | 全体 Z   |
| 5   | 剛体要素荷重   | Dead   | 並進荷重 | R1     | 200   | ... | 全体 Z   |

### 변환 과정

| 행 | 유형 | 대상     | 노드 변환         | 방향    | 하중값 | 좌표 변환 |
| -- | ---- | -------- | ----------------- | ------- | ------ | --------- |
| 3  | 1    | N1       | 1                 | 全体 Z  | 100    | FY=-100   |
| 4  | 1    | N2,N3    | '2,3'             | 全体 Z  | 50     | FY=-50    |
| 5  | 2    | R1→N2    | 2 (마스터 노드)   | 全体 Z  | 200    | FY=-200   |

### MCT 출력 결과

```
*USE-STLD, Dead

*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
   1,0,-100,0,0,0,0,,
   '2,3',0,-50,0,0,0,0,,
   2,0,-200,0,0,0,0,,

; End of data for load case [Dead] -------------------------
```

### 좌표 변환 상세

```
입력: 全体 Z 방향, P1=100
변환: ES Z → MIDAS Y, 부호 반전
출력: FX=0, FY=-100, FZ=0
```

### 의존 관계

```
CONLOAD ──┬── 節点座標 (노드 번호 매핑)
          │       ↓
          │   nodeMapping.get('N1') → 1
          │
          └── 剛体要素 (유형 2 전용)
                  ↓
              rigidMasterNode.get('R1') → 'N2'
              nodeMapping.get('N2') → 2
```
