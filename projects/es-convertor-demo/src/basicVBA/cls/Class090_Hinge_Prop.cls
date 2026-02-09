VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Class090_Hinge_Prop"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private Const nReadSTRow = 4

Private Const nRead1STCol = 2
Private Const nRead1EDCol = 25

Private Const nRead2STCol = 27
Private Const nRead2EDCol = 50

Private strData_zp() As String
Private strData_yp() As String
Private mWS As Worksheet

Public strName As String

Public Sub ClearSheet()
  Call ClearData(strName, nReadSTRow, nRead2STCol, nRead2EDCol)
  Call ClearData(strName, nReadSTRow, nRead1STCol, nRead1EDCol)
  With m_ThisWorkbook.Sheets(strName)
    .Range(.Cells(nReadSTRow, nRead1STCol - 1), .Cells(m_RowDataMax, nRead1STCol - 1)).ClearContents
    .Cells(nReadSTRow - 2, nRead1STCol) = "■zp"
    .Cells(nReadSTRow - 2, nRead2STCol) = "■yp"
  End With
End Sub

Public Function ReadHinge_Prop(ByRef dicHingeProp As Dictionary) As Long
  
If m_ResumeNext Then
  On Error Resume Next
End If

  ' M-φ要素詳細
  Dim i As Long
  
  Dim nCnt As Long
  ReDim strData_yp(nRead2EDCol - nRead2STCol + 1, 0)
  ReDim strData_zp(nRead1EDCol - nRead1STCol + 1, 0)
  
  Dim NewSheet As Worksheet
  Set NewSheet = AddSheet(strName)
  
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nRead2STCol, nRead2EDCol, strData_yp, True)
  nCnt = nCnt + GetData(m_ChangeBook, strName, nReadSTRow, nRead1STCol - 1, nRead1EDCol, strData_zp, True)
  
  If nCnt < 0 Then
    NewSheet.Delete
    ReadHinge_Prop = nCnt
    Exit Function
  End If
  
  ' ES Ver 11.2 変更対応
  ' タイトル取得
  Dim n As Long, j As Long
  Dim strData() As String
  ReDim strData(nRead2EDCol - nRead2STCol + 1, 0)
  
  n = GetData(m_ChangeBook, strName, nReadSTRow - 1, nRead1STCol, nRead1EDCol, strData, True)
  
  If InStr(strData(3, 0), "-Φ4") > 0 Then
    ' Ver 11.2
    Dim vChgV11_2 As Variant
    vChgV11_2 = Array(, , , 8, 9, 10, 11, 12, 18, 19, 20, 21, 22, 6, 5, 4, 3, 7, 16, 15, 14, 13, 17)
    Dim strBuf_zp As Variant
    Dim strBuf_yp As Variant
    
    For i = 0 To nCnt / 2
      strBuf_yp = Application.Index(strData_yp, , i + 1)
      strBuf_zp = Application.Index(strData_zp, , i + 1)
      
      For j = 3 To UBound(vChgV11_2)
        strData_yp(j, i) = strBuf_yp(vChgV11_2(j) + 1, 1)
        strData_zp(j + 1, i) = strBuf_zp(vChgV11_2(j) + 2, 1)
      Next j
    Next i
  
' 確認用
'    For i = 0 To UBound(strData_zp, 2)
'      For j = 0 To 24
'        Cells(20 + i, j + 1) = strData_zp(j, i)
'      Next j
'      For j = 0 To 24
'        Cells(20 + i, j + 27) = strData_yp(j, i)
'      Next j
'    Next i
  
  End If
  
  For i = 0 To nCnt / 2
    If dicHingeProp.Exists(strData_zp(2, i)) Then
      dicHingeProp(strData_zp(2, i)) = dicHingeProp(strData_zp(2, i)) & " " & m_ElemData(strData_zp(1, i))
    Else
      dicHingeProp.Add strData_zp(2, i), m_ElemData(strData_zp(1, i))
    End If
  Next i
  
  ReadHinge_Prop = nCnt
  
End Function

Public Sub ChangeHinge_Prop(ByRef dicHYST_yp As Dictionary, _
                            ByRef dicHYST_zp As Dictionary, _
                            ByRef dicHingeElem As Dictionary, _
                            ByRef vWriteData_ASS() As String)    ', dicSPG6Comp As Dictionary)
  
If m_ResumeNext Then
  On Error Resume Next
End If

  Call UseData(strData_zp, strData_yp)
