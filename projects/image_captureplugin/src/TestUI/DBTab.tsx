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
 import { VarTabGroupDB } from "./variables";
 //import ImageButton from "./ImageButton.tsx";
 import { TabGroup, Tab, GuideBox, Typography, } from "@midasit-dev/moaui";

 //import { default as ReactionTab } from "./ReactionTab";
 import IconButton from "@mui/material/IconButton";

//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";

 
 const DBTab = () => {

     return (
        <GuideBox show={false} width='100%'>
        <Typography variant="body1">Result Category</Typography>
         <TabGroup
            //  value={value}
            //  onChange={(event: React.SyntheticEvent, newValue: string) => setValue(newValue)}
         >
             <Tab value="Reactions" label="Reactions" />
             <Tab value="Deformations" label="Deformations" />
         </TabGroup>
         {/* {value === "Reactions" && <ReactionComponent />}
         {value === "Deformations" && <DeformationComponent />} */}
     </GuideBox>
     );
 };
 
 export default DBTab;
 