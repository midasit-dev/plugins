# Seismic Hazard Map

**Intro**
------
The National Seismic Hazard Map Plugin utilizes the **Seismic Hazard Map** specified by the Ministry of Public Administration and Security of Korea, as per the seismic design standards KDS 17 10 00:2024, to check the earthquake risk for specific sites based on various return periods.

- Validates seismic design standards KDS 17 10 00:2024.
- Checks earthquake risks for various return periods (50, 100, 200, 500, 1000, 2400, 4800 years).
- Queries earthquake risk via address or latitude/longitude input.

**Version**
------
__v1.0.0__: Plugin release


**Language**
------
__English__


**Benefits of this plugin**
------
According to KDS 17 10 00:2024 4.2.1.1(4), the Minister of Public Administration and Security’s approved national earthquake hazard map can be used for precise assessment of seismic hazard (seismic disaster) for specific sites.

The current official map showing earthquake risk is the **“National Seismic Hazard Map”** published in 2013.

However, this map did not allow direct access to data values for representative areas. As a result, users must either exert effort to analyze estimated points on the image or occasionally input incorrect data, leading to erroneous seismic designs.

- Provides quick and accurate earthquake risk information.
- Allows querying of earthquake risks according to various recurrence intervals.
- Enhances user convenience with address or latitude/longitude input.

This plugin linearly interpolates data values from the official map based on an address or latitude/longitude, providing more accurate results, although the values are still estimates.

**How to use this plugin?**
------

#### Design Standard Verification:
1. Launch the plugin and review the seismic design standards KDS 17 10 00:2024.

#### Return Period Setting:
2. Set the return period.
  - e.g., **2400** years

#### Target Address Entry:
3. Enter the **target address** and click the **Search** button.
  - Enter the address directly (by Address) or by latitude/longitude coordinates(by Latitude/Longitude).

#### Result Verification:
4. Verify the earthquake risk results for the entered address 

**Conclusion**
------
This guide enables you to effectively utilize the Seismic Hazard Map Plugin to check the earthquake risk for specific sites based on various return periods, enhancing both the precision and efficiency of seismic risk assessments.



