# \*NL-LINK & \*NL-PROP MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 스프링 관련 시트에서 MIDAS Civil NX의 비선형 링크 섹션으로 변환합니다.

| MCT 섹션               | 설명                          | 소스 시트                       | VBA 클래스            |
| ---------------------- | ----------------------------- | ------------------------------- | --------------------- |
| `*NL-LINK`             | 비선형 링크 요소 정의         | `ばね要素`                      | Class110_ElemSpring   |
| `*NL-PROP`             | 비선형 링크 속성 정의         | `ばね特性表_成分一覧(対称)`     | Class130_SPGAllSym    |
| `*VISCOUS-OIL-DAMPER`  | 점성/오일 댐퍼 정의           | (NL-PROP 생성 시 자동)          | Class130_SPGAllSym    |
| (보조: SPG6Comp)       | 6성분 이력 유형 판별          | `ばね特性表_6成分概要`          | Class120_SPG6Comp     |

> **연결 관계**:
> - NL-LINK의 GPROP 필드 → NL-PROP의 NAME 필드
> - NL-PROP의 nDamper 필드 → VISCOUS-OIL-DAMPER의 KEY 필드
> - SPG6Comp에서 "BMR(CD)ダンパー" 판별 시 VISCOUS-OIL-DAMPER 섹션 생성

---

## 1. \*NL-LINK (비선형 링크 요소)

### 1.1 소스 시트 설정

| 항목      | VBA                   | 값         |
| --------- | --------------------- | ---------- |
| 시트명    | `m_Sheet_ElmSpr`      | `ばね要素` |
| 시작 행   | `nReadSTRow`          | 4          |
| 시작 열   | `nReadSTCol`          | 2 (B)      |
| 종료 열   | `nReadEDCol`          | 9 (I)      |

### 1.2 열 구조 (VBA strData)

| 열  | 인덱스 | VBA             | 설명                     |
| --- | ------ | --------------- | ------------------------ |
| B   | 0      | strData(0, j)   | 요소명 (要素名)          |
| C   | 1      | strData(1, j)   | 노드1 (節点1)            |
| D   | 2      | strData(2, j)   | 노드2 (節点2)            |
| E   | 3      | strData(3, j)   | 속성명 (ばね特性表示名)  |
| F   | 4      | strData(4, j)   | 좌표계 (座標系)          |
| G-I | 5-7    | strData(5-7, j) | 추가 데이터              |

### 1.3 MCT 출력 형식

```
*NL-LINK  ; General Link
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, ANGLE-x, ANGLE-y, ANGLE-z, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, P0X, P0Y, P0Z, P1X, P1Y, P1Z, P2X, P2Y, P2Z, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, V1X, V1Y, V1Z, V2X, V2Y, V2Z, GROUP
   1,1,2,SPR-01,NL_SPR-01,1,2,1,0,0,0,-1,0,
   2,3,4,SPR-02,,0,90,
```

### 1.4 필드 설명

| 필드      | 설명                    | 소스/처리                           |
| --------- | ----------------------- | ----------------------------------- |
| iNO       | 요소 번호               | m_ElemSprData(strData(0, j))        |
| iNODE1    | 노드1 번호              | m_NodeData(strData(1, j))           |
| iNODE2    | 노드2 번호              | m_NodeData(strData(2, j))           |
| GPROP     | 속성명 (콤마→대시)      | ChgCamma(strData(3, j))             |
| IEPROP    | NL 요소 속성명          | `NL_` + 속성명 (dicSPG6Comp 존재 시)|
| iRCS~     | 좌표계/각도             | CalcAngle() 함수 결과               |
| GROUP     | 그룹명                  | 항상 빈값                           |

### 1.5 CalcAngle 함수 (VBA 191-272)

좌표계 문자열을 파싱하여 MCT 각도 문자열 생성:

```vba
' 참조요소인 경우 (VBA 256-262)
If Left(strCoordSys, Len("参照要素")) = "参照要素" Then
  strAngle = "0," & m_ElemAngle(vBuf(1))(0)  ' 예: "0,90"
' 벡터인 경우 (VBA 263-268)
Else
  strAngle = "1,2,"
  strAngle = strAngle & Split_CoordSys(strCoordSys)  ' 예: "1,2,1,0,0,0,-1,0"
End If
```

### 1.6 dicChangeVecter 딕셔너리 (VBA 450-498)

36개의 벡터 변환 매핑:

