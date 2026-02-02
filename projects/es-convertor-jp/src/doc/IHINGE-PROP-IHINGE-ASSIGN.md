# \*IHINGE-PROP & \*IHINGE-ASSIGN MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀에서 MIDAS Civil NX의 비탄성 힌지 섹션으로 변환합니다.

> **중요**: `*IHINGE-PROP`는 **2개의 다른 소스**에서 생성됩니다!

| MCT 섹션         | 소스 시트                     | VBA 클래스          | 출력 열               |
| ---------------- | ----------------------------- | ------------------- | --------------------- |
| `*IHINGE-PROP`   | `M-φ要素詳細` (zp/yp)         | Class090_Hinge_Prop | m_HINGEPROP_COL (41)  |
| `*IHINGE-PROP`   | `ばね特性表_成分一覧(非対称)` | Class140_SPGAllASym | m_SPGALLASYM_COL (66) |
| `*IHINGE-ASSIGN` | `M-φ特性表`                   | Class100_Hinge_Ass  | m_HINGEASS_COL (46)   |
| (보조)           | `M-φ特性表`                   | Class100_Hinge_Ass  | dicHYST_yp/zp 생성    |

---

## 1. IHINGE-PROP (소스 1: M-φ 要素詳細)

### 1.1 소스 시트 설정 (Class090_Hinge_Prop)

| 항목    | VBA              | 값            |
| ------- | ---------------- | ------------- |
| 시트명  | `m_Sheet_HngPrp` | `M-φ要素詳細` |
| 시작 행 | `nReadSTRow`     | 4             |

**두 개의 테이블 영역**:

| 테이블 | 시작 열        | 종료 열        | 설명        |
| ------ | -------------- | -------------- | ----------- |
| zp     | nRead1STCol=2  | nRead1EDCol=25 | 면외 (zp축) |
| yp     | nRead2STCol=27 | nRead2EDCol=50 | 면내 (yp축) |

### 1.2 열 구조

**zp 테이블 (B~Z열, strData_zp)**:

| 인덱스 | VBA                 | 설명                      |
| ------ | ------------------- | ------------------------- |
| 0      | strData_zp(0, j)    | 요소명 (要素名)           |
| 1      | strData_zp(1, j)    | 힌지명 (ヒンジ名)         |
| 2      | strData_zp(2, j)    | 속성명 (特性名)           |
| 3-6    | strData_zp(3-6, j)  | 곡률 양측 (曲率+側) P1-P4 |
| 8-11   | strData_zp(8-11, j) | 모멘트 양측 (M+側) M1-M4  |
| 13-16  | strData_zp(13-16,j) | 곡률 음측 (曲率-側) P1-P4 |
| 18-21  | strData_zp(18-21,j) | 모멘트 음측 (M-側) M1-M4  |

**yp 테이블 (AA~AX열, strData_yp)**: 동일 구조

### 1.3 MCT 출력 형식 (VBA 180-193)

```
*IHINGE-PROP    ; Inelastic Hinge Property
; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1
; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS    ; line 2
; bFy, HLOC[NSECT], HYST, [M_PROP]    ; line 3
; bFz, HLOC[NSECT], HYST, [M_PROP]    ; line 4
; bMx, HLOC[NSECT], HYST, [M_PROP]    ; line 5
; bMy, HLOC[NSECT], HYST, [M_PROP]    ; line 6
; bMz, HLOC[NSECT], HYST, [M_PROP]    ; line 7
; bPMAUTO, PC0, [PMDATA], [PMDATA]    ; line 8
; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]    ; line 9
; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP    ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE
; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO    ; CLO
; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR    ; TAK, TAK, TTE, MTT
; [DATA] : YS-P1, YS-P2, YS-P3, YS-P4, YD-D1, YD-D2, YD-D3, YD-D4, HSL1, ... HSL5    ; iITYPE=1
```

### 1.4 18줄 구조 (속성당) - VBA 237-420

