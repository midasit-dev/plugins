VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class020_Frame"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 11

Private strData() As String

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Function ReadFrame_Sectname(ByRef dicSect As Dictionary, _
                                    dicDblPnt As Dictionary, _
                                    dicDblNode_Z As Dictionary) ', _
'                                    dicDblPntReSet As Dictionary) As Long

If m_ResumeNext Then
  On Error Resume Next
End If

  ' フレーム要素
  Dim i As Long, j As Long, nCnt As Long, nBuf As Long
  Dim dBuf As Double
  Dim vPoint(1) As Variant
  
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    ReadFrame_Sectname = nCnt
    Exit Function
  End If
  
  Dim dicDblPntReSet As Dictionary
  Set dicDblPntReSet = New Dictionary
  
  Dim vNodeTmp(1) As Variant
  For i = 0 To nCnt
    
    vNodeTmp(0) = strData(1, i)
    vNodeTmp(1) = strData(2, i)
    m_ElemNode.Add strData(0, i), vNodeTmp
    
    If Not dicSect.Exists(strData(4, i)) Then
      dicSect.Add strData(4, i), 1
    End If
    If Not dicSect.Exists(strData(5, i)) Then
      dicSect.Add strData(5, i), 1
    End If
    
    If dicDblPnt.Exists(strData(1, i)) Or _
       dicDblPnt.Exists(strData(2, i)) Then

      ' x,y座標が同じか？
      If dicDblNode_Z(strData(1, i))(0) = dicDblNode_Z(strData(2, i))(0) Then
        nBuf = 0
        vPoint(0) = strData(1, i)
        vPoint(1) = strData(2, i)

        If dicDblPnt.Exists(vPoint(1)) Then nBuf = 1

        dBuf = dicDblNode_Z(vPoint(nBuf))(1) - dicDblNode_Z(vPoint(Abs(nBuf - 1)))(1)
        dBuf = dBuf / Abs(dBuf)
        dicDblPntReSet.Add dicDblPnt(vPoint(nBuf)), dBuf / 1000#

      End If
    End If
  Next i

  ReadFrame_Sectname = nCnt
  
End Function


Public Function ReadFrame(ByRef dicSect As Dictionary) As Long
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' フレーム要素
  Dim i As Long, j As Long, nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)

  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
'    NewSheet.Delete
    ReadFrame = nCnt
    Exit Function
  End If
  
  Dim bExist As Boolean
  Dim vBuf As Variant
  
  For i = 0 To nCnt
    If Not dicSect.Exists(strData(4, i)) Then
      dicSect.Add strData(4, i), strData(5, i)
    Else
      bExist = False
      vBuf = Split(dicSect(strData(4, i)), "===")
      For j = 0 To UBound(vBuf)
        If vBuf(j) = strData(5, i) Then
          bExist = True
          Exit For
        End If
      Next j
      
      If Not bExist Then
        dicSect(strData(4, i)) = dicSect(strData(4, i)) & "===" & strData(5, i)
      End If
    End If
  Next i
  
  ReadFrame = nCnt
  
End Function

Public Sub SetElemNo(ByRef nElemMax As Long, strRigidData() As String)

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long, j As Long, k As Long
'  Dim nMax As Long
  nElemMax = 0
  
  Dim dAngle() As Double
'  Dim nHor As Long
'  Dim vAngle(1) As Variant
'  ReDim dAngle(UBound(strData, 2))
  ' 最大検出
  For i = 0 To UBound(strData, 2)
    If IsNumeric(strData(0, i)) Then
      If nElemMax < strData(0, i) Then nElemMax = strData(0, i)
    End If
    If Len(strData(0, i)) > 0 Then
      m_ElemData.Add strData(0, i), strData(0, i)
      
'      ' Angle
'      dAngle(i) = CalcAngle(m_NodeData(strData(1, i)), m_NodeData(strData(2, i)), strData(6, i), nHor)
'
'      vAngle(0) = dAngle(i)
'      vAngle(1) = nHor
'      m_ElemAngle.Add strData(0, i), vAngle
      
    End If
  Next i
  
  ' 剛体要素チェック
  For i = 0 To UBound(strRigidData, 2)
    If IsNumeric(strRigidData(0, i)) Then
      If nElemMax < strRigidData(0, i) Then nElemMax = strRigidData(0, i)
    End If
