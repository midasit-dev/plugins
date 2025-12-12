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
	VerifyDialog,
} from '@midasit-dev/moaui';
// import { default as WelcomeDevTools } from './DevTools/Welcome';
import { DBTab } from './Components/DB/DBTab'
import { ReactionTab } from './TestUI/ReactionTab'
import MainComponent from './Components/MainComponent'
import PreviewComponent from './Components/PreviewComponent';
import PrintPreview from './Components/Print/PrintPreview';
import { VarTabGroupMain } from './TestUI/var';
import { useRecoilState } from 'recoil';
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
		<GuideBox>
			<VerifyDialog />
			<MainComponent />
		</GuideBox>
	);
}

export default App;