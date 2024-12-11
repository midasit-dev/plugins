### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
### do not delete this import scripts ###

import numpy as np
from scipy.interpolate import RBFInterpolator

def get_earthquake_coeff(x, y, scatter_data, scatter_value):
    x_len = len(scatter_value)    
    xobs = np.zeros((x_len, 2))
    yobs = np.zeros(x_len)

    for i in range(x_len):
        xobs[i][0] = scatter_data[i][0]
        xobs[i][1] = scatter_data[i][1]
        yobs[i] = scatter_value[i]
    
    x_pos = [[x, y]]
    y_value = RBFInterpolator(xobs, yobs)(x_pos)

    return json.dumps(
        {
            "value": y_value.tolist()
        },
    )