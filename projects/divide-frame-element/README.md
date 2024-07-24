# Floor Transition 

**Intro**
----------
This plugin aids in transferring or transitioning the shape of a measured floor to other floors within a structural model, especially useful in multi-story buildings.

- Provides functionality to switch floors in multi-story buildings.
- Transforms node and element coordinates based on floor information or z-coordinates.

**Version**
----------
__v1.0.0__: Plugin release


**Language**
----------
__English__

**Benefits of this plugin**
---
This plugin allows for the automatic adjustment of node and element coordinates, replacing the need for manual work or reliance on auxiliary programs like Excel. It is particularly useful for moving partial model segments vertically in structures equipped with wall belts.

Automates the adjustment of node and element coordinates, significantly saving time.
Reduces errors that can occur in manual processes, enhancing model accuracy.
Simplifies structural model modifications for efficient project management.

**How to use this plugin?**
----------
1. Select one reference node on the bottom floor to get the floor information 
2. Enter the floor you want to move 
3. Enter the destination floor to which you want to move
4. Click the **Apply** button.

**Floor Information Input Methods**
1. If floor information is available:
  - If each floor of the structure is distinctly identified by floor information, the operation is based on that Story Data.
  - For example, if you want to move nodes and elements from the 5th to the 9th floor in a 20-story building, input "5" for the source floor and "9" for the destination floor.

2. If no floor information is available:
  - If there is no separate floor information, the operation is based on the vertical coordinates (z-coordinates).
  - For example, if the z-coordinates of a node group are 0, 5, 10, consider these as "1st floor," "2nd floor," and "3rd floor," respectively, for input.
  - Thus, define the node group at z-coordinate 0 as "1", at 5 as "2", and at 10 as "3" for the operation.

**Conclusion**
----------
The Floor Transition Plugin facilitates the transformation of floor shapes in structural modeling projects. By automating the adjustment of node and element coordinates and effectively managing floor information, it is instrumental in achieving more accurate and faster modeling operations.
