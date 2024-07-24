# Node Controller

## Intro

The purpose of this plugin is to streamline the process of __modifying node coordinates__ without the need to navigate between Node Table or Node Detail Table when selecting nodes.

- Quickly perform node coordinate modification tasks
- Display modified node coordinate information in a table format

## Version
__v1.0.0__: Plugin release

## Language
__English__

## Benefits of this plugin

Traditionally, modifying or creating node coordinates was conducted in two main ways:
- Utilizing the Create Nodes or Translate Nodes functions
- Using the Node or Node Detail Table

This plugin allows you to replace manual tasks or reliance on auxiliary programs like Excel with simple operations.
- Automates node coordinate modification tasks to save time
- Reduces errors during work, enhancing the accuracy of the model
- Provides necessary information without navigating between node tables, improving workflow

## How to use this plugin?

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


## Conclusion

Utilize the Node Controller plugin to efficiently manage node coordinates in structural modeling projects and quickly access necessary information.


