# Node Controller

The purpose of this plugin is to streamline the process of modifying node coordinates without the need to navigate between Node Table or Node Detail Table when selecting nodes.

## Details

### version 1.0.0

1. **Node Selection and Execution**

   - Upon plugin execution with no selection, it starts by selecting nodes. If nodes are already selected, their information is immediately loaded.

2. **Toggle for Create and Translate Selection**

   - **Create**: Added to eliminate inconvenience when additional nodes are needed during node movement.
   - **Translate (Default)**: Facilitates node coordinate movement.

3. **Display of Selected Node Count in Parentheses**

   - Displays the number of selected nodes within parentheses. The box shows the selected node numbers, which can be modified by selecting different nodes.

4. **Inputting Node Movement Distance**

   - Input the distance value to move nodes using arrows next to X, Y, Z coordinate boxes. Clicking the arrows moves the nodes by the specified value (e.g., entering 1 and clicking three times moves it by 3m).

5. **Unit Conversion**

   - Adheres to the selected length unit within the product (e.g., m, mm, cm, in, ft). Allows modification of X, Y, Z coordinates if they have the same value for multiple selected nodes; otherwise marked as "Var." and blocked.

6. **Translate and Create Modes**

   - **Translate Mode**: Applies changed coordinate values.
   - **Create Mode**: Uses inputted coordinate values to create nodes.

7. **Display of Selected Node Coordinates in Table Format**
   - Shows the coordinates of selected nodes in a table format. In cases where nodes have different coordinate values, modifications are allowed in the table.

### version 1.1.0

- We have updated and improved the internal libraries, enhancing performance and stability.
