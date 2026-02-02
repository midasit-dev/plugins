# \*CONSTRAINT MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `支点` 시트에서 지점 구속 조건을 MIDAS Civil NX의 `*CONSTRAINT` 섹션으로 변환

> **참고**: CONSTRAINT는 노드의 자유도(DOF) 구속을 정의합니다.
> `支点` 시트에서 "ばね(스프링)" 이외의 구속(固定/自由)이 있을 때 생성됩니다.
> 스프링 지점은 `*GSPRING` 섹션으로 별도 출력됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA               | TypeScript | 상태 |
| ------- | ----------------- | ---------- | ---- |
| 시트명  | `m_Sheet_Fulcrum` | `支点`     | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3          | ✓    |
| 시작 열 | 2 (nReadSTCol)    | 2 (B)      | ✓    |
| 종료 열 | 13 (nReadEDCol)   | 13 (M)     | ✓    |

### 열 구조 (B~M, 12열)

| 열  | 인덱스 | VBA           | TypeScript | 설명                     |
| --- | ------ | ------------- | ---------- | ------------------------ |
| B   | 0      | strData(0, j) | row[0]     | 지점명 (支点名)          |
| C   | 1      | strData(1, j) | row[1]     | (미사용)                 |
| D   | 2      | strData(2, j) | row[2]     | 노드명 (節点名)          |
| E   | 3      | strData(3, j) | row[3]     | DX 구속 (自由/固定/ばね) |
| F   | 4      | strData(4, j) | row[4]     | DY 구속 (ES 좌표계)      |
| G   | 5      | strData(5, j) | row[5]     | DZ 구속 (ES 좌표계)      |
| H   | 6      | strData(6, j) | row[6]     | RX 구속                  |
| I   | 7      | strData(7, j) | row[7]     | RY 구속 (ES 좌표계)      |
| J   | 8      | strData(8, j) | row[8]     | RZ 구속 (ES 좌표계)      |
| K-M | 9-11   | strData(9-11) | row[9-11]  | (추가 열)                |

### 의존 시트

| 시트명     | TypeScript 상수 | 용도           | 필수 여부 |
| ---------- | --------------- | -------------- | --------- |
| `節点座標` | `NODE`          | 노드 번호 매핑 | **필수**  |

---

## 2. 출력 구조

### MCT 형식

```
*CONSTRAINT    ; Supports
; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP
   1,111111,
   2,110000,
   3,111000,
```

### 필드 설명

| 필드      | 설명                    | 값/소스                    |
| --------- | ----------------------- | -------------------------- |
| NODE_LIST | 노드 번호               | nodeMapping.get(nodeName)  |
| CONST     | DOF 구속 문자열 (6자리) | 1=구속(固定), 0=자유(自由) |
| GROUP     | 그룹 이름               | 항상 빈값                  |

### DOF 문자열 구조

```
CONST = XXXXXX
        │││││└─ Rz (Z축 회전)
        ││││└── Ry (Y축 회전)
        │││└─── Rx (X축 회전)
        ││└──── Dz (Z축 변위)
        │└───── Dy (Y축 변위)
        └────── Dx (X축 변위)

1 = 구속 (固定)
0 = 자유 (自由)
```

---

## 3. 생성 조건

### 분기 조건 (VBA lines 74-80)

```vba
bOutput = False
For k = 3 To 8
  If strData(k, j) = strSpring Then  ' strSpring = "ばね"
    bOutput = True
    Exit For
  End If
Next k

If bOutput Then
  ' → *GSPRING 출력
Else
  ' → *CONSTRAINT 출력
End If
```

| 조건              | 출력 섹션     |
| ----------------- | ------------- |
| DOF에 "ばね" 있음 | `*GSPRING`    |
| DOF에 "ばね" 없음 | `*CONSTRAINT` |

---

## 4. 좌표 변환

### ES → MCT 좌표계 변환

