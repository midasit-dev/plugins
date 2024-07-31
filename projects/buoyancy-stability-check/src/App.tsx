import {GuideBox} from '@midasit-dev/moaui';
import MainWindow from './Components/MainWindow';

const App = () => {
	

	const drawingSize = 580;
	return (
		<GuideBox width='auto' horCenter row spacing={1}>
			<MainWindow/>
		</GuideBox>
	);
}

export default App;