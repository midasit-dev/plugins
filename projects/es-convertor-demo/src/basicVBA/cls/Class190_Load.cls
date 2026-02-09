VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class190_Load"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 20

Private Type StLdCaseType
  strLcType As String
  strLcName As String
  strDESC As String
End Type

Private Type strDatType
  strDat() As String
End Type

' *CONLOAD
Private Type tConLoadType
  nNum As Long
  dicName As Dictionary
  strMCTComment() As String
  strConLoad() As strDatType
End Type

' *SPDISP
Private Type tSpDispType
  nNum As Long
  dicName As Dictionary
  strMCTComment() As String
  strSpDisp() As strDatType
End Type

' *BEAMLOAD
Private Type tBeamLoadType
  nNum As Long
  dicName As Dictionary
  strMCTComment() As String
  strBeamLoad() As strDatType
End Type

' *ELTEMPER
Private Type tElTemperType
  nNum As Long
  dicName As Dictionary
  strMCTComment() As String
  strElTemper() As strDatType
End Type

' *STLDCASE
Private Type tStLoadType
  strMCTComment() As String
  strStLdCase() As String
End Type

Private Type ElemNodeType
  
  vElem As Variant
  vElem_I As Variant
  vElem_J As Variant
  vNode_I As Variant
  vNode_J As Variant
  dLength As Double
  
End Type

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
  ThisWorkbook.Sheets(strName).Range("F3:F100000").NumberFormatLocal = "@"
End Sub

Public Sub ChangeLoad()
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 荷重値
  Dim i As Long, j As Long, k As Long, n As Long
  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol + 1, 0)

  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)

  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  Dim dicType As Dictionary
  Set dicType = New Dictionary
  
  dicType.Add "節点-集中荷重", 1
  dicType.Add "剛体要素荷重", 2
  dicType.Add "節点-強制変位", 3
  dicType.Add "フレーム要素-集中荷重", 4
  dicType.Add "フレーム要素-分布荷重（単独）", 5
  dicType.Add "フレーム要素-分布荷重（連続）", 6
  dicType.Add "フレーム要素-射影長荷重", 7
  dicType.Add "温度荷重", 8
  
  Dim vType As Variant
  vType = Array("*CONLOAD", "*SPDISP", "*BEAMLOAD", "*BEAMLOAD", "*BEAMLOAD", "*BEAMLOAD", "*ELTEMPER")
  
  Dim dicLoadName As Dictionary
  Set dicLoadName = New Dictionary
  For i = 0 To UBound(strData, 2)
    If Not dicLoadName.Exists(strData(2, i)) Then
      dicLoadName.Add strData(2, i), strData(1, i)
'    Else
'      If dicLoadName(strData(2, i)) <> strData(1, i) Then
'        j = 1
'        While dicLoadName.Exists(strData(2, i) & "~" & j)
'          j = j + 1
'        Wend
'        strData(2, i) = strData(2, i) & "~" & j
'      End If
    End If
  Next i
  
  Dim tLoad As tStLoadType
  ReDim tLoad.strMCTComment(1)
  ' コメント
  tLoad.strMCTComment(0) = "*STLDCASE    ; Static Load Cases"
  tLoad.strMCTComment(1) = "; LCNAME, LCTYPE, DESC"
  
