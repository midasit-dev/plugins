VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class110_ElemSpring"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 9

Public m_ElemSprData As Dictionary
Public m_ElemSprProp As Dictionary

Public strName As String

Private dicAngleType As Dictionary
Private dicChangeVecter As Dictionary
Private dicChangeAngle_X As Dictionary
Private dicChangeAngle_Y As Dictionary
Private dicChangeAngle_Z As Dictionary
Private dicAngleType2 As Dictionary
Private dicComponent As Dictionary

'Private Enum CoordSys
'  Dx = 1
'  Dy
'  Dz
'  Rx
'  Ry
'  Rz
'End Enum
Private Const Dx = 1
Private Const Dy = 2
Private Const Dz = 3
Private Const Rx = 4
Private Const Ry = 5
Private Const Rz = 6

Private SpgZ As SpgAngle
Private Spg As SpgAngle
'Private SpgZ.vDefault  As Variant
'Private SpgZ.vRed As Variant
'Private SpgZ.vPink As Variant
'Private SpgZ.vGreen  As Variant
'Private SpgZ.vBlue As Variant
'Private SpgZ.vPurple As Variant
'Private SpgZ.vBrown As Variant

Private nSprgDataCnt As Long
Private strData() As String

Public Function GetSpringElem(dicDblPnt As Dictionary) As Long
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  nSprgDataCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nSprgDataCnt < 0 Then
    NewSheet.Delete
    Exit Function
  End If
  
  Dim strRefElem As String: strRefElem = "参照要素"
  
  Dim i As Long, j As Long
  For i = 0 To UBound(strData, 2)
    
    If Left(strData(4, i), Len(strRefElem)) = strRefElem Then
      If Not dicDblPnt.Exists(strData(1, i)) Then dicDblPnt.Add strData(1, i), strData(2, i)
      If Not dicDblPnt.Exists(strData(2, i)) Then dicDblPnt.Add strData(2, i), strData(1, i)
    End If
  Next i
  
End Function

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
End Sub

Public Sub ChangeElemSpring(ByRef dicSPG6Comp As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' ばね要素
  Dim i As Long, j As Long, k As Long
  Set m_ElemSprData = New Dictionary
  Set m_ElemSprProp = New Dictionary
  Set m_dicSpgRef = New Dictionary
  
  Dim nMax As Long
  nMax = 0
  
  ' 最大検出
  For i = 0 To UBound(strData, 2)
    If IsNumeric(strData(0, i)) Then
      If nMax < strData(0, i) Then nMax = strData(0, i)
    End If
    If Len(strData(0, i)) > 0 Then m_ElemSprData.Add strData(0, i), strData(0, i)
  Next i
  
  ' 要素名から要素番号作成
  nMax = nMax + 1
  For i = 0 To m_ElemSprData.Count - 1
    If Not IsNumeric(m_ElemSprData.Keys(i)) Then
      m_ElemSprData(m_ElemSprData.Keys(i)) = nMax
      nMax = nMax + 1
    End If
  Next i
  
  Dim s As String
  ' ばね特性を使用している要素番号を集める
  For i = 0 To UBound(strData, 2)
    
    If m_ElemSprProp.Exists(strData(3, i)) Then
      s = m_ElemSprProp(strData(3, i))
      s = s & "," & m_ElemSprData(strData(0, i))
      m_ElemSprProp(strData(3, i)) = s
    Else
      m_ElemSprProp(strData(3, i)) = m_ElemSprData(strData(0, i))
    End If
  Next i
  
  Dim vWriteData() As String
  ReDim vWriteData(nSprgDataCnt + 5, 0)  ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0

  ' コメント
  vWriteData(nRowCnt, 0) = "*NL-LINK  ; General Link": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, ANGLE-x, ANGLE-y, ANGLE-z, GROUP": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, P0X, P0Y, P0Z, P1X, P1Y, P1Z, P2X, P2Y, P2Z, GROUP": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, V1X, V1Y, V1Z, V2X, V2Y, V2Z, GROUP": nRowCnt = nRowCnt + 1
  
  Dim strBuf() As String
  Dim vBuf As Variant
  Dim str6Comp As String
  Dim n1 As Long, n2 As Long
  Dim strAngle As String
  
  Set dicComponent = New Dictionary
  Dim vCoordSys As Variant
  vCoordSys = Array("参照要素", "ベクトル:""v1=Global", "ベクトル:""v1=X=")
  
  For j = 0 To nSprgDataCnt
    
    str6Comp = strData(3, j)
    strAngle = CalcAngle(strData(1, j), strData(2, j), strData(3, j), strData(4, j), dicSPG6Comp, vCoordSys)
    n1 = m_NodeData(strData(1, j))
    n2 = m_NodeData(strData(2, j))
    
    ReDim strBuf(14)
    i = 0
    strBuf(i) = m_ElemSprData(strData(0, j)): i = i + 1
    strBuf(i) = n1: i = i + 1
    strBuf(i) = n2: i = i + 1
    strBuf(i) = ChgCamma(strData(3, j)): i = i + 1
    
    If dicSPG6Comp.Exists(str6Comp) Then
      strBuf(i) = "NL_" & strData(3, j)
    End If
    i = i + 1
    
    vBuf = Split(strAngle, ",")
    For k = 0 To UBound(vBuf)
      strBuf(i) = vBuf(k): i = i + 1     ' β角度
    Next k
    strBuf(i) = ""
    
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
    
    nRowCnt = nRowCnt + 1
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_ELMSPRING_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_ELMSPRING_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)

