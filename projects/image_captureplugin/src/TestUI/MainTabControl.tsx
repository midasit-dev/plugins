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
 import { VarTabGroupMain } from "./var";
 import { TabGroup, Tab, GuideBox, Typography } from "@midasit-dev/moaui";
 
 import DBTab from "./DBTab"
 import ViewTab from "./ViewTab"
//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";
 
 const ComponentsTabGroup = () => {
    const [value, setValue] = useRecoilState(VarTabGroupMain);
 
     return (
         <GuideBox show={false} width='100%'>
             <TabGroup
                 value={value}
                 onChange={(event: React.SyntheticEvent, newValue: string) => setValue(newValue)}
             >
                 <Tab value="DB" label="DB" />
                 <Tab value="DISPLAY" label="Type of Display" />
                 <Tab value="VIEW" label="View" />
                 <Tab value="PRINT" label="Print" />
             </TabGroup>
             {value === "DB" && <DBTab />}
             {value === "DISPLAY" && <ViewTab />}
         </GuideBox>
     );
 };
 
 export default ComponentsTabGroup;
 