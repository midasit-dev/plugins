VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class040_Rigid"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 4

Public strName As String
Private nCnt As Long
Private strData() As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
  With m_ThisWorkbook.Sheets(strName)
    .Range(.Cells(nReadSTRow, 4), .Cells(m_RowDataMax, 4)).NumberFormatLocal = "@"
  End With
End Sub

Public Sub ReadRigid(ByRef strRigidData() As String)

If m_ResumeNext Then
  On Error Resume Next
End If

  ' 剛体要素
  Dim i As Long, j As Long, k As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  strRigidData = strData

End Sub

Public Sub ChangeRigid()
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 剛体要素
  Dim i As Long, j As Long, k As Long
'  Dim nCnt As Long
'  Dim strData() As String
'  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
'  Dim NewSheet As Worksheet
'  Set NewSheet = AddSheet(strName)
'
'  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
'  If nCnt < 0 Then
'    NewSheet.Delete
'    Exit Sub
'  End If
  
  ' 要素
  Dim vWriteData() As String
  ReDim vWriteData(UBound(strData, 2) + 2, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  ' コメント
  vWriteData(nRowCnt, 0) = "*RIGIDLINK    ; Rigid Link": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; M-NODE, DOF, S-NODE LIST, GROUP": nRowCnt = nRowCnt + 1
  
  ' 節点
  Dim vWriteData2() As String
  ReDim vWriteData2(UBound(strData, 2) + 2, 0) ' 二次元配列でないとダメ！
  Dim nRow2Cnt As Long
  nRow2Cnt = 0
 ' コメント
  vWriteData2(nRow2Cnt, 0) = "*CONSTRAINT    ; Supports": nRow2Cnt = nRow2Cnt + 1
  vWriteData2(nRow2Cnt, 0) = "; NODE_LIST, CONST(Dx,Dy,Dz,Rx,Ry,Rz), GROUP": nRow2Cnt = nRow2Cnt + 1

  Dim strBuf() As String
  Dim vBuf As Variant
  For j = 0 To nCnt
    m_dicRigidElem.Add strData(0, j), strData(1, j)
    If Len(strData(2, j)) > 0 Then
    
      ReDim strBuf(3)
      i = 0
      strBuf(i) = m_NodeData(strData(1, j)): i = i + 1
      strBuf(i) = "111111": i = i + 1
      
      vBuf = Split(strData(2, j), ",")
      strBuf(i) = m_NodeData(vBuf(0))
      For k = 1 To UBound(vBuf)
        strBuf(i) = strBuf(i) & " " & m_NodeData(vBuf(k))
      Next k
      
      i = i + 1
      strBuf(i) = ""
      
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      
      nRowCnt = nRowCnt + 1
'    Else
'      m_dicRigidNode.Add strData(0, j), strData(1, j)
'      vWriteData2(nRow2Cnt, 0) = strData(1, j) & ",111111,": nRow2Cnt = nRow2Cnt + 1
    
    End If
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_RIGID_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_RIGID_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_RIGID_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_RIGID_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)


'm_RIGIDNODE_COL


End Sub
 
Private Sub Class_Initialize()
  strName = m_Sheet_Rigid
End Sub
