# Image Capture Generator

- This plugin helps you automate the generation of multiple Result Graphic outputs by saving and reusing visualization settings.

## Details

### Version 1.1.0

- An issue where Mode Numbers were not displayed has been fixed.
- An issue causing broken icons has been fixed.

### Version 1.0.0

- This plugin helps you **automatically generate multiple prints** by **saving the settings information** of the Result Graphic and using the saved files.
- **Image output is now supported in Preprocessing Mode**, with the following new features:
  a. Property names can be displayed  
  b. Wall marks can be shown (GEN NX only)  
  c. A description can be added  
  d. When using Active by Identity, floor selection is now available

## How to Use

1. **Saving Settings**  
   a. In the **DB Tab**, select the Result Category and Component, then save  
   b. In the **Type of Display Tab**, select the settings for each category, then save  
   c. In the **View Tab**, select the Active Option and View Option, then save  
   d. In the **Work Tree** (right panel), verify the saved settings and download the `.json` file

2. **Generating Output**  
   a. Select **Add File** to load the file you want to output  
   b. Click the **Select Load Case** button to choose the Load Case for output  
   c. Verify the values saved in the **Print File**, then click **Print Start** to begin printing

## Scope of Support

1. **Result Category** – Reaction, Deformation, Forces, Stresses, Moving Tracer, Mode Shapes
2. **Type of Display** – Contour, Value, Legend, Deform, Display Option, Applied Loads, Cutting Diagram
3. **Active Option**
4. **View Point Option**

## Caution

1. Values for the Component in the Setting information can be saved in multiple instances. Other types, such as Type of Display and View, are saved as single values.
2. Load Case can also be set in multiple instances.
3. The output path must be specified by the user manually.
