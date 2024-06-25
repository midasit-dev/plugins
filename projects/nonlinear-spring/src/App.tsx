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
	TemplatesDualComponentsTypographyDropListSpaceBetween
} from '@midasit-dev/moaui';
import Inputwindow from './Components/Inputwindow';
import LayerTable from './Components/LayerTable';
import View from './Components/View';
import StructureGroup from './Components/StructureGroup';
const App = () => {
	return (
		<GuideBox row width={1100} padding={1} spacing={2}>
			<Inputwindow />
			<View />
			<StructureGroup />
		</GuideBox>
	);
}

export default App;