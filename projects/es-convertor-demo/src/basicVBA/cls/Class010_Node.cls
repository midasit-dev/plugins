VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class010_Node"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 6

Public strName As String
Private strData() As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Sub GetNode(dicDblNode_Z As Dictionary)

  Dim nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    MsgBox "節点座標がありません。"
    End
  End If
  
  Dim i As Long
  Dim vBuf As Variant
  For i = 0 To UBound(strData, 2)
    vBuf = Array(strData(1, i) & "_" & strData(3, i), strData(2, i))
    dicDblNode_Z.Add strData(0, i), vBuf
  Next i
  
End Sub

Public Sub ChangeNode(dicDblPnt As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If
  
  ' 節点座標
  Dim i As Long
'  Dim nCnt As Long
'  Dim strData() As String
'  ReDim strData(nReadEDCol - nReadSTCol, 0)
'  Dim NewSheet As Worksheet
'  Set NewSheet = AddSheet(strName)
'
'  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
'  If nCnt < 0 Then
'    NewSheet.Delete
'    MsgBox "節点座標がありません。"
'    End
'  End If
  
  Dim dicNodeData As Dictionary
  Set dicNodeData = New Dictionary
  
  Set m_DicOrgNode = New Dictionary
  
  Dim nMax As Long, j As Long
  nMax = 0
  
  Dim s As String, strBuf As String
  ' 最大番号検出
  For i = 0 To UBound(strData, 2)
    
    strBuf = strData(1, i) & "_" & strData(2, i) & "_" & strData(3, i)
    m_DicOrgNode.Add strData(0, i), strBuf
    
    If IsNumeric(strData(0, i)) Then
      If nMax < strData(0, i) Then nMax = strData(0, i)
    End If
    If Len(strData(0, i)) > 0 Then m_NodeData.Add strData(0, i), strData(0, i)
  Next i
  
  Set m_dicESNode = New Dictionary  ' Engineer Studio のノード
  
  Dim bFlg As Boolean
  
  Dim BufP(2) As Double
  ' Node データ作成
  nMax = nMax + 1
  For i = 0 To m_NodeData.Count - 1
    If Not IsNumeric(m_NodeData.Keys(i)) Then
      m_NodeData(m_NodeData.Keys(i)) = nMax
      nMax = nMax + 1
    End If
    
    BufP(0) = CDbl(strData(1, i))
    BufP(1) = -1# * CDbl(strData(3, i))
    BufP(2) = CDbl(strData(2, i))
    
'    If dicDblPntReSet.Exists(strData(0, i)) Then strData(2, i) = strData(2, i) + dicDblPntReSet(strData(0, i))
    
    m_dicESNode.Add CLng(m_NodeData(m_NodeData.Keys(i))), BufP
    
    s = strData(1, i) & "-" & strData(2, i) & "-" & strData(3, i)
    bFlg = True
    While dicNodeData.Exists(s) And bFlg
      If dicDblPnt.Exists(strData(0, i)) Then
        strData(2, i) = strData(2, i) - 0.001
        s = strData(1, i) & "-" & strData(2, i) & "-" & strData(3, i)
      Else
        bFlg = False
      End If
    Wend
    While Not dicNodeData.Exists(s)
      dicNodeData.Add s, True
    Wend
  Next i
  
  Dim vWriteData() As String
  ReDim vWriteData(m_NodeData.Count - 1 + 2, 0)   ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*NODE    ; Nodes": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iNO, X, Y, Z": nRowCnt = nRowCnt + 1
    
  For i = 0 To m_NodeData.Count - 1
    
    vWriteData(nRowCnt, 0) = m_NodeData(strData(0, i)) & "," & strData(1, i) & "," & -1# * strData(3, i) & "," & strData(2, i)
    nRowCnt = nRowCnt + 1
  Next i
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_NODE_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_NODE_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)
  
End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_Node
End Sub
