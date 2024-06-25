import json
import numpy as np

def create_pycurve(BH_TableRows, LayerData, ElementStructList):
    BH_TableRows = json.loads(BH_TableRows)
    LayerData = json.loads(LayerData)
    ElementStructList = json.loads(ElementStructList)
    nodes = get_nodes(ElementStructList)
    boreholes, x_coords, WL_data, is_WL = get_borehole_and_waterlevel(BH_TableRows)
    layer_data = get_layer_data(LayerData)

    pycurve_ = {}
    weight_w = 10000.0
    for node_id, node in nodes.items():
        node_x = node['coord'][0]
        node_y = node['coord'][1]
        BHs_x = x_coords

        layers_h = {}
        for bh_id, bh in boreholes.items():
            if bh_id == 0: # ground level
                BHs_y0 = bh
                BH_y0 = np.interp(node_x, BHs_x, BHs_y0)                
                continue

            BHs_y = bh
            BH_y = np.interp(node_x, BHs_x, BHs_y)
            layers_h[bh_id] = [BH_y0, BH_y]
            if node_y > BH_y:
                layer_id = bh_id
                break
            BH_y0 = BH_y
        WL = np.interp(node_x, BHs_x, WL_data)
        x_data, y_data = create_pycurve_by_node(layer_id, layer_data, weight_w, layers_h, WL, node, is_WL)
    
        pycurve_[node_id] = [x_data, y_data]
    
    pycurve = json.dumps(get_pycurve(pycurve_), indent=4)

    return pycurve

# ===================================================================================================

def get_nodes(ElementStructList):
    nodes = {}
    for elstruct in ElementStructList:
        num_node = len(elstruct["NODE"])
        if num_node == 0:
            continue
        for idx in range(num_node-1):
            nid_i = elstruct["NODE"][idx]
            nid_j = elstruct["NODE"][idx+1]
            coord_i = elstruct["CORD"][idx]
            coord_j = elstruct["CORD"][idx+1]

            if nid_i not in nodes:
                nodes[nid_i] = {"coord": coord_i, "length": 0}
            else:
                nodes[nid_i]["coord"] = coord_i

            if nid_j not in nodes:
                nodes[nid_j] = {"coord": coord_j, "length": 0}
            else:
                nodes[nid_j]["coord"] = coord_j

            nodes[nid_i]["length"] += 0.5*np.sqrt((coord_i[0]-coord_j[0])**2 + (coord_i[1]-coord_j[1])**2)
            nodes[nid_j]["length"] += 0.5*np.sqrt((coord_i[0]-coord_j[0])**2 + (coord_i[1]-coord_j[1])**2)
    
    return nodes

# ===================================================================================================

def get_borehole_and_waterlevel(BH_TableRows):
    id = 0  # ground level
    is_WL = False
    boreholes = {}
    for bh in BH_TableRows:
        values = list(bh.values())[list(bh.keys()).index('BH1'):]

        if bh["Index"] == "X Position":
            x_coords = list(map(float, values))
        elif bh["Index"] == "Water Level":
            WL_data = list(map(float, values))
            is_WL = True
        else:
            boreholes[id] = list(map(float, values))
            id += 1
    
    return boreholes, x_coords, WL_data, is_WL

# ===================================================================================================

def get_layer_data(LayerData):
    layer_data = {}
    for layer in LayerData:
        id = layer["id"]
        layer_data[id] = layer

    return layer_data

def get_pycurve(pycurve_):
    pycurve = []
    for node_id, data in pycurve_.items():
        x_data, y_data = data
        py = {"NODE": node_id, "X": x_data, "Y": y_data}
        pycurve.append(py)

    return pycurve

