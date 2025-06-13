import { useRecoilState } from "recoil";
import { soilBasicData, SoilBasic } from "../states";

export const useSoilBasic = () => {
  const [soilBasic, setSoilBasic] = useRecoilState(soilBasicData);

  const handleChange = (fieldName: keyof typeof soilBasic) => (e: any) => {
    const value = e.target.value;
    setSoilBasic((prev) => ({
      ...prev,
      [fieldName]: typeof prev[fieldName] === "number" ? Number(value) : value,
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
