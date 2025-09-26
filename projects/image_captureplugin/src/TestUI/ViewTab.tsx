/**
 *		                                                                         __      
 *		                                                                        /\ \__   
 *		  ___     ___     ___ ___     _____     ___     ___       __     ___    \ \ ,_\  
 *		 /'___\  / __`\ /' __` __`\  /\ '__`\  / __`\ /' _ `\   /'__`\ /' _ `\   \ \ \/  
 *		/\ \__/ /\ \L\ \/\ \/\ \/\ \ \ \ \L\ \/\ \L\ \/\ \/\ \ /\  __/ /\ \/\ \   \ \ \_ 
 *		\ \____\\ \____/\ \_\ \_\ \_\ \ \ ,__/\ \____/\ \_\ \_\\ \____\\ \_\ \_\   \ \__\
 *		 \/____/ \/___/  \/_/\/_/\/_/  \ \ \/  \/___/  \/_/\/_/ \/____/ \/_/\/_/    \/__/
 *		                                \ \_\                                            
 *		                                 \/_/                                            
 */

 import React from "react";
 import { useRecoilState } from "recoil";
 import { VarTabGroupView } from "./var";
 import { TabGroup, Tab, GuideBox, Typography } from "@midasit-dev/moaui";
//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";
 
 const ComponentsTabGroup = () => {
    
 
     return (
         <GuideBox show={false} width='100%'>
            <Typography variant="body2">Type of Display</Typography>
             <TabGroup
                //  value={value}
                //  onChange={(event: React.SyntheticEvent, newValue: string) => setValue(newValue)}
             >
                 <Tab value="SubTab2-1" label="SubTab2-1" />
                 <Tab value="SubTab2-2" label="SubTab2-2" />
             </TabGroup>
             {/* {value === "Material" && <ConcreteBasic />}
             {value === "TimeDependent" && <TimeDependentBasic />} */}
         </GuideBox>
     );
 };
 
 export default ComponentsTabGroup;
 