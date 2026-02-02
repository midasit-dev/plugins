# \*GSPRING & \*GSPRTYPE MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀에서 스프링 지점을 MIDAS Civil NX의 `*GSPRING` 및 `*GSPRTYPE` 섹션으로 변환

| MCT 섹션    | 소스 시트  | VBA 클래스          | 설명                     |
| ----------- | ---------- | ------------------- | ------------------------ |
| `*GSPRING`  | `支点`     | Class160_Fulcrum    | 노드에 스프링 타입 할당  |
| `*GSPRTYPE` | `支点詳細` | Class170_FulcDetail | 스프링 타입 속성 정의    |

> **연관 관계**: `*GSPRING`에서 참조하는 TYPE-NAME은 `*GSPRTYPE`에서 정의됩니다.

---

## 1. \*GSPRING - 스프링 지점 할당

### 1.1 필요한 데이터 시트

| 항목    | VBA               | TypeScript | 상태 |
| ------- | ----------------- | ---------- | ---- |
| 시트명  | `m_Sheet_Fulcrum` | `支点`     | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3          | ✓    |
| 시작 열 | 2 (nReadSTCol)    | 2 (B)      | ✓    |
| 종료 열 | 13 (nReadEDCol)   | 13 (M)     | ✓    |

### 1.2 열 구조 (B~M, 12열)

| 열  | 인덱스 | VBA           | 설명                     |
| --- | ------ | ------------- | ------------------------ |
| B   | 0      | strData(0, j) | 지점명 (TYPE-NAME)       |
| C   | 1      | strData(1, j) | (미사용)                 |
| D   | 2      | strData(2, j) | 노드명 (節点名)          |
| E   | 3      | strData(3, j) | DX 구속 (自由/固定/ばね) |
| F   | 4      | strData(4, j) | DY 구속                  |
| G   | 5      | strData(5, j) | DZ 구속                  |
| H   | 6      | strData(6, j) | RX 구속                  |
| I   | 7      | strData(7, j) | RY 구속                  |
| J   | 8      | strData(8, j) | RZ 구속                  |

### 1.3 생성 조건

DOF 열(3~8)에 "ばね"가 하나라도 있으면 `*GSPRING` 출력

```vba
' VBA lines 74-80
bOutput = False
For k = 3 To 8
  If strData(k, j) = strSpring Then  ' strSpring = "ばね"
    bOutput = True
    Exit For
  End If
Next k

If bOutput Then
  ' → *GSPRING 출력
End If
```

### 1.4 MCT 출력 형식

```
*GSPRING    ; General Spring Supports
; NODE_LIST, TYPE-NAME, GROUP
   1,Spring-1,
   2,Spring-2,
```

| 필드      | 설명              | VBA 소스                    |
| --------- | ----------------- | --------------------------- |
| NODE_LIST | 노드 번호         | m_NodeData(strData(2, j))   |
| TYPE-NAME | 스프링 타입명     | strData(0, j)               |
| GROUP     | 그룹 이름         | 빈값                        |

### 1.5 VBA 코드 (lines 82-96)

```vba
If bOutput Then
  dicSprType.Add strData(0, j), True  ' 스프링 타입 등록
  nWriteType = 0
  ReDim strBuf(3)
  i = 0
  strBuf(i) = m_NodeData(strData(2, j)): i = i + 1  ' 노드 번호
  strBuf(i) = strData(0, j): i = i + 1              ' 타입명
  strBuf(i) = ""                                     ' GROUP

  ' 출력: "노드번호,타입명,"
  vWriteData(nRowCnt(nWriteType), 0) = strBuf(0)
  For k = 1 To i
    vWriteData(nRowCnt(nWriteType), 0) = vWriteData(nRowCnt(nWriteType), 0) & "," & strBuf(k)
  Next k
End If
```

---

## 2. \*GSPRTYPE - 스프링 타입 정의

### 2.1 필요한 데이터 시트

| 항목    | VBA                  | TypeScript | 상태 |
| ------- | -------------------- | ---------- | ---- |
| 시트명  | `m_Sheet_FulcDetail` | `支点詳細` | ✓    |
| 시작 행 | 4 (nReadSTRow)       | 4          | ✓    |
| 시작 열 | 2 (nReadSTCol)       | 2 (B)      | ✓    |
| 종료 열 | 21 (nReadEDCol)      | 21 (U)     | ✓    |
| 헤더 행 | 2행                  | 2행        | ✓    |

### 2.2 열 구조 (B~U, 20열)

VBA Enum 정의 (lines 18-37):