```
Line 1:  MLHP={속성명},{재료유형},DIST,NONE, I, SKEL,,    ; 헤더
Line 2:  NO,NO,NO,NO,NO,NO,NO                              ; bExistIJ 플래그
Line 3:  NO                                                ; bFy (I단)
Line 4:  NO                                                ; bFz (I단)
Line 5:  NO                                                ; bMx (I단)
Line 6:  NO                                                ; bMy (I단)
Line 7:  YES,1,{HYST},{SYM},0,1,5,1,1,{zp데이터}           ; bMz (I단, zp축)
Line 8:  YES,1,{HYST},{SYM},0,1,5,1,1,{yp데이터}           ; bMz (I단, yp축)
Line 9:  (공백)                                            ; PM 데이터 구분
Line 10: NO                                                ; bFy (J단, 복사)
Line 11: NO                                                ; bFz (J단, 복사)
Line 12: NO                                                ; bMx (J단, 복사)
Line 13: NO                                                ; bMy (J단, 복사)
Line 14: YES,1,{HYST},{SYM},0,1,5,1,1,{zp데이터}           ; bMz (J단, 복사)
Line 15: YES,1,{HYST},{SYM},0,1,5,1,1,{yp데이터}           ; bMz (J단, 복사)
Line 16: 0, 0, 0, 0, 0, 0                                  ; YS AUTO
Line 17: (공백)                                            ; 종료
```

> **참고**: J단(Lines 10-15)은 I단(Lines 3-8)의 복사입니다 (VBA 408-411)

### 1.5 dicHYST 이력 유형 딕셔너리 (VBA 124-143)

```vba
dicHYST.Add "線形", "EBI"
dicHYST.Add "バイリニア(対称)原点指向", "NBI"
dicHYST.Add "バイリニア(対称)Takeda", "TAK"
dicHYST.Add "バイリニア(非対称)Takeda", "TAK"
dicHYST.Add "トリリニア(対称)Takeda", "TAK"
dicHYST.Add "トリリニア(対称)ノーマル", "KIN"
dicHYST.Add "トリリニア(対称)原点指向", "ORG"
dicHYST.Add "トリリニア(対称)原点最大指向", "PKO"
dicHYST.Add "トリリニア(対称)劣化", "ETR"
dicHYST.Add "トリリニア(非対称)Takeda", "TAK"
dicHYST.Add "トリリニア(非対称)原点指向", "ORG"
dicHYST.Add "トリリニア(非対称)原点最大指向", "PKO"
dicHYST.Add "トリリニア(非対称)劣化", "ETR"
dicHYST.Add "テトラリニア(対称)Takeda", "TTE"
dicHYST.Add "テトラリニア(対称)H11鋼材(耐震)", "TTE"
dicHYST.Add "テトラリニア(非対称)Takeda", "TTE"
dicHYST.Add "テトラリニア(非対称)H11鋼材(耐震)", "TTE"
dicHYST.Add "RC柱ビバイリニア(双方)Takeda", "TAK"
```

### 1.6 dicSYM 대칭 플래그 딕셔너리 (VBA 145-164)

```vba
' 対称 = 0, 非対称 = 1
dicSYM.Add "線形", 0
dicSYM.Add "バイリニア(対称)原点指向", 0
dicSYM.Add "バイリニア(対称)Takeda", 0
dicSYM.Add "バイリニア(非対称)Takeda", 1
dicSYM.Add "トリリニア(対称)Takeda", 0
dicSYM.Add "トリリニア(対称)ノーマル", 0
dicSYM.Add "トリリニア(対称)原点指向", 0
dicSYM.Add "トリリニア(対称)原点最大指向", 0
dicSYM.Add "トリリニア(対称)劣化", 0
dicSYM.Add "トリリニア(非対称)Takeda", 1
dicSYM.Add "トリリニア(非対称)原点指向", 1
dicSYM.Add "トリリニア(非対称)原点最大指向", 1
dicSYM.Add "トリリニア(非対称)劣化", 1
dicSYM.Add "テトラリニア(対称)Takeda", 0
dicSYM.Add "テトラリニア(対称)H11鋼材(耐震)", 0
dicSYM.Add "テトラリニア(非対称)Takeda", 1
dicSYM.Add "テトラリニア(非対称)H11鋼材(耐震)", 1
dicSYM.Add "RC柱ビバイリニア(双方)Takeda", 0
```

### 1.7 GetLineType 함수 (VBA 502-514)

선형/비선형 유형에 따른 데이터 전처리:

```vba
Private Function GetLineType(ByRef strHingeType As String, ByRef strCateDetail As String) As Long
  Dim nLineType As Long
  nLineType = 0

  If strHingeType = "EBI" Then
    nLineType = 1    ' 선형: 10배 곱셈
  ElseIf strHingeType = "TAK" Then
    If strCateDetail <> "トリリニア(対称)Takeda" And strCateDetail <> "トリリニア(非対称)Takeda" Then
      nLineType = 2  ' TAK (트리리니어 제외): 값 시프트
    End If
  End If

  GetLineType = nLineType
End Function
```

**nLineType에 따른 처리**:

| nLineType | 처리                                                       |
| --------- | ---------------------------------------------------------- |
| 0         | 없음 (기본)                                                |
| 1 (EBI)   | `strData(9) = strData(8) * 10` 등 10배 곱셈                |
| 2 (TAK)   | `strData(10) = strData(9); strData(9) = strData(8)` 시프트 |

### 1.8 CheckeHingeType 함수 (VBA 487-500)

추가 계수 필요 여부:

```vba
Private Function CheckeHingeType(ByVal strHingeType As String) As String
  Select Case strHingeType
    Case "TAK", "TAK", "TTE", "MTT"
      CheckeHingeType = "0.5,1"    ' EXPO, FACTOR
    Case Else
      CheckeHingeType = ""
  End Select
End Function
```

### 1.9 MZ 데이터 줄 구조 (VBA 276-329)

```
YES,1,{HYST},{SYM},0,1,5,1,1,{M1},{M2},{M3},{M4},{P1},{P2},{P3},{P4},0.5,1,2,4,8,{M1n},{M2n},{M3n},{M4n},{P1n},{P2n},{P3n},{P4n},0.5,1,2,4,8[,0.5,1]
```

| 위치  | 값             | 설명                               |
| ----- | -------------- | ---------------------------------- |
| 1     | YES,1          | 활성, HLOC                         |
| 2     | {HYST}         | 이력 유형 (TAK, KIN, ORG 등)       |
| 3     | {SYM}          | 대칭 플래그 (0 또는 1)             |
| 4     | 0,1,5,1,1      | iIM, DEFORM, SFTYPE, STIFF, iITYPE |
| 5-8   | strData(8-11)  | 모멘트 양측 (本体) M1-M4           |
| 9-12  | strData(3-6)   | 곡률 양측 (本体) P1-P4             |
| 13    | 0.5,1,2,4,8    | HSL1-HSL5                          |
| 14-17 | strData(18-21) | 모멘트 음측 (負側) M1-M4           |
| 18-21 | strData(13-16) | 곡률 음측 (負側) P1-P4             |
| 22    | 0.5,1,2,4,8    | HSL1-HSL5                          |
| 23-24 | 0.5,1          | EXPO, FACTOR (TAK/TTE/MTT만)       |

---

## 2. IHINGE-PROP (소스 2: ばね特性表\_成分一覧(非対称))

### 2.1 소스 시트 설정 (Class140_SPGAllASym)

| 항목    | VBA                  | 값                            |
| ------- | -------------------- | ----------------------------- |
| 시트명  | `m_Sheet_SPGAllASym` | `ばね特性表_成分一覧(非対称)` |
| 시작 행 | `nReadSTRow`         | 5                             |

**세 개의 테이블 영역**:

| 테이블명     | 시작 열        | 종료 열         | 열 수 |
| ------------ | -------------- | --------------- | ----- |
| バイリニア   | nRead1STCol=2  | nRead1EDCol=26  | 25    |
| トリリニア   | nRead2STCol=28 | nRead2EDCol=56  | 29    |
| テトラリニア | nRead3STCol=58 | nRead3EDCol=102 | 45    |

### 2.2 MCT 출력 형식 (VBA 68-81)

```
*IHINGE-PROP    ; Inelastic Hinge Property
; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1
; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS    ; line 2
; bFx, HLOC[NSECT], HYST, [M_PROP]    ; line 3
; bFy, HLOC[NSECT], HYST, [M_PROP]    ; line 4
; bFz, HLOC[NSECT], HYST, [M_PROP]    ; line 5
; bMx, HLOC[NSECT], HYST, [M_PROP]    ; line 6
; bMy, HLOC[NSECT], HYST, [M_PROP]    ; line 7
; bMz, HLOC[NSECT], HYST, [M_PROP]    ; line 8
; bPMAUTO, PC0, [PMDATA], [PMDATA]    ; line 9
; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]    ; line 10
; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP    ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE
; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR    ; TAK, TAK, TTE, MTT
```