```vba
' 기본 벡터 정의 (VBA 434-448)
strVect(0) = "1,0,0,0,-1,0"   ' X,Y 평면, v1 정렬, xl 축
strVect(1) = "1,0,0,0,0,-1"   ' X,Z 평면, v1 정렬, xl 축
strVect(2) = "0,0,1,1,0,0"    ' Y,Z 평면, v1 정렬, xl 축
strVect(3) = "0,0,1,0,1,0"
strVect(4) = "0,-1,0,0,0,1"
strVect(5) = "0,-1,0,-1,0,0"
strVect(6) = "0,0,-1,0,-1,0"
strVect(7) = "0,1,0,1,0,0"
strVect(8) = "-1,0,0,0,0,1"
strVect(9) = "0,-1,0,1,0,0"
strVect(10) = "1,0,0,0,0,1"
strVect(11) = "0,0,1,0,-1,0"

' Align=v1,Axis=xl (VBA 453-458)
dicChangeVecter.Add "X,Y,v1,xl", strVect(0)  ' "1,0,0,0,-1,0"
dicChangeVecter.Add "X,Z,v1,xl", strVect(1)  ' "1,0,0,0,0,-1"
dicChangeVecter.Add "Y,Z,v1,xl", strVect(2)  ' "0,0,1,1,0,0"
dicChangeVecter.Add "Y,X,v1,xl", strVect(3)  ' "0,0,1,0,1,0"
dicChangeVecter.Add "Z,X,v1,xl", strVect(4)  ' "0,-1,0,0,0,1"
dicChangeVecter.Add "Z,Y,v1,xl", strVect(5)  ' "0,-1,0,-1,0,0"

' Align=v1,Axis=yl (VBA 461-466)
dicChangeVecter.Add "X,Y,v1,yl", strVect(4)  ' "0,-1,0,0,0,1"
dicChangeVecter.Add "X,Z,v1,yl", strVect(6)  ' "0,0,-1,0,-1,0"
dicChangeVecter.Add "Y,Z,v1,yl", strVect(0)  ' "1,0,0,0,-1,0"
dicChangeVecter.Add "Y,X,v1,yl", strVect(7)  ' "0,1,0,1,0,0"
dicChangeVecter.Add "Z,X,v1,yl", strVect(2)  ' "0,0,1,1,0,0"
dicChangeVecter.Add "Z,Y,v1,yl", strVect(8)  ' "-1,0,0,0,0,1"

' Align=v1,Axis=zl (VBA 469-474)
dicChangeVecter.Add "X,Y,v1,zl", strVect(2)  ' "0,0,1,1,0,0"
dicChangeVecter.Add "X,Z,v1,zl", strVect(9)  ' "0,-1,0,1,0,0"
dicChangeVecter.Add "Y,Z,v1,zl", strVect(4)  ' "0,-1,0,0,0,1"
dicChangeVecter.Add "Y,X,v1,zl", strVect(10) ' "1,0,0,0,0,1"
dicChangeVecter.Add "Z,X,v1,zl", strVect(0)  ' "1,0,0,0,-1,0"
dicChangeVecter.Add "Z,Y,v1,zl", strVect(11) ' "0,0,1,0,-1,0"

' Align=v2,Axis=xl (VBA 477-482) - v1,zl과 동일
' Align=v2,Axis=yl (VBA 485-490) - v1,xl과 동일
' Align=v2,Axis=zl (VBA 493-498) - v1,yl과 동일
```

### 1.7 좌표계 파싱 (Split_CoordSys, VBA 348-413)

```vba
' Global 벡터 2개인 경우 (VBA 367-379)
If 두 벡터 모두 Global이면:
  key = "X,Y,v1,xl" 형식으로 추출
  strRet = dicChangeVecter(key)

' Global이 아닌 벡터인 경우 (VBA 381-407)
Else:
  v1, v2 벡터 파싱 (Global/Alpha/X=Y=Z= 형식)
  Select Case Align,Axis:
    Case "v1,xl", "v2,yl":
      strRet = v1(0) & ",-" & v1(2) & "," & v1(1) & "," & Calc_Vecter(v1, v2)
    Case "v1,yl", "v2,zl":
      strRet = Calc_Vecter(v1, v2) & "," & v2(0) & ",-" & v2(2) & "," & v2(1)
    Case "v1,zl", "v2,xl":
      strRet = v1(0) & ",-" & v1(2) & "," & v1(1) & "," & v2(0) & ",-" & v2(2) & "," & v2(1)
```

### 1.8 dicComponent 로직 (VBA 221-254)

동일 속성명이 다른 좌표계로 사용되는 경우 `~1`, `~2` 접미사 추가:

```vba
' 2중절점 판별 (VBA 215-219)
strSprPnt = "_NotSame"
If m_DicOrgNode(strN1) = m_DicOrgNode(strN2) Then
  strSprPnt = "_Same"
End If

' 좌표계 충돌 검사 (VBA 221-254)
If dicComponent.Exists(strName) Then
  If dicComponent(strName) <> strCoordSys & strSprPnt Then
    ' 새 속성명 생성: "SPR-01~1"
    i = 1
    s = "~" & i
    While m_dicSprProp.Exists(strName & s)
      i = i + 1
      s = "~" & i
    Wend
    strName = strName & s
  End If
End If
```