End Sub

Private Function CalcAngle(ByRef strN1 As String, _
                           ByRef strN2 As String, _
                           strName As String, _
                           strCoordSys As String, _
                           dicSPG6Comp As Dictionary, _
                           ByRef vCoordSys As Variant) As String

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim strAngle As String
  Dim strBuf As String, strBuf2 As String
  Dim vBuf As Variant
'  vCoordSys = Array("参照要素", "ベクトル:""v1=Global", "ベクトル:""v1=X=")
  
  Dim nNodicComponent As Long: nNodicComponent = -1
  Dim i As Long, k As Long, n As Long
  Dim s As String, strSprPnt As String
  
  Dim n1 As Long, n2 As Long
  n1 = m_NodeData(strN1)
  n2 = m_NodeData(strN2)
  
  strSprPnt = "_NotSame"
  If m_DicOrgNode(strN1) = m_DicOrgNode(strN2) Then
    ' 2重節点
    strSprPnt = "_Same"
  End If
  
  If dicComponent.Exists(strName) Then
    ' 既存。strCoordSys をチェック
    If dicComponent(strName) <> strCoordSys & strSprPnt Then
      ' 座標系の違うもの。
      i = 1
      s = "~" & i
      While m_dicSprProp.Exists(strName & s)
        i = i + 1
        s = "~" & i
      Wend
      
      n = UBound(m_SprComp) + 1
      m_dicSprProp.Add (strName & s), n
      ReDim Preserve m_SprCompORG(n)
      ReDim Preserve m_SprComp(n)
      
      m_SprComp(n).vAngle = Array(Dx, Dz, -Dy, Rx, Rz, -Ry)
      k = m_dicSprProp(strName)
      m_SprCompORG(n) = m_SprCompORG(k)
      m_SprComp(n) = m_SprCompORG(k)
      
      If dicSPG6Comp.Exists(strName) Then dicSPG6Comp.Add strName & s, dicSPG6Comp(strName)
      
      strName = strName & s
      
      If Not dicComponent.Exists(strName) Then
        dicComponent.Add strName, strCoordSys & strSprPnt
        nNodicComponent = m_dicSprProp(strName)
      End If
    End If
  Else
    dicComponent.Add strName, strCoordSys & strSprPnt
    nNodicComponent = m_dicSprProp(strName)
  End If
  
  If Left(strCoordSys, Len(vCoordSys(0))) = vCoordSys(0) Then
    ' 参照要素
    m_dicSpgRef.Add strName, True
    vBuf = Split(strCoordSys, ":")
    If UBound(vBuf) = 1 Then
      strAngle = "0," & m_ElemAngle(vBuf(1))(0)
    End If
  Else
    strAngle = "1,2,"
    strAngle = strAngle & Split_CoordSys(strCoordSys)
    n = m_dicSprProp(strName)
    m_SprComp(n).vAngle = Array(Dx, Dy, Dz, Rx, Ry, Rz)
  End If
  
  CalcAngle = strAngle
  
End Function

Private Function Change_Global(vData As Variant) As Variant
  
  Dim vRet As Variant
  If InStr(vData, "GlobalX") > 0 Then vRet = Array(1, 0, 0)
  If InStr(vData, "GlobalY") > 0 Then vRet = Array(0, 1, 0)
  If InStr(vData, "GlobalZ") > 0 Then vRet = Array(0, 0, 1)
  
  Change_Global = vRet
  
End Function
Private Function Change_Alpha(vData As Variant) As Variant
  
  Dim vRet As Variant, vBuf As Variant, vAlpha As Variant, vBeta As Variant
  
  vBuf = Split(vData, ",")
  
  If UBound(vBuf) > 0 Then
    vAlpha = Split(vBuf(0), "=")
    vBeta = Split(vBuf(1), "=")
  End If
  
  If UBound(vAlpha) = 2 And UBound(vBeta) = 1 Then
    vAlpha = vAlpha(2)
    vBeta = vBeta(1)
    vRet = Array(Cos(vBeta) * Cos(vAlpha), Cos(vBeta) * Sin(vAlpha), Sin(vBeta))
  End If
  
  Change_Alpha = vRet
  
