<!-- ![](https://hubs.ly/Q02hxwP10) -->

# Load Combination Plugin - User Guide

## Overview

This plugin simplifies the creation and management of load combinations for structural design in **midas Civil NX**, allowing for both standard and custom design code compatibility.

---

## Features

### 1. Active State

- **Local**: Visible within the plugin.
- **Inactive**: Can be created in Civil NX.
- **Strength**: Auto-created for ULS (Ultimate Limit State).
- **Service**: Auto-created for SLS (Service Limit State).

### 2. Combination Type

- **Add**: Combines all load cases.
- **Either**: Includes one load case.
- **Envelop**: Creates an envelope of all cases.

### 3. Factor Sign

- **+**: Positive factors only.
- **-**: Negative factors only.
- **±**: Both positive and negative factors.
- **+, -**: All factors individually.

### 4. Load Cases

- Directly imported from **Civil NX** with updates to include predefined combinations (e.g., Static, RS, MVL).

### 5. Load Combination

- User-defined name for the combination.

### 6. Factors (1 to 5)

- Enter factor values; at least one factor is required for each imported load case.

---

## Functionality

### 1. Generate Load Combinations

- Creates combinations for various design tabs (Steel, Concrete, SRC, Composite Steel).

### 2. Generate Envelope Load Combinations

- Automatically creates an envelope of generated combinations.

### 3. Generate Inactive Load Combinations

- Creates combinations marked as "Inactive."

### 4. Import Load Cases

- Imports cases based on model definitions.

### 5. Export Load Combination Input

- Exports a wizard file for reuse in other models or templates for local design codes.

---

## Usage Instructions

1. **Define Active State**: Select from Local, Inactive, Strength, or Service.
2. **Set Combination Type**: Choose Add, Either, or Envelop.
3. **Assign Factor Values**: Input values for Factors 1 to 5.
4. **Generate Load Cases and Combinations**: Import or modify cases and combinations.
5. **Export/Import Configurations**: Save or load wizard files for efficient project management.
