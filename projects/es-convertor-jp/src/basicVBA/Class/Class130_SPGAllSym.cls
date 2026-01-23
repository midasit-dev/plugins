VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class130_SPGAllSym"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 5

Private Const nRead1STCol = 2
Private Const nRead1EDCol = 13

Private Const nRead2STCol = 15
Private Const nRead2EDCol = 30

Private Const nRead3STCol = 32
Private Const nRead3EDCol = 50

Private Const nRead4STCol = 52
Private Const nRead4EDCol = 78

Private Const nWritSTRow = 3
Private Const nWritSTCol = nRead4EDCol + 2

Private Type NLPropType
  strProp(5) As String
  dRotate(5) As Double
End Type

Public strName As String
Public dicSprProp As Dictionary

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nRead1STCol, nRead1EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead2STCol, nRead2EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead3STCol, nRead3EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead4STCol, nRead4EDCol, 2)
  With m_ThisWorkbook.Sheets(strName)
    .Cells(nReadSTRow - 3, nRead1STCol) = "■線形"
    .Cells(nReadSTRow - 3, nRead2STCol) = "■バイリニア"
    .Cells(nReadSTRow - 3, nRead3STCol) = "■トリリニア"
    .Cells(nReadSTRow - 3, nRead4STCol) = "■テトラリニア"
  End With
End Sub

