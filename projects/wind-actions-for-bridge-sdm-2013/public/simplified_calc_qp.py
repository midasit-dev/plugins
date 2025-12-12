import numpy as np

def simplified_calculate_qp(category, location, return_period=None, degree=None, apply_reduction=False):
    if category == "Table 3.6":
        if location == "Waglan Island":
            return_periods = np.array([50, 100, 200])
            wind_speeds = np.array([71, 78, 85])  # m/s values for Waglan Island
        elif location == "Hong Kong Observatory":
            return_periods = np.array([50, 100, 200])
            wind_speeds = np.array([68, 75, 81])  # m/s values for Hong Kong Observatory]

        # Interpolate to find the wind speed for the given return period
        v_d = np.interp(return_period, return_periods, wind_speeds)

        # Calculate qp using Table 3.6 formula (rounded to 3 decimal places)
        qp = round(613 * 10**-6 * v_d**2, 3)  # kN/m^2

    elif category == "Table 3.7":
        location_map = {"Sheltered Location": 2.5, "Exposed Location": 3.8}
        
        qp = location_map.get(location)
        if qp is None:
            raise ValueError("Invalid location. Please enter 'Sheltered Location' or 'Exposed Location'.")

        # ✅ 20% 감소 적용 (Clause 3.4.2.1(3))
        if apply_reduction:
            qp = round(qp * 0.8, 3)

    elif category == "Table 3.8":
        degree_map = {"1": 2.5, "2": 2.8, "3": 3.3, "4": 3.8}

        qp = degree_map.get(degree)
        if qp is None:
            raise ValueError("Invalid degree of exposure. Please enter a value between 1 and 4.")

        # ✅ 20% 감소 적용 (Clause 3.4.2.1(3))
        if apply_reduction:
            qp = round(qp * 0.8, 3)

    else:
        raise ValueError("Invalid category. Choose 'Table 3.6', 'Table 3.7', or 'Table 3.8'.")

    return qp


if __name__ == "__main__":
    # Example usage
    category = "Table 3.8"  
    location = "Sheltered Location"  
    return_period = 120  # years, applicable for Table 3.6
    degree = "1"  # applicable for Table 3.8

    # Call the function correctly with the appropriate parameters
    qp = simplified_calculate_qp(category, location, return_period=return_period, degree=degree, apply_reduction=True)
    print(f"{category}'s qp = {qp} kN/m^2")
