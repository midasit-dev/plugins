import { GuideBox, Alert } from "@midasit-dev/moaui";

const ComponentsAlertError = () => {

	return (
		<GuideBox width={400}>
			<Alert 
				variant="outlined"
				severity="info"
				title="Information"
			>
				Please wait while the analysis is being processed.
			</Alert>
		</GuideBox>
	);
}

export default ComponentsAlertError;
