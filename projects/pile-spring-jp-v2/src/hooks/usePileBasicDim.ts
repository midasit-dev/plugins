import { useRecoilState } from "recoil";
import { pileBasicDimensions } from "../states";

export const usePileBasicDim = () => {
  const [dimensions, setDimensions] = useRecoilState(pileBasicDimensions);

  const handleChange = (fieldName: keyof typeof dimensions) => (e: any) => {
    const value = e.target.value;
    setDimensions((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return {
    values: dimensions,
    handleChange,
  };
};