Public Sub ChangeSPGAllSym(ByRef dicSPG6Comp As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If
  
  ' ばね特性表_成分一覧(対称)
  Dim i As Long, j As Long, k As Long, n As Long, m As Long, o As Long
  Dim vWriteData() As String
  ReDim vWriteData((UBound(m_SprComp) + 1) * 9 + 14, 0)  ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  Dim dicNAGOYA As Dictionary
  Set dicNAGOYA = New Dictionary
  dicNAGOYA.Add "H15.10 HDR-G12", 1.2
  dicNAGOYA.Add "H15.10 HDR-G10", 1
  dicNAGOYA.Add "H15.10 LRB-G12", 1.2
  dicNAGOYA.Add "H15.10 LRB-G10", 1
  dicNAGOYA.Add "H15.10 RB-G12", 1.2
  dicNAGOYA.Add "H15.10 RB-G10", 1
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*NL-PROP    ; General Link Property": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; NAME, APPTYPE, TYPE, TW, TWRATIO_I, bUSEMASS, TM, TMRATIO_I, bSSL, DY, DZ, SIESKEY(if APPTYPE=2), DESC": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLDX, DX, EFFDAMP, bNDX, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLDY, DY, EFFDAMP, bNDY, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLDZ, DZ, EFFDAMP, bNDZ, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLRX, RX, EFFDAMP, bNRX, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLRY, RY, EFFDAMP, bNRY, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bLRZ, RZ, EFFDAMP, bNRZ, [NL_PROP]": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : DSTIFF, DAMP, DEXP, bRIGDBR, BSTIFF, REFV                                  ; Visco-elastic Damper Type": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : STIFF, OPEN                                                                ; Gap Type or Hook Type": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : STIFF, YSTR, PYS_RATIO, YEXP, PA, PB                                       ; Hysteretic System Type": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : STIFF, YSTR, PYS_RATIO, PA, PB                                             ; Lead Rubber Bearing Type": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : STIFF, FCS, FCF, RP, RADIUS, PA, PB                                        ; Friction Pendulum System Type": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [NL_PROP] : SYM, STIFF(1~4), FCS(1~4), FCF(1~4), RP(1~4), RADIUS(1~4), STOPDIST(1~4), H_In, H_Out   ; Triple Friction Pendulum System Type": nRowCnt = nRowCnt + 1
  
  Dim bAllFree As Boolean
  Dim strBuf() As String, strType As String
  Dim vBuf As Variant
  Dim dValue As Double
  Dim dicDamper As Dictionary
  Set dicDamper = New Dictionary
  Dim strSprName As String
  Dim nDamper As Long
  Dim s As String
  Dim vKeys As Variant
  Dim vSPG As Variant
  vSPG = Array(1, 3, -2, 4, 6, -5)
  
  vKeys = m_dicSprProp.Keys
  
  Dim nSort As Long
  Dim vSort As Variant
  vSort = Array(Array(0, 1, 2, 3, 4, 5), _
                Array(1, 0, 2, 4, 3, 5))
  
  For j = 0 To UBound(vKeys)
    
    n = m_dicSprProp(vKeys(j))
    strSprName = m_dicSprProp.Keys(j)
    
    ' 1行目
    ReDim strBuf(10)
    i = 0
    strBuf(i) = ChgCamma(strSprName): i = i + 1
    strBuf(i) = "ELEMENT": i = i + 1
    
    strType = "SPG"
    nDamper = 0
    If dicSPG6Comp.Exists(strSprName) Then
      If dicSPG6Comp(strSprName)(0) = "VISCOUS-OIL-DAMPER" Then
        strType = "AI"
        If Not dicDamper.Exists(strSprName) Then
          nDamper = dicDamper.Count + 1
          dicDamper.Add strSprName, nDamper
        End If
      End If
    End If
    
    strBuf(i) = strType: i = i + 1
    strBuf(i) = "0, 0.5, NO": i = i + 1
    strBuf(i) = "0, 0.5, NO": i = i + 1
    strBuf(i) = "0.5, 0.5, 0": i = i + 1
    strBuf(i) = nDamper & ","
    
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
    
    nRowCnt = nRowCnt + 1
    ' 2行目～7行目
    bAllFree = True
    
    nSort = 0
'    If Not m_dicSpgRef.Exists(strSprName) Then nSort = 1
    If m_dicSpgRef.Exists(strSprName) Then nSort = 1      ' 20250924 修正
    For m = 0 To 5
      If IsArray(m_SprComp(n).vAngle) Then
        vBuf = m_SprComp(n).vAngle(vSort(nSort)(m))
      Else
        vBuf = vSPG(vSort(nSort)(m))
      End If
        
      vBuf = Abs(vBuf)
      
      i = 0
      If m_SprComp(n).SprCompData(vBuf).mct_HYST = "LITR" Then
        bAllFree = False
        ' 名古屋高速ゴム支承
        dValue = dicNAGOYA(m_SprComp(n).SprCompData(vBuf).strData(0)) * m_SprComp(n).SprCompData(vBuf).strData(1) / ChangeN_kN(Change_par_MM2_M2(m_SprComp(n).SprCompData(vBuf).strData(2)))
        strBuf(i) = "YES," & dValue & ", 0, NO"
      ElseIf Len(m_SprComp(n).SprCompData(vBuf).strProp) > 0 Then
        bAllFree = False
        If Not IsNumeric(m_SprComp(n).SprCompData(vBuf).strProp) Then
          
          o = 0
          k = m_SprComp(n).SprCompData(vBuf).mct_iTYPE
          If m_SprComp(n).SprCompData(vBuf).mct_HYST = "SLBC" Then o = 1    ' 負方向
          If k = 1 Then
            m_SprComp(n).SprCompData(vBuf).strProp = m_SprComp(n).SprCompData(vBuf).strTENS(o, 0).strK
          Else
            m_SprComp(n).SprCompData(vBuf).strProp = m_SprComp(n).SprCompData(vBuf).strTENS(o, 0).strF
          End If
          
'          m_SprComp(n).SprCompData(vBuf).strProp = m_SprComp(n).SprCompData(vBuf).strTENS(0, 0).strD
        End If
        
        strBuf(i) = "YES": i = i + 1
        strBuf(i) = m_SprComp(n).SprCompData(vBuf).strProp: i = i + 1
        strBuf(i) = "0,NO"
      Else
        strBuf(i) = "NO, 0, 0, NO"
      End If
    
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      nRowCnt = nRowCnt + 1
      
    Next m
    
    If bAllFree Then
      For m = 6 To 1 Step -1
        vWriteData(nRowCnt - m, 0) = "YES,0.00001,0,NO"
      Next m
    End If
    
    vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
    nRowCnt = nRowCnt + 1
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_SPGALLSYM_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_SPGALLSYM_COL)).Value = vWriteData
  
  ' BMR(CD)ダンパー
  If dicDamper.Count > 0 Then
    ReDim vWriteData(dicDamper.Count * 7 + 3, 0)
    
    nRowCnt = 0
    vWriteData(nRowCnt, 0) = "*VISCOUS-OIL-DAMPER    ; Define Seismic Control Device - Viscous/Oil Damper": nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; KEY, NAME, DESC, INPUTMETHOD, DEVICE TYPE, COMPANY, PRODUCT NAME, TYPE NUM, DAMPER TYPE, DASHPOT TYPE, INPUT TYPE, INPUT TYPE_EXFN ; 1st line": nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; [Dx] : DOF, CE, P1, C1, Alpha1, K0, PY, VY, ALPHA, C, CE - [Rz] : .....                                                            ; 2nd-7th line": nRowCnt = nRowCnt + 1

    For j = 0 To dicDamper.Count - 1
      ReDim strBuf(7)
      
      strSprName = dicDamper.Keys(j)
      
      i = 0
      strBuf(i) = dicDamper(strSprName): i = i + 1
      strBuf(i) = ChgCamma(strSprName): i = i + 1
      strBuf(i) = " , 0, , , , , 0, 2, 0, 1"
      
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      nRowCnt = nRowCnt + 1
      
      s = "YES"
      For k = 1 To 6
         vWriteData(nRowCnt, 0) = s & " , 0, 0, 0, 0, 0, 1, 1, 0.1, 1, NO, 100": nRowCnt = nRowCnt + 1
         s = "NO"
      Next k
    Next j
  
    m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_OILDAMPER_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_OILDAMPER_COL)).Value = vWriteData
  End If
  
  Dim strCells As String
  With m_ChangeBook.Sheets(strName)
    For i = nRead1STCol To nRead4EDCol
      vBuf = .Cells(nReadSTRow - 1, i).Formula
      .Cells(nReadSTRow - 1, i) = Replace(vBuf, "=", "'")
    Next i
  End With
  
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead1STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead2STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead3STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead4STCol)
  
End Sub

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

  n = n + 1
  nST(n) = nRead4STCol
  nED(n) = nRead4EDCol

  GetArea = n
End Function

Private Sub Class_Initialize()
  strName = m_Sheet_SPGAllSym
End Sub
