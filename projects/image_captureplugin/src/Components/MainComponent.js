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

import { GuideBox, Panel, Tab, TabGroup } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { VarTabGroupMain } from "../TestUI/var";
import { DBTab } from "./DB/DBTab";
import { PrintTab } from "./Print/PrintTab";
import { TypeOfDisplayTab } from "./TypeOfDisplay/TypeOfDisplayTab";

import ModelPreviewComponent from "./ModelPreviewComponent";
import { ModelTab } from "./ModelTab";
import PreviewComponent from "./PreviewComponent";
import PrintPreview from "./Print/PrintPreview";
import './TabControl.css';
import { ViewTab } from "./ViewTab";

//  import DBTab from "./DBTab"
//  import ViewTab from "./ViewTab"
//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";

const MainComponent = () => {
    const [value, setValue] = useRecoilState(VarTabGroupMain);

    return (
        <Panel padding={0}>
            <TabGroup
                value={value}
                onChange={(event, newValue) => setValue(newValue)}
            >
                <Tab value="MODEL" label="MODEL" />
                <Tab value="DB" label="DB" />
                <Tab value="DISPLAY" label="Type of Display" />
                <Tab value="VIEW" label="View" />
                <Tab value="PRINT" label="GENERATE" />
            </TabGroup>
            <GuideBox row>
                <GuideBox width={'540px'} height={'703px'}>
                    {value === "MODEL" && <ModelTab />}
                    {value === "DB" && <DBTab />}
                    {value === "DISPLAY" && <TypeOfDisplayTab />}
                    {value === "VIEW" && <ViewTab />}
                    {value === "PRINT" && <PrintTab />}
                </GuideBox>
                <GuideBox width={'320px'} height={'703px'}>
                    {value == "MODEL" && <ModelPreviewComponent />}
                    {value != "PRINT" && value != "MODEL" && <PreviewComponent />}
                    {value == "PRINT" && <PrintPreview />}
                </GuideBox>
            </GuideBox>
        </Panel>
    );
};

export default MainComponent;
