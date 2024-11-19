import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
import LoadCasesName from "./components/load-cases-name/LoadCasesName";
import VelocityPressure from "./components/velocity-pressure/VelocityPressure";
import Optional from "./components/optional/Optional";
import Btns from "./components/btns/Buttons";
import { useRecoilValue } from "recoil";
import { isBlurSelector } from "./defines/blurDefines";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = () => {
  const isBlur = useRecoilValue(isBlurSelector);

  return (
    <QueryClientProvider client={queryClient}>
      <GuideBox>
        <div className="relative p-4 gap-4 flex flex-col bg-[#f4f5f6] w-[500px]">
          {isBlur && <Blur />}

          <LoadCasesName />
          <VelocityPressure />
          <Optional />
          <Btns />
        </div>
      </GuideBox>
    </QueryClientProvider>
  );
};

export default App;

function Blur() {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 pointer-events-auto cursor-default" />
  );
}
