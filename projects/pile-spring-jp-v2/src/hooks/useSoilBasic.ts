import { useRecoilState } from "recoil";
import { soilBasicData } from "../states";

export const useSoilBasic = () => {
  const [soilBasic, setSoilBasic] = useRecoilState(soilBasicData);

  const handleChange = (fieldName: keyof typeof soilBasic) => (e: any) => {
    const value = e.target.value;
    setSoilBasic((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCheckBoxChange =
    (fieldName: keyof typeof soilBasic) => (e: any) => {
      const value = e.target.checked;
      setSoilBasic((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    };

  return {
    values: soilBasic,
    handleChange,
    handleCheckBoxChange,
  };
};
