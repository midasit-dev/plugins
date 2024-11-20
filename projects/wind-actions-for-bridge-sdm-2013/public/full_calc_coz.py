# Calculate Orography Effect Factor Co(z) for qpb(z) of full procedure

import numpy as np
import json


def full_calculate_coz(velocity, z, H, Lu, Ld, x, loadLength, OrographyType, location):
    def calculate_sb_sc(z, loadLength):
        heights = np.array([10, 15, 20, 30, 40, 50, 60, 80, 100, 150, 200, 250, 300])
        lengths = np.array([20, 40, 60, 100, 200, 400, 600, 1000, 2000])
        sb_table = np.array([
            [2.36, 2.15, 2.05, 1.93, 1.79, 1.68, 1.62, 1.55, 1.46],
            [2.36, 2.15, 2.05, 1.93, 1.81, 1.70, 1.65, 1.58, 1.51],
            [2.36, 2.15, 2.05, 1.94, 1.82, 1.73, 1.67, 1.61, 1.54],
            [2.36, 2.16, 2.07, 1.97, 1.86, 1.77, 1.72, 1.67, 1.60],
            [2.36, 2.17, 2.09, 2.00, 1.89, 1.81, 1.76, 1.71, 1.65],
            [2.37, 2.19, 2.11, 2.02, 1.92, 1.84, 1.80, 1.75, 1.69],
            [2.38, 2.21, 2.13, 2.04, 1.95, 1.87, 1.83, 1.78, 1.72],
            [2.40, 2.24, 2.16, 2.08, 2.00, 1.92, 1.88, 1.84, 1.78],
            [2.42, 2.27, 2.20, 2.12, 2.04, 1.97, 1.93, 1.89, 1.84],
            [2.47, 2.33, 2.27, 2.20, 2.12, 2.06, 2.02, 1.98, 1.94],
            [2.52, 2.39, 2.33, 2.26, 2.19, 2.13, 2.10, 2.06, 2.01],
            [2.56, 2.44, 2.38, 2.32, 2.25, 2.19, 2.16, 2.12, 2.08],
            [2.60, 2.48, 2.42, 2.36, 2.30, 2.24, 2.21, 2.18, 2.14]
        ])
        sc_table = np.array(
            [
                1.00,
                1.08,
                1.14,
                1.23,
                1.30,
                1.39,
                1.41,
                1.48,
                1.67,
                1.77,
                1.84,
                1.88,
                1.91,
            ]
        )
        t_table = np.array([3, 4.8,6.3,9.0,14.5,23.4,31.0,44.1,71.1])

        z = max(10, min(z, 300))
        loadLength = max(20, min(loadLength, 2000))
        # Determine t based on table values or formula
        if loadLength in lengths:
            t = t_table[np.where(lengths == loadLength)[0][0]]
        else:
            if loadLength <= 20:
                t = 3
            else:
                t = 0.375 * (loadLength ** 0.69)

        if z in heights and loadLength in lengths:
            z_index = np.where(heights == z)[0][0]
            L_index = np.where(lengths == loadLength)[0][0]
            sb = sb_table[z_index, L_index]
            sc = sc_table[z_index]
        else:
            sc =(z / 10) ** 0.19
            if loadLength < 50 and  z < 25:
                z = 25
            try:
                sb = (1 + (z / 10) ** -0.4 * (1.48 - 0.704 * np.log(np.log(t)))) * ((z / 10) ** 0.19)
            except ValueError:
                print("Invalid value.")
                return None, None



        return sb, sc

    # Function to calculate s
    def calculate_s(OrographyType, location, H, Lu, Ld, x, z):
        # Determine Φ (Slope)
        Phi = H / Lu

        # Determine Le based on Orography Type and Phi
        if Phi >= 0.05 and Phi <= 0.3:
            Le = Lu
        elif Phi > 0.3:
            Le = H / 0.3
        else:
            Le = Lu  # Default value when Phi < 0.05

        # Initialize s
        s = 0

        # Upwind section for all orography (Case 1)
        if location == "Upwind":
            x_Lu = x / Lu
            z_Le = z / Le
            if -1.5 <= x_Lu <= 0 and 0 <= z_Le <= 2.0:
                # Calculate A and B for Upwind
                A = (
                    0.1552 * z_Le**4
                    - 0.8575 * z_Le**3
                    + 1.8133 * z_Le**2
                    - 1.9115 * z_Le
                    + 1.0124
                )
                B = 0.3542 * z_Le**2 - 1.0577 * z_Le + 2.6456
                # Calculate s
                s = A * np.exp(B * x_Lu)
            else:
                s = 0

        # Downwind section for Cliffs and Escarpments (Case 2)
        elif location == "Downwind" and OrographyType == "Cliffs and Escarpments":
            x_Le = x / Le
            z_Le = z / Le
            if 0.1 <= x_Le <= 3.5 and 0.1 <= z_Le <= 2.0:
                log_x_Le = np.log10(x_Le)
                log_z_Le = np.log10(z_Le)
                # Calculate A, B, C
                A = (
                    -1.3420 * log_z_Le**3
                    - 0.8222 * log_z_Le**2
                    + 0.4609 * log_z_Le
                    - 0.0791
                )
                B = (
                    -1.0196 * log_z_Le**3
                    - 0.8910 * log_z_Le**2
                    + 0.5343 * log_z_Le
                    - 0.1156
                )
                C = (
                    0.8030 * log_z_Le**3
                    + 0.4236 * log_z_Le**2
                    - 0.5738 * log_z_Le
                    + 0.1606
                )
                # Calculate s
                s = A * (log_x_Le**2) + B * log_x_Le + C
            else:
                s = 0

        # Downwind section for Hills and Ridges (Case 3)
        elif location == "Downwind" and OrographyType == "Hills or Ridges":
            x_Ld = x / Ld
            z_Le = z / Le
            if 0 <= x_Ld <= 2.0 and 0 <= z_Le <= 2.0:
                # Calculate A and B
                A = (
                    0.1552 * z_Le**4
                    - 0.8575 * z_Le**3
                    + 1.8133 * z_Le**2
                    - 1.9115 * z_Le
                    + 1.0124
                )
                B = -0.3056 * z_Le**2 + 1.0212 * z_Le - 1.7637
                # Calculate s
                s = A * np.exp(B * x_Ld)
            else:
                s = 0
        else:
            raise ValueError("Invalid Location or Orography Type combination.")

        return s

    # Determine which calculation to perform based on velocity type
    if velocity == "Peak Velocity":
        # Calculate sb and sc
        sb, sc = calculate_sb_sc(z, loadLength)
        if sb is None or sc is None:
            return None, None, None

        # Calculate s
        s = calculate_s(OrographyType, location, H, Lu, Ld, x, z)

        # Calculate Phi
        Phi = H / Lu

        # Calculate co based on Phi
        if Phi < 0.05:
            coz = 1
        elif 0.05 <= Phi < 0.3:
            coz = 1 + 2 * s * Phi * (sc / sb)
        elif Phi >= 0.3:
            coz = 1 + 0.6 * s * (sc / sb)
        else:
            coz = 1  # Default case

        return json.dumps({"sb": sb, "sc": sc, "coz": coz})

    elif velocity == "Mean Velocity":
        # Calculate s
        s = calculate_s(OrographyType, location, H, Lu, Ld, x, z)

        # Calculate Phi
        Phi = H / Lu

        # Calculate co based on Phi
        if Phi < 0.05:
            coz = 1
        elif 0.05 <= Phi < 0.3:
            coz = 1 + 2 * s
        elif Phi >= 0.3:
            coz = 1 + 0.6 * s
        else:
            coz = 1  # Default case

        return json.dumps({"sb": "null", "sc": "null", "coz": coz})

    else:
        raise ValueError(
            "Invalid velocity type specified. Must be 'Peak Velocity' or 'Mean Velocity'."
        )


if __name__ == "__main__":
    # Example usage
    velocity = "Peak Velocity"  # "Peak Velocity" or "Mean Velocity"
    OrographyType = "Hills or Ridges"  # "Cliffs and Escarpments" or "Hills or Ridges"
    location = "Upwind"  # "Upwind" or "Downwind"
    H = 30  # Height of Topographic Feature, H (m)
    Lu = 500  # Length of Upwind Slope, Lu (m)
    Ld = 500  # Length of Downwind Slope, Ld (m)
    x = -100  # Distance from the crest in meters (negative for upwind)
    z = 85  # Height above ground level (m)
    loadLength = 1950  # Loaded length (m)

    # Function call
    sb, sc, coz = full_calculate_coz(
        velocity, z, H, Lu, Ld, x, loadLength, OrographyType, location
    )

    # test the function
    if coz is not None:
        if sb is not None and sc is not None:
            print(f"sb(z) = {sb:.3f}")
            print(f"sc(z) = {sc:.3f}")
        else:
            print("sb(z) = N.A")
            print("sc(z) = N.A")
        print(f"co(z) = {coz:.3f}")
    else:
        print("Calculation Error.")