'    If Len(strRigidData(0, i)) > 0 Then
'      m_ElemData.Add strRigidData(0, i), strRigidData(0, i)
'    End If
  Next i
  
  ' 要素データ作成
  nElemMax = nElemMax + 1
  For i = 0 To m_ElemData.Count - 1
    If Not IsNumeric(m_ElemData.Keys(i)) Then
      m_ElemData(m_ElemData.Keys(i)) = nElemMax
      nElemMax = nElemMax + 1
    End If
  Next i
  
End Sub

Public Sub ChangeFrame(ByRef dicHingeElem As Dictionary)

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long, j As Long, k As Long
'  Dim nMax As Long
'  nElemMax = 0
  
  Dim dAngle() As Double
  Dim nHor As Long
  Dim vAngle(1) As Variant
  ReDim dAngle(UBound(strData, 2))
  ' 最大検出
  For i = 0 To UBound(strData, 2)
'    If IsNumeric(strData(0, i)) Then
'      If nElemMax < strData(0, i) Then nElemMax = strData(0, i)
'    End If
    If Len(strData(0, i)) > 0 Then
'      m_ElemData.Add strData(0, i), strData(0, i)
      
      ' Angle
      dAngle(i) = CalcAngle(m_NodeData(strData(1, i)), m_NodeData(strData(2, i)), strData(6, i), nHor)
      
      vAngle(0) = dAngle(i)
      vAngle(1) = nHor
      m_ElemAngle.Add strData(0, i), vAngle
      
    End If
  Next i
  
'  ' 要素データ作成
'  nElemMax = nElemMax + 1
'  For i = 0 To m_ElemData.Count - 1
'    If Not IsNumeric(m_ElemData.Keys(i)) Then
'      m_ElemData(m_ElemData.Keys(i)) = nElemMax
'      nElemMax = nElemMax + 1
'    End If
'  Next i
  
  Dim vWriteData() As String
  ReDim vWriteData(UBound(strData, 2) + 2, 0)   ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*ELEMENT    ; Elements": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element": nRowCnt = nRowCnt + 1
  
  Dim strBuf() As String
  
  For i = 0 To UBound(strData, 2)
    
    If strData(8, i) = "M－φ要素" Then dicHingeElem.Add strData(0, i), True
    
    ReDim strBuf(7)
    j = 0
    strBuf(j) = m_ElemData(strData(0, i)): j = j + 1
    strBuf(j) = "Beam": j = j + 1
    strBuf(j) = m_MaterialData(m_Sect2Material(strData(4, i))): j = j + 1
    strBuf(j) = m_SectData(strData(4, i) & "-" & strData(5, i)): j = j + 1
  
    strBuf(j) = m_NodeData(strData(1, i)): j = j + 1
    strBuf(j) = m_NodeData(strData(2, i)): j = j + 1
    strBuf(j) = dAngle(i): j = j + 1
    strBuf(j) = "0": j = j + 1
    
'    If Len(strBuf(2)) > 0 Then
      m_ElemNo2MaterialNo.Add strBuf(0), strBuf(2)
      
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To j - 1
         vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      
      nRowCnt = nRowCnt + 1
'    End If
  Next i
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_FRAME_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_FRAME_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)

End Sub
 
Private Function CalcAngle(nNo1 As Long, nNo2 As Long, strElmCoord As String, nHor As Long) As Double

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
  
'  Dim nHor As Long
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
              vect.y = vBuf2(0)
              vect.z = vBuf(3)
            End If
          End If
        End If
      End If
      
      dAngle = GetAngle(nNo1, nNo2, vect)
    End If
  End If

  CalcAngle = Format(dAngle, "0.00")
  
End Function

 
Private Sub Class_Initialize()
  strName = m_Sheet_Frame
End Sub