### 2.3 17줄 구조 (속성당) - VBA 94-227

```
Line 1:  MLHP=NL_{sprName}, STEEL, SPR, AUTO, I, NONE, SKEL,,    ; 헤더
Line 2:  NO , NO, NO, NO, NO, NO, NO                              ; bExistIJ 플래그
Line 3:  {DOF1}                                                    ; bFx (I단)
Line 4:  {DOF2}                                                    ; bFy (I단)
Line 5:  {DOF3}                                                    ; bFz (I단)
Line 6:  {DOF4}                                                    ; bMx (I단)
Line 7:  {DOF5}                                                    ; bMy (I단)
Line 8:  {DOF6}                                                    ; bMz (I단)
Line 9:  (공백)                                                    ; 구분
Line 10: {DOF1 복사}                                               ; bFx (J단)
Line 11: {DOF2 복사}                                               ; bFy (J단)
Line 12: {DOF3 복사}                                               ; bFz (J단)
Line 13: {DOF4 복사}                                               ; bMx (J단)
Line 14: {DOF5 복사}                                               ; bMy (J단)
Line 15: {DOF6 복사}                                               ; bMz (J단)
Line 16: (공백)                                                    ; 구분
Line 17: 0, 0, 0, 0, 0, 0                                          ; YS AUTO
```

### 2.4 DOF 줄 유형

**유형 1: 線形 (NO)** (VBA 208-212)

```
NO
```

**유형 2: 高減衰積層ゴム系 (LITR)** (VBA 119-128)

```
YES,,LITR,{bearingType},{rubberHeight},{area},0.01, YES
```

| 필드         | VBA 소스                   |
| ------------ | -------------------------- |
| bearingType  | dicBearingType(strData(0)) |
| rubberHeight | strData(1)                 |
| area         | strData(2)                 |

**유형 3: 対称/非対称** (VBA 129-201)

```
YES,,{HYST},{SYM},0, 1,{SFType},{Stiff},{iTYPE},{F1~F4},{D1~D4},0.5,1,2,4,8,{F1n~F4n},{D1n~D4n},0.5,1,2,4,8{,HYST2}[,0.5, 1]
```

### 2.5 dicBearingType 딕셔너리 (VBA 46-59)

```vba
dicBearingType.Add "H15.10 HDR-G12", 1
dicBearingType.Add "H15.10 HDR-G10", 2
dicBearingType.Add "H15.10 LRB-G12", 3
dicBearingType.Add "H15.10 LRB-G10", 4
dicBearingType.Add "H15.10 RB-G12", 5
dicBearingType.Add "H15.10 RB-G10", 6
dicBearingType.Add "H13.5 HDR-G12", 1
dicBearingType.Add "H13.5 HDR-G10", 2
dicBearingType.Add "H13.5 LRB-G12", 3
dicBearingType.Add "H13.5 LRB-G10", 4
dicBearingType.Add "H13.5 RB-G12", 5
dicBearingType.Add "H13.5 RB-G10", 6
```

### 2.6 P값 누적 계산 (VBA 152-160)

```vba
' 초기값
strTENS(nTens, 0).strP = strTENS(nTens, 0).strD * strTENS(nTens, 0).strK

' 누적 계산
For l = 1 To UBound(strTENS, 2)
  strTENS(nTens, l).strP = strTENS(nTens, l).strK * _
      (strTENS(nTens, l).strD - strTENS(nTens, l - 1).strD) + _
      strTENS(nTens, l - 1).strP
Next l
```

### 2.7 vSort 배열 (VBA 92-93)

참조요소 유무에 따른 DOF 순서:

```vba
vSort = Array( _
  Array(0, 1, 2, 3, 4, 5), _  ' 기본 순서 (nSort=0)
  Array(0, 2, 1, 3, 5, 4)  _  ' 참조요소 순서 (nSort=1)
)

' 참조요소 존재 여부 확인 (VBA 104)
If m_dicSpgRef.Exists(strSprName) Then nSort = 1
```

