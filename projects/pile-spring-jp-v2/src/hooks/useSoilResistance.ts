import { useRecoilState } from "recoil";
import { soilResistance } from "../states";

export const useSoilResistance = () => {
  const [soilResis, setSoilResis] = useRecoilState(soilResistance);

  const handleChange = (fieldName: keyof typeof soilResis) => (e: any) => {
    const value = e.target.value;
    setSoilResis((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCheckBoxChange =
    (fieldName: keyof typeof soilResis) => (e: any) => {
      const value = e.target.checked;
      setSoilResis((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    };

  const handleClayFrictionMethodChange = (e: any) => {
    setSoilResis((prev) => ({
      ...prev,
      clayFrictionMethod: e.target.value,
    }));
  };

  return {
    values: soilResis,
    handleChange,
    handleCheckBoxChange,
    handleClayFrictionMethodChange,
  };
};
