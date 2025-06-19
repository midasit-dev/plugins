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
import { Main } from "./features/frames";
import { GuideBox } from "@midasit-dev/moaui";

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
// interface RowData {
//   id: number;
//   name: string;
//   age: number;
//   country: string;
// }

const App = () => {
  return (
    <GuideBox id="App" row width={1000} height={800} border="1px solid black">
      <Main />
    </GuideBox>
  );
};

export default App;
