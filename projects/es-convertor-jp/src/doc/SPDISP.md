# \*SPDISP MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `荷重` 시트에서 노드 강제 변위를 MIDAS Civil NX의 `*SPDISP` 섹션으로 변환

> **참고**: SPDISP는 지점의 강제 변위(Specified Displacement)를 정의합니다.
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

| 열  | 인덱스  | VBA              | TypeScript      | 설명                              |
| --- | ------- | ---------------- | --------------- | --------------------------------- |
| C   | row[1]  | strData(1, i)    | LOAD_TYPE       | 하중 유형 (ノード-強制変位)       |
| D   | row[2]  | strData(2, i)    | LOAD_CASE       | 하중 케이스명                     |
| E   | row[3]  | strData(3, i)    | ACTION_TYPE     | 작용 유형 (並進荷重/モーメント)   |
| F   | row[4]  | strData(4, i)    | TARGET          | 대상 노드명 (콤마 구분)           |
| G   | row[5]  | strData(5, i)    | VALUE1          | 변위 값                           |
| O   | row[13] | strData(13, i)   | DIRECTION       | **방향/좌표유형** (전체 X/Y/Z, ベクトル指定, 座標指定) |
| P   | row[14] | strData(14, i)   | VECTOR_X        | X성분 (벡터 지정 시)              |
| Q   | row[15] | strData(15, i)   | VECTOR_Y        | Y성분 (벡터 지정 시)              |
| R   | row[16] | strData(16, i)   | VECTOR_Z        | Z성분 (벡터 지정 시)              |
| S   | row[17] | strData(17, i)   | ALPHA           | Alpha 각도 (좌표 지정 시)         |
| T   | row[18] | strData(18, i)   | BETA            | Beta 각도 (좌표 지정 시)          |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | 노드 번호 매핑                | **필수**  |

---

## 2. 출력 구조

### MCT 형식

```
*USE-STLD, Settlement

*SPDISP    ; Specified Displacement of Supports
; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP
   1,100000,0.01,0,0,0,0,0,
   2,001000,0,0,-0.005,0,0,0,

; End of data for load case [Settlement] -------------------------
```

### 필드 설명

| 필드        | 설명                    | 값/소스                          |
| ----------- | ----------------------- | -------------------------------- |
| NODE_LIST   | 노드 번호 (또는 목록)   | nodeMapping.get(nodeName)        |
| FLAG        | DOF 플래그 (6자리)      | 각 자리 1=지정, 0=미지정         |
| Dx          | X축 변위 (m)            | 변위값 또는 0                    |
| Dy          | Y축 변위 (m)            | 변위값 또는 0                    |
| Dz          | Z축 변위 (m)            | 변위값 또는 0                    |
| Rx          | X축 회전 (rad)          | 변위값 또는 0                    |
| Ry          | Y축 회전 (rad)          | 변위값 또는 0                    |
| Rz          | Z축 회전 (rad)          | 변위값 또는 0                    |
| GROUP       | 그룹 이름               | 항상 빈값                        |

---

## 3. SPDISP 생성 조건

### 하중 유형 매핑

| 유형 번호 | 하중 유형           | MCT 출력   |
| --------- | ------------------- | ---------- |
| 3         | ノード-強制変位     | *SPDISP    |

### 스킵 조건

```vba
' VBA line 227: If strData(5, i) <> 0# Then
' 값이 0이면 스킵
```

---

## 4. FLAG 필드 구조

### FLAG 의미

```
FLAG = XXXXXX
       │││││└─ Rz (Z축 회전)
       ││││└── Ry (Y축 회전)
       │││└─── Rx (X축 회전)
       ││└──── Dz (Z축 변위)
       │└───── Dy (Y축 변위)
       └────── Dx (X축 변위)

1 = 해당 DOF에 변위 지정
0 = 해당 DOF는 미지정
```

### FLAG 예시

| FLAG   | 의미                           |
| ------ | ------------------------------ |
| 100000 | Dx만 지정                      |
| 010000 | Dy만 지정                      |
| 001000 | Dz만 지정                      |
| 000100 | Rx만 지정                      |
| 111000 | Dx, Dy, Dz 모두 지정           |
| 111111 | 모든 DOF 지정                  |

---

## 5. SetSpDisp 함수 분석

### VBA 핵심 로직 (lines 433-498)

```vba
Private Sub SetSpDisp(tSpDisp As tSpDispType, strData() As String, nCnt As Long)
  ' 벡터 타입 딕셔너리
  dicVecterType.Add "並進荷重全体 X", 0   ' Dx
  dicVecterType.Add "並進荷重全体 Y", 1   ' Dy
  dicVecterType.Add "並進荷重全体 Z", 2   ' Dz
  dicVecterType.Add "モーメント全体 X", 3  ' Rx
  dicVecterType.Add "モーメント全体 Y", 4  ' Ry
  dicVecterType.Add "モーメント全体 Z", 5  ' Rz

  ' ★ 중요: DIRECTION 열(13)에서 값 읽기
  strVecterType = strData(13, nCnt)

  If strVecterType = "ベクトル指定" Or strVecterType = "座標指定" Then
    ' 방식 1: 벡터/좌표 지정 → CalcVecter 사용
    strLoad = CalcVecter(strData, nCnt, 5, strFlag)
  Else
    ' 방식 2: 축 지정 → ACTION_TYPE + DIRECTION 조합
    ' 예: "並進荷重" + "全体 X" → "並進荷重全体 X" → 인덱스 0
    vVect(dicVecterType(strData(3, nCnt) & strVecterType)) = 1

    ' FLAG 생성
    For k = 0 To 5
      strFlag = strFlag & CStr(vVect(k))
    Next k

    ' 변위값 적용
    For k = 0 To 5
      strBuf(k) = vVect(k) * strData(5, nCnt)
    Next k
  End If

  ' 최종 출력: NODE, FLAG, Dx, Dy, Dz, Rx, Ry, Rz
  tSpDisp.strSpDisp(i).strDat(j) = strNode & "," & strFlag & "," & strLoad
End Sub
```

