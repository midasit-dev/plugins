VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class070_Sect"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 30

Private dicSectOption As Dictionary
Private strData() As String

Private dicSectName As Dictionary
Private dicSectNameBuf As Dictionary

Public strName As String
Private dicSectList As Dictionary
Private strSectList As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
  m_ThisWorkbook.Sheets(strName).Activate
  
  Dim nRowEnd As Long
  nRowEnd = m_ThisWorkbook.Sheets(strName).Cells.SpecialCells(xlLastCell).Row + 1
  With m_ThisWorkbook.Sheets(strName)
    With .Range(.Cells(nReadSTRow, nReadEDCol), Cells(nRowEnd, nReadEDCol)).Validation
      .Delete
      .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Formula1:=strSectList
    End With
  
    .Cells(nReadSTRow - 2, nReadEDCol) = "断面"
    .Cells(nReadSTRow - 1, nReadEDCol) = "形状"
  End With
  
End Sub

Public Function ReadSect_SectName(ByRef dicSect As Dictionary) As Long

If m_ResumeNext Then
  On Error Resume Next
End If

  ' 断面特性ｵﾌﾟｼｮﾝ
  Dim i As Long, j As Long
  Dim nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    ReadSect_SectName = nCnt
    Exit Function
  End If
    
  Dim strBuf(1) As String
  For i = 0 To nCnt
    If dicSect.Exists(strData(0, i)) Then
      strBuf(0) = strData(2, i)
      strBuf(1) = strData(21, i)
       dicSect(strData(0, i)) = strBuf
    End If
  Next i
  
  ReadSect_SectName = nCnt
  
End Function

Public Sub ChangeSect(ByRef dicSect As Dictionary, ByRef dicSectYoung As Dictionary, bSect As Boolean)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 断面特性ｵﾌﾟｼｮﾝ
  Dim i As Long, j As Long
  Dim nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