| Enum    | 열  | 인덱스 | 설명       |
| ------- | --- | ------ | ---------- |
| -       | B   | 0      | 지점명     |
| -       | C   | 1      | (미사용)   |
| Cel_D   | D   | 2      | 강성값 1   |
| Cel_E   | E   | 3      | 강성값 2   |
| Cel_F   | F   | 4      | 강성값 3   |
| Cel_G   | G   | 5      | 강성값 4   |
| Cel_H   | H   | 6      | 강성값 5   |
| Cel_I   | I   | 7      | 강성값 6   |
| Cel_J   | J   | 8      | 강성값 7   |
| Cel_K   | K   | 9      | 강성값 8   |
| Cel_L   | L   | 10     | 강성값 9   |
| Cel_M   | M   | 11     | 강성값 10  |
| Cel_N   | N   | 12     | 강성값 11  |
| Cel_O   | O   | 13     | 강성값 12  |
| Cel_P   | P   | 14     | 강성값 13  |
| Cel_Q   | Q   | 15     | 강성값 14  |
| Cel_R   | R   | 16     | 강성값 15  |
| Cel_S   | S   | 17     | 강성값 16  |
| Cel_T   | T   | 18     | 강성값 17  |
| Cel_U   | U   | 19     | 강성값 18  |

### 2.3 생성 조건

`支点` 시트에서 스프링 타입으로 등록된 지점명만 출력 (VBA line 86):

```vba
If dicSprType(strData(0, j)) Then
  ' → *GSPRTYPE 출력
End If
```

### 2.4 MCT 출력 형식 (4줄 구조)

```
*GSPRTYPE    ; Define General Spring Supports
; NAME, SDx1, SDy1, SDy2, SDz1, SDz2, SDz3, ..., SRz1, ..., SRz6
;       MDx1, MDy1, MDy2, MDz1, MDz2, MDz3, ..., MRz1, ..., MRz6
;       DDx1, DDy1, DDy2, DDz1, DDz2, DDz3, ..., DRz1, ..., DRz6
;       bStiffness, bMass, bDamping
   Spring-1,1000,2000,0,3000,0,0,0,500,0,100,0,0,200,0,0,0,0,0,0,0,0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   YES,NO,NO
```

| 줄  | 내용                     | 설명                       |
| --- | ------------------------ | -------------------------- |
| 1   | NAME + 21개 강성값       | 스프링 강성 (Stiffness)    |
| 2   | 21개 0                   | 질량 (Mass) - 미사용       |
| 3   | 21개 0                   | 감쇠 (Damping) - 미사용    |
| 4   | YES,NO,NO                | 사용 플래그                |

### 2.5 강성값 매핑 (VBA lines 89-110)

VBA strBuf 배열 구성:

| strBuf | VBA 소스              | 부호   | 설명  |
| ------ | --------------------- | ------ | ----- |
| [0]    | strData(0, j)         | -      | NAME  |
| [1]    | Abs(Cel_D)            | +      | SDx1  |
| [2]    | Abs(Cel_K)            | +      | SDy1  |
| [3]    | Abs(Cel_F)            | +      | SDy2  |
| [4]    | Abs(Cel_J)            | +      | SDz1  |
| [5]    | Abs(Cel_N)            | +      | SDz2  |
| [6]    | Abs(Cel_E)            | +      | SDz3  |
| [7]    | "0"                   | -      | 패딩  |
| [8]    | Abs(Cel_Q)            | +      | SRx1  |
| [9]    | **-1** × Abs(Cel_O)   | **-**  | SRy1  |
| [10]   | Abs(Cel_G)            | +      | SRy2  |
| [11]   | **-1** × Abs(Cel_M)   | **-**  | SRz1  |
| [12]   | "0"                   | -      | 패딩  |
| [13]   | Abs(Cel_P)            | +      | SRz2  |
| [14]   | Abs(Cel_T)            | +      | SRz3  |
| [15]   | Abs(Cel_I)            | +      | SRz4  |
| [16]   | Abs(Cel_L)            | +      | SRz5  |
| [17]   | Abs(Cel_R)            | +      | SRz6  |
| [18]   | "0"                   | -      | 패딩  |
| [19]   | Abs(Cel_S)            | +      |       |
| [20]   | Abs(Cel_U)            | +      |       |
| [21]   | Abs(Cel_H)            | +      |       |

> **주의**: SRy1(Cel_O)과 SRz1(Cel_M)은 **부호 반전** 적용

### 2.6 VBA 코드 (lines 85-128)

```vba
For j = 0 To nCnt
  If dicSprType(strData(0, j)) Then
    ReDim strBuf(21)
    i = 0
    strBuf(i) = strData(0, j): i = i + 1           ' NAME
    strBuf(i) = Abs(strData(Cel_D, j)): i = i + 1  ' SDx1
    strBuf(i) = Abs(strData(Cel_K, j)): i = i + 1  ' SDy1
    ' ... (중략) ...
    strBuf(i) = -1# * Abs(strData(Cel_O, j)): i = i + 1  ' SRy1 (부호 반전!)
    strBuf(i) = Abs(strData(Cel_G, j)): i = i + 1
    strBuf(i) = -1# * Abs(strData(Cel_M, j)): i = i + 1  ' SRz1 (부호 반전!)
    ' ... (중략) ...

    ' Line 1: NAME + 강성값
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
    nRowCnt = nRowCnt + 1

    ' Line 2: 질량 (21개 0)
    vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
    nRowCnt = nRowCnt + 1

    ' Line 3: 감쇠 (21개 0)
    vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
    nRowCnt = nRowCnt + 1

    ' Line 4: 플래그
    vWriteData(nRowCnt, 0) = "YES,NO,NO"
    nRowCnt = nRowCnt + 1
  End If
Next j
```

