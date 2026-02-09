VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class140_SPGAllASym"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 5

Private Const nRead1STCol = 2
Private Const nRead1EDCol = 26

Private Const nRead2STCol = 28
Private Const nRead2EDCol = 56

Private Const nRead3STCol = 58
Private Const nRead3EDCol = 102

Private mWS As Worksheet

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nRead1STCol, nRead1EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead2STCol, nRead2EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead3STCol, nRead3EDCol, 2)
  With m_ThisWorkbook.Sheets(strName)
    .Cells(nReadSTRow - 3, nRead1STCol) = "■バイリニア"
    .Cells(nReadSTRow - 3, nRead2STCol) = "■トリリニア"
    .Cells(nReadSTRow - 3, nRead3STCol) = "■テトラリニア"
  End With
End Sub

Public Sub ChangeSPGAllASym(ByRef dicSPG6Comp As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long, j As Long, k As Long, l As Long, n As Long, m As Long
  
  Dim dicBearingType As Dictionary
  Set dicBearingType = New Dictionary
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
  
  Dim nLineType As Long
  Dim nCnt As Long
  Dim vWriteData() As String
  ReDim vWriteData((dicSPG6Comp.Count + 1) * 17 + 13, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0

  ' コメント
  vWriteData(nRowCnt, 0) = "*IHINGE-PROP    ; Inelastic Hinge Property": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS              ; line 2": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bFx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 3": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bFy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 4": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bFz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 5": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 6": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 7": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 8": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bPMAUTO, PC0, [PMDATA], [PMDATA]                                                                       ; line 9": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]           ; line 10": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP                          ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR            ; TAK, TAK, TTE, MTT": nRowCnt = nRowCnt + 1

  Dim strBuf() As String, s As String
  Dim vBuf As Variant
  Dim nMTK As Long
  
  Dim strSprName As String
  Dim nRepeat As Long, nAbs As Long, nTens As Long
  
  Dim nSort As Long
  Dim vSort As Variant
  vSort = Array(Array(0, 1, 2, 3, 4, 5), _
                Array(0, 2, 1, 3, 5, 4))
  For j = 0 To dicSPG6Comp.Count - 1
    
    strSprName = dicSPG6Comp.Keys(j)
    n = m_dicSprProp(strSprName)
    
    vWriteData(nRowCnt, 0) = "MLHP=NL_" & strSprName & ", STEEL, SPR, AUTO, I, NONE, SKEL,,": nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "NO , NO, NO, NO, NO, NO, NO": nRowCnt = nRowCnt + 1
    
    nSort = 0
'    If Not m_dicSpgRef.Exists(strSprName) Then nSort = 1
    If m_dicSpgRef.Exists(strSprName) Then nSort = 1
    
    nRepeat = nRowCnt
    For k = 1 To 6
      
'      m = m_SprComp(n).vAngle(vSort(nSort)(k - 1))
'      nAbs = Abs(m)
'      nAbs = vSort(nSort)(k - 1)
      nAbs = vSort(nSort)(k)
      
      s = m_SprComp(n).SprCompData(nAbs).strProp
      If Len(s) > 0 Then
        
        If Not (m_SprComp(n).SprCompData(nAbs).nComponent = 0 And m_SprComp(n).SprCompData(nAbs).nType = 0) Then
          ' 線形以外
          If m_SprComp(n).SprCompData(nAbs).nComponent = 2 And m_SprComp(n).SprCompData(nAbs).nType = 0 Then
            ' その他
            ' 名古屋高速ゴム支承
            ReDim strBuf(5)
            i = 0
            strBuf(i) = "YES,,LITR": i = i + 1
            strBuf(i) = dicBearingType(m_SprComp(n).SprCompData(nAbs).strData(0)): i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).strData(1): i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).strData(2): i = i + 1
            strBuf(i) = "0.01, YES"
          Else    'If m_SprComp(n).SprCompData(nAbs).nComponent = 0 Then
            ' 対称・非対称
            ReDim strBuf(28)
            ' [M-PROP]
            