'
  Dim NewSheet As Worksheet
  If bSect Then
    Set NewSheet = AddSheet(strName)
  End If
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  Set dicSectOption = New Dictionary
  Set dicSectName = New Dictionary
  Set dicSectNameBuf = New Dictionary
  
  Dim dValue As Double
  For i = 0 To UBound(strData, 2)
    dicSectOption.Add strData(0, i), i
    dValue = CDbl(strData(2, i))
    dValue = ChangeN_kN(dValue) / ChangeMM2_M2(1)
    dicSectYoung.Add strData(0, i), dValue          ' strData(2, i)
  Next i
  
  Dim strCommVal(5) As String, strCommTap(10) As String
  Dim strVal() As String, strTap() As String
  Dim nVal As Long, nTap As Long
  nVal = -1
  nTap = -1
  
  ' コメント(Value)
  j = 0
  strCommVal(j) = "*SECTION    ; Section": j = j + 1
  strCommVal(j) = "; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - VALUE": j = j + 1
  strCommVal(j) = ";       AREA, ASy, ASz, Ixx, Iyy, Izz                                               ; 2nd line": j = j + 1
  strCommVal(j) = ";       CyP, CyM, CzP, CzM, QyB, QzB, PERI_OUT, PERI_IN, Cy, Cz                     ; 3rd line": j = j + 1
  strCommVal(j) = ";       Y1, Y2, Y3, Y4, Z1, Z2, Z3, Z4, Zyy, Zzz                                    ; 4th line": j = j + 1
  strCommVal(j) = "; [OFFSET] : OFFSET, iCENT, iREF, iHORZ, HUSER, iVERT, VUSER": j = j + 1
  
  ' コメント(Taperd)
  j = 0
  strCommTap(j) = "*SECTION    ; Section": j = j + 1
  strCommTap(j) = "; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - VALUE": j = j + 1
  strCommTap(j) = ";       D11, D12, D13, D14, D15, D16, D17, D18                                      ; 2nd line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       AREA1, ASy1, ASz1, Ixx1, Iyy1, Izz1                                         ; 3rd line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       CyP1, CyM1, CzP1, CzM1, QyB1, QzB1, PERI_OUT1, PERI_IN1, Cy1, Cz1           ; 4th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       Y11, Y12, Y13, Y14, Z11, Z12, Z13, Z14, Zyy1, Zzz1                          ; 5th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       D21, D22, D23, D24, D25, D26, D27, D28                                      ; 6th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       AREA2, ASy2, ASz2, Ixx2, Iyy2, Izz2                                         ; 7th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       CyP2, CyM2, CzP2, CzM2, QyB2, QzB2, PERI_OUT2, PERI_IN2, Cy2, Cz2           ; 8th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = ";       Y21, Y22, Y23, Y24, Z21, Z22, Z23, Z24, Zyy2, Zzz2                          ; 9th line(STYPE=VALUE)": j = j + 1
  strCommTap(j) = "; [OFFSET2]: OFFSET, iCENT, iREF, iHORZ, HUSERI, HUSERJ, iVERT, VUSERI, VUSERJ": j = j + 1
  
  Dim vBuf As Variant
  Dim vKeys As Variant
  Dim nSect As Long
  nSect = 0
  
  vKeys = dicSect.Keys
  For i = 0 To dicSect.Count - 1
    vBuf = Split(dicSect(vKeys(i)), "===")
    For j = 0 To UBound(vBuf)
      nSect = nSect + 1
      If vKeys(i) = vBuf(j) Then
        Call Set_Value(nSect, dicSectOption(vKeys(i)), dicSect(i), strVal, nVal)
      Else
        Call Set_Taperd(nSect, dicSectOption(vKeys(i)), dicSectOption(vBuf(j)), dicSect(vBuf(j)), strTap, nTap)
      End If
      
      m_SectData.Add vKeys(i) & "-" & vBuf(j), nSect
    Next j
  Next i
  
  ' Sect データ作成
  Dim nRowCnt As Long
  nRowCnt = 0
  
  nCnt = nVal * 4
  Dim vWriteData() As String
  ReDim vWriteData(nCnt, 0)   ' 二次元配列でないとダメ！
  
  If nVal >= 0 Then
    For i = 0 To UBound(strCommVal)
      vWriteData(nRowCnt, 0) = strCommVal(i): nRowCnt = nRowCnt + 1
    Next i
    For i = 0 To UBound(strVal)
      vWriteData(nRowCnt, 0) = strVal(i): nRowCnt = nRowCnt + 1
    Next i
    m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_SECT_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_SECT_COL)).Value = vWriteData
  End If
  
  nRowCnt = 0
  nCnt = nTap * 7 + 12
  Erase vWriteData
  ReDim vWriteData(nCnt, 0)   ' 二次元配列でないとダメ！
  
  If nTap >= 0 Then
    For i = 0 To UBound(strCommTap)
      vWriteData(nRowCnt, 0) = strCommTap(i): nRowCnt = nRowCnt + 1
    Next i
    For i = 0 To UBound(strTap)
      vWriteData(nRowCnt, 0) = strTap(i): nRowCnt = nRowCnt + 1
    Next i
    m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_SECT_PSC_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_SECT_PSC_COL)).Value = vWriteData
  End If
  
  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)
  
End Sub

Private Function SectName(ByRef strSect As String, ByRef strSect2 As String, ByVal nMax As Long) As String

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim strSectTap As String
  strSectTap = strSect & "=*=" & strSect2
  
'  If Len(strSect) <= 28 Then
'    SectName = strSect
'    Exit Function
'  End If

  Dim strRet As String, strBuf As String
  Dim n As Long
  If dicSectName.Exists(strSectTap) Then
    strRet = dicSectName(strSectTap)
  Else
    strRet = strSect
    strBuf = strRet & "~"
    n = 0
    If Len(strRet) > 28 Then
      strBuf = Left(strSect, nMax)
      strBuf = strBuf & "~"
      strRet = strBuf & 1
    End If
    
    While dicSectNameBuf.Exists(strRet)
      n = n + 1
      strRet = strBuf & n
    Wend
    
    dicSectNameBuf.Add strRet, True
    dicSectName.Add strSectTap, strRet

  End If

  SectName = strRet

End Function

