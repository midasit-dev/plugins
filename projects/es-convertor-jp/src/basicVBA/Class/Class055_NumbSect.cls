VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class055_NumbSect"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 17

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Sub GetNumbSect()
  
  If m_ResumeNext Then
    On Error Resume Next
  End If

  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  ' êîílífñ Ç©ÇÁÇ‡éÊìæ
  Dim i As Long
  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol + 2, 0)
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  For i = 0 To nCnt
     If Not m_Sect2Material.Exists(strData(0, i)) Then
      m_Sect2Material.Add strData(0, i), strData(1, i)
    End If
  Next i
  
End Sub
 
Private Sub Class_Initialize()
  strName = m_Sheet_NumbSect
End Sub
