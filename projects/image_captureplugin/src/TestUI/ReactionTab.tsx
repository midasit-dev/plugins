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

 import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
 import { useRecoilState } from "recoil";
 import { VarTabGroupView, VarCompListReaction } from "./var";
 import { TabGroup, Tab, GuideBox } from "@midasit-dev/moaui";
 import MoaStack from "@midasit-dev/moaui/Components/Stack";
 import { ListComponent } from "./ListComponents";
//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";


 
export const ReactionTab = React.forwardRef((props, ref) => {

    // const {
    //     compList,
    //     onComponentsChange,
    //     beamData,
    //   } = props;
    const reactFMComps = ["Fx", "Fy", "Fz", "Mx", "My"];
    const [compCheck, setCompCheck] = useState();

    const [doUpdate, setDoUpdate] = useState();
    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const handleCompChange = () => {
        //setCompCheck(selectedComp.length > 0 ? selectedComp[0] : "");
      };
 
     return (
         <GuideBox show={false} width='100%'>
             <MoaStack direction="row" spacing={0.55}>
                <ListComponent
                  width="100%"
                  label="Components"
                  userData={reactFMComps}
                  //checkList={{reactFMComps}}
                  setCheckList={handleCompChange}
                  {...updateKit}
                  //singleSelect
                />
                <ListComponent
                  width="100%"
                  label={"Option Local Check"}
                  userData={["Local"]}
                  //checkList={optLocalCheckList}
                  //setCheckList={(l) => setOptLocalCheckList(l)}
                  {...updateKit}
                />
              </MoaStack>
         </GuideBox>
     );
 });
 
 //export default ReactionTab;
 