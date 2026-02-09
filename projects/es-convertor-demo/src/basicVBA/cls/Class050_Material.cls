VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class050_Material"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 3
Private Const nReadSTCol = 2
Private Const nReadEDCol = 10

Private dicMatlName As Dictionary
Private dicMatlNameBuf As Dictionary

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nReadSTCol, nReadEDCol)
End Sub

Public Sub ChangeMaterial(ByRef dicMatlYoung As Dictionary, ByRef dicSect As Dictionary)
  
  If m_ResumeNext Then
    On Error Resume Next
  End If

  ' 材料
  Dim i As Long, j As Long
  Dim nCnt As Long
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)
    
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
    
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)    ' 材料シート取得
  If nCnt < 0 Then
    NewSheet.Delete
    Exit Sub
  End If
  
  For i = 0 To UBound(strData, 2)
    For j = 3 To 6
      If Not IsNumeric(strData(j, i)) Then strData(j, i) = 0
    Next j
  Next i
  
  Dim dicPoisson As Dictionary
  Set dicPoisson = New Dictionary
  
  ' ポアソン比
  dicPoisson.Add "コンクリート材料", 0.167
  dicPoisson.Add "鉄筋材料", 0.3
  dicPoisson.Add "鋼板材料", 0.3
  dicPoisson.Add "炭素繊維シート（FRP） 材料", 0.46
  
  Dim dicConc As Dictionary
  Set dicConc = New Dictionary
  dicConc.Add 21, "Fc21"
  dicConc.Add 24, "Fc24"
  dicConc.Add 27, "Fc27"
  dicConc.Add 30, "Fc30"
  dicConc.Add 36, "Fc36"
  dicConc.Add 40, "Fc40"
  dicConc.Add 50, "Fc50"
  dicConc.Add 60, "Fc60"
  dicConc.Add 70, "Fc70"
  dicConc.Add 80, "Fc80"
  dicConc.Add 235, "SS400"
  dicConc.Add 315, "SM490"
  dicConc.Add 355, "SM490Y"
  dicConc.Add 450, "SM570"
  
  Dim dicStandard As Dictionary
  Set dicStandard = New Dictionary
  dicStandard.Add "コンクリート材料", Array("JIS-Civil(RC)", "CONC")
  dicStandard.Add "鋼板材料", Array("JIS-Civil(S)", "STEEL")
  dicStandard.Add "鉄筋材料", Array("JIS-Civil(S)", "STEEL")
  
  ' Material データ作成
  For i = 0 To nCnt
    
    If strData(1, i) = "データベース" Or strData(2, i) = "鋼板材料" Then
      If Not dicConc.Exists(CInt(strData(3, i))) Then strData(1, i) = "ユーザー"
    End If
  Next i
  
  Dim dValue As Double
  Dim strBuf As String
  Dim vWriteData() As String
  ReDim vWriteData(nCnt + dicSect.Count + 4, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*MATERIAL    ; Material": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; iMAT, TYPE, MNAME, SPHEAT, HEATCO, PLAST, TUNIT, bMASS, DAMPRATIO, [DATA1]           ; STEEL, CONC, USER": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [DATA1] : 1, STANDARD, CODE/PRODUCT, DB, USEELAST, ELAST": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [DATA1] : 2, ELAST, POISN, THERMAL, DEN, MASS": nRowCnt = nRowCnt + 1
  
  Dim nMatlMax As Long: nMatlMax = 0
  For i = 0 To nCnt
    
    If IsNumeric(strData(4, i)) Then
      dValue = CDbl(strData(4, i))
      dValue = ChangeN_kN(dValue) / ChangeMM2_M2(1)
      
      If dValue = 0# Then dValue = 1#
      dicMatlYoung.Add strData(0, i), dValue      'strData(4, i)
      m_MaterialData.Add strData(0, i), i + 1
      
'      strData(0, i) = ChangeMatlName(strData(0, i))
      If strData(2, i) = "鉄筋材料" Then
        m_MatNo2S_or_RC.Add m_MaterialData(strData(0, i)), "STEEL"
      Else
        m_MatNo2S_or_RC.Add m_MaterialData(strData(0, i)), "RC"
      End If
      
      If nMatlMax < m_MaterialData(strData(0, i)) Then nMatlMax = m_MaterialData(strData(0, i))
      If strData(1, i) = "ユーザー" Then
        If dicPoisson.Exists(strData(2, i)) Then
          strData(2, i) = dicPoisson(strData(2, i))
        Else
          strData(2, i) = 0.3
        End If
        
        vWriteData(nRowCnt, 0) = m_MaterialData(strData(0, i)) & "," & _
                                 "USER," & _
                                 ChangeMatlName(strData(0, i)) & "," & _
                                 "0,0,,C,NO,0.0,2," & _
                                 dValue & "," & _
                                 strData(2, i) & "," & _
                                 strData(6, i) & "," & _
                                 strData(5, i) & ",0"
        nRowCnt = nRowCnt + 1
      Else
        vWriteData(nRowCnt, 0) = m_MaterialData(strData(0, i)) & "," & _
                                 dicStandard(strData(2, i))(1) & "," & _
                                 ChangeMatlName(strData(0, i)) & "," & _
                                 "0,0,,C,NO,0.0,1," & _
                                 dicStandard(strData(2, i))(0) & ",," & _
                                 dicConc(CInt(strData(3, i))) & "," & _
                                 "NO," & _
                                 strData(4, i)
        nRowCnt = nRowCnt + 1
      End If
    End If
  Next i
  
  nMatlMax = nMatlMax + 1
  ' 材料データの無いもの登録
  Dim strMatlName As String
  Dim vKeys As Variant
  vKeys = dicSect.Keys
  For i = 0 To dicSect.Count - 1
    strMatlName = "Material"
    If m_MaterialData.Exists(strMatlName) Then
      
      j = 2
      strBuf = "~" & j
      While m_MaterialData.Exists(strMatlName & strBuf)
        j = j + 1
         strBuf = "~" & j
      Wend
      strMatlName = strMatlName & strBuf
    End If
    m_MaterialData.Add strMatlName, nMatlMax
    vWriteData(nRowCnt, 0) = nMatlMax & "," & _
                             "USER," & _
                             strMatlName & "," & _
                             "0,0,,C,NO,0.0,2," & _
                             ChangeN_kN(dicSect(vKeys(i))(0)) / ChangeMM2_M2(1) & "," & _
                             "0.3," & _
                             dicSect(vKeys(i))(1) & "," & _
                             "0,0"
                             
    dicSect(vKeys(i)) = strMatlName
    nMatlMax = nMatlMax + 1
    nRowCnt = nRowCnt + 1
  Next i
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_MATERIAL_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_MATERIAL_COL)).Value = vWriteData
  Call FixtWriteColor(strName, nReadSTRow - 1, nReadSTCol)
  
End Sub
 
Private Sub Class_Initialize()
  strName = m_Sheet_Material
End Sub
