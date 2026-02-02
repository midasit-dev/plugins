# \*BEAMLOAD MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `荷重` 시트에서 보 요소 하중을 MIDAS Civil NX의 `*BEAMLOAD` 섹션으로 변환

> **참고**: BEAMLOAD는 보 요소에 작용하는 집중/분포/투영 하중을 정의합니다.
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
| C   | row[1]  | LOAD_TYPE       | 하중 유형                         |
| D   | row[2]  | LOAD_CASE       | 하중 케이스명                     |
| E   | row[3]  | ACTION_TYPE     | 작용 유형 (並進荷重/モーメント)   |
| F   | row[4]  | TARGET          | 대상 요소명 (콤마 구분)           |
| G   | row[5]  | VALUE1          | P1 값 (시작점 하중)               |
| H   | row[6]  | VALUE2          | P2 값 (끝점 하중)                 |
| M   | row[11] | ECCENTRICITY    | 편심값                            |
| O   | row[13] | DIRECTION       | 방향 (全体/要素 X/Y/Z)            |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | 요소 길이 계산용              | **필수**  |
| `フレーム要素`| `FRAME`        | 요소 번호 매핑                | **필수**  |

---

## 2. 출력 구조

### MCT 형식

```
*USE-STLD, Live

*BEAMLOAD    ; Element Beam Loads
; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP
; ELEM_LIST, CMD, TYPE, TYPE, DIR, VX, VY, VZ, bPROJ, [ECCEN], [VALUE], GROUP
; [VALUE]       : D1, P1, D2, P2, D3, P3, D4, P4
; [ECCEN]       : bECCEN, ECCDIR, I-END, J-END, bJ-END
; [ADDITIONAL]  : bADDITIONAL, ADDITIONAL_I-END, ADDITIONAL_J-END, bADDITIONAL_J-END
   1,LINE,UNILOAD,GY,NO,NO,,,,0,-10,1,-10, 0, 0, 0, 0,, NO, 0, 0, NO,

; End of data for load case [Live] -------------------------
```

### 필드 설명

| 필드        | 설명                    | 값/소스                          |
| ----------- | ----------------------- | -------------------------------- |
| ELEM_LIST   | 요소 번호               | elementMapping.get(elemName)     |
| CMD         | 명령 타입               | `BEAM` 또는 `LINE`               |
| TYPE        | 하중 타입               | `CONLOAD`/`UNILOAD`/`CONMOMENT`/`UNIMOMENT` |
| DIR         | 방향                    | `GX`/`GY`/`GZ`/`LX`/`LY`/`LZ`   |
| bPROJ       | 투영 여부               | `YES` 또는 `NO`                  |
| [ECCEN]     | 편심 정보               | GetECCEN 결과                    |
| [VALUE]     | 하중 값                 | `D1,P1,D2,P2,...`                |

---

## 3. BEAMLOAD 생성 조건

### 하중 유형 매핑

| 유형 번호 | 하중 유형                    | CMD    | TYPE      | bPROJ |
| --------- | ---------------------------- | ------ | --------- | ----- |
| 4         | フレーム要素-集中荷重        | BEAM   | CONLOAD/CONMOMENT | NO  |
| 5         | フレーム要素-分布荷重(単独)  | LINE   | UNILOAD/UNIMOMENT | NO  |
| 6         | フレーム要素-分布荷重(連続)  | LINE   | UNILOAD/UNIMOMENT | NO  |
| 7         | フレーム要素-射影面荷重      | LINE   | UNILOAD/UNIMOMENT | YES |

### VBA 로직 (lines 666-674)

```vba
' CMD 결정
If 4 < nType Then strCMD = ",LINE,"   ' 유형 5,6,7 → LINE
' 기본값: ",BEAM,"                     ' 유형 4 → BEAM

' PROJ 결정
If nType = 6 Then strPROJ = ",YES,"   ' 유형 7(실제 6+1) → 투영
' 기본값: ",NO,"

' TYPE 결정
If nType = 3 Then                     ' 유형 4(실제 3+1)
  strType = "CONLOAD,"
  If nAction = 1 Then strType = "CONMOMENT,"
Else
  strType = vType(nAction)            ' UNILOAD/UNIMOMENT
End If
```

---

## 4. 방향 매핑

### VBA (lines 654-659)

```vba
dicDir.Add "全体 X", "GX"
dicDir.Add "全体 Y", "GZ"   ' ES Y → MIDAS Z
dicDir.Add "全体 Z", "GY"   ' ES Z → MIDAS Y
dicDir.Add "要素 X", "LX"
dicDir.Add "要素 Y", "LZ"   ' ES Y → MIDAS Z
dicDir.Add "要素 Z", "LY"   ' ES Z → MIDAS Y
```