'  For i = 0 To UBound(strData, 2)
'    ReDim Preserve tLoad.strStLdCase(i)
'    tLoad.strStLdCase(i) = strData(0, i) & ",USER,"
'  Next i
  For i = 0 To dicLoadName.Count - 1
    ReDim Preserve tLoad.strStLdCase(i)
    tLoad.strStLdCase(i) = dicLoadName.Keys(i) & ",USER,"
  Next i
  
  
  Dim tConLoad As tConLoadType
  Set tConLoad.dicName = New Dictionary
  ReDim tConLoad.strMCTComment(1)
  tConLoad.strMCTComment(0) = "*CONLOAD    ; Nodal Loads"
  tConLoad.strMCTComment(1) = "; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME"
  tConLoad.nNum = UBound(tConLoad.strMCTComment)
  
  Dim tSpDisp As tSpDispType
  Set tSpDisp.dicName = New Dictionary
  ReDim tSpDisp.strMCTComment(1)
  tSpDisp.strMCTComment(0) = "*SPDISP    ; Specified Displacement of Supports"
  tSpDisp.strMCTComment(1) = "; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP"
  tSpDisp.nNum = UBound(tSpDisp.strMCTComment)
  
  Dim tBeamLoad As tBeamLoadType
  Set tBeamLoad.dicName = New Dictionary
  ReDim tBeamLoad.strMCTComment(5)
  tBeamLoad.strMCTComment(0) = "*BEAMLOAD    ; Element Beam Loads"
  tBeamLoad.strMCTComment(1) = "; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP"
  tBeamLoad.strMCTComment(2) = "; ELEM_LIST, CMD, TYPE, TYPE, DIR, VX, VY, VZ, bPROJ, [ECCEN], [VALUE], GROUP"
  tBeamLoad.strMCTComment(3) = "; [VALUE]       : D1, P1, D2, P2, D3, P3, D4, P4"
  tBeamLoad.strMCTComment(4) = "; [ECCEN]       : bECCEN, ECCDIR, I-END, J-END, bJ-END"
  tBeamLoad.strMCTComment(5) = "; [ADDITIONAL]  : bADDITIONAL, ADDITIONAL_I-END, ADDITIONAL_J-END, bADDITIONAL_J-END"
  tBeamLoad.nNum = UBound(tBeamLoad.strMCTComment)
  
  Dim tElTemper As tElTemperType
  Set tElTemper.dicName = New Dictionary
  ReDim tElTemper.strMCTComment(1)
  tElTemper.strMCTComment(0) = "*ELTEMPER    ; Element Temperatures"
  tElTemper.strMCTComment(1) = "; ELEM_LIST, TEMPER, GROUP"
  tElTemper.nNum = UBound(tElTemper.strMCTComment)
  
  Dim vElem As Variant
  Dim vNode As Variant
  Dim strElem As String: strElem = ""
  Dim strNode As String: strNode = ""
  
  For i = 0 To UBound(strData, 2)
    
'    If strData(5, i) <> 0# Then
    
      n = dicType(strData(1, i))
      If n = 1 Or n = 2 Or n = 3 Then
        ' 節点名→ No
        vNode = Split(strData(4, i), ",")
        For j = 0 To UBound(vNode)
          vNode(j) = m_NodeData(vNode(j))
        Next j
        strNode = vNode(0)
        For j = 1 To UBound(vNode)
          strNode = strNode & "," & vNode(j)
        Next j
        
        ' 要素名→ No
        If n = 2 Then
          vElem = Split(strData(4, i), ",")
          For j = 0 To UBound(vElem)
            vElem(j) = m_NodeData(m_dicRigidElem(vElem(j)))
          Next j
          strNode = vElem(0)
          For j = 1 To UBound(vElem)
            strNode = strNode & "," & vElem(j)
          Next j
          
          If Len(strNode) = 0 Then n = -1
  
        End If
      End If
      
      Select Case n
        Case 1, 2
          If strData(5, i) <> 0# Then
            ' *CONLOAD
            strData(4, i) = strNode
            Call SetConLoad(tConLoad, strData, i)
          End If
        Case 3
          If strData(5, i) <> 0# Then
            ' *SPDISP
            strData(4, i) = strNode
            Call SetSpDisp(tSpDisp, strData, i)
          End If
        Case 4, 5, 6, 7
          ' *BEAMLOAD
          Call SetBeamLoad(tBeamLoad, strData, i, dicType(strData(1, i)))
        Case 8
          If strData(5, i) <> 0# Then
            ' *ELTEMPER
            ' 要素名→No
            vElem = Split(strData(4, i), ",")
            For j = 0 To UBound(vElem)
              vElem(j) = m_ElemData(vElem(j))
            Next j
            strElem = vElem(0)
            For j = 1 To UBound(vElem)
              strElem = strElem & "," & vElem(j)
            Next j
            
            strData(4, i) = strElem
            Call SetElTemper(tElTemper, strData, i)
          End If
        Case Else
      End Select
