VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class030_PlnElm"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 9

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
  With m_ThisWorkbook.Sheets(strName)
    .Range(.Cells(nReadSTRow, 4), .Cells(m_RowDataMax, 4)).NumberFormatLocal = "@"
  End With
End Sub

Public Sub ChangePlnElm(dicPlnSect As Dictionary, nElemMax As Long)

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long, j As Long, k As Long, n As Long, nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)

  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)

  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  Dim vWriteData() As String
  ReDim vWriteData(nCnt + 2, 0)   ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*ELEMENT    ; Elements": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iEL, TYPE, iMAT, iPRO, iN1, iN2, iN3, iN4, iSUB, iWID , LCAXIS    ; Planar Element": nRowCnt = nRowCnt + 1
  
  Dim strBuf() As String
  Dim vBuf As Variant
  
  For i = 0 To nCnt
    If IsNumeric(strData(0, i)) Then
      nElemMax = nElemMax + 1
      vBuf = dicPlnSect(strData(4, i))
      
      vBuf(5) = ChangeMatlName(CStr(vBuf(5)))
      
      ReDim strBuf(12)
      j = 0
      strBuf(j) = nElemMax: j = j + 1
      strBuf(j) = "PLATE": j = j + 1
      strBuf(j) = m_MaterialData(vBuf(5)): j = j + 1
      strBuf(j) = vBuf(0): j = j + 1
      
      vBuf = Split(strData(2, i), ",")
      n = 1
      
      If UBound(vBuf) > 4 Then n = n + 1
      
      For k = 0 To UBound(vBuf) Step n
        strBuf(j) = m_NodeData(vBuf(k)): j = j + 1
      Next k
      
      If j < 8 Then j = j + 1
      
      strBuf(j) = "1, 0"
      
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To j
         vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      
      nRowCnt = nRowCnt + 1
    End If
  Next i
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_PLNELM_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_PLNELM_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)

End Sub
 
Private Function CalcAngle(nNo1 As Long, nNo2 As Long, strElmCoord As String) As Double

If m_ResumeNext Then
  On Error Resume Next
End If

  ' Angle
  Dim dAngle As Double
  Dim dicElmCoordSys As Dictionary
  Set dicElmCoordSys = New Dictionary
  
  dicElmCoordSys.Add "Y軸", 0
  dicElmCoordSys.Add "ベクトル:Global X", 1
  dicElmCoordSys.Add "ベクトル:Global Y", 2
  dicElmCoordSys.Add "ベクトル:Global Z", 3
  
  Dim vElmCoordSys() As Variant
  vElmCoordSys = Array("節点", "ベクトル:Alpha", "ベクトル:X", "ポイント")
  
  Dim dBeta(1, 3) As Double
  dBeta(0, 0) = 180
  dBeta(0, 1) = 0
  dBeta(0, 2) = 180
  dBeta(0, 3) = 270
  
  dBeta(1, 0) = 0
  dBeta(1, 1) = 0
  dBeta(1, 2) = 0
  dBeta(1, 3) = 90
  
  Dim nHor As Long
  nHor = ChkHorPnt(nNo1, nNo2)
  
  Dim i As Long, j As Long
  Dim vBuf As Variant, vBuf2 As Variant, vBuf3 As Variant
  Dim vect As PointType
  vect.x = 0#
  vect.y = 0#
  vect.z = 0#
  
  dAngle = 0#
  If dicElmCoordSys.Exists(strElmCoord) Then
    dAngle = dBeta(nHor, dicElmCoordSys(strElmCoord))
  Else
    For i = 0 To 3
      If vElmCoordSys(i) = Left(strElmCoord, Len(vElmCoordSys(i))) Then Exit For
    Next i
    If i = 0 Then
      ' 節点
      vBuf = Split(strElmCoord, ":")
      If UBound(vBuf) = 1 Then
        If IsNumeric(m_NodeData(vBuf(1))) Then
          dAngle = GetNodeNo2Angle(nNo1, nNo2, m_NodeData(vBuf(1)))
        End If
      End If
    Else
      If i = 1 Then
        ' αβ
        vBuf = Split(strElmCoord, "=")
        If UBound(vBuf) = 2 Then
          vBuf2 = Split(vBuf(1), ",")
          If UBound(vBuf2) = 1 Then
            If IsNumeric(vBuf(2)) And IsNumeric(vBuf2(0)) Then
              vect.x = Cos(vBuf(2)) * Cos(vBuf2(0))
              vect.y = Sin(vBuf(2))
              vect.z = -1# * Cos(vBuf(2)) * Sin(vBuf2(0))
            End If
          End If
        End If
      ElseIf i < 4 Then
        ' ベクトル、ポイント
        vBuf = Split(strElmCoord, "=")
        If UBound(vBuf) = 3 Then
          vBuf2 = Split(vBuf(2), ",")
          vBuf3 = Split(vBuf(1), ",")
          If UBound(vBuf2) = 1 And UBound(vBuf3) = 1 Then
            
            If IsNumeric(vBuf3(0)) And IsNumeric(vBuf2(0)) And IsNumeric(vBuf(3)) Then
              vect.x = vBuf3(0)
              vect.y = vBuf(3)
              vect.z = -1# * vBuf2(0)
            End If
          End If
        End If
      End If
      
      dAngle = GetAngle(nNo1, nNo2, vect)
    End If
  End If

  CalcAngle = dAngle
  
End Function
 
Private Sub Class_Initialize()
  strName = m_Sheet_PlnElm
End Sub