### 부호 반전 규칙 (lines 756-759)

```vba
If strDir = "GY" Or strDir = "LY" Then
  dP1(k) = dP1(k) * -1#
  dP2(k) = dP2(k) * -1#
End If
```

> **중요**: GY/LY 방향(ES Z → MIDAS Y)일 때 하중값의 부호가 반전됩니다.

---

## 5. SortElem 함수 (요소 체인 정렬)

### 목적

연속 분포하중(`フレーム要素-分布荷重(連続)`)을 위해 요소들을 연결 순서대로 정렬

### VBA 로직 (lines 557-617)

```vba
' 1. 각 요소의 노드 정보 및 길이 계산
For i = 0 To UBound(vElem)
  vElemNode(i).vElem = vElem(i)
  vElemNode(i).vNode_I = m_ElemNode(vElem(i))(0)  ' i-노드
  vElemNode(i).vNode_J = m_ElemNode(vElem(i))(1)  ' j-노드
  vElemNode(i).dLength = dist(vNode_I, vNode_J)
  dAll = dAll + vElemNode(i).dLength
Next i

' 2. 요소 연결 관계 파악
For i = 0 To UBound(vElemNode) - 1
  For j = i + 1 To UBound(vElemNode)
    If vElemNode(i).vNode_I = vElemNode(j).vNode_J Then
      vElemNode(i).vElem_I = j  ' i의 앞 요소 = j
      vElemNode(j).vElem_J = i  ' j의 뒤 요소 = i
    End If
    If vElemNode(i).vNode_J = vElemNode(j).vNode_I Then
      vElemNode(i).vElem_J = j  ' i의 뒤 요소 = j
      vElemNode(j).vElem_I = i  ' j의 앞 요소 = i
    End If
  Next j
Next i

' 3. 시작점 찾기 및 순서 정렬
' vElem_I가 비어있는 요소 = 시작점
```

### 연결 체인 예시

```
입력: E3, E1, E2 (무순서)

연결 관계:
  E1: N1 ─── N2
  E2: N2 ─── N3
  E3: N3 ─── N4

정렬 결과: E1, E2, E3 (체인 순서)
```

---

## 6. GetECCEN 함수 (편심 처리)

### 목적

하중 방향과 요소 각도를 기반으로 편심 방향 결정

### VBA 로직 (lines 500-545)

```vba
If vEccentricity = 0 Or Len(vEccentricity) = 0 Then
  GetECCEN = "NO,,,,"
Else
  Select Case vDir
    Case "GX"
      ' 요소 각도에 따라 LY 또는 LZ
      If (angle0=0 And angle1=0) Or (angle0≠0 And angle1=1) Then
        strEccDir = "LY"
      Else
        strEccDir = "LZ"
      End If
    Case "GY"
      ' ...
    Case "GZ"
      ' ...
    Case "LY", "LZ"
      strEccDir = vDir  ' 로컬 방향은 그대로 사용
  End Select

  GetECCEN = "YES,0," & strEccDir & "," & vEccentricity & "," & vEccentricity & ",NO"
End If
```

### 출력 형식

| 편심 없음 | 편심 있음                          |
| --------- | ---------------------------------- |
| `NO,,,,`  | `YES,0,LY,0.5,0.5,NO`              |

---

## 7. 삼각형 분포 하중

### 조건

P1=0, P2≠0 일 때 삼각형 분포 하중 처리

### VBA 로직 (lines 700-727)

```vba
If CDbl(strData(5, nCnt)) = 0 Then
  If Not CDbl(strData(6, nCnt)) = 0 Then
    ' 삼각형 분포: 전체 길이에 대해 선형 증가
    dBaseLoad = CDbl(strData(6, nCnt)) / dAll

    For k = 0 To UBound(vElemNode)
      dP1(k) = dLoad * dBaseLoad           ' 시작점 하중
      dLoad = dLoad + vElemNode(k).dLength ' 누적 거리
      dP2(k) = dLoad * dBaseLoad           ' 끝점 하중
    Next k
  End If
End If
```

### 삼각형 분포 예시

```
입력: P1=0, P2=30, 요소 E1(10m), E2(10m), E3(10m)
전체 길이: 30m
기본 기울기: 30/30 = 1.0 kN/m per m

요소별 계산:
  E1: dP1=0*1.0=0,   dP2=10*1.0=10
  E2: dP1=10*1.0=10, dP2=20*1.0=20
  E3: dP1=20*1.0=20, dP2=30*1.0=30

     P=30
      ╱│
     ╱ │
    ╱  │
   ╱   │
  ╱    │
 ╱─────┼───────
P=0   E1   E2   E3
```

---

## 8. VALUE 필드 형식

### MCT VALUE 구조

```
D1, P1, D2, P2, D3, P3, D4, P4
```