'  Call UseData(strData_yp)

  Dim i As Long, j As Long, k As Long, n As Long
  
  Dim dicHYST As Dictionary
  Set dicHYST = New Dictionary
  dicHYST.Add "線形", "EBI"
  dicHYST.Add "バイリニア(対称)正負方向", "NBI"
  dicHYST.Add "バイリニア(対称)Takeda", "TAK"
  dicHYST.Add "バイリニア(非対称)Takeda", "TAK"
  dicHYST.Add "トリリニア(対称)Takeda", "TAK"
  dicHYST.Add "トリリニア(対称)ノーマル", "KIN"
  dicHYST.Add "トリリニア(対称)原点指向", "ORG"
  dicHYST.Add "トリリニア(対称)原点最大指向", "PKO"
  dicHYST.Add "トリリニア(対称)弾性", "ETR"
  dicHYST.Add "トリリニア(非対称)Takeda", "TAK"
  dicHYST.Add "トリリニア(非対称)原点指向", "ORG"
  dicHYST.Add "トリリニア(非対称)原点最大指向", "PKO"
  dicHYST.Add "トリリニア(非対称)弾性", "ETR"
  dicHYST.Add "テトラリニア(対称)Takeda", "TTE"
  dicHYST.Add "テトラリニア(対称)H11 鉄道(耐震)", "TTE"
  dicHYST.Add "テトラリニア(非対称)Takeda", "TTE"
  dicHYST.Add "テトラリニア(非対称)H11 鉄道(耐震)", "TTE"
  dicHYST.Add "RC橋脚バイリニア(動解)Takeda", "TAK"

  Dim dicSYM As Dictionary
  Set dicSYM = New Dictionary
  dicSYM.Add "線形", 0
  dicSYM.Add "バイリニア(対称)正負方向", 0
  dicSYM.Add "バイリニア(対称)Takeda", 0
  dicSYM.Add "バイリニア(非対称)Takeda", 1
  dicSYM.Add "トリリニア(対称)Takeda", 0
  dicSYM.Add "トリリニア(対称)ノーマル", 0
  dicSYM.Add "トリリニア(対称)原点指向", 0
  dicSYM.Add "トリリニア(対称)原点最大指向", 0
  dicSYM.Add "トリリニア(対称)弾性", 0
  dicSYM.Add "トリリニア(非対称)Takeda", 1
  dicSYM.Add "トリリニア(非対称)原点指向", 1
  dicSYM.Add "トリリニア(非対称)原点最大指向", 1
  dicSYM.Add "トリリニア(非対称)弾性", 1
  dicSYM.Add "テトラリニア(対称)Takeda", 0
  dicSYM.Add "テトラリニア(対称)H11 鉄道(耐震)", 0
  dicSYM.Add "テトラリニア(非対称)Takeda", 1
  dicSYM.Add "テトラリニア(非対称)H11 鉄道(耐震)", 1
  dicSYM.Add "RC橋脚バイリニア(動解)Takeda", 0
  
  Dim nLineType As Long
  Dim nCnt As Long
  Dim vWriteData() As String
  ReDim vWriteData((UBound(strData_zp, 2) + 1) * 18 + 14, 0) ' 二次元配列でないとダメ！
  Dim nRowCnt As Long
  nRowCnt = 0
  
  ' コメント(ASS)
  Dim nAssCnt As Long: nAssCnt = 0
  ReDim vWriteData_ASS(UBound(strData_zp, 2) + 2, 0)
  vWriteData_ASS(nAssCnt, 0) = "*IHINGE-ASSIGN  ; Inelastic Hinge Assignment": nAssCnt = nAssCnt + 1
  vWriteData_ASS(nAssCnt, 0) = "; ELEM_LIST, PROP, FIBER_DIV": nAssCnt = nAssCnt + 1
  
  ' コメント
  vWriteData(nRowCnt, 0) = "*IHINGE-PROP    ; Inelastic Hinge Property": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; NAME, MTYPE, HTYPE, MCODE, ELPOS, ITYPE, DEF, FIBER, DESC    ; line 1": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bExistIJ_FX, bExistIJ_FY, bExistIJ_FZ, bExistIJ_MX, bExistIJ_FY, bExistIJ_MZ, bExistIJ_YS              ; line 2": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bFy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 3": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bFz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 4": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMx, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 5": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMy, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 6": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bMz, HLOC[NSECT], HYST, [M_PROP]                                                                       ; line 7": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bPMAUTO, PC0, [PMDATA], [PMDATA]                                                                       ; line 8": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; bYSAUTO, GAMMA1ST, GAMMA2ND, ALPHA, COUPLING, [YSDATA], [YSDATA]           ; line 9": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP                          ; KIN, ORG, PKO, DEG, NBI, EBI, ETR, ETE": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO                    ; CLO": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [M_PROP] : iSYM, iIM, DEFORM, SFTYPE, STIFF, iITYPE, [DATA]-TENS, [DATA]-COMP, EXPO, FACTOR            ; TAK, TAK, TTE, MTT": nRowCnt = nRowCnt + 1
  vWriteData(nRowCnt, 0) = "; [DATA] : YS-P1, YS-P2, YS-P3, YS-P4, YD-D1, YD-D2, YD-D3, YD-D4, HSL1, ... HSL5                        ; iITYPE=1": nRowCnt = nRowCnt + 1
  
  Dim strBuf() As String, s As String
  Dim vBuf As Variant
  Dim strHingeType As String
  Dim strFacter As String
  Dim strCateDetail As String
  Dim strPropName As String
  
  Dim vAssign As Variant
  vAssign = Array("", ",BEAM")    ' CIVIL NX 2026(v1.1)対応
  
  Dim nCopy As Long
  For j = 0 To UBound(strData_zp, 2)
  
    For i = 2 To 21
      If Not IsNumeric(strData_yp(i, j)) Then strData_yp(i, j) = 0
      If Not IsNumeric(strData_zp(i, j)) Then strData_zp(i, j) = 0
    Next i
        
    For i = 0 To 3
      If IsNumeric(strData_yp(13 + i, j)) Then
        strData_yp(13 + i, j) = Abs(strData_yp(13 + i, j))
      Else
        strData_yp(13 + i, j) = 0
      End If
      If IsNumeric(strData_zp(13 + i, j)) Then
        strData_zp(13 + i, j) = Abs(strData_zp(13 + i, j))
      Else
        strData_zp(13 + i, j) = 0
      End If
      If IsNumeric(strData_yp(18 + i, j)) Then
        strData_yp(18 + i, j) = Abs(strData_yp(18 + i, j))
      Else
        strData_yp(18 + i, j) = 0
      End If
      If IsNumeric(strData_zp(18 + i, j)) Then
        strData_zp(18 + i, j) = Abs(strData_zp(18 + i, j))
      Else
        strData_zp(18 + i, j) = 0
      End If
    Next i
    
    i = 0
    ' 1行目
    
    If dicHingeElem(strData_zp(0, j)) Then
      
      ReDim strBuf(10)
      strPropName = ChgCamma(HingeName(strData_zp(1, j)))
      strBuf(i) = "MLHP=" & strPropName: i = i + 1
      
      s = m_ElemData(strData_zp(0, j))    ' 要素名から要素No
      
      If m_ElemNo2MaterialNo.Exists(s) Then
        k = m_ElemNo2MaterialNo(s)      ' 要素Noから材料No
        strBuf(i) = m_MatNo2S_or_RC(k): i = i + 1
        strBuf(i) = "DIST,NONE, I, SKEL,,": i = i + 1
        
        vBuf = m_ElemData.Keys
        vBuf = m_ElemNo2MaterialNo.Keys
        
        vWriteData(nRowCnt, 0) = strBuf(0)
        For k = 1 To i - 1
          vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
        Next k
        nRowCnt = nRowCnt + 1
        
        ' 2行目
        vWriteData(nRowCnt, 0) = "NO,NO,NO,NO,NO,NO,NO": nRowCnt = nRowCnt + 1
        
        i = 0
        ' 3行目～6行目
        nCopy = nRowCnt
        vWriteData(nRowCnt, 0) = "NO": nRowCnt = nRowCnt + 1
        vWriteData(nRowCnt, 0) = "NO": nRowCnt = nRowCnt + 1
        vWriteData(nRowCnt, 0) = "NO": nRowCnt = nRowCnt + 1
        vWriteData(nRowCnt, 0) = "NO": nRowCnt = nRowCnt + 1
        
        i = 0
        ' 7行目(zpの値使用)
        strCateDetail = Replace(dicHYST_zp(strData_zp(1, j)), " ", "")
        ReDim strBuf(22)
        strBuf(i) = "YES,1": i = i + 1
        strHingeType = dicHYST(strCateDetail)
        strBuf(i) = strHingeType: i = i + 1
        strBuf(i) = dicSYM(strCateDetail): i = i + 1
        strBuf(i) = "0,1,5,1,1": i = i + 1
        
        nLineType = GetLineType(strHingeType, strCateDetail)
        
        If nLineType > 0 Then
          If nLineType = 1 Then
            strData_zp(9, j) = strData_zp(8, j) * 10#
            strData_zp(4, j) = strData_zp(3, j) * 10#
            strData_zp(19, j) = strData_zp(18, j) * 10#
            strData_zp(14, j) = strData_zp(13, j) * 10#
          Else
            strData_zp(10, j) = strData_zp(9, j): strData_zp(9, j) = strData_zp(8, j)
            strData_zp(5, j) = strData_zp(4, j): strData_zp(4, j) = strData_zp(3, j)
            strData_zp(20, j) = strData_zp(19, j): strData_zp(19, j) = strData_zp(18, j)
            strData_zp(15, j) = strData_zp(14, j): strData_zp(14, j) = strData_zp(13, j)
          End If
        End If
        
        ' 曲げモーメント引張側(＋側)
        strBuf(i) = strData_zp(8, j): i = i + 1
        strBuf(i) = strData_zp(9, j): i = i + 1
        strBuf(i) = strData_zp(10, j): i = i + 1
        strBuf(i) = strData_zp(11, j): i = i + 1
        
        ' 曲率引張側(＋側)
        strBuf(i) = strData_zp(3, j): i = i + 1
        strBuf(i) = strData_zp(4, j): i = i + 1
        strBuf(i) = strData_zp(5, j): i = i + 1
        strBuf(i) = strData_zp(6, j): i = i + 1
        
        strBuf(i) = "0.5, 1, 2, 4, 8": i = i + 1
        
        ' 曲げモーメント圧縮側(－側)
        strBuf(i) = strData_zp(18, j): i = i + 1
        strBuf(i) = strData_zp(19, j): i = i + 1
        strBuf(i) = strData_zp(20, j): i = i + 1
        strBuf(i) = strData_zp(21, j): i = i + 1
        
        ' 曲率引張側(－側)
        strBuf(i) = strData_zp(13, j): i = i + 1
        strBuf(i) = strData_zp(14, j): i = i + 1
        strBuf(i) = strData_zp(15, j): i = i + 1
        strBuf(i) = strData_zp(16, j): i = i + 1
        
        strBuf(i) = "0.5, 1, 2, 4, 8": i = i + 1
        
        strFacter = CheckeHingeType(strHingeType)
        If Len(strFacter) > 0 Then
          strBuf(i) = strFacter: i = i + 1
        End If
        
        vWriteData(nRowCnt, 0) = strBuf(0)
        For k = 1 To i - 1
          vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
        Next k
        
        nRowCnt = nRowCnt + 1
      
        i = 0
        ' 7行目(ypの値使用)
        strCateDetail = Replace(dicHYST_yp(strData_yp(1, j)), " ", "")
        ReDim strBuf(22)
        strBuf(i) = "YES,1": i = i + 1
        strHingeType = dicHYST(strCateDetail)
        strBuf(i) = strHingeType: i = i + 1
        strBuf(i) = dicSYM(strCateDetail): i = i + 1
        strBuf(i) = "0,1,5,1,1": i = i + 1
        
        nLineType = GetLineType(strHingeType, strCateDetail)
        
        If nLineType > 0 Then
          If nLineType = 1 Then
            strData_yp(9, j) = strData_yp(8, j) * 10#
            strData_yp(4, j) = strData_yp(3, j) * 10#
            strData_yp(19, j) = strData_yp(18, j) * 10#
            strData_yp(14, j) = strData_yp(13, j) * 10#
          Else
            strData_yp(10, j) = strData_yp(9, j): strData_yp(9, j) = strData_yp(8, j)
            strData_yp(5, j) = strData_yp(4, j): strData_yp(4, j) = strData_yp(3, j)
            strData_yp(20, j) = strData_yp(19, j): strData_yp(19, j) = strData_yp(18, j)
            strData_yp(15, j) = strData_yp(14, j): strData_yp(14, j) = strData_yp(13, j)
          End If
        End If
        
        ' 曲げモーメント引張側(＋側)
        strBuf(i) = strData_yp(8, j): i = i + 1
        strBuf(i) = strData_yp(9, j): i = i + 1
        strBuf(i) = strData_yp(10, j): i = i + 1
        strBuf(i) = strData_yp(11, j): i = i + 1
        
        ' 曲率引張側(＋側)
        strBuf(i) = strData_yp(3, j): i = i + 1
        strBuf(i) = strData_yp(4, j): i = i + 1
        strBuf(i) = strData_yp(5, j): i = i + 1
        strBuf(i) = strData_yp(6, j): i = i + 1
        
        strBuf(i) = "0.5, 1, 2, 4, 8": i = i + 1
        
        ' 曲げモーメント圧縮側(－側)
        strBuf(i) = strData_yp(18, j): i = i + 1
        strBuf(i) = strData_yp(19, j): i = i + 1
        strBuf(i) = strData_yp(20, j): i = i + 1
        strBuf(i) = strData_yp(21, j): i = i + 1
        
        ' 曲率引張側(－側)
        strBuf(i) = strData_yp(13, j): i = i + 1
        strBuf(i) = strData_yp(14, j): i = i + 1
        strBuf(i) = strData_yp(15, j): i = i + 1
        strBuf(i) = strData_yp(16, j): i = i + 1
        
        strBuf(i) = "0.5, 1, 2, 4, 8": i = i + 1
        
        strFacter = CheckeHingeType(strHingeType)
        If Len(strFacter) > 0 Then
          strBuf(i) = strFacter: i = i + 1
        End If
        
        vWriteData(nRowCnt, 0) = strBuf(0)
        For k = 1 To i - 1
          vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
        Next k
        
        nRowCnt = nRowCnt + 1
      
        ' 8行目(無し：空行)
        vWriteData(nRowCnt, 0) = " "
        nRowCnt = nRowCnt + 1
    
        For i = nCopy To nCopy + 6
          vWriteData(nRowCnt, 0) = vWriteData(i, 0)
          nRowCnt = nRowCnt + 1
        Next i
    
        i = 0
        ' 9行目
        vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "0, 0, 0, 0, 0, 0"
        nRowCnt = nRowCnt + 1
      
        ' 10行目？(無し：空行)
        vWriteData(nRowCnt, 0) = " "
        nRowCnt = nRowCnt + 1
        
        ' *IHINGE-ASSIGN(2025/12/09)
        vWriteData_ASS(nAssCnt, 0) = m_ElemData(strData_zp(0, j)) & vAssign(m_Version) & "," & strPropName & ",": nAssCnt = nAssCnt + 1
      End If
    End If
  Next j
  
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_HINGEPROP_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nRowCnt - 1, m_HINGEPROP_COL)).Value = vWriteData
  m_Sheet_MCT.Range(m_Sheet_MCT.Cells(m_WRITE_ROW, m_HINGEASS_COL), m_Sheet_MCT.Cells(m_WRITE_ROW + nAssCnt - 1, m_HINGEASS_COL)).Value = vWriteData_ASS
  Call FixtWriteColor(strName, nReadSTRow - 1, nRead1STCol)
  Call FixtWriteColor(strName, nReadSTRow - 1, nRead2STCol)
    
