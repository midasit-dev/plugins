import {GuideBox} from '@midasit-dev/moaui';
import MainWindow from './Components/MainWindow';

const App = () => {
	

	const drawingSize = 350;
	return (
		<GuideBox width='auto' row spacing={1}>
			<MainWindow/>
		</GuideBox>
	);
}

export default App;