---

## 3. IHINGE-ASSIGN (M-φ 割り当て)

### 3.1 소스 시트 설정 (Class100_Hinge_Ass)

| 항목    | VBA              | 값          |
| ------- | ---------------- | ----------- |
| 시트명  | `m_Sheet_HngAss` | `M-φ特性表` |
| 시작 행 | `nReadSTRow`     | 4           |
| 시작 열 | `nReadSTCol`     | 2 (B)       |
| 종료 열 | `nReadEDCol`     | 15 (O)      |

### 3.2 열 구조 (VBA strData)

| 인덱스 | 열  | 설명                 |
| ------ | --- | -------------------- |
| 0      | B   | 속성명 (特性名)      |
| 1-3    | C-E | (추가 데이터)        |
| 4      | F   | zp 카테고리 (大分類) |
| 5      | G   | zp 상세 (詳細)       |
| 6      | H   | (추가 데이터)        |
| 7      | I   | yp 카테고리 (大分類) |
| 8      | J   | yp 상세 (詳細)       |
| 9-13   | K-O | (추가 데이터)        |

### 3.3 dicHYST_yp/zp 생성 (VBA 45-48)

```vba
For i = 0 To nCnt
  dicHYST_zp.Add strData(0, i), strData(4, i) & strData(5, i)  ' 카테고리 + 상세
  dicHYST_yp.Add strData(0, i), strData(7, i) & strData(8, i)
Next i
```

예시:

- strData(4, i) = "トリリニア(対称)"
- strData(5, i) = "Takeda"
- dicHYST_zp(속성명) = "トリリニア(対称)Takeda"

### 3.4 MCT 출력 형식 (VBA 56-63)

```
*IHINGE-ASSIGN  ; Inelastic Hinge Assignment
; ELEM_LIST, PROP, FIBER_DIV
1,HINGE-01,0
2,HINGE-02,0
```

**출력 1 (Class100_Hinge_Ass)**: (VBA 60-63)

```vba
vWriteData(nRowCnt, 0) = dicHingeProp(strData(0, i)) & "," & _
                         ChgCamma(HingeName(strData(0, i))) & ",0"
```

**출력 2 (Class090_Hinge_Prop)**: (VBA 422-423)

```vba
' CIVIL NX 2026(v1.1) 대응
vAssign = Array("", ",BEAM")

vWriteData_ASS(nAssCnt, 0) = m_ElemData(strData_zp(0, j)) & vAssign(m_Version) & "," & strPropName & ","
```

| 버전      | 출력 형식                 |
| --------- | ------------------------- |
| 2025 이전 | `요소번호,힌지이름,`      |
| 2026 이상 | `요소번호,BEAM,힌지이름,` |

---

## 4. HingeName 함수 (main.bas 881-908)

긴 힌지 이름을 20자 미만으로 truncate:

```vba
Public Function HingeName(ByRef strHinge As String) As String
  ' 20자 미만이고 중복 없으면 그대로 반환
  If Len(strHinge) < 20 And Not m_LongHingeNameBuf.Exists(strHinge) Then
    m_LongHingeNameBuf.Add strHinge, True
    HingeName = strHinge
    Exit Function
  End If

  ' 15자로 자르고 ~숫자 추가
  strBuf = Left(strHinge, 15) & "~"
  n = 1
  strRet = strBuf & n

  ' 중복 방지
  While m_LongHingeNameBuf.Exists(strRet)
    n = n + 1
    strRet = strBuf & n
  Wend

  m_LongHingeNameBuf.Add strRet, True
  HingeName = strRet
End Function
```

예시:

- "VeryLongHingeName123456" → "VeryLongHingeName~1"
- "VeryLongHingeName123457" → "VeryLongHingeName~2"

---

## 5. 두 IHINGE-PROP 소스의 차이점

