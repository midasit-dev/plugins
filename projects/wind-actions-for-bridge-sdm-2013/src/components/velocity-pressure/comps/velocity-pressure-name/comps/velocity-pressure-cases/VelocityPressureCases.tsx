import { GuideBox, Typography } from "@midasit-dev/moaui";
import { VELOCITY_PRESSURE_CASES_WIDTH } from "../../../../../../defines/widthDefines";
import List from "./comps/list/List";
import Btns from "./comps/btns";
import { useRecoilValue } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../defines/openDefines";
import AddModVelocityPressure from "./comps/add-modify-dialog/AddModVelocityPressure";

export default function VelocityPressureCases() {
  const isOpen = useRecoilValue(isOpenAddModVelocityPressureSelector);

  return (
    <div className="absolute top-0 right-[32px] w-auto z-20 shadow-lg rounded-md bg-[#f4f5f6] border border-gray-300">
      <div className="relative">{isOpen && <AddModVelocityPressure />}</div>

      <GuideBox
        width={VELOCITY_PRESSURE_CASES_WIDTH}
        padding={2}
        horCenter
        spacing={2}
      >
        <Typography variant="h1">Velocity Pressure Cases</Typography>
        <List />
        <Btns />
      </GuideBox>
    </div>
  );
}
