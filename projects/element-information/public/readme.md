# Element information

## Items Available for Checking

| NO | Usage Command | INFORMATION ITEM |
|----|---------------|------------------|
| 1 | db/elem | +db/matl<br>+db/sect |
|  | Elem ID | Node Connectivity |
|  | Type (+ Sub Type) | Material Properties |
|  |  | Section Properties |
| 2 | "TABLE_TYPE": "ELEMENTWEIGHT" | |
|  | Element Length | Area (for plate) |
|  |  | Volume (for solid) |
|  |  | Unit Weight |
|  |  | Total Weight |
| 3 | db/frls | Beam end release |
|  |  | etc. |

Bill of Material ..(Is it pierced?)

## Input UI

- Element Selection: Select via API or direct input
- Information Item Selection: Check desired items
- Apply Button

## Output UI

- Information Table (Read Only)
- Reset Button
