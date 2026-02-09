Attribute VB_Name = "main"
Option Explicit

Public m_NodeData As Dictionary             ' 節点名称 → 節点No
Public m_MaterialData As Dictionary         ' 材料名称 → 材料No
Public m_ElemData As Dictionary             ' 要素名称 → 要素No
Public m_ElemAngle As Dictionary            ' 要素名称 → 要素角度
Public m_SectData As Dictionary             ' i断面名称-j断面名称 → 断面No
Public m_Sect2Material As Dictionary        ' 断面名称 → 材料名称
Public m_ElemNode As Dictionary             ' 要素名称 → 節点名称

Public m_ElemNo2MaterialNo As Dictionary    ' 要素No → 材料No
Public m_MatNo2S_or_RC As Dictionary        ' 材料No → S or RC

Public m_DicOrgNode As Dictionary             ' 節点から節点座標（No、X_Y_Z) バネ要素2重節点検出用

Public m_LongHingeName As Dictionary
Public m_LongHingeNameBuf As Dictionary

Public m_dicMatlName As Dictionary
Public m_dicMatlNameBuf As Dictionary

'Public m_dicRigidNode As Dictionary
Public m_dicRigidElem As Dictionary

Private dicNewSheets As Dictionary
Private dicSprComp As Dictionary

' シート名
Public Const m_Sheet_Node = "節点座標"
Public Const m_Sheet_Frame = "フレーム要素"
Public Const m_Sheet_PlnElm = "平板要素"
Public Const m_Sheet_Rigid = "剛体要素"
Public Const m_Sheet_Material = "材料"
Public Const m_Sheet_NumbSect = "数値断面"
Public Const m_Sheet_SectElem = "断面要素"
Public Const m_Sheet_Sect = "断面特性ｵﾌﾟｼｮﾝ"
Public Const m_Sheet_PlnSect = "平板断面"

Public Const m_Sheet_HngPrp = "M-φ要素詳細"
Public Const m_Sheet_HngAss = "M-φ特性表"
Public Const m_Sheet_ElmSpr = "ばね要素"
Public Const m_Sheet_SPG6Comp = "ばね特性表_6成分概要"
Public Const m_Sheet_SPGAllSym = "ばね特性表_成分一覧(対称)"
Public Const m_Sheet_SPGAllASym = "ばね特性表_成分一覧(非対称)"
Public Const m_Sheet_SPGAllOther = "ばね特性表_成分一覧(その他)"
Public Const m_Sheet_Fulcrum = "支点"
Public Const m_Sheet_FulcDetail = "支点詳細"
Public Const m_Sheet_NodalMass = "節点質量"
Public Const m_Sheet_Load = "荷重値"
Public Const m_Sheet_InternalForce = "内力"

Public Type PointType
  x As Double
  y As Double
  z As Double
End Type
Public BufP As PointType

Private Type AreaType
  STCOl As Long
  EDCol As Long
End Type
Private Type TDataType
  Rows As Long
  COLS() As AreaType
End Type

Private Type HNGType
  strF As String
  strK As String
  strD As String
  strP As String
End Type

Private Type SprCompDataType
  nComponent As Long
  nType As Long
  strProp As String
  dRotate As Double
  mct_HYST As String
  mct_HYST2 As String
  mct_iSYM As Long
  mct_iTYPE As Long
  mct_SFType As Long
  mct_dStiff As Double
  strCategory(6) As String
  strData() As String
  strTENS() As HNGType
End Type
Public Type SprCompType
  vAngle As Variant
  SprCompData(1 To 6) As SprCompDataType
End Type

Public Type SpgAngle
  vDefault As Variant
  vRed As Variant
  vPink As Variant
  vGreen As Variant
  vCyan As Variant
  vBlue As Variant
  vPurple As Variant
  vBrown As Variant
  vIndigo As Variant
  vLghtGreen As Variant
  vOrange As Variant
  vDarkKhaki As Variant
  vGray As Variant
  vDarkCyan As Variant
  vLimeGreen As Variant
  vSalmon As Variant
  vOlive As Variant
  vViolet As Variant
End Type

Public m_SprComp() As SprCompType
Public m_SprCompORG() As SprCompType
Public m_dicSprProp As Dictionary         ' ばね特性表_成分一覧で使用(対称・非対称・その他)

Public m_dicESNode As Dictionary          ' Engineer Studio のノードをCivil NX 座標系に変換した値
Public m_dicSpgRef As Dictionary          ' バネ要素、”座標系=[参照部材:〇〇]”の場合

Public Const m_RowDataMax = 100000        ' maxデータ数
Public Const m_DataCopyColor = 65535      ' Yellow
Public Const m_DataCellColor = 14277081   ' gray
  
' mct 書き出し
Public Const m_MCT = "mct"
Public Const m_WRITE_ROW = 2
Public Const m_nInterval = 5

Public Const m_NODE_COL = 1                                       ' 節点座標(*NODE)                  1
Public Const m_FRAME_COL = m_NODE_COL + m_nInterval               ' フレーム要素(*ELEMENT)           6
Public Const m_PLNELM_COL = m_FRAME_COL + m_nInterval             ' 平面要素(*ELEMENT               11

Public Const m_RIGID_COL = m_PLNELM_COL + m_nInterval             ' 剛体要素(*RIGIDLINK)            16
Public Const m_MATERIAL_COL = m_RIGID_COL + m_nInterval           ' 材料(*MATERIAL)                 21
Public Const m_SECT_COL = m_MATERIAL_COL + m_nInterval            ' 断面(*SECTION)                  26
Public Const m_SECT_PSC_COL = m_SECT_COL + m_nInterval            ' テーパー断面(*SECT-PSCVALUE)   31
Public Const m_PLNSECT_COL = m_SECT_PSC_COL + m_nInterval         ' 平面断面(*THICKNESS)            36

Public Const m_HINGEPROP_COL = m_PLNSECT_COL + m_nInterval        ' M-φ要素詳細(*IHINGE-PROP)      41
Public Const m_HINGEASS_COL = m_HINGEPROP_COL + m_nInterval       ' M-φ特性表(*IHINGE-ASSIGN)      46
Public Const m_ELMSPRING_COL = m_HINGEASS_COL + m_nInterval       ' ばね要素(*NL-LINK)              51

Public Const m_OILDAMPER_COL = m_ELMSPRING_COL + m_nInterval      ' BMR(CD)ダンパー(*VISCOUS-OIL-DAMPER)      56

Public Const m_SPGALLSYM_COL = m_OILDAMPER_COL + m_nInterval      ' ばね特性表_成分一覧(対称)(*NL-PROP)       61
Public Const m_SPGALLASYM_COL = m_SPGALLSYM_COL + m_nInterval     ' ばね特性表_成分一覧(非対称)(*IHINGE-PROP) 66