```
ES 좌표계:  (X, Y, Z)
MCT 좌표계: (X, -Z, Y)

DOF 변환:
  MCT Dx = ES Dx   (동일)
  MCT Dy = ES Dz   (ES Z → MCT Y)  ★ 좌표 변환
  MCT Dz = ES Dy   (ES Y → MCT Z)  ★ 좌표 변환
  MCT Rx = ES Rx   (동일)
  MCT Ry = ES Rz   (ES RZ → MCT RY) ★ 좌표 변환
  MCT Rz = ES Ry   (ES RY → MCT RZ) ★ 좌표 변환
```

### VBA 코드 (lines 104-109)

```vba
strBuf(i) = dicFreeFixt(strData(3, j)) & _  ' ES Dx → MCT Dx
            dicFreeFixt(strData(5, j)) & _  ' ES Dz → MCT Dy ★
            dicFreeFixt(strData(4, j)) & _  ' ES Dy → MCT Dz ★
            dicFreeFixt(strData(6, j)) & _  ' ES Rx → MCT Rx
            dicFreeFixt(strData(8, j)) & _  ' ES Rz → MCT Ry ★
            dicFreeFixt(strData(7, j))      ' ES Ry → MCT Rz ★
```

### 열 매핑 테이블

| ES 열 | ES 인덱스 | ES DOF | MCT DOF | MCT 위치 |
| ----- | --------- | ------ | ------- | -------- |
| E     | 3         | Dx     | Dx      | 1번째    |
| G     | 5         | Dz     | Dy      | 2번째 ★  |
| F     | 4         | Dy     | Dz      | 3번째 ★  |
| H     | 6         | Rx     | Rx      | 4번째    |
| J     | 8         | Rz     | Ry      | 5번째 ★  |
| I     | 7         | Ry     | Rz      | 6번째 ★  |

---

## 5. DOF 값 매핑

### 딕셔너리 (VBA lines 48-51)

```vba
Dim dicFreeFixt As Dictionary
Set dicFreeFixt = New Dictionary
dicFreeFixt.Add "自由", 0  ' Free
dicFreeFixt.Add "固定", 1  ' Fixed
```

### TypeScript 매핑

```typescript
const FREE_FIXT_MAP: Record<string, string> = {
  自由: "0",
  固定: "1",
  Free: "0",
  Fixed: "1",
  "": "0", // Empty = Free
};
```

---

## 6. VBA 함수 분석

### ChangeFulcrum (lines 25-139)

```vba
Public Sub ChangeFulcrum(ByRef dicSprType As Dictionary)
  ' 데이터 읽기
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)

  ' MCT 헤더 (lines 66-68)
  vWriteData(nRowCnt(nWriteType), m_nInterval) = "*CONSTRAINT    ; Supports"
  vWriteData(nRowCnt(nWriteType), m_nInterval) = "; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP"

  For j = 0 To nCnt
    ' 스프링 체크 (lines 74-80)
    bOutput = False
    For k = 3 To 8
      If strData(k, j) = strSpring Then
        bOutput = True
        Exit For
      End If
    Next k

    If bOutput Then
      ' *GSPRING 출력 (lines 82-96)
    Else
      ' *CONSTRAINT 출력 (lines 97-119)
      strBuf(0) = m_NodeData(strData(2, j))  ' 노드 번호

      ' DOF 문자열 생성 (좌표 변환 적용)
      strBuf(1) = dicFreeFixt(strData(3, j)) & _  ' Dx
                  dicFreeFixt(strData(5, j)) & _  ' Dz→Dy
                  dicFreeFixt(strData(4, j)) & _  ' Dy→Dz
                  dicFreeFixt(strData(6, j)) & _  ' Rx
                  dicFreeFixt(strData(8, j)) & _  ' Rz→Ry
                  dicFreeFixt(strData(7, j))      ' Ry→Rz

      strBuf(2) = ""  ' GROUP
    End If
  Next j
End Sub
```

