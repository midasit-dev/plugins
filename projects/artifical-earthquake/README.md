# Artificial Earthquake Generator

**Intro**
------
- This plugin generates  **response spectrum** and  **artificial earthquakes** for time history analysis according to standards and creates graphs.
- Using the design spectrum, artificial seismic waves can be generated and converted into spectrum load graphs.
- It includes the **ASCE7** spectrum series standard and data is obtained from the **USGS Seismic Design Geodatabase**.


**Version**
------
__v1.0.0__: Plugin release

**Language**
------
__English__

**Benefits of this plugin**
------
The plugin provides Response Spectrum data based on the ASCE7-22 standard, drawing from the USGS Seismic Design Geodatabase. It fetches latitude and longitude data for specified regions and offers four types of RS Data:
- Two-Period Design Spectrum
- Two-Period MCEr Spectrum
- Multi-Period Design Spectrum
- Multi-Period MCEr Spectrum

Additionally, based on the generated RS Data, it creates matched artificial ground motion data through RS matching (Spectral matching) to align with the target spectrum.

- Generates accurate response spectra and artificial seismograms according to standards.
- Provides reliable results using USGS data.
- Visualizes the generated data in graphs for easy analysis.
- Features an easy-to-use interface for selecting design criteria and entering data.

**How to use this plugin?**
------

##### Spectrum Standard Selection:
1. Launch the plugin and select the design spectrum standard (ASCE7-22).
##### Target Address Entry:
2. Enter the **target address** and click the **Search** button.
    - Enter the address directly (by Address) or by latitude/longitude coordinates(by Latitude/Longitude).
##### Seismic Data Input:
3. Set the **Risk Category** and **Soil Site Class**.

##### Result Verification:
4. Click the **Calc.Design Spectrum** button to generate the response spectrum.
5. Enter values appropriate for the earthquake scale considering Rise,Level,Total time and Damping Ratio.

##### AE Calc. Button:
6. Click the **Calc.Artificial Earthquake**. button to generate artificial seismogram data.

##### Analyze the Results:
7. Visualize the result graphs for analysis.

##### Data Update:
8. Click the **Update RS Function** or **Update TimeHistory Function** button to import the result data into the program.

**Conclusion**
------
This guide enables you to effectively generate and analyze response spectra and artificial seismograms for time history analysis using the new standard (ASCE7-22) RS and Artificial Seismogram Generator plugin.

