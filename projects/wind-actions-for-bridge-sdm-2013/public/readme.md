![](https://hubs.ly/Q02_mtjG0)

# Wind Load Calculator for bridges (HK)

This plug-in calculates the Peak Velocity Pressure for wind actions applied to bridge structures, based on Section 3.4 **Wind Actions** from the **STRUCTURES DESIGN MANUAL for Highways and Railways 2013 Edition (SDM 2013)**, published by the Hong Kong Highways Department.

## Details

### Version: 1.0.0

- **Reference**: SDM 2013, Chapter 3.4 "Wind Actions"
- **Issue Date**: Updated to include the latest SDM 2013 revisions, effective as of 2023.

This plug-in uses the wind action guidelines specified in the SDM 2013 to estimate the Peak Velocity Pressure, which is then applied to the structural model of the bridge.

### Functionality

- Calculates wind-induced forces on bridge structures.
- Supports two calculation methods:
  - **3.4.2 Simplified Procedure**
  - **3.4.3 Full Procedure** (Note: Does not support the dynamic response procedure)
- Integrates wind pressures directly into the structural analysis for accurate design.
- **Height of Restraint**: Accounts for the height of restraints (e.g., parapets or barriers) not part of the model. The additional height is measured from the top in the local y or z (+) direction, depending on the load direction.

### Important Considerations

- Considers factors such as wind speed and terrain as outlined in SDM 2013 for accurate pressure calculations.
- This plug-in follows the standards set by SDM 2013, and any updates to the manual may require adjustments or recalibration of the tool.
