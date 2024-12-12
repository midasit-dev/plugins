# basic peak velocity pressure,qpb(z, L), obtained from Table 3.9  Calculation
import numpy as np


def full_peak_calculate_qp(z, L, coz, degree, kpc):
    # Defining the height and loaded length values from the table
    heights = np.array([10, 15, 20, 30, 40, 50, 60, 80, 100, 150, 200])
    lengths = np.array([20, 100, 200, 400, 600, 1000, 2000])

    # Defining the corresponding qpb(z, L) values as a 2D array
    pressures = np.array(
        [
            [4.2, 2.8, 2.4, 2.1, 2.0, 1.8, 1.6],
            [4.2, 2.8, 2.5, 2.2, 2.0, 1.9, 1.7],
            [4.2, 2.8, 2.5, 2.2, 2.1, 2.0, 1.8],
            [4.2, 2.9, 2.6, 2.3, 2.3, 2.1, 1.9],
            [4.2, 3.0, 2.7, 2.5, 2.3, 2.2, 2.0],
            [4.2, 3.1, 2.8, 2.5, 2.4, 2.3, 2.1],
            [4.3, 3.1, 2.9, 2.6, 2.5, 2.4, 2.2],
            [4.3, 3.3, 3.0, 2.8, 2.7, 2.5, 2.4],
            [4.4, 3.4, 3.1, 2.9, 2.8, 2.7, 2.5],
            [4.6, 3.6, 3.4, 3.2, 3.1, 3.0, 2.8],
            [4.8, 3.8, 3.6, 3.4, 3.3, 3.2, 3.0],
        ]
    )

    # Handling boundary conditions
    z = np.clip(z, 10, 200)
    L = np.clip(L, 20, 2000)

    # Interpolation steps
    # Interpolate over heights for each length
    interp_along_height = np.array(
        [np.interp(z, heights, pressures[:, i]) for i in range(len(lengths))]
    )

    # Interpolate over lengths using the results from above
    qpb_value = np.interp(L, lengths, interp_along_height)
    degree_map = {"1": 0.7, "2": 0.8, "3": 0.9, "4": 1.0}
    degree_value = degree_map.get(degree)
    # Calculate qp using Table 3.9 formula
    qp = round(qpb_value * (coz**2) * degree_value * kpc, 3)  # kN/m^2
    return qp


if __name__ == "__main__":
    # Example usage
    z = 85
    L = 1950
    coz = 1.33
    degree = "1"
    kpc = 1.22
    qp = full_peak_calculate_qp(z, L, coz, degree, kpc)
    print(
        f"Peak Velocity Pressure, qp({z}, {L},{coz},{degree},{kpc}) = {qp:.3f} kN/m^2"
    )