---

## 2. \*NL-PROP (비선형 링크 속성)

### 2.1 소스 시트 설정

| 항목      | VBA                    | 값                                |
| --------- | ---------------------- | --------------------------------- |
| 시트명    | `m_Sheet_SPGAllSym`    | `ばね特性表_成分一覧(対称)`       |
| 시작 행   | `nReadSTRow`           | 5                                 |

### 2.2 4개 테이블 영역 (VBA 12-24)

| 테이블명         | 시작 열  | 종료 열  | 열 수 | 유형        |
| ---------------- | -------- | -------- | ----- | ----------- |
| 線形             | 2 (B)    | 13 (M)   | 12    | LINEAR      |
| バイリニア       | 15 (O)   | 30 (AD)  | 16    | NBI         |
| トリリニア       | 32 (AF)  | 50 (AX)  | 19    | KIN         |
| テトリリニア     | 52 (AZ)  | 78 (CA)  | 27    | TTE         |

### 2.3 MCT 출력 형식 (VBA 73-86)

```
*NL-PROP    ; General Link Property
; NAME, APPTYPE, TYPE, TW, TWRATIO_I, bUSEMASS, TM, TMRATIO_I, bSSL, DY, DZ, SIESKEY(if APPTYPE=2), DESC
; bLDX, DX, EFFDAMP, bNDX, [NL_PROP]
; bLDY, DY, EFFDAMP, bNDY, [NL_PROP]
; bLDZ, DZ, EFFDAMP, bNDZ, [NL_PROP]
; bLRX, RX, EFFDAMP, bNRX, [NL_PROP]
; bLRY, RY, EFFDAMP, bNRY, [NL_PROP]
; bLRZ, RZ, EFFDAMP, bNRZ, [NL_PROP]
; [NL_PROP] : DSTIFF, DAMP, DEXP, bRIGDBR, BSTIFF, REFV                                  ; Visco-elastic Damper Type
; [NL_PROP] : STIFF, OPEN                                                                ; Gap Type or Hook Type
; [NL_PROP] : STIFF, YSTR, PYS_RATIO, YEXP, PA, PB                                       ; Hysteretic System Type
; [NL_PROP] : STIFF, YSTR, PYS_RATIO, PA, PB                                             ; Lead Rubber Bearing Type
; [NL_PROP] : STIFF, FCS, FCF, RP, RADIUS, PA, PB                                        ; Friction Pendulum System Type
; [NL_PROP] : SYM, STIFF(1~4), FCS(1~4), FCF(1~4), RP(1~4), RADIUS(1~4), STOPDIST(1~4), H_In, H_Out   ; Triple Friction Pendulum System Type
```

### 2.4 8줄 구조 (속성당)

```
Line 1: SPR-01,ELEMENT,SPG,0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,0,
Line 2: YES,1000,0,NO           ; Dx DOF
Line 3: YES,2000,0,NO           ; Dy DOF
Line 4: YES,3000,0,NO           ; Dz DOF
Line 5: YES,100,0,NO            ; Rx DOF
Line 6: YES,200,0,NO            ; Ry DOF
Line 7: YES,300,0,NO            ; Rz DOF
Line 8: 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
```

### 2.5 Line 1 생성 (VBA 113-141)

```vba
' 기본 유형 (VBA 119-129)
strType = "SPG"
nDamper = 0

If dicSPG6Comp(strSprName)(0) = "VISCOUS-OIL-DAMPER" Then
  strType = "AI"
  nDamper = dicDamper.Count + 1
  dicDamper.Add strSprName, nDamper
End If

' Line 1 구성 (VBA 131-140)
' NAME, APPTYPE, TYPE, TW, TWRATIO_I, bUSEMASS, TM, TMRATIO_I, bSSL, DY, DZ, SIESKEY, DESC
strBuf = ChgCamma(strSprName) & ",ELEMENT," & strType & ",0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0," & nDamper & ","
```

### 2.6 vSPG 배열 (VBA 99)

성분 인덱스 매핑 (출력 위치 → ES 성분):

```vba
vSPG = Array(1, 3, -2, 4, 6, -5)
' 위치 0 → 성분 1 (Dx)
' 위치 1 → 성분 3 (Dz) → MCT Dy
' 위치 2 → 성분 -2 (Dy) → MCT Dz (부호 반전)
' 위치 3 → 성분 4 (Rx)
' 위치 4 → 성분 6 (Rz) → MCT Ry
' 위치 5 → 성분 -5 (Ry) → MCT Rz (부호 반전)
```