---

## 6. 두 가지 처리 방식

### 방식 1: ベクトル指定 / 座標指定

DIRECTION 열에 "ベクトル指定" 또는 "座標指定"가 있을 때

```vba
If strVecterType = "ベクトル指定" Or strVecterType = "座標指定" Then
  strLoad = CalcVecter(strData, nCnt, 5, strFlag)
  strLoad = strLoad & ","
```

- CalcVecter 함수로 복잡한 방향 벡터 계산
- 좌표 변환 적용: ES(X,Y,Z) → MIDAS(X,-Z,Y)

### 방식 2: 축 지정 (全体 X/Y/Z)

DIRECTION 열에 "全体 X", "全体 Y", "全体 Z"가 있을 때

```vba
Else
  ' ACTION_TYPE + DIRECTION으로 키 생성
  ' 예: strData(3) = "並進荷重", strVecterType = "全体 X"
  ' → 키 = "並進荷重全体 X" → 인덱스 0 (Dx)
  vVect(dicVecterType(strData(3, nCnt) & strVecterType)) = 1
```

### 벡터 타입 매핑

| 조합키 (ACTION + DIRECTION) | 인덱스 | DOF | FLAG 위치 |
| --------------------------- | ------ | --- | --------- |
| 並進荷重全体 X              | 0      | Dx  | 1XXXXX    |
| 並進荷重全体 Y              | 1      | Dy  | X1XXXX    |
| 並進荷重全体 Z              | 2      | Dz  | XX1XXX    |
| モーメント全体 X            | 3      | Rx  | XXX1XX    |
| モーメント全体 Y            | 4      | Ry  | XXXX1X    |
| モーメント全体 Z            | 5      | Rz  | XXXXX1    |

---

## 7. TypeScript 코드 이슈

### ✅ 버그 수정 완료

VBA에서는 **strData(13)** (DIRECTION 열)에서 값을 읽습니다.
TypeScript 코드가 수정되어 이제 **COL.DIRECTION (13)**을 사용합니다.

**VBA (line 466):**
```vba
strVecterType = strData(13, nCnt)  ' DIRECTION 열
```

**TypeScript (수정 후):**
```typescript
// VBA line 466: strVecterType = strData(13, nCnt) - uses DIRECTION column
const strVecterType = normalizeJapaneseText(String(row[COL.DIRECTION] || ''));
```

> **수정 내역**: `COL.COORD_TYPE` → `COL.DIRECTION` 변경 완료

---

## 8. 출력 형식

### MCT 출력 구조

```
NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP
```

### 출력 예시

```
단일 노드, X방향 변위:
1,100000,0.01,0,0,0,0,0,

다중 노드, Z방향 변위:
'1,2,3',001000,0,0,-0.005,0,0,0,

회전 변위 (Y축):
5,000010,0,0,0,0,0.001,0,
```

---

## 9. 결론

**✓ \*SPDISP 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: 하중 유형 3 (ノード-強制変位)
- 필요한 시트: `荷重` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. FLAG는 6자리 문자열 (Dx, Dy, Dz, Rx, Ry, Rz)
> 2. 축 지정: ACTION_TYPE + DIRECTION으로 인덱스 결정
> 3. 벡터/좌표 지정: CalcVecter로 계산
> 4. 값이 0이면 스킵

---

## 데이터 입력 예제

### Excel 시트 (`荷重`)

|     | C              | D          | E        | F      | G      | O        |
| --- | -------------- | ---------- | -------- | ------ | ------ | -------- |
| 2   | 荷重タイプ     | ケース名   | 作用タイプ| 対象   | 値     | 方向     |
| 3   | ノード-強制変位 | Settle    | 並進荷重 | N1     | 0.01   | 全体 X   |
| 4   | ノード-強制変位 | Settle    | 並進荷重 | N2     | -0.005 | 全体 Z   |

### 변환 과정

| 행 | ACTION_TYPE | DIRECTION | 조합키           | 인덱스 | FLAG   | 변위값           |
| -- | ----------- | --------- | ---------------- | ------ | ------ | ---------------- |
| 3  | 並進荷重    | 全体 X    | 並進荷重全体 X   | 0      | 100000 | Dx=0.01          |
| 4  | 並進荷重    | 全体 Z    | 並進荷重全体 Z   | 2      | 001000 | Dz=-0.005        |

### MCT 출력 결과

```
*USE-STLD, Settle

*SPDISP    ; Specified Displacement of Supports
; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP
   1,100000,0.01,0,0,0,0,0,
   2,001000,0,0,-0.005,0,0,0,

; End of data for load case [Settle] -------------------------
```

### 의존 관계

```
SPDISP ──── 節点座標 (노드 번호 매핑)
                ↓
            nodeMapping.get('N1') → 1
```
