VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class100_Hinge_Ass"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 15

Private mWS As Worksheet
Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
End Sub

Public Sub ChangeHinge_Ass(ByRef dicHingeProp As Dictionary, ByRef dicHYST_yp As Dictionary, ByRef dicHYST_zp As Dictionary, ByRef vWriteData() As String)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' M-φ特性表
  Dim i As Long, j As Long
  Dim strData() As String
  
  Dim nCnt As Long
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  For i = 0 To nCnt
    dicHYST_zp.Add strData(0, i), strData(4, i) & strData(5, i)
    dicHYST_yp.Add strData(0, i), strData(7, i) & strData(8, i)
  Next i
  
  Dim strBuf As String
'  Dim vWriteData() As String
  ReDim vWriteData(UBound(strData, 2) + 2, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*IHINGE-ASSIGN  ; Inelastic Hinge Assignment": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; ELEM_LIST, PROP, FIBER_DIV": nRowCnt = nRowCnt + 1
  
  For i = 0 To UBound(strData, 2)
    vWriteData(nRowCnt, 0) = dicHingeProp(strData(0, i)) & "," & _
                             ChgCamma(HingeName(strData(0, i))) & ",0"
    nRowCnt = nRowCnt + 1
  Next i
  
'  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_HINGEASS_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_HINGEASS_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)
 
End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_HngAss
End Sub
