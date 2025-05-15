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

import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
// import { default as WelcomeDevTools } from './DevTools/Welcome';

import { default as BasicInput } from "./Components/BasicInput";
import { default as LoadOutput } from "./Components/LoadOutput";
import { default as ApplyLoad } from "./Components/ApplyLoad";

// const opacity = 0.5;
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
  // Test function

  // Parameters
  // {
  // 	"super_type": {
  // 		"description": "Superstructure Type",
  // 		"value": integer,
  // 		"enum": [1, 2, 3]
  // 	},
  // 	"struct_type": {
  // 		"description": "Structure Type",
  // 		"value": string,
  // 		"enum": ["Normal", "Minor"]
  // 	},
  // 	"deck_surf_type": {
  // 		"description": "Deck Surfacing Type",
  // 		"value": string,
  // 		"enum": ["plain", "trafficked", "waterproofed", "thickness"]
  // 	},
  // 	"deck_surf_thick": {
  // 		"description": "Deck Surfacing Thickness",
  // 		"value": float,
  // 		"min": 0,
  // 		"unit": "mm"
  // 	},
  // 	"height_sea_level": {
  // 		"description": "Height above sea level",
  // 		"value": float,
  // 		"unit": "m"
  // 	},
  // 	"adj_option":{
  // 		"description": "Adjustment Option(Interpolation:true or Get larger value:false)",
  // 		"value": boolean,
  // 	},
  // 	"diff_option": {
  // 		"description": "Temperature difference option",
  // 		"value": boolean,
  // 	},
  //  "lcname_to_apply": {
  // 		"description": "Loadcase name to apply, index 0: max, index 1: min",
  // 		"value": array[string],
  // 		"enum": "dependent on the program"
  // 	}
  // }

  return (
    <GuideBox width={550} column spacing={2} padding={2}>
      {BasicInput()}
      {LoadOutput()}
      {ApplyLoad()}
    </GuideBox>
  );
};

export default App;