Private Sub Set_Value(ByRef nSect As Long, ByRef nDat As Long, ByRef strSect2 As String, ByRef strVal() As String, ByRef nCnt As Long)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' Value
  Dim i As Long, j As Long
  Dim strBuf() As String
  
  i = 0
  nCnt = nCnt + 1
  ' 1行目
  ReDim strBuf(11)
  strBuf(i) = nSect: i = i + 1
  strBuf(i) = "VALUE": i = i + 1
  strBuf(i) = ChgCamma(SectName(strData(0, nDat), strSect2, 23)): i = i + 1
  
  If strData(17, nDat) = "TRUE" Then
    strBuf(i) = "LT,0,0,1,": i = i + 1
    strBuf(i) = strData(18, nDat): i = i + 1
    strBuf(i) = "1": i = i + 1
    strBuf(i) = strData(19, nDat): i = i + 1
  Else
    strBuf(i) = "CC,0,0,0,0,0,0": i = i + 1
  End If
  
  strBuf(i) = "NO,NO": i = i + 1
  strBuf(i) = dicSectList(strData(28, nDat)): i = i + 1
  strBuf(i) = "BUILT,0,0,0,0,0,0,0,0,0": i = i + 1
  
  ReDim Preserve strVal(nCnt)
  strVal(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strVal(nCnt) = strVal(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 2行目
  ReDim strBuf(5)
  strBuf(i) = strData(4, nDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  strBuf(i) = strData(24, nDat): i = i + 1
  strBuf(i) = strData(5, nDat): i = i + 1
  strBuf(i) = strData(6, nDat): i = i + 1
  
  ReDim Preserve strVal(nCnt)
  strVal(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strVal(nCnt) = strVal(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 3行目
  ReDim strBuf(9)
  strBuf(i) = strData(13, nDat): i = i + 1
  strBuf(i) = strData(12, nDat): i = i + 1
  strBuf(i) = strData(10, nDat): i = i + 1
  strBuf(i) = strData(11, nDat): i = i + 1
  strBuf(i) = "0,0,0,0": i = i + 1
  strBuf(i) = strData(12, nDat): i = i + 1
  strBuf(i) = strData(11, nDat): i = i + 1
  
  ReDim Preserve strVal(nCnt)
  strVal(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strVal(nCnt) = strVal(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 4行目
  ReDim strBuf(8)
  strBuf(i) = -1# * strData(12, nDat): i = i + 1
  strBuf(i) = strData(13, nDat): i = i + 1
  strBuf(i) = strData(13, nDat): i = i + 1
  strBuf(i) = -1# * strData(12, nDat): i = i + 1
  strBuf(i) = strData(10, nDat): i = i + 1
  strBuf(i) = strData(10, nDat): i = i + 1
  strBuf(i) = -1# * strData(11, nDat): i = i + 1
  strBuf(i) = -1# * strData(11, nDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  
  ReDim Preserve strVal(nCnt)
  strVal(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strVal(nCnt) = strVal(nCnt) & "," & strBuf(j)
  Next j
  
End Sub

Private Sub Set_Taperd(ByRef nSect As Long, ByRef niDat As Long, ByRef njDat As Long, ByRef strSect2 As String, ByRef strTap() As String, ByRef nCnt As Long)

If m_ResumeNext Then
  On Error Resume Next
End If

  ' Taperd
  Dim i As Long, j As Long
  Dim strBuf() As String
  
  i = 0
  nCnt = nCnt + 1
  ' 1行目
  ReDim strBuf(20)
  strBuf(i) = nSect: i = i + 1
  strBuf(i) = "TAPERED": i = i + 1
  strBuf(i) = ChgCamma(SectName(strData(0, niDat) & "(TAP)", strSect2, 18)): i = i + 1
  
  If strData(17, niDat) = "TRUE" Then
    strBuf(i) = "LT,0,0,1,": i = i + 1
    strBuf(i) = strData(18, niDat): i = i + 1
    strBuf(i) = strData(18, njDat): i = i + 1
    strBuf(i) = "1": i = i + 1
    strBuf(i) = strData(19, niDat): i = i + 1
    strBuf(i) = strData(19, njDat): i = i + 1
  Else
    strBuf(i) = "CC,0,0,0,0,0,0,0,0": i = i + 1
  End If
  
  strBuf(i) = "NO,NO,NO": i = i + 1
  strBuf(i) = dicSectList(strData(28, niDat)): i = i + 1
  strBuf(i) = "1,1,VALUE": i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 2行目
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = "0,0,0,0,0,0,0,0"
  
  nCnt = nCnt + 1
  ' 3行目
  ReDim strBuf(5)
  strBuf(i) = strData(4, niDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  strBuf(i) = strData(24, niDat): i = i + 1
  strBuf(i) = strData(5, niDat): i = i + 1
  strBuf(i) = strData(6, niDat): i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 4行目
  ReDim strBuf(9)
  strBuf(i) = strData(13, niDat): i = i + 1
  strBuf(i) = strData(12, niDat): i = i + 1
  strBuf(i) = strData(10, niDat): i = i + 1
  strBuf(i) = strData(11, niDat): i = i + 1
  strBuf(i) = "0,0,0,0": i = i + 1
  strBuf(i) = "0": i = i + 1   'strData(12, niDat): i = i + 1
  strBuf(i) = "0": i = i + 1   'strData(11, niDat): i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 5行目
  ReDim strBuf(8)
  strBuf(i) = -1# * strData(12, niDat): i = i + 1
  strBuf(i) = strData(13, niDat): i = i + 1
  strBuf(i) = strData(13, niDat): i = i + 1
  strBuf(i) = -1# * strData(12, niDat): i = i + 1
  strBuf(i) = strData(10, niDat): i = i + 1
  strBuf(i) = strData(10, niDat): i = i + 1
  strBuf(i) = -1# * strData(11, niDat): i = i + 1
  strBuf(i) = -1# * strData(11, niDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  nCnt = nCnt + 1
  ' 6行目
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = "0,0,0,0,0,0,0,0"
  
  i = 0
  nCnt = nCnt + 1
  ' 7行目
  ReDim strBuf(5)
  strBuf(i) = strData(4, njDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  strBuf(i) = strData(24, njDat): i = i + 1
  strBuf(i) = strData(5, njDat): i = i + 1
  strBuf(i) = strData(6, njDat): i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 8行目
  ReDim strBuf(9)
  strBuf(i) = strData(13, njDat): i = i + 1
  strBuf(i) = strData(12, njDat): i = i + 1
  strBuf(i) = strData(10, njDat): i = i + 1
  strBuf(i) = strData(11, njDat): i = i + 1
  strBuf(i) = "0,0,0,0": i = i + 1
  strBuf(i) = "0": i = i + 1   'strData(12, njDat): i = i + 1
  strBuf(i) = "0": i = i + 1   'strData(11, njDat): i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
  i = 0
  nCnt = nCnt + 1
  ' 9行目
  ReDim strBuf(8)
  strBuf(i) = -1 * strData(12, njDat): i = i + 1
  strBuf(i) = strData(13, njDat): i = i + 1
  strBuf(i) = strData(13, njDat): i = i + 1
  strBuf(i) = -1 * strData(12, njDat): i = i + 1
  strBuf(i) = strData(10, njDat): i = i + 1
  strBuf(i) = strData(10, njDat): i = i + 1
  strBuf(i) = -1 * strData(11, njDat): i = i + 1
  strBuf(i) = -1 * strData(11, njDat): i = i + 1
  strBuf(i) = "0,0": i = i + 1
  
  ReDim Preserve strTap(nCnt)
  strTap(nCnt) = strBuf(0)
  For j = 1 To i - 1
    strTap(nCnt) = strTap(nCnt) & "," & strBuf(j)
  Next j
  
End Sub

Private Sub Class_Initialize()

  strName = m_Sheet_Sect
  
  Set dicSectList = New Dictionary
  
  dicSectList.Add "山形断面", "L"
  dicSectList.Add "溝形断面", "C"
  dicSectList.Add "H-断面", "H"
  dicSectList.Add "T-断面", "T"
  dicSectList.Add "ボックス断面", "B"
  dicSectList.Add "パイプ断面", "P"
  dicSectList.Add "2山形断面", "2L"
  dicSectList.Add "2溝形断面", "2C"
  dicSectList.Add "矩形", "SB"
  dicSectList.Add "円形", "SR"
  dicSectList.Add "中空八角形", "OCT"
  dicSectList.Add "八角形", "SOCT"
  dicSectList.Add "矩形-八角形", "ROCT"
  dicSectList.Add "中空小判形", "TRK"
  dicSectList.Add "小判形", "STRK"
  dicSectList.Add "半小判形", "HTRK"
  dicSectList.Add "", "SB"
  
  strSectList = dicSectList.Keys(0)
  Dim i As Long
  For i = 1 To dicSectList.Count - 1
    strSectList = strSectList & "," & dicSectList.Keys(i)
  Next i
  
End Sub
