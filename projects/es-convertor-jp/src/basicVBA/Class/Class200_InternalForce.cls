VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class200_InternalForce"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 12

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Sub ChangeInternalForce()
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' 内力
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
  ReDim vWriteData(nCnt + 1 + 4, 0)  ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0

  ' コメント
  vWriteData(nRowCnt, 0) = "*INI-EFORCE    ; Initial Element Force": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; TYPE, ID, Axial-i, Axial-j     ; TRUSS": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z": nRowCnt = nRowCnt + 1
 
  Dim strBuf() As String
  Dim vBuf As Variant
  For j = 0 To nCnt
    ReDim strBuf(11)
    i = 0
    strBuf(i) = "BEAM": i = i + 1
    strBuf(i) = strData(2, j): i = i + 1
    strBuf(i) = strData(3, j): i = i + 1
    strBuf(i) = "0,0": i = i + 1
    strBuf(i) = strData(9, j): i = i + 1
    strBuf(i) = strData(6, j): i = i + 1
    strBuf(i) = -1 * strData(5, j): i = i + 1
    
    strBuf(i) = strData(4, j): i = i + 1
    strBuf(i) = "0,0": i = i + 1
    strBuf(i) = strData(10, j): i = i + 1
    strBuf(i) = strData(8, j): i = i + 1
    strBuf(i) = -1 * strData(7, j)
    
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k

    nRowCnt = nRowCnt + 1
  Next j

  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_INTERFORCE), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_INTERFORCE)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)

End Sub

Private Sub Class_Initialize()
  strName = m_Sheet_InternalForce
End Sub

