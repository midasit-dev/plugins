import React from 'react';
import m from '@midasit-dev/moaui';

const App = () => {
	return (
		<m.GuideBox width={550} spacing={2} padding={2}>
			<m.GuideBox row width='100%' spacing={2}>
				<m.Panel variant="shadow2" width='50%' height={100}/>
				<m.Panel variant="shadow2" width='50%' height={100}/>
				<m.Panel variant="shadow2" width='50%' height={100}/>
			</m.GuideBox>
			<m.GuideBox width='100%' spacing={2}>
				<m.Panel variant="shadow2" width='100%' height={50}/>
				<m.Panel variant="shadow2" width='100%' height={50}/>
				<m.Panel variant="shadow2" width='100%' height={50}/>
			</m.GuideBox>
		</m.GuideBox>
	);
}

export default App;