### 2.7 vSort 배열 (VBA 105-106)

참조요소 유무에 따른 정렬 순서:

```vba
vSort = Array( _
  Array(0, 1, 2, 3, 4, 5), _  ' 기본 순서 (nSort=0)
  Array(1, 0, 2, 4, 3, 5)  _  ' 참조요소 순서 (nSort=1, 20250924 수정)
)

' 참조요소 존재 여부 확인 (VBA 148)
If m_dicSpgRef.Exists(strSprName) Then nSort = 1
```

### 2.8 DOF 줄 생성 (VBA 149-193)

```vba
For m = 0 To 5
  ' vSort와 vSPG로 성분 인덱스 결정
  vBuf = m_SprComp(n).vAngle(vSort(nSort)(m))  ' 또는 vSPG(vSort(nSort)(m))
  vBuf = Abs(vBuf)

  If m_SprComp(n).SprCompData(vBuf).mct_HYST = "LITR" Then
    ' 고감쇠적층고무계 베어링 강성 계산 (VBA 159-163)
    dValue = dicNAGOYA(strData(0)) * strData(1) / ChangeN_kN(Change_par_MM2_M2(strData(2)))
    strBuf = "YES," & dValue & ", 0, NO"

  ElseIf Len(m_SprComp(n).SprCompData(vBuf).strProp) > 0 Then
    ' 강성값 존재 (VBA 164-182)
    strBuf = "YES," & strProp & ",0,NO"

  Else
    ' 자유 DOF (VBA 183-185)
    strBuf = "NO, 0, 0, NO"
  End If
Next m
```

### 2.9 dicNAGOYA 베어링 비율 (VBA 63-70)

```vba
dicNAGOYA.Add "H15.10 HDR-G12", 1.2
dicNAGOYA.Add "H15.10 HDR-G10", 1
dicNAGOYA.Add "H15.10 LRB-G12", 1.2
dicNAGOYA.Add "H15.10 LRB-G10", 1
dicNAGOYA.Add "H15.10 RB-G12", 1.2
dicNAGOYA.Add "H15.10 RB-G10", 1
```

### 2.10 bAllFree 처리 (VBA 195-199)

6 DOF 모두 자유인 경우 최소 강성 적용:

```vba
If bAllFree Then
  For m = 6 To 1 Step -1
    vWriteData(nRowCnt - m, 0) = "YES,0.00001,0,NO"
  Next m
End If
```

### 2.11 Line 8 (VBA 201-202)

31개의 0값:

```vba
vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
```

---

## 3. SPG6Comp (6성분 이력 유형)

### 3.1 소스 시트 설정

| 항목      | VBA                   | 값                          |
| --------- | --------------------- | --------------------------- |
| 시트명    | `m_Sheet_SPG6Comp`    | `ばね特性表_6成分概要`      |
| 시작 행   | `nReadSTRow`          | 4                           |
| 시작 열   | `nReadSTCol`          | 2 (B)                       |
| 종료 열   | `nReadEDCol`          | 15 (O)                      |

### 3.2 이력 유형 딕셔너리 (VBA 46-56)

```vba
dicData.Add "自由", ""
dicData.Add "固定", ""
dicData.Add "線形", ""
dicData.Add "高減衰積層ゴム系", "LITR"
dicData.Add "バイリニア (対称)", "NBI"
dicData.Add "バイリニア (非対称)", "NBI"
dicData.Add "トリリニア (対称)", "KIN"
dicData.Add "トリリニア (非対称)", "KIN"
dicData.Add "テトリリニア (対称)", "TTE"
dicData.Add "テトリリニア (非対称)", "TTE"
dicData.Add "BMR(CD)ダンパー", "VISCOUS-OIL-DAMPER"
```

### 3.3 대칭/비대칭 딕셔너리 (VBA 58-69)

```vba
' 対称 = 0, 非対称 = 1
dicASymmetric.Add "高減衰積層ゴム系", "0"
dicASymmetric.Add "バイリニア (対称)", "0"
dicASymmetric.Add "バイリニア (非対称)", 1
dicASymmetric.Add "トリリニア (対称)", 0
dicASymmetric.Add "トリリニア (非対称)", 1
dicASymmetric.Add "テトリリニア (対称)", 0
dicASymmetric.Add "テトリリニア (非対称)", 1
dicASymmetric.Add "BMR(CD)ダンパー", ""
```

### 3.4 GetSPG6CompDetail 함수 (VBA 101-128)

NBI 상세 유형 변환:

```vba
dicDetail.Add "原点原点", "SLBT"
dicDetail.Add "履歴履歴", "SLBC"
dicDetail.Add "原点履歴原点", "NBI"
dicDetail.Add "Gap/Hook", "SLBI"
dicDetail.Add "Takeda", "TAK"
dicDetail.Add "cloud/スリップ", "SLBI"

' Gap/Hook 특수 처리 (VBA 121-123)
If strSPGDetail = "Gap/Hook" Then
  strHYST2 = ", 0.01, 0.02"  ' 추가 매개변수
End If
```

---

## 4. \*VISCOUS-OIL-DAMPER (점성/오일 댐퍼)

### 4.1 개요

BMR(CD)ダンパー 유형의 스프링 요소가 있을 때 생성되는 제진장치 정의 섹션입니다.

> **생성 위치**: Class130_SPGAllSym.cls의 ChangeSPGAllSym() 함수 내 (VBA 207-239)
> **생성 조건**: `dicDamper.Count > 0` (NL-PROP 처리 중 BMR(CD)ダンパー 유형 감지 시)

### 4.2 NL-PROP와의 연결

dicDamper는 NL-PROP 생성 과정에서 채워집니다:

```vba
' NL-PROP Line 1 생성 중 (VBA 119-129)
strType = "SPG"
nDamper = 0

If dicSPG6Comp.Exists(strSprName) Then
  If dicSPG6Comp(strSprName)(0) = "VISCOUS-OIL-DAMPER" Then
    strType = "AI"                              ' TYPE을 "AI"로 변경
    If Not dicDamper.Exists(strSprName) Then
      nDamper = dicDamper.Count + 1             ' 댐퍼 KEY 번호 부여
      dicDamper.Add strSprName, nDamper         ' 딕셔너리에 추가
    End If
  End If
End If

' NL-PROP Line 1의 마지막 필드에 nDamper 값 출력
strBuf = "SPR-DAMPER,ELEMENT,AI,...," & nDamper & ","
'                                       ↑
'                                   VISCOUS-OIL-DAMPER의 KEY와 동일
```

### 4.3 MCT 출력 형식 (VBA 212-214)

```
*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper
; KEY, NAME, DESC, INPUTMETHOD, DEVICE TYPE, COMPANY, PRODUCT NAME, TYPE NUM, DAMPER TYPE, DASHPOT TYPE, INPUT TYPE, INPUT TYPE_EXFN ; 1st line
; [Dx] : DOF, CE, P1, C1, Alpha1, K0, PY, VY, ALPHA, C, CE - [Rz] : .....                                                            ; 2nd-7th line
```

### 4.4 7줄 구조 (댐퍼당)

```
Line 1: 1,SPR-DAMPER, , 0, , , , , 0, 2, 0, 1         ; 헤더
Line 2: YES , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100   ; Dx DOF (활성)
Line 3: NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100    ; Dy DOF
Line 4: NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100    ; Dz DOF
Line 5: NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100    ; Rx DOF
Line 6: NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100    ; Ry DOF
Line 7: NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100    ; Rz DOF
```

### 4.5 Line 1 필드 설명 (VBA 221-229)

| 필드           | 위치 | VBA 소스                      | 값/설명                    |
| -------------- | ---- | ----------------------------- | -------------------------- |
| KEY            | 1    | dicDamper(strSprName)         | 댐퍼 일련 번호 (1, 2, ...) |
| NAME           | 2    | ChgCamma(strSprName)          | 속성명 (콤마→대시)         |
| DESC           | 3    | " "                           | 설명 (빈값)                |
| INPUTMETHOD    | 4    | "0"                           | 입력 방법                  |
| DEVICE TYPE    | 5    | ""                            | 장치 유형 (빈값)           |
| COMPANY        | 6    | ""                            | 제조사 (빈값)              |
| PRODUCT NAME   | 7    | ""                            | 제품명 (빈값)              |
| TYPE NUM       | 8    | ""                            | 유형 번호 (빈값)           |
| DAMPER TYPE    | 9    | "0"                           | 댐퍼 유형                  |
| DASHPOT TYPE   | 10   | "2"                           | 대시팟 유형                |
| INPUT TYPE     | 11   | "0"                           | 입력 유형                  |
| INPUT TYPE_EXFN| 12   | "1"                           | 확장 함수 입력 유형        |

```vba
' VBA 코드 (221-229)
strBuf(i) = dicDamper(strSprName): i = i + 1      ' KEY
strBuf(i) = ChgCamma(strSprName): i = i + 1       ' NAME
strBuf(i) = " , 0, , , , , 0, 2, 0, 1"            ' DESC ~ INPUT TYPE_EXFN
```

### 4.6 Lines 2-7 DOF 필드 설명 (VBA 232-236)

