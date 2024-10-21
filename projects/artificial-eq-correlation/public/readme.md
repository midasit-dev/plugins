# Artificial Seismic Wave Correlation Coefficient Review

- This function reviews the correlation coefficient of the inputted artificial seismic waves (Time History Functions).
- Select the Time History Functions from those input into Midas Civil for correlation coefficient review.
- The default value for the correlation coefficient threshold is set to 0.16, but it can be modified by the user.
  <br />

## Details

### Version 1.0.0

- When the plugin is executed, the inputted Time History Functions are loaded (with a Refresh option available).
- By clicking the **Calculate** button, you can perform the correlation coefficient review.
- If the correlation coefficient is lower than the threshold value, it will be displayed in blue, and if higher, it will be displayed in red.
- **"NG"** in the results indicates that the correlation coefficient cannot be reviewed.
- Ensure that the number of data points in the two Time History Functions to be reviewed matches.
