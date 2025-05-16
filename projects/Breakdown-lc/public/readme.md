![](https://hubs.ly/Q02R9-MW0)

# Breakdown Load Combination Plugin
## Guidelines
### 1. Post-Analysis Usage
- Ensure the plugin is used in the ‘PostCS’ and ‘locked’ state.
### 2. Element Limit
- A maximum of 5 elements can be selected for simultaneous breakdown.
### 3. Load Combination Prefix

- **Provided Prefix**: If an LCB Prefix is provided, the plugin incorporates it into the generated load combination names.
- **No Prefix**: If no LCB Prefix is provided, the plugin creates names based on the selected load combinations.
- **Limitation**: The character limit for the breakdown LC is 20. Adjust the load case name or the prefix name accordingly.
- **Example**: `(LC/Prefix)_Mx_min_(element no.)`

Where:  
`p` (Prefix length) + `8` (fixed characters) + `q` (Load Case length) <= 20 characters
### 4. Load Case Criteria
- Ensure ‘Strength/Stress’, ‘Serviceability’, or ‘Active’ criteria is selected under the Active column.
### 5. Load Case Type
- Ensure ‘Add’ or ‘Envelope’ type is selected under the Type column.
### 6. Limitations
- South Africa and France moving loads are not supported.
### 7. Load Factors
- Ensure only positive load factors are provided for asymmetrical loads, such as moving loads and settlement loads. Negative load factors for these load cases are not permissible.

## Release notes.
### version 1.3.0
- Improved handling of construction stage forces during force selection.
### version 1.1.0
- Fixed issue related to undefined construction stage forces.
### version 1.0.0
- initial release.
