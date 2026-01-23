VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} Frm_Version 
   Caption         =   "ƒo?ƒWƒ‡ƒ“‘I‘ð"
   ClientHeight    =   1995
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   3075
   OleObjectBlob   =   "Frm_Version.frx":0000
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "Frm_Version"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub CmdBtn_Exec_Click()
  
  m_Version = Comb_Version.ListIndex
  Unload Me

End Sub

Private Sub UserForm_Initialize()

  Comb_Version.AddItem "CIVIL NX 2025(v1.1)", 0
  Comb_Version.AddItem "CIVIL NX 2026(v1.1)", 1
  Comb_Version.ListIndex = Comb_Version.ListCount - 1
  
  m_Version = -1
  
End Sub
