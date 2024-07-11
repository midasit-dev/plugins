import React from 'react';
import {
	GuideBox,
	Panel,
} from '@midasit-dev/moaui';
import ComponentEarthquakeCode from './Components/CompEarthquakeCode';
import MDReport from "./Components/MarkdownView";
import CompMapView from './Components/RightMapView';
import { motion } from 'framer-motion';

const App = () => {

	return (
    <GuideBox row width={1000} spacing={1} padding={2}>
      <GuideBox width="100%" padding={1} height={640} verSpaceBetween>

				<Panel variant="shadow2" width="100%" height={290}>
					<GuideBox width="100%" height="100%" padding={1}>
						<ComponentEarthquakeCode />
					</GuideBox>
				</Panel>
        

        <Panel variant="shadow2" width="100%" height={310}>
          <GuideBox center padding={2}>
            <div
              style={{
                height: "100%",
                width: "100%",
                overflowY: "visible",
                fontSize: 12,
              }}
            >
              <MDReport />
            </div>
          </GuideBox>
        </Panel>

      </GuideBox>

      <GuideBox width="100%" padding={1} height={640}>
        <Panel variant="shadow2" width="100%" height={640} relative padding={2}>
					<CompMapView />
        </Panel>
      </GuideBox>
			
    </GuideBox>
  );
}

export default App;