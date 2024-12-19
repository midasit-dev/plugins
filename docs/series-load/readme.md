![](https://hubs.ly/Q02hx5J70)

# Series Load

- Apply a customized static beam load on the structure continuously at regular intervals.

## Details

- Apply the static load combinations as live loads.
- The valid input loads are as below.
  - Concentrated Loads
  - Distributed Loads
  - Concentrated parallel loads direct outwards from the origin axis(Centrifugal force)
- Series Load can be applied in the **continous** structure only and starts **i-node**.
- The Direction of Centrifugal force is a perpendicular direction to the tangent of splines continually connected nodes.
- The spline was calculated using one method within the three methods.
  1. Natural Cubic Spline
  2. Clamped Cubic Spline
  3. Monotone Cubic Hermite Spline (Recommend)

## Release Notes

- **v1.1.0**
  - bugs have been fixed to ensure the model file functions correctly.
  - even when there are no static loads, load combinations and beam loads.
- **v1.0.0**
  - Initial release version.