'            If m_SprComp(n).SprCompData(nAbs).mct_HYST = "TAK" Then
'              For nMTK = 1 To 0 Step -1
'                m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK + 1).strK = m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK).strK
'                m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK + 1).strF = m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK).strF
'                m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK + 1).strD = m_SprComp(n).SprCompData(nAbs).strTENS(nMTK, nMTK).strD
'              Next nMTK
'            End If
            
            i = 0
            strBuf(i) = "YES,": i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).mct_HYST: i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).mct_iSYM: i = i + 1
            strBuf(i) = "0, 1": i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).mct_SFType: i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).mct_dStiff: i = i + 1
            strBuf(i) = m_SprComp(n).SprCompData(nAbs).mct_iTYPE: i = i + 1
            ' [DATA]-TENS
            
            For nTens = 0 To 1
              m_SprComp(n).SprCompData(nAbs).strTENS(nTens, 0).strP = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, 0).strD * m_SprComp(n).SprCompData(nAbs).strTENS(nTens, 0).strK
              For l = 1 To UBound(m_SprComp(n).SprCompData(nAbs).strTENS, 2)
                m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strP = _
                    m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strK * _
                    (m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strD - m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l - 1).strD) _
                    + m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l - 1).strP
              Next l
            Next nTens
            
            nTens = 1
            If m > 0 Then nTens = 0
            
            For l = 0 To UBound(m_SprComp(n).SprCompData(nAbs).strTENS, 2)
             If m_SprComp(n).SprCompData(nAbs).mct_iTYPE = 0 Then
               strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strF: i = i + 1
              Else
               strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strP: i = i + 1
              End If
            Next l
            If i < 11 Then i = 11
            
            For l = 0 To UBound(m_SprComp(n).SprCompData(nAbs).strTENS, 2)
              strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strD: i = i + 1
            Next l
            If i < 15 Then i = 15
            
            strBuf(i) = "0.5, 1, 2, 4, 8": i = i + 1
            
            nTens = Abs(nTens - 1)
            For l = 0 To UBound(m_SprComp(n).SprCompData(nAbs).strTENS, 2)
             If m_SprComp(n).SprCompData(nAbs).mct_iTYPE = 0 Then
               strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strF: i = i + 1
             Else
               strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strP: i = i + 1
              End If
            Next l
            If i < 20 Then i = 20
            
            For l = 0 To UBound(m_SprComp(n).SprCompData(nAbs).strTENS, 2)
              strBuf(i) = m_SprComp(n).SprCompData(nAbs).strTENS(nTens, l).strD: i = i + 1
            Next l
            If i < 24 Then i = 24
            
            strBuf(i) = "0.5, 1, 2, 4, 8" & m_SprComp(n).SprCompData(nAbs).mct_HYST2
            
            If m_SprComp(n).SprCompData(nAbs).mct_HYST = "TTE" Then
              i = i + 1
              strBuf(i) = "0.5, 1"
            End If
          End If
          
          vWriteData(nRowCnt, 0) = strBuf(0)
          For m = 1 To i
            vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(m)
          Next m
        Else
          vWriteData(nRowCnt, 0) = "NO"
        End If
      Else
        vWriteData(nRowCnt, 0) = "NO"
      End If
      nRowCnt = nRowCnt + 1
      
    Next k
    
    ' 空行
    nRowCnt = nRowCnt + 1
    
    For k = 0 To 6
      vWriteData(nRowCnt + k, 0) = vWriteData(nRepeat + k, 0)
    Next k
    nRowCnt = nRowCnt + 7
    vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0": nRowCnt = nRowCnt + 1
    
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_SPGALLASYM_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_SPGALLASYM_COL)).Value = vWriteData
    
  Dim strCells As String
  With m_ChangeBook.Sheets(strName)
    For i = nRead1STCol To nRead3EDCol
      vBuf = .Cells(nReadSTRow - 1, i).Formula
      .Cells(nReadSTRow - 1, i) = Replace(vBuf, "=", "'")
    Next i
  End With
  
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead1STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead2STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead3STCol)
  
End Sub

Private Function CheckeHingeType(ByVal strHingeType As String) As String

  Dim strBuf As String
  strBuf = ""
  
  Select Case strHingeType
    Case "TAK", "TAK", "TTE", "MTT"
      strBuf = "0.5,1"
    Case Else
      strBuf = ""
  End Select
    
  CheckeHingeType = strBuf
    
End Function

Private Function GetLineType(ByRef strHingeType As String, ByRef strCateDetail As String) As Long
  
  Dim nLineType As Long
  nLineType = 0
  
  If strHingeType = "EBI" Then
    nLineType = 1
  ElseIf strHingeType = "TAK" Then
    If strCateDetail <> "トリリニア(対称)Takeda" And strCateDetail <> "トリリニア(非対称)Takeda" Then nLineType = 2
  End If
    
  GetLineType = nLineType

End Function

Public Function GetArea(nRow As Long, nST() As Long, nED() As Long) As Long

  Dim n As Long
  
  nRow = nReadSTRow
  
  n = 0
  nST(n) = nRead1STCol
  nED(n) = nRead1EDCol
  
  n = n + 1
  nST(n) = nRead2STCol
  nED(n) = nRead2EDCol
  
  n = n + 1
  nST(n) = nRead3STCol
  nED(n) = nRead3EDCol

  GetArea = n
  
End Function

Private Sub Class_Initialize()
  strName = m_Sheet_SPGAllASym
End Sub