End Function
Private Function Change_Vect(vData As Variant) As Variant
  
  Dim vRet(2) As Variant, vBuf As Variant, vX As Variant, vY As Variant, vZ As Variant
  
  vBuf = Split(vData, ",")
  
  If UBound(vBuf) > 1 Then
    vX = Split(vBuf(0), "=")
    vY = Split(vBuf(1), "=")
    vZ = Split(vBuf(2), "=")
  End If
  If UBound(vX) > 1 Then vRet(0) = vX(2)
  If UBound(vY) > 0 Then vRet(1) = vY(1)
  If UBound(vZ) > 0 Then vRet(2) = vZ(1)
  
  Change_Vect = vRet
  
End Function
Private Function Calc_Vecter(v1 As Variant, v2 As Variant) As String

  Dim i As Long
  Dim dVect As Double
  Dim vRet As Variant
  
  dVect = Sqr(v1(0) * v1(0) + v1(1) * v1(1) + v1(2) * v1(2))
  If dVect <> 0# Then
    For i = 0 To 2
      v1(i) = v1(i) / dVect
    Next i
  End If
  
  dVect = Sqr(v2(0) * v2(0) + v2(1) * v2(1) + v2(2) * v2(2))
  If dVect <> 0# Then
    For i = 0 To 2
      v2(i) = v2(i) / dVect
    Next i
  End If
  
  vRet = Array(v2(1) * -v1(2) - v1(1) * -v2(2), v2(2) * -v1(0) - v1(2) * -v2(2), v2(0) * v1(1) - v1(0) * -v2(1))
  Calc_Vecter = vRet(0) & "," & -vRet(2) & "," & vRet(1)
  
End Function


Private Function Split_CoordSys(strCoordSys) As String
      
  Dim i As Long, j As Long
  Dim vBuf As Variant, vAlBt As Variant
  Dim strBuf As String, strRet As String
  strRet = ""
  
  Dim strAlpha As String: strAlpha = "Alpha"