'    End If
  Next i
  
  Dim sName As String
  Dim vWriteData() As String
  ReDim vWriteData(UBound(tLoad.strMCTComment) + UBound(tLoad.strStLdCase) + 1, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long, nNextRow As Long
  nRowCnt = 0
  
  ' *STLDCASE
  For i = 0 To UBound(tLoad.strMCTComment)
    vWriteData(nRowCnt, 0) = tLoad.strMCTComment(i): nRowCnt = nRowCnt + 1
  Next i
  For i = 0 To UBound(tLoad.strStLdCase)
    vWriteData(nRowCnt, 0) = tLoad.strStLdCase(i): nRowCnt = nRowCnt + 1
  Next i
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_LOAD_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_LOAD_COL)).Value = vWriteData
  
  ' *CONLOAD
  ReDim vWriteData(tConLoad.dicName.Count * 7 + tConLoad.nNum, 0) ' 二次元配列でないとダメ！
  nRowCnt = 0
  
  For i = 0 To tConLoad.dicName.Count - 1
    sName = tConLoad.dicName.Keys(i)
    vWriteData(nRowCnt, 0) = "*USE-STLD, " & sName: nRowCnt = nRowCnt + 2
    vWriteData(nRowCnt, 0) = tConLoad.strMCTComment(0): nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = tConLoad.strMCTComment(1): nRowCnt = nRowCnt + 1
    
    j = tConLoad.dicName(sName)
    For k = 0 To UBound(tConLoad.strConLoad(j).strDat)
      vWriteData(nRowCnt, 0) = tConLoad.strConLoad(j).strDat(k): nRowCnt = nRowCnt + 1
    Next k
    nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; End of data for load case [" & sName & "] -------------------------": nRowCnt = nRowCnt + 2
  Next i
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_CONLOAD_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_CONLOAD_COL)).Value = vWriteData
  
  ' *SPDISP
  ReDim vWriteData(tSpDisp.dicName.Count * 7 + tSpDisp.nNum, 0) ' 二次元配列でないとダメ！
  nRowCnt = 0
  
  For i = 0 To tSpDisp.dicName.Count - 1
    sName = tSpDisp.dicName.Keys(i)
    vWriteData(nRowCnt, 0) = "*USE-STLD, " & sName: nRowCnt = nRowCnt + 2
    vWriteData(nRowCnt, 0) = tSpDisp.strMCTComment(0): nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = tSpDisp.strMCTComment(1): nRowCnt = nRowCnt + 1
    
    j = tSpDisp.dicName(sName)
    For k = 0 To UBound(tSpDisp.strSpDisp(j).strDat)
      vWriteData(nRowCnt, 0) = tSpDisp.strSpDisp(j).strDat(k): nRowCnt = nRowCnt + 1
    Next k
    nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; End of data for load case [" & sName & "] -------------------------": nRowCnt = nRowCnt + 2
  Next i
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_SPDISP_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_SPDISP_COL)).Value = vWriteData
  
  ' *BEAMLOAD
  ReDim vWriteData(tBeamLoad.dicName.Count * 11 + tBeamLoad.nNum, 0) ' 二次元配列でないとダメ！
  nRowCnt = 0
  
  For i = 0 To tBeamLoad.dicName.Count - 1
    sName = tBeamLoad.dicName.Keys(i)
    vWriteData(nRowCnt, 0) = "*USE-STLD, " & sName: nRowCnt = nRowCnt + 2
    
    For k = 0 To UBound(tBeamLoad.strMCTComment)
      vWriteData(nRowCnt, 0) = tBeamLoad.strMCTComment(k): nRowCnt = nRowCnt + 1
    Next k
    
    j = tBeamLoad.dicName(sName)
    For k = 0 To UBound(tBeamLoad.strBeamLoad(j).strDat)
      vWriteData(nRowCnt, 0) = tBeamLoad.strBeamLoad(j).strDat(k): nRowCnt = nRowCnt + 1
    Next k
    nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; End of data for load case [" & sName & "] -------------------------": nRowCnt = nRowCnt + 2
  Next i
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_BEAMLOAD_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_BEAMLOAD_COL)).Value = vWriteData
  
  ' *ELTEMPER
  ReDim vWriteData(tElTemper.dicName.Count * 7 + tElTemper.nNum, 0) ' 二次元配列でないとダメ！
  nRowCnt = 0
  
  For i = 0 To tElTemper.dicName.Count - 1
    sName = tElTemper.dicName.Keys(i)
    vWriteData(nRowCnt, 0) = "*USE-STLD, " & sName: nRowCnt = nRowCnt + 2
    vWriteData(nRowCnt, 0) = tElTemper.strMCTComment(0): nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = tElTemper.strMCTComment(1): nRowCnt = nRowCnt + 1
    
    j = tElTemper.dicName(sName)
    For k = 0 To UBound(tElTemper.strElTemper(j).strDat)
      vWriteData(nRowCnt, 0) = tElTemper.strElTemper(j).strDat(k): nRowCnt = nRowCnt + 1
    Next k
    nRowCnt = nRowCnt + 1
    vWriteData(nRowCnt, 0) = "; End of data for load case [" & sName & "] -------------------------": nRowCnt = nRowCnt + 2
  Next i
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_ELTEMPER_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_ELTEMPER_COL)).Value = vWriteData
 
  m_ChangeBook.Sheets(strName).Cells(nReadSTRow - 1, 6).ColumnWidth = 70
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)
  