---

## 3. 의존 관계

```
支点 (FULCRUM)                     支点詳細 (FULC_DETAIL)
┌─────────────────┐                ┌─────────────────────┐
│ 지점명 (TYPE-NAME)│─────────────→│ 지점명 (NAME)        │
│ 노드명           │                │ 강성값 (D~U열)      │
│ DOF 구속         │                │                     │
└─────────────────┘                └─────────────────────┘
        │                                   │
        ↓                                   ↓
   *GSPRING                            *GSPRTYPE
   (노드 할당)                          (타입 정의)
```

### 처리 순서

1. `支点` 시트 처리 (Class160_Fulcrum)
   - DOF에 "ばね" 있으면 `dicSprType`에 지점명 등록
   - `*GSPRING` 출력: 노드번호, 지점명

2. `支点詳細` 시트 처리 (Class170_FulcDetail)
   - `dicSprType`에 등록된 지점명만 처리
   - `*GSPRTYPE` 출력: 4줄 구조 (강성, 질량, 감쇠, 플래그)

---

## 4. VBA와 TypeScript 비교

### *GSPRING

| 항목        | VBA               | TypeScript        | 일치 |
| ----------- | ----------------- | ----------------- | ---- |
| 시트 설정   | row=3, col=2-13   | row=3, col=2-13   | ✓    |
| 스프링 체크 | "ばね"            | "ばね"            | ✓    |
| 출력 형식   | nodeNo,typeName,  | nodeNo,typeName,  | ✓    |

### *GSPRTYPE

| 항목        | VBA               | TypeScript        | 일치 |
| ----------- | ----------------- | ----------------- | ---- |
| 시트 설정   | row=4, col=2-21   | row=4, col=2-21   | ✓    |
| 헤더 행     | 2행               | 2행               | ✓    |
| 4줄 구조    | 강성/질량/감쇠/플래그 | 강성/질량/감쇠/플래그 | ✓    |
| 부호 반전   | Cel_O, Cel_M      | cellIndex 13, 11  | ✓    |
| 출력 형식   | 21개 값           | 21개 값           | ✓    |

---

## 5. 결론

**✓ \*GSPRING 및 \*GSPRTYPE 변환은 VBA와 완전히 일치합니다.**

- `*GSPRING` 생성 조건: `支点` 시트에서 DOF에 "ばね" 포함
- `*GSPRTYPE` 생성 조건: `*GSPRING`에서 등록된 지점명
- 필요한 시트: `支点`, `支点詳細`, `節点座標`
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. `*GSPRING`과 `*GSPRTYPE`은 함께 사용됨
> 2. TYPE-NAME으로 연결 (지점명)
> 3. `*GSPRTYPE`은 4줄 구조 (강성/질량/감쇠/플래그)
> 4. SRy1, SRz1은 **부호 반전** 적용

---

## 데이터 입력 예제

### Excel 시트 (`支点`)

|     | B(지점명)  | C | D(노드) | E(Dx) | F(Dy) | G(Dz) | H(Rx) | I(Ry) | J(Rz) |
| --- | ---------- | - | ------- | ----- | ----- | ----- | ----- | ----- | ----- |
| 2   | 支点名     |   | 節点    | Dx    | Dy    | Dz    | Rx    | Ry    | Rz    |
| 3   | Spring-1   |   | N1      | ばね  | ばね  | 固定  | 自由  | 自由  | 自由  |
| 4   | Spring-2   |   | N2      | ばね  | 固定  | 固定  | 自由  | 自由  | 自由  |

### Excel 시트 (`支点詳細`)

|     | B(지점명)  | C | D    | E    | F    | ... |
| --- | ---------- | - | ---- | ---- | ---- | --- |
| 3   | 支点名     |   | SDx  | SDy  | SDz  | ... |
| 4   | Spring-1   |   | 1000 | 2000 | 0    | ... |
| 5   | Spring-2   |   | 500  | 0    | 0    | ... |

### MCT 출력 결과

```
*GSPRING    ; General Spring Supports
; NODE_LIST, TYPE-NAME, GROUP
   1,Spring-1,
   2,Spring-2,

*GSPRTYPE    ; Define General Spring Supports
; NAME, SDx1, SDy1, SDy2, SDz1, SDz2, SDz3, ..., SRz1, ..., SRz6
;       MDx1, MDy1, MDy2, MDz1, MDz2, MDz3, ..., MRz1, ..., MRz6
;       DDx1, DDy1, DDy2, DDz1, DDz2, DDz3, ..., DRz1, ..., DRz6
;       bStiffness, bMass, bDamping
   Spring-1,1000,2000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   YES,NO,NO
   Spring-2,500,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
   YES,NO,NO
```