| 항목          | M-φ 要素詳細 (Class090)           | ばね特性表\_非対称 (Class140) |
| ------------- | --------------------------------- | ----------------------------- |
| **소스 시트** | M-φ 要素詳細                      | ばね特性表\_成分一覧(非対称)  |
| **대상 요소** | 프레임 요소 (빔, 기둥)            | 스프링 요소 (NL-LINK)         |
| **이름 형식** | MLHP={propName}                   | MLHP=NL\_{sprName}            |
| **재료 유형** | m_MatNo2S_or_RC (CONC/STEEL)      | STEEL (고정)                  |
| **HTYPE**     | DIST                              | SPR                           |
| **MCODE**     | NONE                              | AUTO                          |
| **출력 열**   | m_HINGEPROP_COL (41)              | m_SPGALLASYM_COL (66)         |
| **6 DOF**     | Lines 3-7: NO, Line 7-8: MZ zp/yp | Lines 3-8: 각 DOF별 데이터    |
| **데이터**    | 모멘트-곡률 (M-φ)                 | 힘-변위 (F-D) + P값 누적 계산 |

---

## 6. 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              main.bas 호출 순서                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. clsHngPrp.ReadHinge_Prop(dicHingeProp)                                      │
│        ↓                                                                        │
│  2. clsHngAss.ChangeHinge_Ass(dicHingeProp, dicHYST_yp, dicHYST_zp, vWriteData) │
│        ↓ dicHYST_yp, dicHYST_zp 생성                                            │
│  3. clsHngPrp.ChangeHinge_Prop(dicHYST_yp, dicHYST_zp, dicHingeElem, vWriteData)│
│        ↓                                                                        │
│     *IHINGE-PROP (출력열 41) + *IHINGE-ASSIGN (출력열 46)                        │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  (별도) clsSPGAllASym.ChangeSPGAllASym(dicSPG6Comp)                              │
│        ↓                                                                        │
│     *IHINGE-PROP (출력열 66) ← NL_접두사로 스프링 속성용                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```
                    ┌───────────────┐
                    │  M-φ特性表    │
                    │   (시트)      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────────────┐
                    │ Class100_Hinge_Ass    │
                    │ ChangeHinge_Ass()     │
                    └───────┬───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 dicHYST_yp           dicHYST_zp           dicHingeProp
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│  M-φ要素詳細    │────▶│ Class090_Hinge_Prop   │────▶│ *IHINGE-PROP  │
│   (시트)        │     │ ChangeHinge_Prop()    │     │ (프레임용)    │
│ [zp/yp 테이블]  │     └───────────────────────┘     │ 출력열 41     │
└─────────────────┘               │                   └───────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │*IHINGE-ASSIGN │
                          │  출력열 46    │
                          └───────────────┘

┌────────────────────────┐     ┌───────────────────────┐     ┌───────────────┐
│ばね特性表_成分一覧     │────▶│ Class140_SPGAllASym   │────▶│ *IHINGE-PROP  │
│   (非対称)             │     │ ChangeSPGAllASym()    │     │ (스프링용)    │
│ [3개 테이블]           │     └───────────────────────┘     │ 출력열 66     │
└────────────────────────┘                                   └───────────────┘
```

---

## 7. 예제

### 7.1 M-φ 要素詳細 → IHINGE-PROP + IHINGE-ASSIGN

**입력 (M-φ 特性表)**:

| 속성명   | ... | zp대분류         | zp상세 | ... | yp대분류         | yp상세 |
| -------- | --- | ---------------- | ------ | --- | ---------------- | ------ |
| HINGE-01 | ... | トリリニア(対称) | Takeda | ... | トリリニア(対称) | Takeda |

**입력 (M-φ 要素詳細 - zp)**:

| 요소명 | 힌지명   | P1  | P2  | P3  | P4  | ... | M1  | M2  | M3  | M4  |
| ------ | -------- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ELEM-1 | HINGE-01 | 0.1 | 0.2 | 0.3 | 0.4 | ... | 100 | 200 | 300 | 400 |

**출력 (IHINGE-PROP)**:

```
*IHINGE-PROP    ; Inelastic Hinge Property
; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1
...
MLHP=HINGE-01,CONC,DIST,NONE, I, SKEL,,
NO,NO,NO,NO,NO,NO,NO
NO
NO
NO
NO
YES,1,TAK,0,0,1,5,1,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,0.5,1
YES,1,TAK,0,0,1,5,1,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,0.5,1

NO
NO
NO
NO
YES,1,TAK,0,0,1,5,1,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,0.5,1
YES,1,TAK,0,0,1,5,1,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,0.5,1
0, 0, 0, 0, 0, 0

```