'  Dim strBuf_Alpha As String
  Dim strGlobal As String: strGlobal = "Global"
  Dim strBuf_Global As String
 
  Dim vCoordSys As Variant
  vCoordSys = Array("v1=Global", "v2=Global", "v1=X=", "v2=X=", "v1=Alpha=", "v2=Alpha=", "Beta=")
  
  vBuf = Split(Replace(strCoordSys, " ", ""), ":")
  If UBound(vBuf) = 1 Then
    strBuf = vBuf(1)
    
    strBuf_Global = Replace(strBuf, strGlobal, "")
    If Len(strBuf_Global) + Len(strGlobal) * 2 = Len(strBuf) Then
      ' v1="Global" & v2="Global"
      For i = 0 To 3
        strBuf = Replace(strBuf, vCoordSys(i), "")
      Next i
      strBuf = Replace(strBuf, "Align=", "")
      strBuf = Replace(strBuf, "Axis=", "")
      strBuf = Replace(strBuf, """", "")
        
      If dicChangeVecter.Exists(strBuf) Then
        strRet = dicChangeVecter(strBuf)
      End If
    Else
      vBuf = Split(strBuf, """")
      vBuf(0) = vBuf(1)
      vBuf(1) = vBuf(3)
      vBuf(2) = Right(vBuf(4), Len(vBuf(4)) - 1)
    
      vBuf(2) = Replace(vBuf(2), "Align=", "")
      vBuf(2) = Replace(vBuf(2), "Axis=", "")
      
      Dim vVect(1) As Variant
      For i = 0 To 1
        If InStr(vBuf(i), strGlobal) > 0 Then
          vVect(i) = Change_Global(vBuf(i))
        ElseIf InStr(vBuf(i), strAlpha) > 0 Then
          vVect(i) = Change_Alpha(vBuf(i))
        Else
          vVect(i) = Change_Vect(vBuf(i))
        End If
      Next i
    
      Select Case vBuf(2)
        Case "v1,xl", "v2,yl"
          strRet = vVect(0)(0) & ",-" & vVect(0)(2) & "," & vVect(0)(1) & "," & Calc_Vecter(vVect(0), vVect(1))
        Case "v1,yl", "v2,zl"
          strRet = Calc_Vecter(vVect(0), vVect(1)) & "," & vVect(1)(0) & ",-" & vVect(1)(2) & "," & vVect(1)(1)
        Case "v1,zl", "v2,xl"
          strRet = vVect(0)(0) & ",-" & vVect(0)(2) & "," & vVect(0)(1) & "," & vVect(1)(0) & ",-" & vVect(1)(2) & "," & vVect(1)(1)
      End Select
    End If
  End If
        
  Split_CoordSys = strRet

End Function

Private Sub Class_Initialize()
  strName = m_Sheet_ElmSpr
  
  Set dicAngleType = New Dictionary
  dicAngleType.Add "Y,X,v1,xl", 90
  dicAngleType.Add "X,Z,v1,yl", 90
  dicAngleType.Add "Z,Y,v1,zl", -90
  dicAngleType.Add "Z,Y,v2,xl", -90
  dicAngleType.Add "Y,X,v2,yl", 90
  dicAngleType.Add "X,Z,v2,zl", 90
  
  Set dicAngleType2 = New Dictionary
  dicAngleType2.Add "1,Y=0,Z=0", "X"
  dicAngleType2.Add "0,Y=1,Z=0", "Y"
  dicAngleType2.Add "0,Y=0,Z=1", "Z"
  dicAngleType2.Add "-1,Y=0,Z=0", "X"
  dicAngleType2.Add "0,Y=-1,Z=0", "Y"
  dicAngleType2.Add "0,Y=0,Z=-1", "Z"
  
  Dim strVect(20) As String
  strVect(0) = "1,0,0,0,-1,0"
  strVect(1) = "1,0,0,0,0,-1"
  strVect(2) = "0,0,1,1,0,0"
  strVect(3) = "0,0,1,0,1,0"
  strVect(4) = "0,-1,0,0,0,1"
  strVect(5) = "0,-1,0,-1,0,0"
  
  strVect(6) = "0,0,-1,0,-1,0"
  strVect(7) = "0,1,0,1,0,0"
  strVect(8) = "-1,0,0,0,0,1"
  strVect(9) = "0,-1,0,1,0,0"
  strVect(10) = "1,0,0,0,0,1"
  
  strVect(11) = "0,0,1,0,-1,0"
  
  Set dicChangeVecter = New Dictionary
  
  ' Align=v1,Axis=xl
  dicChangeVecter.Add "X,Y,v1,xl", strVect(0)
  dicChangeVecter.Add "X,Z,v1,xl", strVect(1)
  dicChangeVecter.Add "Y,Z,v1,xl", strVect(2)
  dicChangeVecter.Add "Y,X,v1,xl", strVect(3)
  dicChangeVecter.Add "Z,X,v1,xl", strVect(4)
  dicChangeVecter.Add "Z,Y,v1,xl", strVect(5)

  ' Align=v1,Axis=yl
  dicChangeVecter.Add "X,Y,v1,yl", strVect(4)
  dicChangeVecter.Add "X,Z,v1,yl", strVect(6)
  dicChangeVecter.Add "Y,Z,v1,yl", strVect(0)
  dicChangeVecter.Add "Y,X,v1,yl", strVect(7)
  dicChangeVecter.Add "Z,X,v1,yl", strVect(2)
  dicChangeVecter.Add "Z,Y,v1,yl", strVect(8)

  ' Align=v1,Axis=zl
  dicChangeVecter.Add "X,Y,v1,zl", strVect(2)
  dicChangeVecter.Add "X,Z,v1,zl", strVect(9)
  dicChangeVecter.Add "Y,Z,v1,zl", strVect(4)
  dicChangeVecter.Add "Y,X,v1,zl", strVect(10)
  dicChangeVecter.Add "Z,X,v1,zl", strVect(0)
  dicChangeVecter.Add "Z,Y,v1,zl", strVect(11)
  
  ' Align=v2,Axis=xl
  dicChangeVecter.Add "X,Y,v2,xl", strVect(2)
  dicChangeVecter.Add "X,Z,v2,xl", strVect(9)
  dicChangeVecter.Add "Y,Z,v2,xl", strVect(4)
  dicChangeVecter.Add "Y,X,v2,xl", strVect(10)
  dicChangeVecter.Add "Z,X,v2,xl", strVect(0)
  dicChangeVecter.Add "Z,Y,v2,xl", strVect(11)
  
  ' Align=v2,Axis=yl
  dicChangeVecter.Add "X,Y,v2,yl", strVect(0)
  dicChangeVecter.Add "X,Z,v2,yl", strVect(1)
  dicChangeVecter.Add "Y,Z,v2,yl", strVect(2)
  dicChangeVecter.Add "Y,X,v2,yl", strVect(3)
  dicChangeVecter.Add "Z,X,v2,yl", strVect(4)
  dicChangeVecter.Add "Z,Y,v2,yl", strVect(5)

  ' Align=v2,Axis=zl
  dicChangeVecter.Add "X,Y,v2,zl", strVect(4)
  dicChangeVecter.Add "X,Z,v2,zl", strVect(6)
  dicChangeVecter.Add "Y,Z,v2,zl", strVect(0)
  dicChangeVecter.Add "Y,X,v2,zl", strVect(7)
  dicChangeVecter.Add "Z,X,v2,zl", strVect(2)
  dicChangeVecter.Add "Z,Y,v2,zl", strVect(8)
  
End Sub
