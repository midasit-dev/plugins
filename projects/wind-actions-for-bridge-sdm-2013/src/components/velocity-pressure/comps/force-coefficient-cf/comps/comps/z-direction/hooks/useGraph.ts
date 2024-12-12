import { useCallback } from "react";

export default function useGraph() {
  const getBasePoints = useCallback((theta: number) => {
    if (theta === 10) {
      return {
        x: [0.0, 4.0, 22.0],
        y: [0.75, 0.9, 0.9],
      };
    } else if (theta === 6) {
      return {
        x: [0.0, 22.0],
        y: [0.75, 0.9],
      };
    } else if (theta === 0) {
      return {
        x: [0.0, 14.0, 22.0],
        y: [0.75, 0.15, 0.15],
      };
    } else {
      throw new Error("Invalid type. Use 'a' or 'b'.");
    }
  }, []);

  const getX = useCallback((b_dtot: number) => {
    if (b_dtot < 0 || b_dtot > 22) {
      return 0;
    } else {
      return b_dtot;
    }
  }, []);

  const getInterpolatedY = useCallback((b_dtot: number, theta: number) => {
    if (b_dtot < 0 || b_dtot > 22) {
      return 0.75;
    }

    // Define piecewise functions for cfz based on theta
    function cfz_theta_0(b_dtot: number) {
      if (b_dtot <= 14) {
        return parseFloat(((-0.6 / 14) * b_dtot + 0.75).toFixed(3));
      } else {
        return 0.15;
      }
    }

    function cfz_theta_6(b_dtot: number) {
      if (b_dtot <= 21) {
        return parseFloat(((0.15 / 21) * b_dtot + 0.75).toFixed(3));
      } else {
        return 0.9;
      }
    }

    function cfz_theta_10(b_dtot: number) {
      if (b_dtot <= 4) {
        return parseFloat((-0.0375 * b_dtot + 0.75).toFixed(3));
      } else {
        return 0.9;
      }
    }

    let cfz_val;

    // Calculate cfz based on theta using interpolation
    if (theta === 0) {
      cfz_val = cfz_theta_0(b_dtot);
    } else if (theta > 0 && theta <= 6) {
      const cfz_0 = cfz_theta_0(b_dtot);
      const cfz_6 = cfz_theta_6(b_dtot);
      cfz_val = (((theta - 0) * (cfz_6 - cfz_0)) / (6 - 0) + cfz_0).toFixed(3);
    } else if (theta > 6 && theta <= 10) {
      const cfz_6 = cfz_theta_6(b_dtot);
      const cfz_10 = cfz_theta_10(b_dtot);
      cfz_val = (((theta - 6) * (cfz_10 - cfz_6)) / (10 - 6) + cfz_6).toFixed(
        3
      );
    } else {
      cfz_val = cfz_theta_10(b_dtot);
    }

    return parseFloat(cfz_val.toString());
  }, []);

  return {
    getBasePoints,
    getX,
    getInterpolatedY,
  };
}
