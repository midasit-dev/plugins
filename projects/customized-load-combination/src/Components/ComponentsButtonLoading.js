import { Button } from "@midasit-dev/moaui";

const ComponentsButtonLoading = () => {
	return (
		// <GuideBox spacing={2}>
			// <Button
			// 	variant="contained"
			// 	color="normal"
			// 	width="130px"
			// 	loading
			// >
			// 	Normal
			// </Button>
			<Button
			variant="contained"
			color="negative"
			width="130px"
            clickevent
			loading// Use the loading prop here to toggle loading state
             // Trigger the passed event on button click
		>
			Negative
		</Button>
	// </GuideBox>
	)
}

export default ComponentsButtonLoading;