| 필드 | 설명                        |
| ---- | --------------------------- |
| D1   | 시작 위치 (0 = 요소 시작점) |
| P1   | 시작점 하중값               |
| D2   | 끝 위치 (1 = 요소 끝점)     |
| P2   | 끝점 하중값                 |
| D3~D4, P3~P4 | 추가 하중점 (미사용) |

### 예시

```
균일 분포: ,0,10,1,10, 0, 0, 0, 0
삼각형:    ,0,0,1,20, 0, 0, 0, 0
```

---

## 9. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 요소 정렬         | SortElem 함수            | sortElem 함수               | 동일      |
| 편심 처리         | GetECCEN 함수            | getECCEN 함수               | 동일      |
| 방향 매핑         | dicDir Dictionary        | DIR_MAP 객체                | 동일      |
| 삼각형 분포       | 인라인 계산              | 동일 로직                   | 동일      |

---

## 10. 결론

**✓ \*BEAMLOAD 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: 하중 유형 4~7 (프레임 요소 하중)
- 필요한 시트: `荷重` (주요), `節点座標`, `フレーム要素` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. CMD: 유형 4 → BEAM, 유형 5~7 → LINE
> 2. bPROJ: 유형 7만 YES
> 3. GY/LY 방향일 때 부호 반전
> 4. 삼각형 분포: P1=0, P2≠0일 때 선형 증가

---

## 데이터 입력 예제

### Excel 시트 (`荷重`)

|     | C                          | D      | E        | F      | G   | H   | M   | O        |
| --- | -------------------------- | ------ | -------- | ------ | --- | --- | --- | -------- |
| 2   | 荷重タイプ                 | ケース名| 作用タイプ| 対象   | P1  | P2  | 偏心 | 方向     |
| 3   | フレーム要素-集中荷重      | Dead   | 並進荷重 | E1     | 100 |     |     | 全体 Z   |
| 4   | フレーム要素-分布荷重(単独)| Live   | 並進荷重 | E1     | 10  | 10  |     | 全体 Z   |
| 5   | フレーム要素-分布荷重(連続)| Live   | 並進荷重 | E1,E2  | 0   | 20  |     | 全体 Z   |
| 6   | フレーム要素-射影面荷重    | Wind   | 並進荷重 | E3     | 5   | 5   | 0.2 | 全体 X   |

### 변환 결과

| 행 | 유형 | CMD  | TYPE    | DIR | PROJ | VALUE          | 비고             |
| -- | ---- | ---- | ------- | --- | ---- | -------------- | ---------------- |
| 3  | 4    | BEAM | CONLOAD | GY  | NO   | 0,-100,1,0     | 집중, 부호 반전  |
| 4  | 5    | LINE | UNILOAD | GY  | NO   | 0,-10,1,-10    | 균일, 부호 반전  |
| 5  | 6    | LINE | UNILOAD | GY  | NO   | E1:0,0,1,-10 / E2:0,-10,1,-20 | 삼각형 |
| 6  | 7    | LINE | UNILOAD | GX  | YES  | 0,5,1,5        | 투영, 편심 있음  |

### MCT 출력 결과

```
*USE-STLD, Dead

*BEAMLOAD    ; Element Beam Loads
; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP
...
   1,BEAM,CONLOAD,GY,NO,NO,,,,0,-100,1,0, 0, 0, 0, 0,, NO, 0, 0, NO,

; End of data for load case [Dead] -------------------------

*USE-STLD, Live

*BEAMLOAD    ; Element Beam Loads
...
   1,LINE,UNILOAD,GY,NO,NO,,,,0,-10,1,-10, 0, 0, 0, 0,, NO, 0, 0, NO,
   1,LINE,UNILOAD,GY,NO,NO,,,,0,0,1,-10, 0, 0, 0, 0,, NO, 0, 0, NO,
   2,LINE,UNILOAD,GY,NO,NO,,,,0,-10,1,-20, 0, 0, 0, 0,, NO, 0, 0, NO,

; End of data for load case [Live] -------------------------

*USE-STLD, Wind

*BEAMLOAD    ; Element Beam Loads
...
   3,LINE,UNILOAD,GX,YES,YES,0,LY,0.2,0.2,NO,0,5,1,5, 0, 0, 0, 0,, NO, 0, 0, NO,

; End of data for load case [Wind] -------------------------
```

### 의존 관계

```
BEAMLOAD ──┬── 節点座標 (요소 길이 계산)
           │       ↓
           │   dist(Node_I, Node_J)
           │
           └── フレーム要素 (요소 번호, 노드 연결)
                   ↓
               elementMapping.get('E1') → 1
               elemNodeNames.get('E1') → {nodeI: 'N1', nodeJ: 'N2'}
```
