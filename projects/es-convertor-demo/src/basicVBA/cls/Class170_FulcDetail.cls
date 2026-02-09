VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class170_FulcDetail"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4
Private Const nReadSTCol = 2
Private Const nReadEDCol = 21

Public strName As String

Private Enum Cells
  Cel_D = 2
  Cel_E
  Cel_F
  Cel_G
  Cel_H
  Cel_I
  Cel_J
  Cel_K
  Cel_L
  Cel_M
  Cel_N
  Cel_O
  Cel_P
  Cel_Q
  Cel_R
  Cel_S
  Cel_T
  Cel_U
End Enum


Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol, 2)
End Sub

Public Sub ChangeFulcDetail(ByRef dicSprType As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 支点詳細
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
  
  For i = 0 To UBound(strData, 2)
    For j = 2 To 19
      If Not IsNumeric(strData(j, i)) Then strData(j, i) = 0
    Next j
  Next i
  
  Dim vWriteData() As String
  ReDim vWriteData((nCnt + 1) * 4 + 5, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0

  ' コメント
  vWriteData(nRowCnt, 0) = "*GSPRTYPE    ; Define General Spring Supports": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; NAME, SDx1, SDy1, SDy2, SDz1, SDz2, SDz3, ..., SRz1, ..., SRz6": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = ";       MDx1, MDy1, MDy2, MDz1, MDz2, MDz3, ..., MRz1, ..., MRz6": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = ";       DDx1, DDy1, DDy2, DDz1, DDz2, DDz3, ..., DRz1, ..., DRz6": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = ";       bStiffness, bMass, bDamping                             ": nRowCnt = nRowCnt + 1
  
  Dim strBuf() As String
  Dim vBuf As Variant
  For j = 0 To nCnt
    If dicSprType(strData(0, j)) Then
      ReDim strBuf(21)
      i = 0
      strBuf(i) = strData(0, j): i = i + 1
      strBuf(i) = Abs(strData(Cel_D, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_K, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_F, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_J, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_N, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_E, j)): i = i + 1
      strBuf(i) = "0": i = i + 1
      strBuf(i) = Abs(strData(Cel_Q, j)): i = i + 1
      strBuf(i) = -1# * Abs(strData(Cel_O, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_G, j)): i = i + 1
      strBuf(i) = -1# * Abs(strData(Cel_M, j)): i = i + 1
      strBuf(i) = "0": i = i + 1
      strBuf(i) = Abs(strData(Cel_P, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_T, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_I, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_L, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_R, j)): i = i + 1
      strBuf(i) = "0": i = i + 1
      strBuf(i) = Abs(strData(Cel_S, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_U, j)): i = i + 1
      strBuf(i) = Abs(strData(Cel_H, j))
      
      vWriteData(nRowCnt, 0) = strBuf(0)
      For k = 1 To i
        vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
      Next k
      
      nRowCnt = nRowCnt + 1
      vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
      
      nRowCnt = nRowCnt + 1
      vWriteData(nRowCnt, 0) = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
      
      nRowCnt = nRowCnt + 1
      vWriteData(nRowCnt, 0) = "YES,NO,NO"
  
      nRowCnt = nRowCnt + 1
    End If
  Next j
  
  If nRowCnt > 5 Then
    m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_FULCDETAIL_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_FULCDETAIL_COL)).Value = vWriteData
  End If
  Call FixtWriteColor(strName, nReadSTRow - 2, nReadSTCol)

End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_FulcDetail
End Sub
