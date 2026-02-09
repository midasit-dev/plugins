VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class060_SectElem"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 13

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Function ReadSectElem_SectName(ByRef dicSect As Dictionary) As Long
    
If m_ResumeNext Then
  On Error Resume Next
End If

  ' ’f–Ê—v‘f
  Dim i As Long
  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    ReadSectElem_SectName = nCnt
    Exit Function
  End If
    
  For i = 0 To nCnt
    If dicSect.Exists(strData(0, i)) Then
      dicSect.Remove (strData(0, i))
    End If
  Next i
  
  ReadSectElem_SectName = nCnt
  
End Function

Public Sub ReadSectElem(ByRef dicMatlYoung As Dictionary, ByRef dicSectYoung As Dictionary, ByRef dicSect As Dictionary, bRead As Boolean)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' ’f–Ê—v‘f
  Dim i As Long
  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol + 2, 0)

  Dim NewSheet As Worksheet
  If bRead Then
    Set NewSheet = AddSheet(strName)
  End If
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
   
  For i = 0 To nCnt
    strData(3, i) = ChangeMatlName(strData(3, i))
    strData(12, i) = dicSectYoung(strData(0, i))
    strData(13, i) = dicMatlYoung(strData(3, i))
  Next i
  
  For i = 0 To nCnt
    If Not m_Sect2Material.Exists(strData(0, i)) Then     ' And strData(12, i) = strData(13, i) Then
      m_Sect2Material.Add strData(0, i), strData(3, i)
    End If
  Next i
  
  Dim vKeys As Variant
  vKeys = dicSect.Keys
  For i = 0 To dicSect.Count - 1
     If Not m_Sect2Material.Exists(vKeys(i)) Then
      m_Sect2Material.Add vKeys(i), dicSect(vKeys(i))
    End If
  Next i
  
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)
  
End Sub
 
Private Sub Class_Initialize()
  strName = m_Sheet_SectElem
End Sub