End Sub

Private Sub UseData(ByRef strDataZp() As String, ByRef strDataYp() As String)

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim dicElmDetail As Dictionary
  Set dicElmDetail = New Dictionary
  
  Dim i As Long, j As Long, n As Long
  Dim strBufZp() As String, strBufYp() As String, strName As String, strProp As String
  
  strBufZp = strDataZp
  Erase strDataZp
  strBufYp = strDataYp
  Erase strDataYp
  
  For i = 0 To UBound(strBufZp, 2)
    
    If Len(strBufZp(1, i)) > 0 Then strName = strBufZp(1, i)
    If Len(strBufZp(2, i)) > 0 Then strProp = strBufZp(2, i)
    n = -1
    If dicElmDetail.Exists(strName) Then
      If Len(Trim(strBufZp(0, i))) > 0 Then
        n = dicElmDetail(strName)
'        strDataZp(0, n) = strName
'        strDataZp(1, n) = strProp
      End If
    Else
      n = dicElmDetail.Count
      dicElmDetail.Add strName, n
      ReDim Preserve strDataZp(UBound(strBufZp, 1), n)
      ReDim Preserve strDataYp(UBound(strBufYp, 1), n)
'      strDataZp(0, n) = strBufZp(0, i)
'      strDataZp(1, n) = strName
    End If
    
    If n >= 0 Then
      strDataZp(0, n) = strName
      strDataYp(0, n) = strName
      strDataZp(1, n) = strProp
      strDataYp(1, n) = strProp
      For j = 2 To UBound(strBufZp, 1) - 1
        strDataZp(j, n) = strBufZp(j + 1, i)
        strDataYp(j, n) = strBufYp(j, i)
      Next j
    End If
  Next i


End Sub

Private Function CheckeHingeType(ByVal strHingeType As String) As String

  Dim strBuf As String
    
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

Private Sub Class_Initialize()
  strName = m_Sheet_HngPrp
End Sub
