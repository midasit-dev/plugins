VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class150_SPGAllOther"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 5

Private Const nRead1STCol = 2
Private Const nRead1EDCol = 12

Private Const nRead2STCol = 14
Private Const nRead2EDCol = 25

Private mWS As Worksheet

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nRead1STCol, nRead1EDCol, 2)
  Call ClearData(strName, nReadSTRow, nRead2STCol, nRead2EDCol, 2)
  With m_ThisWorkbook.Sheets(strName)
    .Cells(nReadSTRow - 3, nRead1STCol) = "■名古屋高速ゴム支承"
    .Cells(nReadSTRow - 3, nRead2STCol) = "■BMR(CD)ダンパー"
  End With
End Sub

Private Function CheckeHingeType(ByVal strHingeType As String) As String
  
If m_ResumeNext Then
  On Error Resume Next
End If

  Dim strBuf As String
  strBuf = ""
  
  Select Case strHingeType
    Case "TAK", "TAK", "TTE", "MTT"
      strBuf = "0.5,1"
    Case Else
      strBuf = ""
  End Select
    
  CheckeHingeType = strBuf
    
End Function

Private Function GetLineType(ByRef strHingeType As String, ByRef strCateDetail As String) As Long
  
  Dim nLineType As Long
  nLineType = 0
  
  If strHingeType = "EBI" Then
    nLineType = 1
  ElseIf strHingeType = "TAK" Then
    If strCateDetail <> "トリリニア(対称)Takeda" And strCateDetail <> "トリリニア(非対称)Takeda" Then nLineType = 2
  End If
    
  GetLineType = nLineType
  
End Function

Public Sub FixWriteColor()
  
  Dim i As Long
  Dim vBuf As Variant
  Dim strCells As String
  With m_ChangeBook.Sheets(strName)
    For i = nRead1STCol To nRead2EDCol
      vBuf = .Cells(nReadSTRow - 1, i).Formula
      .Cells(nReadSTRow - 1, i) = Replace(vBuf, "=", "'")
    Next i
  End With
  
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead1STCol)
  Call FixtWriteColor(strName, nReadSTRow - 2, nRead2STCol)

End Sub

Public Function GetArea(nRow As Long, nST() As Long, nED() As Long) As Long
  
  Dim n As Long
  
  nRow = nReadSTRow
  
  n = 0
  nST(n) = nRead1STCol
  nED(n) = nRead1EDCol

  n = n + 1
  nST(n) = nRead2STCol
  nED(n) = nRead2EDCol

  GetArea = n
End Function

Private Sub Class_Initialize()
  strName = m_Sheet_SPGAllOther
End Sub
