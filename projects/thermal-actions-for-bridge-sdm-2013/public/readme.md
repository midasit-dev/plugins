![](https://hubs.ly/Q02_mpN60)

# Temperature Load Calculator for bridges (HK)

This plug-in calculates thermal actions on bridge structures based on Section 3.5 **Temperature Effects** from the **STRUCTURES DESIGN MANUAL for Highways and Railways 2013 Edition (SDM 2013) (Revision 5), issued in December 2023.**, published by the Hong Kong Highways Department.

## Details

### Version: 1.1.0

- **Reference**: SDM 2013, Chapter 3.5 "Temperature Effects"
- **Issue Date**: December 2023

This plug-in is developed based on the Structures Design Manual for Highways and Railways, 2013 Edition (Revision 5), issued in December 2023. Users should take note of the latest version of the Manual when performing relevant designs.​

It estimates thermal actions on the bridge superstructure by considering both uniform temperature changes and temperature differences within the structure.

### Functionality

- **Uniform Temperature Components**: Calculates uniform temperature changes that govern the bridge’s movement. The uniform temperature is based on weighted averages of temperatures measured at various levels.
- **Temperature Difference Components**: Accounts for temperature variations between the top surface and other levels of the superstructure.
- Integrates thermal actions directly into the structural analysis.

### Important Considerations

- Ensure accurate temperature data (uniform and differential) for precise calculations.
- Compliant with SDM 2013 standards; future updates to the manual may require recalibration of the tool.

Version: 1.1.0

- **Loading Diagram Addition**: Included a loading diagram to help users visualize the temperature gradient/difference load application.
- **Temperature Load Flexibility Improvement**: Enabled users to reassign temperature loads, allowing new assignments or replacing previous loads on elements where a temperature load has already been applied.
- **Traceability Enhancement**: Provided reference clauses from the Manual to improve traceability.

### Version: 1.0.0

- Initial release
