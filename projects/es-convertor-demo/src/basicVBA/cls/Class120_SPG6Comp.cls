VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class120_SPG6Comp"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 15

Public strName As String
Private strData() As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
End Sub

Public Function GetHingeSPG6Comp(ByRef dicSPG6Comp As Dictionary)

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    GetHingeSPG6Comp = nCnt
    Exit Function
  End If
  
  Dim i As Long, j As Long
  Dim dicData As Dictionary
  Set dicData = New Dictionary
  
  dicData.Add "自由", ""
  dicData.Add "固定", ""
  dicData.Add "線形", ""
  dicData.Add "名古屋高速ゴム支承", "LITR"
  dicData.Add "バイリニア (対称)", "NBI"
  dicData.Add "バイリニア (非対称)", "NBI"
  dicData.Add "トリリニア (対称)", "KIN"
  dicData.Add "トリリニア (非対称)", "KIN"
  dicData.Add "テトラリニア (対称)", "TTE"
  dicData.Add "テトラリニア (非対称)", "TTE"
  dicData.Add "BMR(CD)ダンパー", "VISCOUS-OIL-DAMPER"

  Dim dicASymmetric As Dictionary
  Set dicASymmetric = New Dictionary
  
  ' 対称は 0、非対称は 1
  dicASymmetric.Add "名古屋高速ゴム支承", "0"
  dicASymmetric.Add "バイリニア (対称)", "0"
  dicASymmetric.Add "バイリニア (非対称)", 1
  dicASymmetric.Add "トリリニア (対称)", 0
  dicASymmetric.Add "トリリニア (非対称)", 1
  dicASymmetric.Add "テトラリニア (対称)", 0
  dicASymmetric.Add "テトラリニア (非対称)", 1
  dicASymmetric.Add "BMR(CD)ダンパー", ""

  Dim strHYST2 As String: strHYST2 = ""
  Dim strType(1) As String
  
  ReDim m_SprCompORG(nCnt)
  For i = 0 To nCnt
    m_dicSprProp.Add strData(0, i), i

    For j = 1 To 11 Step 2
      If Len(dicData(strData(j, i))) > 0 Then
        strType(0) = dicData(strData(j, i))
        strType(1) = dicASymmetric(strData(j, i))
        
        If strType(0) = "NBI" Then
          strType(0) = GetSPG6CompDetail(strData(j + 1, i), strHYST2)
        End If
        
        m_SprCompORG(i).SprCompData((j + 1) / 2).mct_HYST = strType(0)
        m_SprCompORG(i).SprCompData((j + 1) / 2).mct_HYST2 = strHYST2
        m_SprCompORG(i).SprCompData((j + 1) / 2).mct_iSYM = strType(1)
        If Not dicSPG6Comp.Exists(strData(0, i)) Then
          dicSPG6Comp.Add strData(0, i), strType
        End If
      End If
    Next j
  Next i

  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)
  GetHingeSPG6Comp = nCnt

End Function
Private Function GetSPG6CompDetail(ByVal strSPGDetail, ByRef strHYST2 As String) As String

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim strRet As String: strRet = "NBI"
  Dim dicDetail As Dictionary
  Set dicDetail = New Dictionary
  
  dicDetail.Add "正方向", "SLBT"
  dicDetail.Add "負方向", "SLBC"
  dicDetail.Add "正負方向", "NBI"
  dicDetail.Add "Gap/Hook", "SLBI"
  dicDetail.Add "Takeda", "TAK"
  dicDetail.Add "cloud/スリップ", "SLBI"
  
  If dicDetail.Exists(strSPGDetail) Then
    strRet = dicDetail(strSPGDetail)
    
    If strSPGDetail = "Gap/Hook" Then
      strHYST2 = ", 0.01, 0.02"
    End If
  End If
  
  GetSPG6CompDetail = strRet
  
End Function

'Public Sub ChangeSPG6Comp(ByRef mWS As Worksheet, ByRef clsElmSpr As Class110_ElemSpring)
'
'If m_ResumeNext Then
'  On Error Resume Next
'End If
'
'  ' ばね特性表_6成分概要
'  Dim i As Long, j As Long, k As Long
'  Dim nCnt As Long
'  ReDim strData(nReadEDCol - nReadSTCol, 0)
'
'  Dim NewSheet As Worksheet
'  Set NewSheet = AddSheet(strName)
'
'  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
'  If nCnt < 0 Then Exit Sub
'
'  Dim vWriteData() As String
'  ReDim vWriteData(nCnt + 2, 0)  ' 二次元配列でないとダメ！
'  Dim nRowCnt As Long
'  nRowCnt = 0
'
'  ' コメント
'  vWriteData(nRowCnt, 0) = "*GSPRING    ; General Spring Supports": nRowCnt = nRowCnt + 1
'  vWriteData(nRowCnt, 0) = "; NODE_LIST, TYPE-NAME, GROUP": nRowCnt = nRowCnt + 1
'
'  Dim strBuf() As String
'  Dim vBuf As Variant
'  For j = 0 To UBound(strData, 2)
'    ReDim strBuf(9)
'    i = 0
'    strBuf(i) = clsElmSpr.m_ElemSprData(strData(0, j)): i = i + 1
'    strBuf(i) = m_NodeData(strData(1, j)): i = i + 1
'    strBuf(i) = m_NodeData(strData(2, j)): i = i + 1
'    strBuf(i) = strData(3, j): i = i + 1
'    strBuf(i) = "": i = i + 1 '  & strData(3, j): i = i + 1
'    strBuf(i) = "1": i = i + 1
'    strBuf(i) = "90": i = i + 1      ' β角度。とりあえず 0
'    strBuf(i) = "0,0,0,"
'
'    vWriteData(nRowCnt, 0) = strBuf(0)
'    For k = 1 To i
'      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
'    Next k
'
'    nRowCnt = nRowCnt + 1
'  Next j
'
'End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_SPG6Comp
End Sub