| 필드    | 위치 | 값       | 설명                          |
| ------- | ---- | -------- | ----------------------------- |
| DOF     | 1    | YES/NO   | 해당 DOF 활성 여부            |
| CE      | 2    | 0        | 감쇠 계수                     |
| P1      | 3    | 0        | 매개변수 1                    |
| C1      | 4    | 0        | 매개변수 C1                   |
| Alpha1  | 5    | 0        | 알파 계수 1                   |
| K0      | 6    | 0        | 초기 강성                     |
| PY      | 7    | 1        | 항복 하중                     |
| VY      | 8    | 1        | 항복 속도                     |
| ALPHA   | 9    | 0.1      | 알파 계수                     |
| C       | 10   | 1        | 감쇠 계수 C                   |
| CE      | 11   | NO       | 유효 감쇠 사용 여부           |
| (값)    | 12   | 100      | 추가 매개변수                 |

```vba
' VBA 코드 (232-236)
s = "YES"                                          ' 첫 DOF만 YES
For k = 1 To 6
  vWriteData(nRowCnt, 0) = s & " , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100"
  nRowCnt = nRowCnt + 1
  s = "NO"                                         ' 나머지 DOF는 NO
Next k
```

> **참고**: 첫 번째 DOF(Dx)만 "YES"로 활성화되고, 나머지 5개 DOF(Dy~Rz)는 "NO"로 비활성화됩니다.

### 4.7 전체 VBA 코드 (207-239)

```vba
' BMR(CD)ダンパー用表 (VBA 207-239)
If dicDamper.Count > 0 Then
  ReDim vWriteData(dicDamper.Count * 7 + 3, 0)

  nRowCnt = 0
  ' 헤더 주석 (VBA 212-214)
  vWriteData(nRowCnt, 0) = "*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; KEY, NAME, DESC, INPUTMETHOD, DEVICE TYPE, ...": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [Dx] : DOF, CE, P1, C1, Alpha1, K0, PY, VY, ALPHA, C, CE - [Rz] : ...": nRowCnt = nRowCnt + 1

  ' 각 댐퍼에 대해 7줄 출력 (VBA 216-237)
  For j = 0 To dicDamper.Count - 1
    ReDim strBuf(7)

    strSprName = dicDamper.Keys(j)

    ' Line 1: 헤더 (VBA 221-229)
    i = 0
    strBuf(i) = dicDamper(strSprName): i = i + 1   ' KEY
    strBuf(i) = ChgCamma(strSprName): i = i + 1    ' NAME
    strBuf(i) = " , 0, , , , , 0, 2, 0, 1"         ' 나머지 필드

    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
    nRowCnt = nRowCnt + 1

    ' Lines 2-7: 6 DOF (VBA 232-236)
    s = "YES"
    For k = 1 To 6
       vWriteData(nRowCnt, 0) = s & " , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100"
       nRowCnt = nRowCnt + 1
       s = "NO"
    Next k
  Next j

  ' MCT 시트에 출력 (VBA 239)
  m_Sheet_MCT.Range(...).Value = vWriteData
End If
```

### 4.8 NL-PROP ↔ VISCOUS-OIL-DAMPER 연결 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Class130_SPGAllSym.ChangeSPGAllSym()             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  For each sprName:                                                      │
│    ┌─────────────────────────────────────────┐                          │
│    │ dicSPG6Comp(sprName)(0) == "VISCOUS..." │                          │
│    └────────────────────┬────────────────────┘                          │
│                         │ YES                                           │
│                         ▼                                               │
│    ┌─────────────────────────────────────────┐                          │
│    │ strType = "AI"                          │                          │
│    │ nDamper = dicDamper.Count + 1           │                          │
│    │ dicDamper.Add sprName, nDamper          │                          │
│    └────────────────────┬────────────────────┘                          │
│                         │                                               │
│                         ▼                                               │
│    ┌─────────────────────────────────────────────────────────┐          │
│    │ *NL-PROP Line 1:                                        │          │
│    │ "SPR-DAMPER,ELEMENT,AI,...,1,"                          │          │
│    │                            ↑                            │          │
│    │                        nDamper                          │          │
│    └─────────────────────────────────────────────────────────┘          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  If dicDamper.Count > 0:                                                │
│    ┌─────────────────────────────────────────────────────────┐          │
│    │ *VISCOUS-OIL-DAMPER:                                    │          │
│    │ "1,SPR-DAMPER, , 0, , , , , 0, 2, 0, 1"                  │          │
│    │  ↑                                                      │          │
│    │  KEY (= nDamper)                                        │          │
│    │ "YES , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100"             │          │
│    │ "NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100" × 5          │          │
│    └─────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.9 예제

**입력**: `ばね特性表_6成分概要` 시트에서 "BMR(CD)ダンパー" 유형의 스프링

