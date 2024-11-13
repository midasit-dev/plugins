import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
import LoadCasesName from "./components/load-cases-name";
import VelocityPressure from "./components/velocity-pressure";
import Optional from "./components/optional";
import Btns from "./components/btns";

const App = () => {
  return (
    <GuideBox width={500} spacing={2} padding={2} fill="#f4f5f6" show>
      <LoadCasesName />
      <VelocityPressure />
      <Optional />
      <Btns />
    </GuideBox>
  );
};

export default App;
