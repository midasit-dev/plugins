import React from 'react';
import m from '@midasit-dev/moaui';

const url = (): string => {
	if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
	return 'https://midasit-dev.github.io/plugintest';
}

function App() {
  return (
    <m.GuideBox width='100vw' height='100vh' show fill='#f4f5f6' center>
			<m.Panel>
				<m.GuideBox row width='100%' verCenter horSpaceBetween spacing={2}>
					<m.Typography size='medium'>Node Controller</m.Typography>
					<m.Button color='negative' onClick={() => window.open(`${url()}/node-controller`)}>TEST</m.Button>
				</m.GuideBox>
			</m.Panel>
		</m.GuideBox>
  );
}

export default App;