Public Const m_FULCRUM_COL = m_SPGALLASYM_COL + m_nInterval      ' 支点(GSPRING)(*GSPRING)          71
Public Const m_FULCRUM2_COL = m_FULCRUM_COL + m_nInterval         ' 支点(CONSTRAINT)(*CONSTRAINT)   76

Public Const m_FULCDETAIL_COL = m_FULCRUM2_COL + m_nInterval      ' 支点詳細(*GSPRTYPE)            81
Public Const m_NODALMASS_COL = m_FULCDETAIL_COL + m_nInterval     ' 節点質量(*NODALMASS)           86
Public Const m_INTERFORCE = m_NODALMASS_COL + m_nInterval         ' 内力(*INI-EFORCE)              91
Public Const m_LOAD_COL = m_INTERFORCE + m_nInterval              ' 荷重(*STLDCASE)                96
Public Const m_CONLOAD_COL = m_LOAD_COL + m_nInterval             ' 荷重(CONLOAD)(*CONLOAD)       101
Public Const m_SPDISP_COL = m_CONLOAD_COL + m_nInterval           ' 荷重(SPDISP)(*SPDISP)         106
Public Const m_BEAMLOAD_COL = m_SPDISP_COL + m_nInterval          ' 荷重(BEAMLOAD)(*BEAMLOAD)     111
Public Const m_ELTEMPER_COL = m_BEAMLOAD_COL + m_nInterval        ' 荷重(ELTEMPER)(*ELTEMPER)     116
Public Const m_RIGIDNODE_COL = m_ELTEMPER_COL + m_nInterval       ' 剛体要素(支点)(*CONSTRAINT)   121
  
Public m_Version As Long
Public m_ThisWorkbook As Workbook
Public m_ChangeBook As Workbook
Public m_Sheet_MCT As Worksheet
Public m_ResumeNext As Boolean

Private clsNode As Class010_Node
Private clsFrame As Class020_Frame
Private clsPlnElm As Class030_PlnElm
Private clsRigid As Class040_Rigid
Private clsMaterial As Class050_Material
Private clsNumbSect As Class055_NumbSect
Private clsSectElem As Class060_SectElem
Private clsSect As Class070_Sect
Private clsPlnSect As Class080_PlnSect

Private clsHngPrp As Class090_Hinge_Prop
Private clsHngAss As Class100_Hinge_Ass
Private clsElmSpr As Class110_ElemSpring
Private clsSPG6Comp As Class120_SPG6Comp
Private clsSPGAllSym As Class130_SPGAllSym
Private clsSPGAllASym As Class140_SPGAllASym
Private clsSPGAllOther As Class150_SPGAllOther

Private clsFulcrum As Class160_Fulcrum
Private clsFulcDetail As Class170_FulcDetail
Private clsNodalMass As Class180_NodalMass
Private clsLoad As Class190_Load
Private clsInternalForce As Class200_InternalForce
    
Private Const m_WriteDir = "mctData"
Private Const m_WriteFile = "ChangeFile"
Private Const m_TemplateFile = "Format_MCT.xltx"

Private Const msg_Damper = "BMR(CD)ダンパーはCIVIL NXの粘性ダンパーに変換され、プロパティはデータ変換後に手動で変更してください。"
Private msgEnd As String

Private Sub ClearDic()

  Set m_NodeData = New Dictionary
  Set m_MaterialData = New Dictionary
  Set m_ElemData = New Dictionary
  Set m_ElemAngle = New Dictionary
  Set m_SectData = New Dictionary
  Set m_Sect2Material = New Dictionary
  Set m_ElemNode = New Dictionary            ' 要素名称 → 節点名称
  
  Set m_ElemNo2MaterialNo = New Dictionary
  Set m_MatNo2S_or_RC = New Dictionary
  
  Set m_LongHingeName = New Dictionary
  Set m_LongHingeNameBuf = New Dictionary
  
  
  Set m_dicMatlName = New Dictionary
  Set m_dicMatlNameBuf = New Dictionary

'  Set m_dicRigidNode = New Dictionary
  Set m_dicRigidElem = New Dictionary

  Set dicSprComp = New Dictionary
  
  Erase m_SprCompORG

End Sub
  
Public Sub mct作成()

Frm_Version.Show
If m_Version < 0 Then Exit Sub

m_ResumeNext = True

If m_ResumeNext Then
  On Error Resume Next
End If

  Set m_ThisWorkbook = ActiveWorkbook

  Application.ScreenUpdating = False

  Dim bRet As Boolean
