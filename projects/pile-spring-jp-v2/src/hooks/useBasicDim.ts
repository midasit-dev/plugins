import { useRecoilState } from "recoil";
import {
  FoundationWidth,
  SideLength,
  Force_Point_X,
  Force_Point_Y,
} from "../states";

export const useBasicDim = () => {
  const [foundationWidth, setFoundationWidth] = useRecoilState(FoundationWidth);
  const [sideLength, setSideLength] = useRecoilState(SideLength);
  const [forcePointX, setForcePointX] = useRecoilState(Force_Point_X);
  const [forcePointY, setForcePointY] = useRecoilState(Force_Point_Y);

  const handleChange = (fieldName: string) => (e: any) => {
    const value = e.target.value;
    switch (fieldName) {
      case "foundationWidth":
        setFoundationWidth(value);
        break;
      case "sideLength":
        setSideLength(value);
        break;
      case "forcePointX":
        setForcePointX(value);
        break;
      case "forcePointY":
        setForcePointY(value);
        break;
    }
  };

  return {
    values: { foundationWidth, sideLength, forcePointX, forcePointY },
    handleChange,
  };
};