End Sub

Private Function CalcVecter(strData() As String, nCnt As Long, Optional ByVal nValueCol As Long = 5, Optional ByRef strFlag As String) As String
  
If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long
  Dim vBuf(2) As Variant
  Dim dAlpha As Double, dBeta As Double, dBasVect As Double
  Dim strLoad As String, strNoData As String
  Dim vFlagBuf() As Variant
  vFlagBuf = Array(0, 0, 0)
  
  vBuf(0) = CDbl(strData(14, nCnt))
  vBuf(1) = CDbl(strData(15, nCnt))
  vBuf(2) = CDbl(strData(16, nCnt))
  
  If strData(12, nCnt) = "球座標指定" Then
    dAlpha = CDbl(strData(17, nCnt))
    dBeta = CDbl(strData(18, nCnt))
    
    vBuf(0) = Cos(dBeta) * Cos(dAlpha)
    vBuf(1) = Cos(dBeta) * Sin(dAlpha)
    vBuf(2) = Sin(dBeta)
  End If
  
  dBasVect = Sqr(vBuf(0) * vBuf(0) + vBuf(1) * vBuf(1) + vBuf(2) * vBuf(2))
  
  strFlag = ""
  For i = 0 To 2
    vBuf(i) = vBuf(i) / dBasVect
    vBuf(i) = vBuf(i) * CDbl(strData(nValueCol, nCnt))
    If Abs(vBuf(i)) > 0 Then vFlagBuf(i) = 1
  Next i

  strNoData = "0.0, 0.0, 0.0"
  If strData(14, nCnt) = "モーメント" Then
    strLoad = strNoData & "," & vBuf(0) & "," & -1# * vBuf(2) & "," & vBuf(1)
    strFlag = "000" & vFlagBuf(0) & vFlagBuf(2) & vFlagBuf(1)
  Else
    strLoad = vBuf(0) & "," & -1# * vBuf(2) & "," & vBuf(1) & "," & strNoData
    strFlag = vFlagBuf(0) & vFlagBuf(2) & vFlagBuf(1) & "000"
  End If
  
  CalcVecter = strLoad

End Function

