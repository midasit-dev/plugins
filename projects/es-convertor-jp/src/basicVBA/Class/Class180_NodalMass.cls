VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class180_NodalMass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 11

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
End Sub

Public Sub ChangeNodalMass()
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 節点質量
  Dim i As Long, j As Long, k As Long
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
  
  Dim vWriteData() As String
  ReDim vWriteData(nCnt + 1 + 2, 0)  ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  For j = 0 To nCnt
    For i = 4 To 9
      If Not IsNumeric(strData(i, j)) Then
        strData(i, j) = 0#
      End If
    Next i
  Next j
  ' コメント
  vWriteData(nRowCnt, 0) = "*NODALMASS    ; Nodal Masses": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ": nRowCnt = nRowCnt + 1
 
  Dim strBuf() As String
  Dim vBuf As Variant
  For j = 0 To nCnt
    ReDim strBuf(6)
    i = 0
    strBuf(i) = m_NodeData(strData(0, j)): i = i + 1
    strBuf(i) = strData(4, j): i = i + 1
    strBuf(i) = strData(6, j): i = i + 1
    strBuf(i) = strData(5, j): i = i + 1
    strBuf(i) = strData(7, j): i = i + 1
    strBuf(i) = strData(9, j): i = i + 1
    strBuf(i) = strData(8, j)
    
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k

    nRowCnt = nRowCnt + 1
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_NODALMASS_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_NODALMASS_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)

End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_NodalMass
End Sub