| 속성명       | xl 유형         | yl 유형 | ... |
| ------------ | --------------- | ------- | --- |
| DAMPER-01    | BMR(CD)ダンパー | 自由    | ... |
| DAMPER-02    | BMR(CD)ダンパー | 自由    | ... |

**출력**:

```
*NL-PROP    ; General Link Property
; ...
DAMPER-01,ELEMENT,AI,0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,1,
YES,0.00001,0,NO
...

DAMPER-02,ELEMENT,AI,0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,2,
YES,0.00001,0,NO
...

*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper
; KEY, NAME, DESC, INPUTMETHOD, DEVICE TYPE, COMPANY, PRODUCT NAME, TYPE NUM, DAMPER TYPE, DASHPOT TYPE, INPUT TYPE, INPUT TYPE_EXFN
; [Dx] : DOF, CE, P1, C1, Alpha1, K0, PY, VY, ALPHA, C, CE - [Rz] : ...
1,DAMPER-01, , 0, , , , , 0, 2, 0, 1
YES , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
2,DAMPER-02, , 0, , , , , 0, 2, 0, 1
YES , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
NO , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100
```

---

## 5. 데이터 흐름

```
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│   ばね要素      │────▶│ Class110_ElemSpring   │────▶│   *NL-LINK    │
│   (시트)        │     │ ChangeElemSpring()    │     │   (MCT)       │
└─────────────────┘     └───────────────────────┘     └───────────────┘
         │                         │                          │
         │                         ▼                          │
         │              dicComponent (좌표계 충돌 검사)        │
         │              m_dicSpgRef (참조요소 추적)            │
         │                         │                          │
         │                         ▼                          │
         │ GPROP ──────────────────┼──────────────────▶ NAME  │
         │                         │                          │
         ▼                         ▼                          ▼
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│ばね特性表_6成分 │────▶│ Class120_SPG6Comp     │────▶│ dicSPG6Comp   │
│  概要 (시트)    │     │ GetHingeSPG6Comp()    │     │ (이력 유형)   │
└─────────────────┘     └───────────────────────┘     └───────────────┘
                                   │
                                   ▼
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│ばね特性表_成分  │────▶│ Class130_SPGAllSym    │────▶│   *NL-PROP    │
│ 一覧(対称)      │     │ ChangeSPGAllSym()     │     │   (MCT)       │
│   (시트)        │     │                       │     │               │
│ [4개 테이블]    │     │ m_SprComp (성분 데이터)│     │ [8줄/속성]    │
└─────────────────┘     └───────────────────────┘     └───────────────┘
                                   │
                                   ▼
                        ┌───────────────────────┐     ┌────────────────────┐
                        │ dicDamper.Count > 0   │────▶│*VISCOUS-OIL-DAMPER │
                        └───────────────────────┘     └────────────────────┘
```

---

## 6. 좌표 변환

### 6.1 ES → MCT 좌표계 변환

```
ES 좌표계:  (X, Y, Z)
MCT 좌표계: (X, -Z, Y)

ES DOF:  Dx, Dy, Dz, Rx, Ry, Rz
MCT DOF: Dx, Dz, Dy, Rx, Rz, Ry  (Y↔Z 스왑)
```

### 6.2 vSPG 배열의 의미

```
vSPG = Array(1, 3, -2, 4, 6, -5)

MCT 출력 순서:  Dx → Dy → Dz → Rx → Ry → Rz
ES 성분 인덱스:  1  →  3  → -2  →  4  →  6  → -5

즉:
MCT Dx ← ES Dx (1)
MCT Dy ← ES Dz (3)
MCT Dz ← ES Dy (-2, 부호 반전)
MCT Rx ← ES Rx (4)
MCT Ry ← ES Rz (6)
MCT Rz ← ES Ry (-5, 부호 반전)
```

---

## 7. VBA와 TypeScript 비교

### 7.1 ElemSpringConverter

| 항목              | VBA                   | TypeScript              | 일치 |
| ----------------- | --------------------- | ----------------------- | ---- |
| 시트 설정         | row=4, col=2-9        | row=4, col=2-9          | ✓    |
| dicChangeVecter   | 36개 매핑             | VECTOR_TRANSFORMATIONS  | ✓    |
| CalcAngle         | 참조요소/벡터 분기    | calcAngleString()       | ✓    |
| dicComponent      | 좌표계 충돌 감지      | dicComponent Map        | ✓    |
| ChgCamma          | 콤마→대시             | chgComma()              | ✓    |

### 7.2 SPGAllSymConverter

