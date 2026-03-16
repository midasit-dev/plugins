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
import { CssBaseline } from "@mui/material";
import ResultTable from "./features/containers/ResultTable";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./features/theme";
import { VerifyDialog } from "@midasit-dev/moaui";

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
 * For more informati on about the library, please refer to the link below.
 * @see https://midasit-dev.github.io/moaui
 */
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <VerifyDialog/>
      <CssBaseline />
      <ResultTable />
    </ThemeProvider>
  );
};

export default App;