**출력 (IHINGE-ASSIGN)**:

```
*IHINGE-ASSIGN  ; Inelastic Hinge Assignment
; ELEM_LIST, PROP, FIBER_DIV
1,HINGE-01,
```

### 7.2 ばね特性表\_非対称 → IHINGE-PROP

**입력**: dicSPG6Comp에 "SPR-ASYM" 등록됨

**출력**:

```
*IHINGE-PROP    ; Inelastic Hinge Property
...
MLHP=NL_SPR-ASYM, STEEL, SPR, AUTO, I, NONE, SKEL,,
NO , NO, NO, NO, NO, NO, NO
YES,,TAK,1,0, 1,5,1000,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8
NO
NO
NO
NO
NO

YES,,TAK,1,0, 1,5,1000,1,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8,100,200,300,400,0.1,0.2,0.3,0.4,0.5,1,2,4,8
NO
NO
NO
NO
NO

0, 0, 0, 0, 0, 0
```

---

## 8. VBA와 TypeScript 비교

### 8.1 HingePropConverter

| 항목            | VBA                  | TypeScript              | 일치 |
| --------------- | -------------------- | ----------------------- | ---- |
| 시트 설정       | row=4, zp/yp 영역    | row=4, zp/yp 영역       | ✓    |
| dicHYST         | 18개 매핑            | HINGE_HYST_MAP          | ✓    |
| dicSYM          | 18개 매핑            | HINGE_SYM_MAP           | ✓    |
| GetLineType     | EBI=1, TAK=2         | getLineType()           | ✓    |
| CheckeHingeType | TAK/TTE/MTT=0.5,1    | checkHingeTypeFactor()  | ✓    |
| HingeName       | 20자 truncate        | truncateHingeName()     | ✓    |
| 18줄 구조       | I/J 복사             | copyStartIndex          | ✓    |
| 버전 분기       | vAssign=["",",BEAM"] | context.version >= 2026 | ✓    |

### 8.2 HingeAssConverter

| 항목            | VBA                   | TypeScript      | 일치 |
| --------------- | --------------------- | --------------- | ---- |
| 시트 설정       | row=4, col=2-15       | row=4, col=2-15 | ✓    |
| dicHYST_zp 생성 | strData(4)+strData(5) | hystZp.set()    | ✓    |
| dicHYST_yp 생성 | strData(7)+strData(8) | hystYp.set()    | ✓    |

---

## 9. 결론

**✓ \*IHINGE-PROP 및 \*IHINGE-ASSIGN 변환은 VBA와 완전히 일치합니다.**

### 핵심 포인트:

1. **IHINGE-PROP 2개 소스**:

   - `M-φ要素詳細` → 프레임 요소용 (MLHP={name})
   - `ばね特性表_成分一覧(非対称)` → 스프링 요소용 (MLHP=NL\_{name})

2. **IHINGE-ASSIGN**: `M-φ特性表`에서 요소-힌지 연결 정의

3. **이력 유형**: dicHYST로 일본어 유형명 → MCT 코드 변환 (TAK, KIN, ORG 등)

4. **대칭 플래그**: dicSYM으로 対称=0, 非対称=1 매핑

5. **버전 분기**: CIVIL NX 2026부터 IHINGE-ASSIGN에 ",BEAM" 추가

6. **이름 truncate**: 20자 초과 시 15자 + "~숫자" 형식으로 변환

7. **P값 누적 계산**: 비대칭 스프링에서 `strP = strK * (strD - strD_prev) + strP_prev`

---

## 관련 섹션

| MCT 섹션         | 생성 조건                      | 소스 시트                     |
| ---------------- | ------------------------------ | ----------------------------- |
| `*IHINGE-PROP`   | M-φ 要素詳細 데이터            | `M-φ要素詳細`                 |
| `*IHINGE-PROP`   | ばね特性表\_非対称 데이터      | `ばね特性表_成分一覧(非対称)` |
| `*IHINGE-ASSIGN` | M-φ 特性表 데이터              | `M-φ特性表`                   |
| `*NL-LINK`       | IEPROP 필드에 NL\_ 접두사 참조 | `ばね要素`                    |
