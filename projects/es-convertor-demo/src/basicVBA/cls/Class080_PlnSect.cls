VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class080_PlnSect"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 7

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
  m_ThisWorkbook.Sheets(strName).Cells(nReadSTRow - 1, nReadEDCol - 1) = "厚さ：(m)"
  m_ThisWorkbook.Sheets(strName).Cells(nReadSTRow - 1, nReadEDCol - 0) = "材料"
End Sub

Public Sub ChangePlnSect(ByRef dicPlnSect As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 平面断面
  Dim i As Long, j As Long
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
  ReDim vWriteData(nCnt + 1, 0)   ' 二次元配列でないとダメ！
  Dim nRowCnt As Long:  nRowCnt = 0
  Dim strBuf(nReadEDCol - nReadSTCol) As String
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*THICKNESS    ; Thickness": nRowCnt = nRowCnt + 1
    
  For i = 0 To nCnt
    strBuf(0) = i + 1
    For j = 1 To nReadEDCol - nReadSTCol
      strBuf(j) = strData(j, i)
    Next j
    
    dicPlnSect.Add strData(0, i), strBuf
    vWriteData(nRowCnt, 0) = i + 1 & ", VALUE," & i + 1 & ", YES," & strData(4, i) & ", 0, NO, 0, 0"
    nRowCnt = nRowCnt + 1
  Next i
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_PLNSECT_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_PLNSECT_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)
  
End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_PlnSect
End Sub
