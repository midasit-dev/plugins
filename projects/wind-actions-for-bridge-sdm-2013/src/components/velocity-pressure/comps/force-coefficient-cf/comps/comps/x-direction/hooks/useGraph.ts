import { useCallback } from "react";
import { type Type, typeA, typeB } from "../type";

export default function useGraph() {
  const getBasePoints = useCallback((type: Type) => {
    if (type === typeA) {
      return {
        x: [0.0, 0.5, 4.0, 12],
        y: [2.4, 2.4, 1.3, 1.3],
      };
    } else if (type === typeB) {
      return {
        x: [0.0, 0.5, 5.0, 12],
        y: [2.4, 2.4, 1.0, 1.0],
      };
    } else {
      throw new Error("Invalid type. Use 'a' or 'b'.");
    }
  }, []);

  const getX = useCallback((b_dtot: number) => {
    if (b_dtot < 0 || b_dtot > 12) {
      return 4;
    } else {
      return b_dtot;
    }
  }, []);

  const getInterpolatedY = useCallback((b_dtot: number, type: Type) => {
    if (type === typeA) {
      // Calculate c_fx,0 for type "a"
      if (b_dtot <= 0.5) {
        return 2.4;
      } else if (b_dtot > 0.5 && b_dtot < 4) {
        return parseFloat((-0.314 * b_dtot + 2.557).toFixed(3));
      } else {
        return 1.3; // For b_dtot >= 4
      }
    } else if (type === typeB) {
      // Calculate c_fx,0 for type "b"
      if (b_dtot <= 0.5) {
        return 2.4;
      } else if (b_dtot > 0.5 && b_dtot < 5) {
        return parseFloat((-0.311 * b_dtot + 2.5555).toFixed(3));
      } else {
        return 1.0; // For b_dtot >= 5
      }
    } else {
      throw new Error("Invalid type. Use 'a' or 'b'.");
    }
  }, []);

  return {
    getBasePoints,
    getX,
    getInterpolatedY,
  };
}