Private Sub SetConLoad(tConLoad As tConLoadType, strData() As String, nCnt As Long)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' *CONLOAD
  Dim i As Long, j As Long
  Dim strLoad As String
  If tConLoad.dicName.Exists(strData(2, nCnt)) Then
    i = tConLoad.dicName(strData(2, nCnt))
    j = UBound(tConLoad.strConLoad(i).strDat) + 1
  Else
    i = tConLoad.dicName.Count
    tConLoad.dicName.Add strData(2, nCnt), i
    ReDim Preserve tConLoad.strConLoad(i)
    j = 0
  End If
  
  tConLoad.nNum = tConLoad.nNum + 1
  strLoad = CalcVecter(strData, nCnt)
  strLoad = strLoad & ",,"
  
  ReDim Preserve tConLoad.strConLoad(i).strDat(j)
  Dim strNode As String
  strNode = GetStringGen(strData(4, nCnt))
    
  tConLoad.strConLoad(i).strDat(j) = strNode & "," & strLoad

End Sub

Private Sub SetSpDisp(tSpDisp As tSpDispType, strData() As String, nCnt As Long)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' *SPDISP
  Dim i As Long, j As Long, k As Long
  If tSpDisp.dicName.Exists(strData(2, nCnt)) Then
    i = tSpDisp.dicName(strData(2, nCnt))
    j = UBound(tSpDisp.strSpDisp(i).strDat) + 1
  Else
    i = tSpDisp.dicName.Count
    tSpDisp.dicName.Add strData(2, nCnt), i
    ReDim Preserve tSpDisp.strSpDisp(i)
    j = 0
  End If
  
  tSpDisp.nNum = tSpDisp.nNum + 1
  Dim dicVecterType As Dictionary
  Set dicVecterType = New Dictionary
  
  dicVecterType.Add "並進荷重全体 X", 0
  dicVecterType.Add "並進荷重全体 Y", 1
  dicVecterType.Add "並進荷重全体 Z", 2
  dicVecterType.Add "モーメント全体 X", 3
  dicVecterType.Add "モーメント全体 Y", 4
  dicVecterType.Add "モーメント全体 Z", 5
  
  Dim vVect As Variant
  vVect = Array(0, 0, 0, 0, 0, 0)
  
  Dim strVecterType As String
  strVecterType = strData(13, nCnt)
  
  Dim strFlag As String: strFlag = ""
  Dim strBuf(5) As String
  Dim strLoad As String
  Dim vBuf(2) As Double         ', dDx As Double, dDy As Double, dDz As Double, cos_b As Double
  Dim dAlpha As Double, dBeta As Double, dBasVect As Double
  
  If strVecterType = "ベクトル指定" Or strVecterType = "球座標指定" Then
     strLoad = CalcVecter(strData, nCnt, 5, strFlag)
     strLoad = strLoad & ","
  Else
    vVect(dicVecterType(strData(3, nCnt) & strVecterType)) = 1
    
    For k = 0 To UBound(vVect)
      strFlag = strFlag & CStr(vVect(k))
    Next k
    
    strLoad = ""
    For k = 0 To 5
      strBuf(k) = vVect(k) * strData(5, nCnt)
      strLoad = strLoad & strBuf(k) & ","
    Next k
    
  End If
  
  ReDim Preserve tSpDisp.strSpDisp(i).strDat(j)
  Dim strNode As String
  strNode = GetStringGen(strData(4, nCnt))
  
  tSpDisp.strSpDisp(i).strDat(j) = strNode & "," & strFlag & "," & strLoad

End Sub

Private Function GetECCEN(vDir As Variant, vElem As Variant, vEccentricity As Variant) As String
  
If m_ResumeNext Then
  On Error Resume Next