def create_pycurve_by_node(layer_id, layer_data, weight_w, layers_h, WL, node, is_WL):

    soil_coeff = "Rankine"
    direction = 1
    kh = float(layer_data[layer_id]["KH"])
    soil_type = layer_data[layer_id]["SoilType"]
    frict = np.radians(float(layer_data[layer_id]["friction_angle"]))
    cohes = float(layer_data[layer_id]["cohesion"])
    circum = float(layer_data[layer_id]["circumference"])
    length = float(node["length"])
    area = circum*length

    stress_Ve, stress_w = calculate_vertical_stress(layer_data, weight_w, layers_h, WL, node, is_WL)
    K0, Ka, Kp = calculata_soil_coefficient(soil_coeff, soil_type, frict)
    stress_V = stress_Ve + stress_w
    stress_H0, stress_Ha, stress_Hp = calculate_horizontal_stress(K0, Ka, Kp, stress_V)
    stress_H0, stress_Ha, stress_Hp = calculate_cohesion_stress(cohes, K0, Ka, Kp, stress_H0, stress_Ha, stress_Hp)
    stress_H0, stress_Ha, stress_Hp = consider_tension_cutoff(stress_H0, stress_Ha, stress_Hp)

    if direction == 1:
        disp_Hp = stress_Hp/kh
        dleng = disp_Hp*2.0

        x_data = [-disp_Hp-dleng, -disp_Hp, 0.0, disp_Hp, disp_Hp+dleng]
        y_data_ = np.array([-stress_Hp, -stress_Hp, 0.0, stress_Hp, stress_Hp])*area
        y_data = list(y_data_)

    elif direction == 2:
        disp_Ha = (stress_Ha-stress_H0)/kh
        disp_Hp = (stress_Hp-stress_H0)/kh
        dleng = abs(disp_Hp - disp_Ha)

        x_act = [disp_Ha-dleng, disp_Ha, 0.0, disp_Hp, disp_Hp+dleng]
        y_act = np.array([stress_Ha, stress_Ha, stress_H0, stress_Hp, stress_Hp])*area

        x_pas = [-disp_Hp-dleng, -disp_Hp, 0.0, -disp_Ha, -disp_Ha+dleng]
        y_pas = np.array([-stress_Hp, -stress_Hp, -stress_H0, -stress_Ha, -stress_Ha])*area

        x_data = [x_act, x_pas]
        y_data = [list(y_act), list(y_pas)]

    return x_data, y_data

# ===================================================================================================

def calculata_soil_coefficient(soil_coeff, soil_type, frict):
    rad45 = np.radians(45.0)

    if soil_coeff == "Rankine":
        if soil_type == "Sand":
            K0 = 1.0 - np.sin(frict)
        elif soil_type == "Clay":
            K0 = 0.95 - np.sin(frict)
        Ka = np.tan(rad45-0.5*frict)**2.0
        Kp = np.tan(rad45+0.5*frict)**2.0

    elif soil_coeff == "Coulomb":
        pass

    return K0, Ka, Kp

def calculate_horizontal_stress(K0, Ka, Kp, stress_V):
    stress_H0 = K0*stress_V
    stress_Ha = Ka*stress_V
    stress_Hp = Kp*stress_V

    return stress_H0, stress_Ha, stress_Hp

def calculate_cohesion_stress(cohes, K0, Ka, Kp, stress_H0, stress_Ha, stress_Hp):
    stress_Ha = stress_Ha - cohes*np.sqrt(Ka)
    stress_Hp = stress_Hp + cohes*np.sqrt(Kp)
    
    return stress_H0, stress_Ha, stress_Hp

def consider_tension_cutoff(stress_H0, stress_Ha, stress_Hp):
    stress_H0 = np.maximum(stress_H0, 0.0)
    stress_Ha = np.maximum(stress_Ha, 0.0)
    stress_Hp = np.maximum(stress_Hp, 0.0)

    return stress_H0, stress_Ha, stress_Hp

def calculate_vertical_stress(layer_data, weight_w, layers_h, WL, node, is_WL):
    stress_ve = 0.0
    stress_w = 0.0
    coor_h = node["coord"][1]

    for id, lay_h in layers_h.items():
        lay_data = layer_data[id]

        weight_t = float(lay_data["gamma_t"])
        weight_sat = float(lay_data["gamma_sat"])
        weight_sub = weight_sat - weight_w

        lay_hi = layers_h[id][0]
        lay_hj = layers_h[id][1]

        if coor_h >= lay_hi and coor_h >= lay_hj:
            break
        elif coor_h <= lay_hi and coor_h >= lay_hj:
            lay_hj = coor_h
            success = True
        elif coor_h <= lay_hi and coor_h <= lay_hj:
            pass
        else:
            print ("Error: Failed to calculate the vertical stress!!!")
        
        if is_WL:
            if WL <= lay_hi and WL <= lay_hj:
                stress_ve += weight_t*(lay_hi-lay_hj)
            elif WL <= lay_hi and WL >= lay_hj:
                stress_ve += weight_t*(lay_hi-WL) + weight_sub*(WL-lay_hj)
                stress_w += weight_w*(WL-lay_hj)
            elif WL >= lay_hi and WL >= lay_hj:
                stress_ve += weight_sub*(lay_hi-lay_hj)
                stress_w += weight_w*(lay_hi-lay_hj)
            else:
                print ("Error: Failed to calculate the vertical stress!!!")
        else:
            stress_ve += weight_t*(lay_hi-lay_hj)

    return stress_ve, stress_w

