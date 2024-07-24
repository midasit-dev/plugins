# Element information

**Intro**
------
This plugin helps you easily check element information. 
It is used when quickly checking and reviewing specific element details.

- Quickly check element information
- Provides necessary detailed information during modeling work without printing the element table


**Version**
------
__v1.0.0__: Plugin release


**Language**
------
__English__

**Benefits of this plugin**
------

- Quick confirmation of element information reduces errors
- Provides necessary information during modeling work without navigating between element tables, improving workflow

The method of displaying a detailed table for selected elements corresponds to the Element Table and Element Detail Table.
However, it was cumbersome to intuitively check the information of selected elements as follows:

__Element Table__: Displays the entire list of elements, with the selected element highlighted
__Element Detail Table__: Only the selected element is displayed in the table

In the plugin, you can __directly check the information of the selected elements__ without navigating to the Element Table or Element Detail Table.

**How to use this plugin?**
------

1. Select elements in modeling.
2. Place the cursor on the plugin to execute it.
3. You can check the selected element's type, material, section, connected node number, length, area, volume, unit weight, total weight, and Beam End Release information.

#### Element Information
  - __Elem ID__: Element ID
  - __Node Con__: Connected node ID
  - __Type__: Element type
  - __Material__: Name of the material assigned to the element
  - __Section__: Name of the section assigned to the element
  - __L/A/V__: Length, Area (in case of Plate), Volume (in case of Solid)
  - __Weight (U)__: Weight per unit length/area/volume (Unit Weight)
  - __Weight (T)__: Total weight of the element
  - __BER (Beam End Release)__: Displays release information at the I/J End.
    * __Hyphen (-)__: If there is no Beam End Release information
    * __F__: Fixed / __P__: Pinned


**Conclusion**
------
Through this guide, you can efficiently manage element information in structural modeling projects and quickly access needed information using the element information plugin.