# Lumped Hinge Checker

The Lumped Hinge Checker plugin reviews the Inelastic Hinge properties data assigned during nonlinear analysis to detect any incorrect data.

## Detail
### Version 1.0.0
1. Import Inelastic Hinge Properties data.
2. Yield Strength Review:
  - Review the imported data based on a yield strength value of 0.01.
  - If incorrect yield strength values(the yield strength value is less than 0.01) are found, the user is notified(**CHECK**).