# ===================================================================================================


BH_TableRows = [
    {
        "id": 1,
        "Index": "X Position",
        "BH1": "5",
        "BH2": "10",
        "BH3": "15",
        "BH4": "20"
    },
    {
        "id": 2,
        "Index": "Ground Level",
        "BH1": "2",
        "BH2": "1",
        "BH3": "2.5",
        "BH4": "1.5"
    },
    {
        "id": 3,
        "Index": "Layer 1",
        "BH1": "-5",
        "BH2": "-3.5",
        "BH3": "-4",
        "BH4": "-6"
    },
    {
        "id": 4,
        "Index": "Layer 2",
        "BH1": "-10",
        "BH2": "-8",
        "BH3": "-11",
        "BH4": "-6"
    },
    {
        "id": 5,
        "Index": "Layer 3",
        "BH1": "-15",
        "BH2": "-16",
        "BH3": "-14",
        "BH4": "-15"
    },
    {
        "id": 6,
        "Index": "Layer 4",
        "BH1": "-20",
        "BH2": "-21",
        "BH3": "-19",
        "BH4": "-18"
    },
    {
        "id": 7,
        "Index": "Water Level",
        "BH1": 0,
        "BH2": 0,
        "BH3": 0,
        "BH4": 0
    }
]

LayerData = [
    {
        "id": 1,
        "LayerNo": 1,
        "SoilType": "Sand",
        "KH": 100000000.0,
        "gamma_t": 19000.0,
        "gamma_sat": 21000.0,
        "friction_angle": 10.0,
        "cohesion": 1000.0,
        "circumference": 1.0
    },
    {
        "id": 2,
        "LayerNo": 2,
        "SoilType": "Sand",
        "KH": 100000000.0,
        "gamma_t": 19000.0,
        "gamma_sat": 21000.0,
        "friction_angle": 10.0,
        "cohesion": 1000.0,
        "circumference": 1.0
    },
    {
        "id": 3,
        "LayerNo": 3,
        "SoilType": "Sand",
        "KH": 100000000.0,
        "gamma_t": 19000.0,
        "gamma_sat": 21000.0,
        "friction_angle": 10.0,
        "cohesion": 1000.0,
        "circumference": 1.0
    },
    {
        "id": 4,
        "LayerNo": 4,
        "SoilType": "Sand",
        "KH": 100000000.0,
        "gamma_t": 19000.0,
        "gamma_sat": 21000.0,
        "friction_angle": 10.0,
        "cohesion": 1000.0,
        "circumference": 1.0
    }
]

ElementList = [
    {'NODE': [], 'CORD': []
    },
    {'NODE': [
            323,
            305,
            309,
            311,
            315,
            319
        ], 'CORD': [
            [
                -1.08822573,
                -14.2
            ],
            [
                -1.08822573,
                -9.2
            ],
            [
                -1.08822573,
                -10.2
            ],
            [
                -1.08822573,
                -11.2
            ],
            [
                -1.08822573,
                -12.2
            ],
            [
                -1.08822573,
                -13.2
            ]
        ]
    },
    {'NODE': [
            320,
            324,
            306,
            310,
            312,
            316
        ], 'CORD': [
            [
                1.08710034,
                -13.2
            ],
            [
                1.08710034,
                -14.2
            ],
            [
                1.08710034,
                -9.2
            ],
            [
                1.08710034,
                -10.2
            ],
            [
                1.08710034,
                -11.2
            ],
            [
                1.08710034,
                -12.2
            ]
        ]
    },
    {'NODE': [
            321,
            325,
            303,
            307,
            313,
            317
        ], 'CORD': [
            [
                8.30161843,
                -13.2
            ],
            [
                8.30161843,
                -14.2
            ],
            [
                8.30161843,
                -9.2
            ],
            [
                8.30161843,
                -10.2
            ],
            [
                8.30161843,
                -11.2
            ],
            [
                8.30161843,
                -12.2
            ]
        ]
    },
    {'NODE': [
            322,
            326,
            304,
            308,
            314,
            318
        ], 'CORD': [
            [
                10.71978986,
                -13.2
            ],
            [
                10.71978986,
                -14.2
            ],
            [
                10.71978986,
                -9.2
            ],
            [
                10.71978986,
                -10.2
            ],
            [
                10.71978986,
                -11.2
            ],
            [
                10.71978986,
                -12.2
            ]
        ]
    }
]