| 항목              | VBA                   | TypeScript              | 일치 |
| ----------------- | --------------------- | ----------------------- | ---- |
| 4개 테이블        | 열 범위 정의          | TABLE_OFFSETS           | ✓    |
| vSPG 배열         | [1,3,-2,4,6,-5]       | V_SPG                   | ✓    |
| vSort 배열        | 2개 정렬 순서         | V_SORT                  | ✓    |
| dicNAGOYA         | 베어링 비율           | NAGOYA_BEARING_RATIOS   | ✓    |
| bAllFree 처리     | YES,0.00001,0,NO      | 구현됨                  | ✓    |
| 31개 0값          | Line 8                | 구현됨                  | ✓    |

### 7.3 VISCOUS-OIL-DAMPER

| 항목              | VBA                   | TypeScript              | 일치 |
| ----------------- | --------------------- | ----------------------- | ---- |
| 생성 조건         | dicDamper.Count > 0   | dicDamper.size > 0      | ✓    |
| 7줄 구조          | 헤더 + 6 DOF          | 헤더 + 6 DOF            | ✓    |
| KEY 필드          | dicDamper(name)       | dicDamper.get(name)     | ✓    |
| DOF 패턴          | YES + NO×5            | YES + NO×5              | ✓    |
| 고정값            | 0,0,0,0,0,1,1,0.1...  | 동일                    | ✓    |
| NL-PROP 연결      | nDamper 필드          | 구현됨                  | ✓    |

---

## 8. 결론

**✓ \*NL-LINK, \*NL-PROP, \*VISCOUS-OIL-DAMPER 변환은 VBA와 완전히 일치합니다.**

### 핵심 포인트:

1. **NL-LINK**: `ばね要素` 시트에서 요소-노드-속성 연결 정의
2. **NL-PROP**: `ばね特性表_成分一覧(対称)` 시트에서 4개 테이블로 속성 정의
3. **VISCOUS-OIL-DAMPER**: BMR(CD)ダンパー 유형의 제진장치 정의
4. **연결 관계**:
   - NL-LINK의 GPROP → NL-PROP의 NAME
   - NL-PROP의 마지막 필드 (nDamper) → VISCOUS-OIL-DAMPER의 KEY
5. **좌표 변환**: vSPG 배열로 ES(X,Y,Z) → MCT(X,Z,Y) 매핑
6. **좌표계 처리**: dicChangeVecter로 36개 벡터 변환 지원
7. **참조요소**: m_dicSpgRef와 vSort로 정렬 순서 결정
8. **오일 댐퍼 조건**: dicSPG6Comp에서 "BMR(CD)ダンパー" → "VISCOUS-OIL-DAMPER" 매핑 시 생성

---

## 데이터 입력 예제

### Excel 시트 (`ばね要素`)

|     | B(요소명) | C(노드1) | D(노드2) | E(속성명) | F(좌표계)                              |
| --- | --------- | -------- | -------- | --------- | -------------------------------------- |
| 3   | 要素名    | 節点1    | 節点2    | 特性表示名| 座標系                                 |
| 4   | SPR1      | N1       | N2       | TYPE-A    | ベクトル:v1="GlobalX",v2="GlobalY"...  |
| 5   | SPR2      | N3       | N4       | TYPE-B    | 参照要素:ELEM1                         |

### Excel 시트 (`ばね特性表_成分一覧(対称)`)

**線形 테이블 (B~M열)**:
|     | B(속성명) | C(성분) | D(강성) | ... |
| --- | --------- | ------- | ------- | --- |
| 4   | 特性表示名| 成分    | K       | ... |
| 5   | TYPE-A    | xl      | 1000    | ... |
| 6   | TYPE-A    | yl      | 2000    | ... |

### MCT 출력 결과

```
*NL-LINK  ; General Link
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP
; ...
   1,1,2,TYPE-A,NL_TYPE-A,1,2,1,0,0,0,-1,0,
   2,3,4,TYPE-B,,0,90,

*NL-PROP    ; General Link Property
; NAME, APPTYPE, TYPE, ...
TYPE-A,ELEMENT,SPG,0, 0.5, NO,0, 0.5, NO,0.5, 0.5, 0,0,
YES,1000,0,NO
YES,2000,0,NO
YES,3000,0,NO
YES,100,0,NO
YES,200,0,NO
YES,300,0,NO
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
```

---

## 관련 섹션

| MCT 섹션              | 생성 조건               | 소스 시트                       |
| --------------------- | ----------------------- | ------------------------------- |
| `*NL-LINK`            | ばね要素 시트 데이터    | `ばね要素`                      |
| `*NL-PROP`            | ばね特性表 시트 데이터  | `ばね特性表_成分一覧(対称)`     |
| `*VISCOUS-OIL-DAMPER` | BMR(CD)ダンパー 유형    | `ばね特性表_6成分概要`          |
