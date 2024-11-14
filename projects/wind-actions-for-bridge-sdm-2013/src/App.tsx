import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
import LoadCasesName from "./components/load-cases-name";
import VelocityPressure from "./components/velocity-pressure";
import Optional from "./components/optional";
import Btns from "./components/btns";
import { useRecoilValue } from "recoil";
import { isBlurSelector } from "./defines/blurDefines";

const App = () => {
  const isBlur = useRecoilValue(isBlurSelector);

  return (
    <GuideBox>
      <div className="relative p-4 gap-4 flex flex-col bg-[#f4f5f6] w-[500px]">
        {isBlur && <Blur />}
				
        <LoadCasesName />
        <VelocityPressure />
        <Optional />
        <Btns />
      </div>
    </GuideBox>
  );
};

export default App;

function Blur() {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 pointer-events-auto cursor-default" />
  );
}
