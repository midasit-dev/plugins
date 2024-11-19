import { Typography } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  selVelocityPressureCaseLightSelector,
  TempProcedureFlagSelector,
  velocityPressureCasesSelector,
  selVelocityPressureCaseSelector,
} from "../../../../../../../../defines/applyDefines";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../defines/openDefines";
import useTemporaryValue from "../../../../../../../../hooks/useTemporaryValue";

export default function List() {
  const [sel, setSel] = useRecoilState(selVelocityPressureCaseLightSelector);
  const [cases] = useRecoilState(velocityPressureCasesSelector);

  const setFlag = useSetRecoilState(TempProcedureFlagSelector);
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);
  const selCase = useRecoilValue(selVelocityPressureCaseSelector);
  const { setTempValueCallback } = useTemporaryValue();

  return (
    <div className="w-full bg-white p-4 border border-[#e3e3e3] rounded-md h-[300px] overflow-y-auto">
      <ul className="w-full border-b border-b-[#e3e3e3] pb-4">
        <li className="grid grid-cols-2 justify-items-center">
          <Typography variant="h1" color="#4B5563">
            Name
          </Typography>
          <Typography variant="h1" color="#4B5563">
            Value (kN/m2)
          </Typography>
        </li>
      </ul>

      {cases?.map((item, index) => (
        <button
          type="button"
          key={item.name}
          className="w-full py-2 cursor-default border"
          style={{
            backgroundColor: sel?.index === index ? "#2B6EFF29" : "white",
            borderColor: sel?.index === index ? "#0867EC" : "white",
          }}
          onClick={() =>
            setSel({
              index: index,
              item: { name: item.name, value: item.value },
            })
          }
          onDoubleClick={() => {
            setSel({
              index: index,
              item: { name: item.name, value: item.value },
            });

            setFlag("modify");
            setIsOpen(true);

            if (!selCase) {
              console.error("selCase is null ...");
              return;
            }

            setTempValueCallback({ ...selCase });
          }}
        >
          <li className="grid grid-cols-2 justify-items-center">
            <Typography color="#4B5563">{item.name}</Typography>
            <Typography color="#4B5563">{`${item.value}`}</Typography>
          </li>
        </button>
      ))}
    </div>
  );
}
