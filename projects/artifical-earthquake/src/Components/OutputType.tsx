//OutputType.tsx
import React from 'react';
import {
  GuideBox,
  Typography,
  RadioGroup,
  Radio,
} from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import {VarOutputType} from './variables';


const CompOutputType = () => {
  const [value, setValue] = useRecoilState(VarOutputType);
 
  const handleChange = (event: React.ChangeEvent, state: string) => {
    setValue(state);
  };
 
  return (
    <GuideBox width='100%' center>
      <GuideBox show fill="1" width="100%" center padding={1} borderRadius={1}>
        <Typography variant="h1">Enter Location</Typography>
      </GuideBox>
      <GuideBox padding={1} width='100%' horCenter>
        <RadioGroup onChange={handleChange} value={value} row>
          <Radio name="By Address" value="By Address"/>
          <Radio name="By Lat/Long" value="By Lat/Long" marginLeft={7} />
        </RadioGroup>
      </GuideBox>
    </GuideBox>
  );
};
export default CompOutputType;
