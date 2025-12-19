# Element information

This plugin helps you easily check element information.
It is used when quickly checking and reviewing specific element details.

## Details

#### Element Information

- **Elem ID**: Element ID
- **Node Con**: Connected node ID
- **Type**: Element type
- **Material**: Name of the material assigned to the element
- **Section**: Name of the section assigned to the element
- **L/A/V**: Length, Area (in case of Plate), Volume (in case of Solid)
- **Weight (U)**: Weight per unit length/area/volume (Unit Weight)
- **Weight (T)**: Total weight of the element
- **BER (Beam End Release)**: Displays release information at the I/J End.
  - **Hyphen (-)**: If there is no Beam End Release information
  - **F**: Fixed / **P**: Pinned

### version 1.2.0

- We have added a Copy button to enable easy copy-and-paste of data into Excel.

### version 1.1.0

- We have updated and improved the internal libraries, enhancing performance and stability.
- Fixed exception handling when BER data is not available