---

## 7. VBA와 TypeScript 비교

| 항목        | VBA               | TypeScript        | 일치 |
| ----------- | ----------------- | ----------------- | ---- |
| 시트 설정   | row=3, col=2-13   | row=3, col=2-13   | ✓    |
| 좌표 변환   | Y↔Z 스왑          | Y↔Z 스왑          | ✓    |
| DOF 매핑    | 自由 →0, 固定 →1  | 自由 →0, 固定 →1  | ✓    |
| 스프링 분기 | "ばね" 체크       | "ばね" 체크       | ✓    |
| 출력 형식   | nodeNo,DOFSTRING, | nodeNo,DOFSTRING, | ✓    |

> **참고**: VBA 파일의 `strSpring` 상수가 인코딩 손상으로 "???"로 표시되지만,
> 시트 이름 패턴(ばね要素, ばね特性表 등)과 TypeScript 구현을 참고하면 "ばね"가 올바른 값입니다.

---

## 8. 결론

**✓ \*CONSTRAINT 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: `支点` 시트에서 DOF가 固定/自由일 때
- 필요한 시트: `支点` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
>
> 1. `支点` 시트에서 두 가지 MCT 섹션 생성: `*GSPRING`, `*CONSTRAINT`
> 2. DOF에 "ばね"(스프링) 있으면 `*GSPRING`, 없으면 `*CONSTRAINT`
> 3. **좌표 변환 적용**: ES(X,Y,Z) → MCT(X,Z,Y)
> 4. DOF 순서: Dx, Dy, Dz, Rx, Ry, Rz

---

## 데이터 입력 예제

### Excel 시트 (`支点`)

|     | B(지점명) | C   | D(노드) | E(Dx) | F(Dy) | G(Dz) | H(Rx) | I(Ry) | J(Rz) |
| --- | --------- | --- | ------- | ----- | ----- | ----- | ----- | ----- | ----- |
| 2   | 支点名    |     | 節点    | Dx    | Dy    | Dz    | Rx    | Ry    | Rz    |
| 3   | Fix1      |     | N1      | 固定  | 固定  | 固定  | 固定  | 固定  | 固定  |
| 4   | Pin1      |     | N2      | 固定  | 固定  | 固定  | 自由  | 自由  | 自由  |
| 5   | RollerX   |     | N3      | 自由  | 固定  | 固定  | 自由  | 自由  | 自由  |

### 변환 과정

| 행  | ES 순서 (E~J)            | MCT 순서 (좌표변환 후)       | DOF 문자열 |
| --- | ------------------------ | ---------------------------- | ---------- |
| 3   | Dx,Dy,Dz,Rx,Ry,Rz=111111 | Dx,Dz,Dy,Rx,Rz,Ry=111111     | 111111     |
| 4   | Dx,Dy,Dz,Rx,Ry,Rz=111000 | Dx,Dz,Dy,Rx,Rz,Ry=111000     | 111000     |
| 5   | Dx,Dy,Dz,Rx,Ry,Rz=011000 | Dx,Dz,Dy,Rx,Rz,Ry=**011000** | 011000     |

> RollerX 예시: ES Dy=固定(1), ES Dz=固定(1) → MCT Dy=1, MCT Dz=1

### MCT 출력 결과

```
*CONSTRAINT    ; Supports
; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP
   1,111111,
   2,111000,
   3,011000,
```

### 의존 관계

```
CONSTRAINT ──── 節点座標 (노드 번호 매핑)
                   ↓
               nodeMapping.get('N1') → 1
               nodeMapping.get('N2') → 2
               nodeMapping.get('N3') → 3
```

---

## 관련 섹션

| MCT 섹션      | 생성 조건          | 소스 시트 |
| ------------- | ------------------ | --------- |
| `*CONSTRAINT` | DOF = 固定/自由    | `支点`    |
| `*GSPRING`    | DOF = ばね(스프링) | `支点`    |