'  bRet = CheckFolder()
'  If Not bRet Then Exit Sub

  msgEnd = "終了しました。"

  Dim i As Long, j As Long, k As Long

  Dim dicSectName As Dictionary
  Dim dicSectAll As Dictionary
  Dim dicMatlYoung As Dictionary
  Dim dicPlnSect As Dictionary
  
  Dim dicSectYoung As Dictionary
  Dim dicSPG6Comp As Dictionary
  
  Dim dicHYST_zp As Dictionary
  Dim dicHYST_yp As Dictionary
  Dim dicHingeElem As Dictionary    ' 20251027 M-φ要素の番号
  
  Dim ChangeSheetName As Dictionary
  
  Dim dicHingeProp As Dictionary
  Set dicHingeProp = New Dictionary
  Dim vWriteData_ASS() As String
  
  Dim dicSprType As Dictionary
  Set dicSprType = New Dictionary
  
  Dim sBook As String, sPath As String, strSheet As String
  
  Set clsNode = New Class010_Node
  Set clsFrame = New Class020_Frame
  Set clsPlnElm = New Class030_PlnElm
  
  Set clsRigid = New Class040_Rigid
  Set clsMaterial = New Class050_Material
  Set clsNumbSect = New Class055_NumbSect
  Set clsSectElem = New Class060_SectElem
  Set clsSect = New Class070_Sect
  Set clsPlnSect = New Class080_PlnSect
  
  Set clsHngPrp = New Class090_Hinge_Prop
  Set clsHngAss = New Class100_Hinge_Ass
  Set clsElmSpr = New Class110_ElemSpring
  Set clsSPG6Comp = New Class120_SPG6Comp
  Set clsSPGAllSym = New Class130_SPGAllSym
  Set clsSPGAllASym = New Class140_SPGAllASym
  Set clsSPGAllOther = New Class150_SPGAllOther
  
  Set clsFulcrum = New Class160_Fulcrum
  Set clsFulcDetail = New Class170_FulcDetail
  Set clsNodalMass = New Class180_NodalMass
  Set clsLoad = New Class190_Load
  Set clsInternalForce = New Class200_InternalForce
  
  Dim mWB As Workbook
  Dim nElemMax As Long: nElemMax = 0
  
  Call ClearDic    ' グローバルデータ初期化
  Set dicSectName = New Dictionary
  Set dicSectAll = New Dictionary
  Set dicMatlYoung = New Dictionary
  Set dicPlnSect = New Dictionary
  
  Set dicSectYoung = New Dictionary
  Set dicSPG6Comp = New Dictionary
  
  Set dicHYST_zp = New Dictionary
  Set dicHYST_yp = New Dictionary
  Set dicHingeElem = New Dictionary
  Set m_dicSprProp = New Dictionary
  
  Set m_dicSpgRef = New Dictionary

  Set ChangeSheetName = New Dictionary
    
  sPath = m_ThisWorkbook.Path
  ChDir sPath
  If Right(sPath, 1) <> "\" Then sPath = sPath & "\"
  Dim vSaveFile As Variant
  
  Dim nSaveFile As Long: nSaveFile = vbNo
  While nSaveFile = vbNo
  
    vSaveFile = Application.GetSaveAsFilename( _
          InitialFileName:=m_WriteFile & ".xlsx", _
          FileFilter:="Excelファイル,*.xlsx")
    If vSaveFile = False Then Exit Sub
    
    For i = 1 To Workbooks.Count
      If Workbooks(i).Name = Mid(vSaveFile, InStrRev(vSaveFile, "\") + 1) Then
        MsgBox Workbooks(i).Name & vbCrLf & "開かれているExcelファイルと同じ名前のファイルは作成できません。", vbCritical + vbCritical, "確認"
        vSaveFile = ""
        Exit For
      End If
    Next i
    
    If Len(vSaveFile) > 0 Then
      If Dir(vSaveFile) <> "" Then
        nSaveFile = MsgBox("ファイルが存在します" & vbCrLf & "実行しますか？", vbYesNoCancel + vbQuestion, "確認")
        If nSaveFile = vbCancel Then Exit Sub
      Else
        nSaveFile = vbYes
      End If
    End If
  Wend
  
  Dim strMacroPath As String
  
  strMacroPath = ThisWorkbook.Path
  If Right(strMacroPath, 1) <> "\" Then strMacroPath = strMacroPath & "\"
  
  sBook = strMacroPath & m_TemplateFile
  If Dir(sBook) = "" Then
'    MsgBox "テンプレートファイルが見つかりません"
'    Exit Sub
  End If
  Set m_ChangeBook = Workbooks.Open(sBook)
  
  If m_ChangeBook Is Nothing Then
    MsgBox "テンプレートファイルが見つかりません"
    Exit Sub
  End If
  
  Application.DisplayAlerts = False
  m_ChangeBook.SaveAs vSaveFile
  Application.DisplayAlerts = True
  
  Set m_Sheet_MCT = m_ChangeBook.Sheets(m_MCT)
  
  For j = 1 To m_ThisWorkbook.Sheets.Count
    ChangeSheetName.Add m_ThisWorkbook.Sheets(j).Name, j
  Next j
  
  Dim nCnt As Long, nFrameCnt As Long, nSectElemCnt As Long, nSectCnt As Long
  nSectElemCnt = -1
  nSectCnt = -1
  Dim strRigid() As String
  Application.DisplayAlerts = False
  
  Dim bSectElem As Boolean: bSectElem = True
  Dim bSect As Boolean: bSect = True
  
  ' Node の前にバネがあるかチェック
  Dim dicDblPnt As Dictionary
  Set dicDblPnt = New Dictionary
  Dim dicDblNode_Z As Dictionary
  Set dicDblNode_Z = New Dictionary
  ' 節点情報取得
  If ChangeSheetName.Exists(m_Sheet_Node) Then Call clsNode.GetNode(dicDblNode_Z)
    ' バネ要素取得
  If ChangeSheetName.Exists(m_Sheet_ElmSpr) Then Call clsElmSpr.GetSpringElem(dicDblPnt)
  ' 数値断面取得
  If ChangeSheetName.Exists(m_Sheet_NumbSect) Then Call clsNumbSect.GetNumbSect     ' m_Sect2Materialセット

'  Dim dicDblPntReSet As Dictionary
'  Set dicDblPntReSet = New Dictionary
' フレーム要素取得
  If ChangeSheetName.Exists(m_Sheet_Frame) Then nFrameCnt = clsFrame.ReadFrame_Sectname(dicSectName, dicDblPnt, dicDblNode_Z) ', dicDblPntReSet)
  If nFrameCnt >= 0 Then
    bSectElem = False
    ' 断面要素
    nSectElemCnt = clsSectElem.ReadSectElem_SectName(dicSectName)
    If dicSectName.Count > 0 Then
      ' 断面名称と関連付けられていない材料あり
      Dim vKeys As Variant
      vKeys = m_Sect2Material.Keys
      For i = 0 To UBound(vKeys)
        If dicSectName.Exists(vKeys(i)) Then
          dicSectName.Remove vKeys(i)
        End If
      Next i
    End If
    If dicSectName.Count > 0 Then
      bSect = False
      '　断面特性ｵﾌﾟｼｮﾝ"
      nSectCnt = clsSect.ReadSect_SectName(dicSectName)
    End If
  End If
  
  If ChangeSheetName.Exists(m_Sheet_Node) Then Call clsNode.ChangeNode(dicDblPnt)
  
  If ChangeSheetName.Exists(m_Sheet_Material) Then Call clsMaterial.ChangeMaterial(dicMatlYoung, dicSectName)
  If ChangeSheetName.Exists(m_Sheet_PlnSect) Then Call clsPlnSect.ChangePlnSect(dicPlnSect)
  
  If ChangeSheetName.Exists(m_Sheet_Frame) Then nCnt = clsFrame.ReadFrame(dicSectAll)
  
  If ChangeSheetName.Exists(m_Sheet_Rigid) Then Call clsRigid.ReadRigid(strRigid)
  If nFrameCnt >= 0 Then Call clsFrame.SetElemNo(nElemMax, strRigid)
  
  If bSect Or nSectCnt >= 0 Then
    If ChangeSheetName.Exists(m_Sheet_Sect) Then Call clsSect.ChangeSect(dicSectAll, dicSectYoung, bSect)
  End If
  
  If bSectElem Or nSectElemCnt >= 0 Then
    If ChangeSheetName.Exists(m_Sheet_SectElem) Then Call clsSectElem.ReadSectElem(dicMatlYoung, dicSectYoung, dicSectName, bSectElem)
  End If
'  If ChangeSheetName.Exists(m_Sheet_NumbSect) Then Call clsNumbSect.GetNumbSect     ' m_Sect2Materialセット
  
  If nCnt >= 0 Then Call clsFrame.ChangeFrame(dicHingeElem)
  If ChangeSheetName.Exists(m_Sheet_PlnElm) Then Call clsPlnElm.ChangePlnElm(dicPlnSect, nElemMax)
  
  If ChangeSheetName.Exists(m_Sheet_HngPrp) Then
    Dim vWriteData() As String
    If clsHngPrp.ReadHinge_Prop(dicHingeProp) >= 0 Then
      Call clsHngAss.ChangeHinge_Ass(dicHingeProp, dicHYST_yp, dicHYST_zp, vWriteData)
      Call clsHngPrp.ChangeHinge_Prop(dicHYST_yp, dicHYST_zp, dicHingeElem, vWriteData)
    End If
  End If
  
  If ChangeSheetName.Exists(m_Sheet_Rigid) Then Call clsRigid.ChangeRigid
  
  If ChangeSheetName.Exists(m_Sheet_SPG6Comp) Then
    If clsSPG6Comp.GetHingeSPG6Comp(dicSPG6Comp) >= 0 Then
      nCnt = GetSpringData
      If ChangeSheetName.Exists(m_Sheet_ElmSpr) Then Call clsElmSpr.ChangeElemSpring(dicSPG6Comp)
     Call clsSPGAllSym.ChangeSPGAllSym(dicSPG6Comp)
     Call clsSPGAllASym.ChangeSPGAllASym(dicSPG6Comp)
    End If
  End If
  
  If ChangeSheetName.Exists(m_Sheet_Fulcrum) Then Call clsFulcrum.ChangeFulcrum(dicSprType)
  If ChangeSheetName.Exists(m_Sheet_FulcDetail) Then Call clsFulcDetail.ChangeFulcDetail(dicSprType)
  If ChangeSheetName.Exists(m_Sheet_NodalMass) Then Call clsNodalMass.ChangeNodalMass
  If ChangeSheetName.Exists(m_Sheet_Load) Then Call clsLoad.ChangeLoad
  If ChangeSheetName.Exists(m_Sheet_InternalForce) Then Call clsInternalForce.ChangeInternalForce
  
  Set dicNewSheets = New Dictionary
  For i = 1 To m_ChangeBook.Sheets.Count
    dicNewSheets.Add m_ChangeBook.Sheets(i).Name, i
  Next i
  If dicNewSheets.Exists(m_Sheet_SPGAllOther) Then
    Call clsSPGAllOther.FixWriteColor
  End If
  
  j = 1
  For i = 2 To m_ThisWorkbook.Sheets.Count
    If dicNewSheets.Exists(m_ThisWorkbook.Sheets(i).Name) Then
      If m_ChangeBook.Sheets(j + 1).Name <> m_ThisWorkbook.Sheets(i).Name Then
        m_ChangeBook.Sheets(m_ThisWorkbook.Sheets(i).Name).Move after:=m_ChangeBook.Sheets(j)
      End If
      j = j + 1
    End If
  Next i
  
  m_ThisWorkbook.Sheets(1).Activate
  m_ThisWorkbook.Sheets(1).Cells(1, 1).Select
  m_Sheet_MCT.Activate
  Application.DisplayAlerts = True

  m_ChangeBook.Save
  m_ChangeBook.Activate
  
  Application.ScreenUpdating = True
  MsgBox msgEnd

End Sub

Public Sub FixtWriteColor(ByRef strName As String, ByVal nReadSTRow As Long, ByVal nReadSTCol As Long)
  
  m_ChangeBook.Sheets(strName).Cells(nReadSTRow, nReadSTCol).Interior.Color = m_DataCellColor

End Sub

Public Sub ClearData(ByRef strName As String, _
                      ByVal nRow1 As Long, _
                      ByVal nCol1 As Long, _
                      ByVal nCol2 As Long, _
                      Optional ByVal nTitleRow As Long = 1)
  Dim nLastRow As Long
  Set m_ThisWorkbook = ActiveWorkbook
  m_ThisWorkbook.Sheets(strName).Select
  With m_ThisWorkbook.Sheets(strName)
    nLastRow = .Cells.SpecialCells(xlLastCell).Row
    
    .Range(.Cells(nRow1 - nTitleRow, nCol1), .Cells(nLastRow, nCol2 + 1)).Clear   'Contents
    .Range(.Cells(nRow1 - nTitleRow, nCol1), .Cells(nRow1 - 1, nCol2)).Interior.Color = m_DataCellColor
    .Cells(nRow1 - nTitleRow, nCol1).Interior.Color = m_DataCopyColor
    .Range(.Cells(nRow1 - nTitleRow, nCol2 + 1), .Cells(nLastRow, nCol2 + 1)).Interior.Pattern = xlNone
    .Range(.Cells(nRow1, nCol1), .Cells(nRow1, nCol2)).UseStandardWidth = True
    
    .Cells(nRow1 - nTitleRow, nCol1).Select
  End With

End Sub

Public Function AddSheet(ByVal strSheetName As String) As Worksheet
  Dim NewSheet As Worksheet
  Set NewSheet = m_ChangeBook.Sheets.Add(Before:=Sheets(m_ChangeBook.Sheets.Count))
  NewSheet.Name = strSheetName
  
  Set AddSheet = NewSheet
End Function

Public Function GetData(ByRef mWB As Workbook, _
                        ByRef strSheetName As String, _
                        ByVal nSTRow As Long, _
                        ByVal nSTCol As Long, _
                        ByVal nEDCol As Long, _
                        ByRef strData() As String, _
                        Optional ByVal bAllData As Boolean = False) As Long

If m_ResumeNext Then
  On Error Resume Next
End If
  
  Dim i As Long
  Dim j As Long
  Dim nCnt As Long, nRow As Long
  nCnt = -1
  Dim mWS_ORG As Worksheet
  Dim DataRange As Range
  
  Set mWS_ORG = m_ThisWorkbook.Sheets(strSheetName)
  
  mWS_ORG.Activate
  With mWS_ORG
    nRow = mWS_ORG.Cells.SpecialCells(xlLastCell).Row
    
    For i = nRow To nSTRow - 1 Step -1
      If Len(mWS_ORG.Cells(i, nSTCol) & mWS_ORG.Cells(i, nSTCol + 1)) > 0 Then Exit For
    Next i
    
    nRow = i
    Set DataRange = .Range(.Cells(1, nSTCol), .Cells(nRow, nEDCol))
  End With
  
  Dim mWS As Worksheet
  Set mWS = mWB.Sheets(strSheetName)
  DataRange.Copy mWS.Range(mWS.Cells(1, nSTCol), mWS.Cells(nRow, nEDCol))
  
  Dim strBuf As String
  For i = nSTRow To mWS.Cells.SpecialCells(xlLastCell).Row
    
    strBuf = ""
    If Len(mWS.Cells(i, nSTCol).Value) > 0 Or bAllData Then
      
      nCnt = nCnt + 1
      ReDim Preserve strData(UBound(strData), nCnt)
      
      For j = nSTCol To nEDCol
        strBuf = strBuf & mWS.Cells(i, j).Value
        strData(j - nSTCol, nCnt) = mWS.Cells(i, j).Value
      Next j
      
      If Len(Trim(strBuf)) = 0 Then nCnt = nCnt - 1
      
    End If
  Next i
  
  mWS.Range(mWS.Cells(1, nSTCol), mWS.Cells(nRow, nEDCol)).EntireColumn.AutoFit
  
  If nSTRow <= nRow Then
    Call SurroundingLines(mWS, nSTRow, nSTCol, nRow, nEDCol)
  End If
  
  mWS_ORG.Cells(nSTRow - 1, nSTCol).Select
  GetData = nCnt
  
End Function

Public Function ChkHorPnt(nNode1 As Long, nNode2 As Long) As Long

  ' m_dicESNode は、Civil NX 座標系
  Dim p(1) As PointType
  Dim nRet As Long
  
  p(0).x = m_dicESNode(nNode1)(0)
  p(0).y = m_dicESNode(nNode1)(1)
  
  p(1).x = m_dicESNode(nNode2)(0)
  p(1).y = m_dicESNode(nNode2)(1)
  
  If p(0).x = p(1).x And p(0).y = p(1).y Then
    nRet = 0    ' 垂直部材
  Else
    nRet = 1    ' 垂直ではない
  End If
  
  ChkHorPnt = nRet

End Function

'Public Function GetSpringPoint2Angle(nNode1 As Long, nNode2 As Long, vChange As Variant) As Double
'
'  Dim i As Long, nChange(2) As Long
'  Dim p(1) As PointType, vect As PointType
'
'  For i = 1 To 3
'    nChange(i - 1) = vChange(i) / Abs(vChange(i))
'  Next i
'
'  p(0).x = nChange(0) * m_dicESNode(nNode1)(Abs(vChange(0)) - 1)
'  p(0).y = nChange(1) * m_dicESNode(nNode1)(Abs(vChange(1)) - 1)
'  p(0).z = nChange(2) * m_dicESNode(nNode1)(Abs(vChange(2)) - 1)
'
'  p(1).x = nChange(0) * m_dicESNode(nNode2)(Abs(vChange(0)) - 1)
'  p(1).y = nChange(1) * m_dicESNode(nNode2)(Abs(vChange(1)) - 1)
'  p(1).z = nChange(2) * m_dicESNode(nNode2)(Abs(vChange(2)) - 1)
'
'  vect.x = p(1).x - p(0).x
'  vect.y = p(1).y - p(0).y
'  vect.z = p(1).z - p(0).z
'
'  If vect.x = 0# And vect.y = 0# And vect.z = 0# Then
'    GetSpringPoint2Angle = 0#
'    Exit Function
'  End If
'
'  GetSpringPoint2Angle = GetCalcAngle(p, vect)
'
'End Function


Public Function GetNodeNo2Angle(nNode1 As Long, nNode2 As Long, nNode3 As Long) As Double

  Dim p As PointType
  
  p.x = m_dicESNode(nNode3)(0)
  p.y = m_dicESNode(nNode3)(1)
  p.z = m_dicESNode(nNode3)(2)
  
  GetNodeNo2Angle = GetAngle(nNode1, nNode2, p)

End Function
'
'Public Function GetAngle(nNode1 As Long, nNode2 As Long, vect As PointType) As Double
'
'  If vect.x = 0# And vect.y = 0# And vect.z = 0# Then
'    GetAngle = 0#
'    Exit Function
'  End If
'
'  Dim p(1) As PointType
'  p(0).x = m_dicESNode(nNode1)(0)
'  p(0).y = m_dicESNode(nNode1)(1)
'  p(0).z = m_dicESNode(nNode1)(2)
'
'  p(1).x = m_dicESNode(nNode2)(0)
'  p(1).y = m_dicESNode(nNode2)(1)
'  p(1).z = m_dicESNode(nNode2)(2)
'
'  GetAngle = GetCalcAngle(p, vect)
'
'End Function

Public Function GetAngle(nNode1 As Long, nNode2 As Long, vectES As PointType) As Double

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim p(1) As PointType
  Dim dist(2) As Double
  Dim vect As PointType
  
  vect.x = vectES.x
  vect.y = -1# * vectES.z
  vect.z = vectES.y
  
  
  p(0).x = m_dicESNode(nNode1)(0)
  p(0).y = m_dicESNode(nNode1)(1)
  p(0).z = m_dicESNode(nNode1)(2)

  p(1).x = m_dicESNode(nNode2)(0)
  p(1).y = m_dicESNode(nNode2)(1)
  p(1).z = m_dicESNode(nNode2)(2)
'
' テストデータ
'  p(0).x = 20
'  p(0).y = 0
'  p(0).z = 0
'
'  p(1).x = 20
'  p(1).y = 0
'  p(1).z = 10
'
'  vect.x = 1
'  vect.y = 2
'  vect.z = 3
    
  ' 要素X軸方向の単位ベクトル
  Dim dBaseX As Double
  Dim pBaseX As PointType
  
  dist(0) = p(1).x - p(0).x
  dist(1) = p(1).y - p(0).y
  dist(2) = p(1).z - p(0).z
  
  dBaseX = Sqr(dist(0) ^ 2 + dist(1) ^ 2 + dist(2) ^ 2)
  pBaseX.x = dist(0) / dBaseX
  pBaseX.y = dist(1) / dBaseX
  pBaseX.z = dist(2) / dBaseX
  
  ' 参照ベクトルの単位ベクトル
  Dim dRefBase As Double
  Dim pRefBase As PointType
  
  dRefBase = Sqr(vect.x ^ 2 + vect.y ^ 2 + vect.z ^ 2)
  pRefBase.x = vect.x / dRefBase
  pRefBase.y = vect.y / dRefBase
  pRefBase.z = vect.z / dRefBase
  
  ' 変換後の要素座標系-y軸を計算 - x軸と参照ベクトルの外積--※1
  Dim pCrsProd As PointType
  pCrsProd.x = pBaseX.z * pRefBase.y - pBaseX.y * pRefBase.z
  pCrsProd.y = pBaseX.x * pRefBase.z - pBaseX.z * pRefBase.x
  pCrsProd.z = pBaseX.y * pRefBase.x - pBaseX.x * pRefBase.y
  
  ' ※1の単位ベクトルを取得し、y軸の単位ベクトル計算
  Dim dBaseY As Double
  Dim pBaseY As PointType
  dBaseY = Sqr(pCrsProd.x ^ 2 + pCrsProd.y ^ 2 + pCrsProd.z ^ 2)

  pBaseY.x = pCrsProd.x / dBaseY
  pBaseY.y = pCrsProd.y / dBaseY
  pBaseY.z = pCrsProd.z / dBaseY
  
  ' 変換後のz軸(単位ベクトル)を計算 - 変換後のy軸とx軸を外積
  Dim pBaseZ As PointType
  pBaseZ.x = pBaseY.z * pBaseX.y - pBaseY.y * pBaseX.z
  pBaseZ.y = pBaseY.x * pBaseX.z - pBaseY.z * pBaseX.x
  pBaseZ.z = pBaseY.y * pBaseX.x - pBaseY.x * pBaseX.y
  
  ' 変換前の参照ベクトル
  Dim pBeforeRefVect(1) As PointType
  pBeforeRefVect(0).x = 1   ' 垂直部材
  pBeforeRefVect(0).y = 0   ' 垂直部材
  pBeforeRefVect(0).z = 0   ' 垂直部材
  
  pBeforeRefVect(1).x = 0   ' その他
  pBeforeRefVect(1).y = 0   ' その他
  pBeforeRefVect(1).z = 1   ' その他
    
  Dim n As Long
  ' 変換前の要素座標系-y軸を計算 - x軸と変換前の参照ベクトルの外積
  Dim pBeforeY As PointType
  
  If dist(0) = 0 And dist(1) = 0 Then
    n = 0
  Else
    n = 1
  End If
  
  pBeforeY.x = pBaseX.y * pBeforeRefVect(n).z - pBaseX.z * pBeforeRefVect(n).y
  pBeforeY.y = pBaseX.z * pBeforeRefVect(n).x - pBaseX.x * pBeforeRefVect(n).z
  pBeforeY.z = pBaseX.x * pBeforeRefVect(n).y - pBaseX.y * pBeforeRefVect(n).x
  
  ' 単位ベクトル計算
  Dim dBefBaseY As Double
  Dim pBefBaseY As PointType
  dBefBaseY = Sqr(pBeforeY.x ^ 2 + pBeforeY.y ^ 2 + pBeforeY.z ^ 2)
  pBefBaseY.x = pBeforeY.x / dBefBaseY
  pBefBaseY.y = pBeforeY.y / dBefBaseY
  pBefBaseY.z = pBeforeY.z / dBefBaseY
  
  ' 変換前のz軸(単位ベクトル)を計算 - 上記のy軸とx軸の外積
  Dim pDefBaseZ As PointType
  pDefBaseZ.x = pBefBaseY.y * pBaseX.z - pBefBaseY.z * pBaseX.y
  pDefBaseZ.y = pBefBaseY.z * pBaseX.x - pBefBaseY.x * pBaseX.z
  pDefBaseZ.z = pBefBaseY.x * pBaseX.y - pBefBaseY.y * pBaseX.x
  
  ' 換後のz軸と変換前のzの内積を取ってβ角度を計算
  Dim pCrossProduct As PointType
  If pBaseX.x = 0 And pBaseX.y = 0 Then
    pCrossProduct.x = pBeforeRefVect(0).x
    pCrossProduct.y = pBeforeRefVect(0).y
    pCrossProduct.z = pBeforeRefVect(0).z
  Else
    pCrossProduct.x = pDefBaseZ.x
    pCrossProduct.y = pDefBaseZ.y
    pCrossProduct.z = pDefBaseZ.z
  End If
  
  Dim dCos As Double
  dCos = (pBaseZ.x * pCrossProduct.x + pBaseZ.y * pCrossProduct.y + pBaseZ.z * pCrossProduct.z) / _
       (Sqr(pBaseZ.x ^ 2 + pBaseZ.y ^ 2 + pBaseZ.z ^ 2) * Sqr(pCrossProduct.x ^ 2 + pCrossProduct.y ^ 2 + pCrossProduct.z ^ 2))
  
  Dim dAngle As Double
  dAngle = 0#
  If pCrsProd.z >= 0 Then
    dAngle = Application.WorksheetFunction.Acos(dCos)
  Else
    dAngle = -1# * Application.WorksheetFunction.Acos(dCos)
  End If
  
  GetAngle = dAngle * 180 / (4 * Atn(1))
  
End Function

Public Function ChgCamma(ByVal strORG As String) As String

  ChgCamma = Replace(strORG, ",", "-")

End Function

Public Function ChangeMatlName(ByRef s_Matl As String, Optional ByVal nMax As Long = 13) As String

If m_ResumeNext Then
  On Error Resume Next
End If
  
  Dim strMatl As String
  strMatl = ChgCamma(s_Matl)
  
  If Len(strMatl) <= nMax Then
    ChangeMatlName = strMatl
    Exit Function
  End If

  Dim strRet As String, strBuf As String
  Dim n As Long
  If m_dicMatlName.Exists(strMatl) Then
    strRet = m_dicMatlName(strMatl)
  Else
    strBuf = Left(strMatl, nMax)
    strBuf = strBuf & "~"
    n = 1
    strRet = strBuf & n
    While m_dicMatlNameBuf.Exists(strRet)
      n = n + 1
      strRet = strBuf & n
    Wend

    m_dicMatlNameBuf.Add strRet, True
    m_dicMatlName.Add strMatl, strRet

  End If

  ChangeMatlName = strRet

End Function

Public Function HingeName(ByRef strHinge As String) As String

If m_ResumeNext Then
  On Error Resume Next
End If
  
  If Len(strHinge) < 20 And Not m_LongHingeNameBuf.Exists(strHinge) Then
    m_LongHingeNameBuf.Add strHinge, True
    HingeName = strHinge
    Exit Function
  End If
  
  Dim strRet As String, strBuf As String
  Dim n As Long
  strBuf = Left(strHinge, 15)
  strBuf = strBuf & "~"
  n = 1
  strRet = strBuf & n
  While m_LongHingeNameBuf.Exists(strRet)
    n = n + 1
    strRet = strBuf & n
  Wend
  
  m_LongHingeNameBuf.Add strRet, True

  HingeName = strRet
  
End Function

Public Function GetStringGen(ByRef strData As String) As String

If m_ResumeNext Then
  On Error Resume Next
End If

  Dim i As Long, j As Long, Num As Long
  Dim vDataBuf As Variant
  Dim vData() As Variant
  Dim strBuf As String
  
  If InStr(strData, ",") <= 0 Then
    GetStringGen = strData
    Exit Function
  End If
  
  vDataBuf = Split(strData, ",")
  
  ' データのない配列を削除
  j = 0
  For i = 0 To UBound(vDataBuf)
    
    If Len(vDataBuf(i)) > 0 Then
      ReDim Preserve vData(j)
      vData(j) = vDataBuf(i)
      j = j + 1
    End If
    
  Next i
  
  ' 整列
  For i = 0 To UBound(vData) - 1
    For j = i + 1 To UBound(vData)
      If CLng(vData(i)) > CLng(vData(j)) Then
        strBuf = vData(j)
        vData(j) = vData(i)
        vData(i) = strBuf
      End If
    Next j
  Next i
  
  j = 0
  strBuf = "'" & vData(0)
  For i = 1 To UBound(vData)
    If CLng(vData(i - 1)) + 1 <> CLng(vData(i)) Then
      If j = 0 Then
        strBuf = strBuf & " " & vData(i)
      Else
        strBuf = strBuf & "to" & vData(i - 1) & " " & vData(i)
      End If
      j = -1
    End If
    
    j = j + 1
  Next i
  
  If j > 0 Then strBuf = strBuf & "to" & vData(UBound(vData))
  
  GetStringGen = strBuf

End Function

Public Sub データ初期化()

  Dim bResult As VbMsgBoxResult
  bResult = MsgBox("データを消しますか？", vbYesNo + vbDefaultButton2, "確認")

  If bResult = vbNo Then Exit Sub
  
  Set clsNode = New Class010_Node
  Set clsFrame = New Class020_Frame
  Set clsPlnElm = New Class030_PlnElm
  
  Set clsRigid = New Class040_Rigid
  Set clsMaterial = New Class050_Material
  Set clsNumbSect = New Class055_NumbSect
  Set clsSectElem = New Class060_SectElem
  Set clsSect = New Class070_Sect
  Set clsPlnSect = New Class080_PlnSect
  
  Set clsHngPrp = New Class090_Hinge_Prop
  Set clsHngAss = New Class100_Hinge_Ass
  Set clsElmSpr = New Class110_ElemSpring
  Set clsSPG6Comp = New Class120_SPG6Comp
  Set clsSPGAllSym = New Class130_SPGAllSym
  Set clsSPGAllASym = New Class140_SPGAllASym
  Set clsSPGAllOther = New Class150_SPGAllOther
  
  Set clsFulcrum = New Class160_Fulcrum
  Set clsFulcDetail = New Class170_FulcDetail
  Set clsNodalMass = New Class180_NodalMass
  Set clsLoad = New Class190_Load
  Set clsInternalForce = New Class200_InternalForce
  
  Call clsNode.ClearSheet
  Call clsFrame.ClearSheet
  Call clsPlnElm.ClearSheet
  Call clsRigid.ClearSheet
  Call clsMaterial.ClearSheet
  Call clsNumbSect.ClearSheet
  Call clsSectElem.ClearSheet
  Call clsSect.ClearSheet
  Call clsPlnSect.ClearSheet

  Call clsHngPrp.ClearSheet
  Call clsHngAss.ClearSheet
  Call clsElmSpr.ClearSheet
  Call clsSPG6Comp.ClearSheet
  Call clsSPGAllSym.ClearSheet
  Call clsSPGAllASym.ClearSheet
  Call clsSPGAllOther.ClearSheet

  Call clsFulcrum.ClearSheet
  Call clsFulcDetail.ClearSheet
  Call clsNodalMass.ClearSheet
  Call clsLoad.ClearSheet
  Call clsInternalForce.ClearSheet
  
  m_ThisWorkbook.Sheets(clsNode.strName).Activate

End Sub

Public Function FileNameCheck(ByVal data_Dir As String, ByRef data_File As String) As String

If m_ResumeNext Then
  On Error Resume Next
End If
    
    ' ファイル作成
    Dim i As Integer
    Dim new_name As String
    Dim FileName As String
    
    If Right(data_Dir, 1) <> "\" Then data_Dir = data_Dir & "\"
    
    new_name = data_File
    FileName = Dir(data_Dir & new_name & ".xlsx", vbNormal)
    i = 0

    Do While FileName <> ""
        i = i + 1
        new_name = data_File & "(" & i & ")"
        FileName = Dir(data_Dir & new_name & ".xlsx", vbNormal)
    Loop

    data_File = new_name & ".xlsx"
    FileNameCheck = data_Dir & new_name
    
End Function

Private Function GetSpringData() As Long
  
  ' ばね特性成分一覧
If m_ResumeNext Then
  On Error Resume Next
End If
  
  Dim i As Long, j As Long, k As Long, l As Long, n As Long, m As Long, o As Long
  Dim nRow As Long, nST(3) As Long, nED(3) As Long
  Dim vCls(2) As Variant
    
  Set vCls(0) = clsSPGAllSym
  Set vCls(1) = clsSPGAllASym
  Set vCls(2) = clsSPGAllOther
    
  Dim nCnt As Long
  Dim strData() As String
  
  Dim dicComponent As Dictionary
  Set dicComponent = New Dictionary
  dicComponent.Add "xl", 1
  dicComponent.Add "yl", 2
  dicComponent.Add "zl", 3
  dicComponent.Add "θxl", 4
  dicComponent.Add "θyl", 5
  dicComponent.Add "θzl", 6
  
  Dim dicType As Dictionary
  Set dicType = New Dictionary
  dicType.Add "d-K", 0
  dicType.Add "d-F", 1
  
  Dim dValue As Double
  Dim nSprCnt As Long, nTotal As Long, nRetCnt As Long
  Dim mWS As Worksheet
  
  nRetCnt = 0
  For i = 0 To UBound(vCls)
    
    Set mWS = AddSheet(vCls(i).strName)
    Erase nST
    Erase nED
    
    nSprCnt = vCls(i).GetArea(nRow, nST, nED)
    
    nTotal = 0
    For j = 0 To nSprCnt
      ReDim strData(nED(j) - nST(j), 0)
      n = GetData(m_ChangeBook, vCls(i).strName, nRow, nST(j), nED(j), strData)
      
      If n >= 0 Then
        
        nTotal = nTotal + 1
        For k = 0 To UBound(strData, 2)
          
          If Not m_dicSprProp.Exists(strData(0, k)) Then
            nCnt = m_dicSprProp.Count
            m_dicSprProp.Add strData(0, k), nCnt
            ReDim Preserve m_SprCompORG(nCnt)
          Else
            nCnt = m_dicSprProp(strData(0, k))
          End If
          n = dicComponent(strData(1, k))   ' 成分
             m_SprCompORG(nCnt).SprCompData(n).nComponent = i
          m_SprCompORG(nCnt).SprCompData(n).nType = j
          m_SprCompORG(nCnt).SprCompData(n).mct_iTYPE = 1   ' d_F 固定とする  ' Abs(dicType(strData(2, k)) - 1)
          m_SprCompORG(nCnt).SprCompData(n).mct_SFType = 3 + m_SprCompORG(nCnt).SprCompData(n).mct_iTYPE * 2
          m_SprCompORG(nCnt).SprCompData(n).mct_dStiff = 1#
          If i = 0 Then
            ' 対称
            If j = 0 Then
              ' 線形
              dValue = CDbl(CDbl(strData(3, k)))
              dValue = ChangeMM_M(dValue)
              m = 4 + i + j + dicType(strData(2, k)) * (i + j + 1)
              m_SprCompORG(nCnt).SprCompData(n).strProp = strData(m, k)
              If dicType(strData(2, k)) = 1 Then m_SprCompORG(nCnt).SprCompData(n).strProp = CDbl(m_SprCompORG(nCnt).SprCompData(n).strProp) / dValue
            Else
              ' 非線形
              ' 3-8
              ' 3-11
              ' 5-12,16-19
              
              ReDim m_SprCompORG(nCnt).SprCompData(n).strTENS(1, j)
              
              m_SprCompORG(nCnt).SprCompData(n).strProp = strData(1, k)
              If j < 3 Then
                For m = 0 To j
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = strData(m + 3, k)
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK = strData(m + 4 + j, k)
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF = strData(m + 5 + j * 2, k)
                Next m
              Else
                For m = 0 To j
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = strData(m + 5, k)
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK = strData(m + 9, k)
                  m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF = strData(m + 16, k)
                Next m
              End If
              
              For m = 0 To UBound(m_SprCompORG(nCnt).SprCompData(n).strTENS, 2)
                dValue = CDbl(m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD)
                dValue = ChangeMM_M(dValue)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = dValue
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strD = dValue
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strK = m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strF = m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF
              Next m
            End If
          ElseIf i = 1 Then
            ' 非対称
            ' j = 0, 3- 8, 10-15
            ' j = 1, 3-11, 12-20
            ' j = 2, 5-12,16-19,22-29,33-36
            
            m_SprCompORG(nCnt).SprCompData(n).strProp = strData(1, k)
            ReDim m_SprCompORG(nCnt).SprCompData(n).strTENS(1, j + 1)
'            ReDim m_SprCompORG(nCnt).SprCompData(n).strCOMP(1, j + 1)
            If j = 0 Then
              ' バイリニア
'              ' j = 0, 3- 8, 10-15
              For m = 0 To j + 1
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = strData(m + 3, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK = strData(m + 5, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF = strData(m + 7, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strD = Abs(strData(m + 10, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strK = Abs(strData(m + 12, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strF = Abs(strData(m + 14, k))
              Next m
                           
              If m_SprCompORG(nCnt).SprCompData(n).mct_HYST = "TAK" Then
                ReDim Preserve m_SprCompORG(nCnt).SprCompData(n).strTENS(1, j + 2)
                For m = 1 To 0 Step -1
                  For o = 2 To 1 Step -1
                    m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o).strK = m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o - 1).strK
                    m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o).strF = m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o - 1).strF
                    m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o).strD = m_SprCompORG(nCnt).SprCompData(n).strTENS(m, o - 1).strD
                  Next o
                Next m
              End If
'
'              For m = 0 To UBound(m_SprCompORG(nCnt).SprCompData(n).strTENS, 2)
'                For l = 0 To 1
'                  dValue = CDbl(m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m).strD)
'                  dValue = ChangeMM_M(dValue)
'                  m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m).strD = dValue
'                Next l
'              Next m
              
            ElseIf j = 1 Then
              ' トリリニア
'              ' j = 1, 3-11, 12-20
              For m = 0 To j + 1
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = strData(m + 3, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK = strData(m + 6, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF = strData(m + 9, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strD = Abs(strData(m + 12, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strK = Abs(strData(m + 15, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strF = Abs(strData(m + 18, k))
              Next m
            Else
              ' テトラリニア
'              ' j = 2, 5-12,16-19,22-29,33-36
              For m = 0 To j + 1
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strD = strData(m + 5, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strK = strData(m + 9, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(0, m).strF = strData(m + 16, k)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strD = Abs(strData(m + 22, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strK = Abs(strData(m + 26, k))
                m_SprCompORG(nCnt).SprCompData(n).strTENS(1, m).strF = Abs(strData(m + 33, k))
              Next m
            End If
            
            For m = 0 To UBound(m_SprCompORG(nCnt).SprCompData(n).strTENS, 2)
              For l = 0 To 1
                dValue = CDbl(m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m).strD)
                dValue = ChangeMM_M(dValue)
                m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m).strD = dValue
              Next l
            Next m
            
          Else
            ' その他
            If j = 0 Then
              ' 名古屋高速ゴム支承
              ReDim m_SprCompORG(nCnt).SprCompData(n).strData(3)
              m_SprCompORG(nCnt).SprCompData(n).strProp = strData(1, k)
              m_SprCompORG(nCnt).SprCompData(n).strData(0) = strData(2, k)
              m_SprCompORG(nCnt).SprCompData(n).strData(1) = ChangeMM_M(strData(3, k))
              m_SprCompORG(nCnt).SprCompData(n).strData(2) = ChangeMM2_M2(strData(4, k))
              m_SprCompORG(nCnt).SprCompData(n).strData(3) = ChangeMM2_M2(strData(5, k))
'              ReDim m_SprCompORG(nCnt).SprCompData(n).strData(3)
'              m_SprCompORG(nCnt).SprCompData(n).strProp = strData(1, k)
'              m_SprCompORG(nCnt).SprCompData(n).strData(0) = strData(2, k)
'              m_SprCompORG(nCnt).SprCompData(n).strData(1) = ChangeMM_M(strData(4, k))
'              m_SprCompORG(nCnt).SprCompData(n).strData(2) = ChangeMM2_M2(strData(3, k))
'              m_SprCompORG(nCnt).SprCompData(n).strData(3) = ChangeMM2_M2(strData(7, k))
            End If
            
            If j = 1 Then
              ' BMR(CD)ダンパー
              msgEnd = msgEnd & Chr(13) & msg_Damper
            End If
          End If
          
          If i < 2 And m_SprCompORG(nCnt).SprCompData(n).mct_iTYPE = 0 Then
            ' 剛性データ作成
            For l = 0 To 1
              m_SprCompORG(nCnt).SprCompData(n).mct_dStiff = m_SprCompORG(nCnt).SprCompData(n).strTENS(l, 0).strK
'              For m = UBound(m_SprCompORG(nCnt).SprCompData(n).strTENS, 2) To 1 Step -1
'                m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m - 1).strD = m_SprCompORG(nCnt).SprCompData(n).strTENS(l, m).strK / m_SprCompORG(nCnt).SprCompData(n).strTENS(l, 0).strK
'              Next m
            Next l
          End If
        Next k
      End If
    Next j
    
    If nTotal = 0 Then
      mWS.Delete
    Else
      nRetCnt = nRetCnt + 2 ^ i
    End If
  Next i
  
  ReDim m_SprComp(UBound(m_SprCompORG))
  m_SprComp = m_SprCompORG
  
  GetSpringData = nRetCnt
  
End Function

'Private Function CheckFolder() As Boolean
'
'  Dim bRet As Boolean
'  Dim strPath As String, strDir As String
'
'  bRet = True
'
'  strPath = m_ThisWorkbook.Path
'  If Right(strPath, 1) <> "\" Then strPath = strPath & "\"
''  strDir = strPath & m_WriteDir
'
''  If Dir(strDir, vbDirectory) = "" Then
''    ' フォルダ作成
''    MkDir strDir
''  End If
'
'  If Dir(strDir, vbDirectory) = "" Then bRet = False
'
'  CheckFolder = bRet
'
'End Function

Private Sub SurroundingLines(ByRef mWS As Worksheet, _
                             ByRef nRow1 As Long, _
                             ByRef nCol1 As Long, _
                             ByRef nRow2 As Long, _
                             ByRef nCol2 As Long)

  With mWS.Range(mWS.Cells(nRow1, nCol1), mWS.Cells(nRow2, nCol2))
    .Borders(xlDiagonalDown).LineStyle = xlNone
    .Borders(xlDiagonalUp).LineStyle = xlNone
    With .Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With .Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With .Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With .Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With .Borders(xlInsideVertical)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlHairline
    End With
    With .Borders(xlInsideHorizontal)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlHairline
    End With
  End With
End Sub
