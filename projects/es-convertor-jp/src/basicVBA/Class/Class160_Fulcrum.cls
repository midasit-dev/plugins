VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class160_Fulcrum"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 13

Public m_ElemSprData As Dictionary
Private Const strSpring = "ばね"

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Sub ChangeFulcrum(ByRef dicSprType As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 支点
  Dim i As Long, j As Long, k As Long
  Set m_ElemSprData = New Dictionary

  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)
    
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  Dim dicFreeFixt As Dictionary
  Set dicFreeFixt = New Dictionary
  dicFreeFixt.Add "自由", 0
  dicFreeFixt.Add "固定", 1
  
  Dim vWriteData() As String
  ReDim vWriteData(nCnt + 2, m_nInterval)  ' 二次元配列でないとダメ！
  Dim nRowCnt(1) As Long
  nRowCnt(0) = 0
  nRowCnt(1) = 0

  ' コメント
  Dim nWriteType As Long
  
  nWriteType = 0
  vWriteData(nRowCnt(nWriteType), 0) = "*GSPRING    ; General Spring Supports": nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
  vWriteData(nRowCnt(nWriteType), 0) = "; NODE_LIST, TYPE-NAME, GROUP": nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
  
  nWriteType = 1
  vWriteData(nRowCnt(nWriteType), m_nInterval) = "*CONSTRAINT    ; Supports": nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
  vWriteData(nRowCnt(nWriteType), m_nInterval) = "; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP": nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
  
  Dim bOutput As Boolean
  Dim strBuf() As String
  Dim vBuf As Variant
  For j = 0 To nCnt
    bOutput = False
    For k = 3 To 8
      If strData(k, j) = strSpring Then
        bOutput = True
        Exit For
      End If
    Next k
    
    If bOutput Then
      dicSprType.Add strData(0, j), True
      nWriteType = 0
      ReDim strBuf(3)
      i = 0
      strBuf(i) = m_NodeData(strData(2, j)): i = i + 1
      strBuf(i) = strData(0, j): i = i + 1
      strBuf(i) = ""
      
      vWriteData(nRowCnt(nWriteType), 0) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt(nWriteType), 0) = vWriteData(nRowCnt(nWriteType), 0) & "," & strBuf(k)
      Next k
      
      nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
    Else
      dicSprType.Add strData(0, j), False
      nWriteType = 1
      ReDim strBuf(7)
      i = 0
      strBuf(i) = m_NodeData(strData(2, j)): i = i + 1
      
      strBuf(i) = dicFreeFixt(strData(3, j)) & _
                  dicFreeFixt(strData(5, j)) & _
                  dicFreeFixt(strData(4, j)) & _
                  dicFreeFixt(strData(6, j)) & _
                  dicFreeFixt(strData(8, j)) & _
                  dicFreeFixt(strData(7, j))
      i = i + 1
      strBuf(i) = ""
      
      vWriteData(nRowCnt(nWriteType), m_nInterval) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt(nWriteType), m_nInterval) = vWriteData(nRowCnt(nWriteType), m_nInterval) & "," & strBuf(k)
      Next k
      
      nRowCnt(nWriteType) = nRowCnt(nWriteType) + 1
    
    End If
  Next j
  
  If nRowCnt(0) = 2 Then
    vWriteData(0, 0) = ""
    vWriteData(1, 0) = ""
  End If
  If nRowCnt(1) = 2 Then
    vWriteData(0, m_nInterval) = ""
    vWriteData(1, m_nInterval) = ""
  End If
  
  Dim nDataCnt As Long
  nDataCnt = nRowCnt(0)
  If nDataCnt < nRowCnt(1) Then nDataCnt = nRowCnt(1)

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_FULCRUM_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nDataCnt - 1, m_FULCRUM_COL + m_nInterval)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)

End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_Fulcrum
End Sub
