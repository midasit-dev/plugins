Attribute VB_Name = "UNIT"
' ’PˆÊ•ÏŠ·

Public Function ChangeN_kN(ByVal dVal As Double) As Double

  ChangeN_kN = dVal * 0.001

End Function

Public Function ChangeMM_M(ByVal dVal As Double) As Double

  ChangeMM_M = dVal * 0.001

End Function

Public Function ChangeMM2_M2(ByVal dVal As Double) As Double

  ChangeMM2_M2 = dVal * 0.001 * 0.001

End Function

Public Function Change_par_MM2_M2(ByVal dVal As Double) As Double

  Change_par_MM2_M2 = dVal / 0.001 / 0.001

End Function
