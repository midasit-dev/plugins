import React from 'react';
import m from '@midasit-dev/moaui';
import { make_curve_data } from './utils_pyscript';
import { Skeleton } from '@mui/material';
import { useSnackbar } from 'notistack';

const App = () => {
	const [ csvResult, setCsvResult ] = React.useState<string>('');
	const [ loadingExtract, setLoadingExtract ] = React.useState<boolean>(false);
	const [ loadingClear, setLoadingClear ] = React.useState<boolean>(false);
	const { enqueueSnackbar } = useSnackbar();

	React.useEffect(() => {
		if (loadingExtract) {
			setTimeout(() => {
				try {
					const result: string = make_curve_data();
					setCsvResult(result);
				} catch ( err ) {
					enqueueSnackbar('Failed to extract data.', { variant: 'error' });
					console.error(err);
				} finally {
					setLoadingExtract(false);
				}
			}, 1000);
		}
	}, [loadingExtract, enqueueSnackbar]);

	React.useEffect(() => {
		if (loadingClear) {
			setTimeout(() => {
        try {
          setCsvResult("");
        } catch (err) {
					enqueueSnackbar("Failed to clear data.", { variant: "error" });
          console.error(err);
        } finally {
          setLoadingClear(false);
        }
      }, 1000);
		}
	}, [loadingClear, enqueueSnackbar]);

	return (
    <m.GuideBox width="auto" spacing={2} padding={2}>
      <m.GuideBox width="100%" spacing={2} row verCenter horSpaceBetween>
        <m.Typography variant="h1">Girder Wizard Lining Extractor</m.Typography>
        <m.Button
          color="negative"
          onClick={() => setLoadingExtract(true)}
          loading={loadingExtract}
        >
          Extract (.csv)
        </m.Button>
      </m.GuideBox>

      <m.GuideBox width='100%' row spacing={2}>
        <m.Button disabled={csvResult === ''} onClick={() => setLoadingClear(true)} loading={loadingClear}>
          Clear
        </m.Button>
				<m.Button disabled={csvResult === ''} onClick={() => downloadCSV(csvResult)}>
          Download (.csv)
        </m.Button>
      </m.GuideBox>

      <m.GuideBox>
        <m.Scrollbars
          width={440}
          height={300}
          panelProps={{
            padding: 0,
            borderRadius: 0,
            marginRight: 1.5,
            variant: "box",
          }}
        >
          {csvResult === "" && <SkeletonList />}
          {csvResult !== "" && <m.Typography>{csvResult}</m.Typography>}
        </m.Scrollbars>
      </m.GuideBox>
    </m.GuideBox>
  );
}

export default App;

function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SkeletonList = () => {
	return (
			<div>
					{Array.from({ length: 12 }).map((_, index) => (
							<Skeleton key={index} width={`${getRandomNumber(50, 100)}%`} />
					))}
			</div>
	);
};

function downloadCSV(csvString: string) {
	// CSV 파일 생성
	const blob = new Blob([csvString], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'output.csv';

	// 다운로드 트리거
	document.body.appendChild(a);
	a.click();

	// Clean up
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
