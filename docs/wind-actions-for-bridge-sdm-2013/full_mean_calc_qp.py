import numpy as np


# Basic hourly mean velocity pressure(qb'(z)) obtained from Table 3.9  Calculation
def full_mean_calculate_qp(z, coz, degree, kpc):
    # Defining known height values and corresponding qb'(z) values
    heights = np.array([10, 15, 20, 30, 40, 50, 60, 80, 100, 150, 200])
    pressures = np.array([0.8, 0.9, 1.0, 1.1, 1.3, 1.4, 1.5, 1.7, 1.8, 2.1, 2.3])

    # Boundary conditions for values outside the provided data range
    if z <= 10:
        return 0.8
    elif z >= 200:
        return 2.3

    # Interpolating for values within the provided range
    qb_value = np.interp(z, heights, pressures)
    degree_map = {"1": 0.7, "2": 0.8, "3": 0.9, "4": 1.0}
    degree_value = degree_map.get(degree)
    # Calculate qp using Table 3.9 formula
    qp = round(qb_value * (coz**2) * degree_value * kpc, 3)  # kN/m^2
    return qp


if __name__ == "__main__":
    # Example usage
    z = 85
    coz = 1.33
    degree = "1"
    kpc = 1.22
    qb = full_mean_calculate_qp(z, coz, degree, kpc)
    print(
        f"Hourly Mean Velocity Pressure, qb'({z},{coz},{degree},{kpc}) = {qb:.3f} kN/m^2"
    )
