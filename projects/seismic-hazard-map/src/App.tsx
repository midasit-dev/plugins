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
} from '@midasit-dev/moaui';
import { default as WelcomeDevTools } from './DevTools/Welcome';
import ComponentEarthquakeCode from './Components/CompEarthquakeCode';
import MDReport from "./Components/MarkdownView";
import CompMapView from './Components/RightMapView';

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

	return (
		<GuideBox row width={1000} spacing={1} padding={2}>
			<GuideBox width='100%' padding={1}>
				<Panel variant="shadow2" width='100%' height={640}>
					<GuideBox width='100%' spacing={2} padding={1}>
						<Panel variant="shadow2" width='100%' height={290}>
							<GuideBox width='100%' height='100%' padding={1}>
								<ComponentEarthquakeCode />
							</GuideBox>
						</Panel>

						<Panel variant="shadow2" width='100%' height={290}>
							<GuideBox center padding={2}>
								<div
									style={{
										height: '100%',
										width: '100%',
										overflowY: "visible",
										fontSize: 12,
									}}
								>
									<MDReport />
								</div>

							</GuideBox>
						</Panel>
					</GuideBox>
				</Panel>
			</GuideBox>
			<GuideBox width='100%' padding={1}>
				<Panel variant="shadow2" width='100%' height={640}>
					<GuideBox width='100%' height='100%' padding={1}>
						<CompMapView />
					</GuideBox>				
				</Panel>
			</GuideBox>
		</GuideBox>
	);
}

export default App;