/**
 * 
 * ██████╗        █████╗ ██████╗ ██████╗ 
 * ╚════██╗      ██╔══██╗██╔══██╗██╔══██╗
 *  █████╔╝█████╗███████║██████╔╝██████╔╝
 *  ╚═══██╗╚════╝██╔══██║██╔═══╝ ██╔═══╝ 
 * ██████╔╝      ██║  ██║██║     ██║     
 * ╚═════╝       ╚═╝  ╚═╝╚═╝     ╚═╝     
 * 
 * @description Entry point for the application after Wrapper
 * @next last entry point
 */

import React from 'react';
import { 
	GuideBox, 
	Panel, 
	DropList,
	Typography,
	Color,
} from "@midasit-dev/moaui";

import { useRecoilState, useRecoilValue } from "recoil";
import CompTypographyAndTextField from "./Components/TypographyAndTextField";
import CompTypographyAndDropList from "./Components/TypographyAndDropList";
import {
	VarValids,
	VarDesignSpectrum,
	VarDesignSpectrumList,
	VarChartData,
  } from "./Components/variables";

  import DesignSpectrum from './Components/DesignSpectrum';
import ArtificalEarthquake from './Components/ArtificialEarthquake';
import CompCharGraph from './Components/ChartGraph';
import MDReport from './Components/MarkdownView';

const opacity = 0.5;
//If you want to test, try using the GuideApp component.
//import GuideApp from './SampleComponents/GuideApp';

/**
 * You can modify the code here and test.
 * 
 * @description You can start from the Panel Component below.
 * 							You can add the Component you want.
 *							You can check the version of the library you are currently using by opening the developer tool.
 * 
 * For more information about the library, please refer to the link below.
 * @see https://midasit-dev.github.io/moaui
 */
const App = () => {
	const [design_spectrum, setDesignSpectrum] = useRecoilState(VarDesignSpectrum);
	const design_spectrum_list = useRecoilValue(VarDesignSpectrumList);

	return (
		<GuideBox width={1020} height={890} verTop spacing={2} padding={2} > 
		{/* overflow="scroll" */}
			<GuideBox center spacing={2}>
				<GuideBox row spacing={2}>					
					<Panel variant="shadow2" padding={2}>						
						<GuideBox width={410} height={370} spacing={2} padding={1} verTop>
							<CompTypographyAndDropList title="Design Code" state={design_spectrum} setState={setDesignSpectrum} blueTitle droplist={design_spectrum_list} width={250}/>
							<DesignSpectrum />							
						</GuideBox>
					</Panel>

					<Panel variant="shadow2" padding={1}>
						<GuideBox width={410} height={385} verSpaceBetween>
						 	<ArtificalEarthquake />
						</GuideBox>
					</Panel>

				</GuideBox>

				<GuideBox width="100%" row horSpaceBetween>
					<Panel variant="shadow2" padding={2}>
						<GuideBox width={855} height={280} verSpaceBetween>	
							<MDReport />			
						</GuideBox>
					</Panel>
				</GuideBox>

				<GuideBox width="100%" row horSpaceBetween>
					<Panel variant="shadow2" padding={2}>
						<GuideBox width={855} height={350} verSpaceBetween>	
							<CompCharGraph />			
						</GuideBox>
					</Panel>
				</GuideBox>
    	</GuideBox>
    </GuideBox>	
	);
}

export default App;