End If

  Dim strRet As String
  Dim strEccDir As String: strEccDir = ""
  
  If vEccentricity = 0# Or Len(vEccentricity) = 0 Then
    strRet = "NO,,,,"
  Else
    Select Case vDir
      Case "GX"
        ' 全体 X
        If (m_ElemAngle(vElem)(0) = 0# And m_ElemAngle(vElem)(1) = 0) Or (m_ElemAngle(vElem)(0) <> 0# And m_ElemAngle(vElem)(1) = 1) Then
          strEccDir = "LY"
        Else
          strEccDir = "LZ"
        End If
      Case "GZ"
        ' 全体 Y
        If m_ElemAngle(vElem)(1) = 1 Then
          If m_ElemAngle(vElem)(0) = 0# Then
            strEccDir = "LY"
          Else
            strEccDir = "LZ"
          End If
        End If
      Case "GY"
        ' 全体 Z
        If (m_ElemAngle(vElem)(0) = 0# And m_ElemAngle(vElem)(1) = 0) Or (m_ElemAngle(vElem)(0) = 0# And m_ElemAngle(vElem)(1) = 1) Then
          strEccDir = "LZ"
        Else
          strEccDir = "LY"
        End If
      Case "LY", "LZ"
        strEccDir = vDir
    End Select
    
    strRet = "YES,0," & strEccDir & "," & vEccentricity & "," & vEccentricity & ",NO"
  End If
  
  GetECCEN = strRet
  
End Function

Private Function dist(vNode1 As Variant, vNode2 As Variant) As Double

  Dim vBuf1 As Variant, vBuf2 As Variant
  vBuf1 = Split(m_DicOrgNode(vNode1), "_")
  vBuf2 = Split(m_DicOrgNode(vNode2), "_")
  
  dist = Sqr((vBuf1(0) - vBuf2(0)) ^ 2 + (vBuf1(1) - vBuf2(1)) ^ 2 + (vBuf1(2) - vBuf2(2)) ^ 2)

End Function

Private Function SortElem(ByRef vElemNode() As ElemNodeType, vElem As Variant) As Double
  
  Dim i As Long, j As Long
  Dim vTmp As Variant
  Dim dAll As Double
  dAll = 0
  For i = 0 To UBound(vElem)
    vElemNode(i).vElem = vElem(i)
    vElemNode(i).vNode_I = m_ElemNode(vElem(i))(0)
    vElemNode(i).vNode_J = m_ElemNode(vElem(i))(1)
    
    vElemNode(i).dLength = dist(vElemNode(i).vNode_I, vElemNode(i).vNode_J)
    dAll = dAll + vElemNode(i).dLength
  Next i
  
  Dim nStart As Long, nEnd As Long
  nStart = 0: nEnd = 0
  For i = 0 To UBound(vElemNode) - 1
      
    For j = i + 1 To UBound(vElemNode)
      If vElemNode(i).vNode_I = vElemNode(j).vNode_J Then
        vElemNode(i).vElem_I = j
        vElemNode(j).vElem_J = i
      End If
      If vElemNode(i).vNode_J = vElemNode(j).vNode_I Then
        vElemNode(i).vElem_J = j
        vElemNode(j).vElem_I = i
      End If
    Next j
    
    If IsEmpty(vElemNode(i).vElem_I) Then nStart = i
    If IsEmpty(vElemNode(i).vElem_J) Then nEnd = i
    
  Next i
  
  Dim bFlg As Boolean
  bFlg = True
    
  i = 0
  j = nStart
  For i = 0 To UBound(vElemNode)
    vElem(i) = vElemNode(j).vElem
    j = vElemNode(j).vElem_J
  Next i
  
  Dim vElemNodeBuf As ElemNodeType
  
  For i = 0 To UBound(vElem) - 1
    For j = i + 1 To UBound(vElem)
      If vElem(i) = vElemNode(j).vElem Then
        
        vElemNodeBuf = vElemNode(j)
        vElemNode(j) = vElemNode(i)
        vElemNode(i) = vElemNodeBuf
      
      End If
    Next j
  Next i
  
  SortElem = dAll

End Function

Private Sub SetBeamLoad(tBeamLoad As tBeamLoadType, strData() As String, nCnt As Long, nType As Long)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' *BEAMLOAD
  ' nType:フレーム要素-集中荷重=3,フレーム要素-分布荷重(単独)=4,フレーム要素-分布荷重(連続)=5,フレーム要素-射影長荷重=6
  Dim i As Long, j As Long, k As Long, n As Long
  If tBeamLoad.dicName.Exists(strData(2, nCnt)) Then
    i = tBeamLoad.dicName(strData(2, nCnt))
    j = UBound(tBeamLoad.strBeamLoad(i).strDat) + 1
  Else
    i = tBeamLoad.dicName.Count
    tBeamLoad.dicName.Add strData(2, nCnt), i
    ReDim Preserve tBeamLoad.strBeamLoad(i)
    j = 0
  End If
  
  Dim strCMD As String: strCMD = ",BEAM,"
  Dim strPROJ As String: strPROJ = ",NO,"
  Dim strType As String
  Dim dicAction As Dictionary
  Dim nAction As Long
  Dim vType As Variant
  Dim dicDir As Dictionary
  Dim strDir As String
  
  Set dicAction = New Dictionary
  dicAction.Add "並進荷重", 0
  dicAction.Add "モーメント", 1
  vType = Array("UNILOAD,", "UNIMOMENT,")
  Set dicDir = New Dictionary
  
  dicDir.Add "全体 X", "GX"
  dicDir.Add "全体 Y", "GZ"
  dicDir.Add "全体 Z", "GY"
  dicDir.Add "要素 X", "LX"
  dicDir.Add "要素 Y", "LZ"
  dicDir.Add "要素 Z", "LY"
  
  Dim vLoadDir As Variant
  vLoadDir = dicDir.Items
  
  nAction = dicAction(strData(3, nCnt))
  
  If 4 < nType Then strCMD = ",LINE,"
  If nType = 6 Then strPROJ = ",YES,"
  
  If nType = 3 Then
    strType = "CONLOAD,"
    If nAction = 1 Then strType = "CONMOMENT,"
  Else
    strType = vType(nAction)
  End If
  
  Dim dP1() As Double, dP2() As Double, dBuf As Double
  Dim dBaseLoads(5) As Double, dLoads(5) As Double, dLen As Double
  Dim dVect1 As Double, dVct2 As Double
  Dim strLoad As String, strFlag As String, strECCEN As String
  Dim strValue As String
  Dim strAdd As String
  Dim vElem As Variant, vCoordLoad As Variant
  vElem = Split(strData(4, nCnt), ",")
  
  ReDim dP1(UBound(vElem))
  ReDim dP2(UBound(vElem))
'  dP1 = 0#
'  dP2 = 0#
  ' 初期値
  For k = 0 To UBound(vElem)
    dP1(k) = 0#
    dP2(k) = 0#
  Next k
  
  Dim dAll As Double
  Dim vElemNode() As ElemNodeType
  ReDim vElemNode(UBound(vElem))
  dAll = SortElem(vElemNode, vElem)
  
  If IsNumeric(strData(5, nCnt)) And IsNumeric(strData(6, nCnt)) Then
    If CDbl(strData(5, nCnt)) = 0 Then
      If Not CDbl(strData(6, nCnt)) = 0 Then
        ' 三角形
          
        Dim dBaseLoad As Double, dLoad As Double
        dLoad = 0#
        If dicDir.Exists(strData(13, nCnt)) Then
          ' 座標系指定
          dBaseLoad = CDbl(strData(6, nCnt)) / dAll
          
          For k = 0 To UBound(vElemNode)
            dP1(k) = dLoad * dBaseLoad
            dLoad = dLoad + vElemNode(k).dLength
            dP2(k) = dLoad * dBaseLoad
          
          Next k
        Else
          ' ベクトル指定
          strLoad = CalcVecter(strData, nCnt, 6, strFlag)
          vCoordLoad = Split(strLoad, ",")
          
          For k = 0 To 5
            dLoads(k) = 0#
            dBaseLoads(k) = vCoordLoad(k) / dAll
          Next k
          
        End If
      End If
    Else
      For k = 0 To UBound(vElemNode)
        dP1(k) = CDbl(strData(5, nCnt))
        dP2(k) = CDbl(strData(6, nCnt))
      Next k
    
    End If
  Else
    If IsNumeric(strData(5, nCnt)) Then For k = 0 To UBound(vElem): dP1(k) = CDbl(strData(5, nCnt)): Next k
    If IsNumeric(strData(6, nCnt)) Then For k = 0 To UBound(vElem): dP2(k) = CDbl(strData(6, nCnt)): Next k
  End If
  
'  If IsNumeric(strData(5, nCnt)) Then dP1 = CDbl(strData(5, nCnt))
'  If IsNumeric(strData(6, nCnt)) Then dP2 = CDbl(strData(6, nCnt))
  
  strAdd = ", 0, 0, 0, 0,, NO, 0, 0, NO,"
  
  dLen = 0#
  For k = 0 To UBound(vElemNode)
    strDir = ""
    If dicDir.Exists(strData(13, nCnt)) Then
      ' 座標系
    
      strDir = dicDir(strData(13, nCnt))
      
      strECCEN = GetECCEN(strDir, vElemNode(k).vElem, strData(11, nCnt))
      
      If strDir = "GY" Or strDir = "LY" Then
        dP1(k) = dP1(k) * -1#
        dP2(k) = dP2(k) * -1#
      End If
      
      strValue = ",0," & dP1(k) & ",1," & dP2(k)
      
      tBeamLoad.nNum = tBeamLoad.nNum + 1
      ReDim Preserve tBeamLoad.strBeamLoad(i).strDat(j)
      tBeamLoad.strBeamLoad(i).strDat(j) = m_ElemData(vElemNode(k).vElem) & strCMD & strType & strDir & strPROJ & strECCEN & strValue & strAdd
      j = j + 1
    Else
      'ベクトル
'      strLoad = CalcVecter(strData, nCnt, 5, strFlag)
'      vDir = Split(strLoad, ",")
          
     dLen = vElemNode(k).dLength

      For n = 0 To Len(strFlag) - 1

        If Mid(strFlag, n + 1, 1) = 1 Then

          dVect1 = dLoads(n) * dBaseLoads(n)
          dLoads(n) = dLoads(n) + dLen
          dVect2 = dLoads(n) * dBaseLoads(n)

          strValue = ",0," & dVect1 & ",1," & dVect2

          strDir = vLoadDir(n)
          strECCEN = GetECCEN(strDir, vElemNode(k).vElem, strData(11, nCnt))

          tBeamLoad.nNum = tBeamLoad.nNum + 1
          ReDim Preserve tBeamLoad.strBeamLoad(i).strDat(j)
          tBeamLoad.strBeamLoad(i).strDat(j) = m_ElemData(vElemNode(k).vElem) & strCMD & strType & strDir & strPROJ & strECCEN & strValue & strAdd
          j = j + 1
        End If
      Next n
    End If
  Next k

End Sub

Private Sub SetElTemper(tElTemper As tElTemperType, strData() As String, nCnt As Long)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' *ELTEMPER
  Dim i As Long, j As Long
  If tElTemper.dicName.Exists(strData(2, nCnt)) Then
    i = tElTemper.dicName(strData(2, nCnt))
    j = UBound(tElTemper.strElTemper(i).strDat) + 1
  Else
    i = tElTemper.dicName.Count
    tElTemper.dicName.Add strData(2, nCnt), i
    ReDim Preserve tElTemper.strElTemper(i)
    j = 0
  End If
  
  tElTemper.nNum = tElTemper.nNum + 1
  ReDim Preserve tElTemper.strElTemper(i).strDat(j)
  Dim strElem As String
  strElem = GetStringGen(strData(4, nCnt))
    
  tElTemper.strElTemper(i).strDat(j) = strElem & "," & strData(5, nCnt) & ","

End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_Load
End Sub
