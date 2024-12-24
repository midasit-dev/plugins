![](https://hubs.ly/Q02hxwP10)

# Customized Load Combination

This plugin streamlines the process of creating and managing load combinations for structural design in **midas Civil NX**.
It provides options for defining load cases, factors, and settings required for specific design scenarios, ensuring compatibility with both standard and custom design codes.

## Details

### version 1.0.0

## Functionality

### 1. Generate Load Combinations

- Generates combinations in **midas Civil NX** under selected design tabs:
  - **Steel Design**
  - **Concrete Design**
  - **SRC Design**
  - **Composite Steel Girder Design**

### 2. Generate Envelop Load Combinations

- Automatically creates an envelope of the generated combinations.

### 3. Generate Inactive Load Combinations

- Produces combinations that are marked as "Inactive."

### 4. Import Load Cases

- Loads cases based on the generated model (e.g., Static, RS, MVL, TH, Settlement).

### 5. Export Load Combination Input

- Exports a wizard file for use in other models or for creating templates specific to local design codes (e.g., TMH, AREMA).
- Useful for regenerating combinations in Civil NX in case of errors.

---

## Usage Instructions

- **Define Active State**: Choose from Local, Inactive, Strength, or Service based on your design requirement.
- **Set Combination Type**: Select Add, Either, or Envelop to manage how cases are grouped.
- **Assign Factor Values**: Input values for Factors 1 to 5. Ensure at least one factor is defined per combination.
- **Generate Load Cases and Combinations**: Use the plugin to import, modify, or export load cases and combinations as needed.
- **Export or Import Configurations**: Save or load wizard files for efficient management across projects.
