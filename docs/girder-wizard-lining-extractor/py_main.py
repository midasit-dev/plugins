### do not delete this import scripts ###
import json
import csv
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet, py_db_read, py_db_read_item
### do not delete this import scripts ###

#npm run start

def py_make_curve_data():
    # Step 1: Read grup data
    print('step1')
    grupDataAll = py_db_read('GRUP')    
    #grupDataAll = py_db_read('NODE')    
    print(grupDataAll)
    grupData = json.loads(grupDataAll)

    nodeList = []
    elemList = []
        
    # Step 2: Find 'Girder' data and extract node and element lists
    print('step2')
    for key, value in grupData.items():
        if value["NAME"] == "Girder":
            nodeList.extend(value.get("N_LIST", []))
            elemList.extend(value.get("E_LIST", []))
            break
            
#    # Step 3: Fetch node and element details
    print('step3-1')
    nodeDetails = []
    for node in nodeList:
        nodeData = json.loads(py_db_read_item('NODE', node))
        nodeDetails.append({
            'Key': node,
            'X': nodeData["X"],
            'Y': nodeData["Y"],
            'Z': nodeData["Z"]
        })
    
    print('step3-2')
    elemDetails = []
    for elem in elemList:
        elemData = json.loads(py_db_read_item('ELEM', elem))
        elemDetails.append({
            'Key': elem,
            'NODE_1': elemData["NODE"][0],
            'NODE_2': elemData["NODE"][1]
        })
    
    # Step 4: Write data to CSV
    # output_path = r'c:\temp\output.csv'
    # try:
    #     print('step4')
    #     with open(output_path, mode='w', newline='') as file:
    #         print('step4-1')
    #         writer = csv.writer(file)
    #         print('step4-2')
    #         # Write Node Info
    #         writer.writerow(['Node Info'])
    #         writer.writerow(['절점Key', 'x좌표값', 'y좌표값', 'z좌표값'])
    #         for node in nodeDetails:
    #             writer.writerow([node['Key'], node['X'], node['Y'], node['Z']])
    #         print('step4-3')
    #         writer.writerow([])  # Empty row for separation

    #         # Write Elem Info
    #         writer.writerow(['Elem Info'])
    #         writer.writerow(['ElemKey', 'NODE 1번 Key', 'NODE 2번 Key'])
    #         for elem in elemDetails:
    #             writer.writerow([elem['Key'], elem['NODE_1'], elem['NODE_2']])
        
    #     print(f'CSV file created at: {output_path}')
    # except Exception as e:
    #     print(f'Failed to write CSV file: {e}')

    # return grupDataAll

		# Step 4: Create CSV String
    csv_lines = []
    
    # Write Node Info
    csv_lines.append('Node Info')
    csv_lines.append('NodeKey, x_coord, y_coord, z_coord')
    for node in nodeDetails:
        csv_lines.append(f"{node['Key']},{node['X']},{node['Y']},{node['Z']}")
    
    csv_lines.append('')  # Empty row for separation

    # Write Elem Info
    csv_lines.append('Elem Info')
    csv_lines.append('ElemKey, Node Start Key, Node End Key')
    for elem in elemDetails:
        csv_lines.append(f"{elem['Key']},{elem['NODE_1']},{elem['NODE_2']}")
    
    return '\n'.join(csv_lines)
