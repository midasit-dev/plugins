import React from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { ChartLine, GuideBox, Typography, Button } from "@midasit-dev/moaui";
import {
    ChartData,
    VarChartData,
    VarGraphType,
    VarDesignSpectrumOption,
    getDesignSpectrumOptionName,
    designSpectrumOptions,
    VarCalcDS,
    VarCalcAE,
} from './variables';
import UpdateRS from './UpdateRS';
import UpdateAE from './UpdateAE';


const CompCharGraph = (props: any) => {
    const [loading, setLoading] = React.useState(false);
    const chartData = useRecoilValue(VarChartData);
    const graph_type = useRecoilValue(VarGraphType);
    const spectrumOption = useRecoilValue(VarDesignSpectrumOption);
    const calcDS = useRecoilValue(VarCalcDS);
    const calcAE = useRecoilValue(VarCalcAE);

    const [openRS, setOpenRS] = React.useState(false);
    const [openAE, setOpenAE] = React.useState(false);

    let nIndex = 0;
    for (const [key, value] of designSpectrumOptions) {
        if (value === spectrumOption) break;
        nIndex++;
    }

    console.log(chartData);
    console.log(nIndex);

    const null_data: ChartData = { id: '', color: '', data: [] };
    const new_chartdata: ChartData[] = [
        (graph_type === '1') ? chartData[nIndex] : chartData[5],
        (graph_type === '1') ? chartData[4] : null_data,
        null_data
    ];

    console.log(chartData);

    const x_label = (graph_type === '1') ? 'Period (sec)' : 'Time (sec)';
    const y_label = (graph_type === '1') ? getDesignSpectrumOptionName(spectrumOption) : 'Acceleration (g)';

    return (
        <GuideBox height="100%" verSpaceBetween>
            <GuideBox row horSpaceBetween spacing={1}>
                <GuideBox show fill='1' width={500} center padding={1} borderRadius={1}>
                    <Typography variant='h1'>Spectrum / Acceleration Graph</Typography>
                </GuideBox>
                <Button disabled={!calcDS} onClick={() => setOpenRS(true)}>Update RS Function</Button>
                {
                    <UpdateRS open={openRS} setOpen={setOpenRS} />
                }
                <Button disabled={!calcAE} onClick={() => setOpenAE(true)}>Update Time History Function</Button>
                {
                    <UpdateAE open={openAE} setOpen={setOpenAE} />
                }
            </GuideBox>
            <GuideBox loading={loading} center>
                <CompChartBottom xlabel={x_label} ylabel={y_label} data={new_chartdata} />
            </GuideBox>
        </GuideBox>
    );
}

export default CompCharGraph;

const CompChartBottom = (props: any) => {
    const { xlabel, ylabel, data } = props;
    return (
        <ChartLine
            width={830}
            height={300}
            data={data}
            legends={true}
            axisBottom
            axisBottomTickValues={5}
            axisBottomDecimals={2}
            axisBottomTickRotation={0}
            axisBottomLegend={xlabel}
            axisBottomLegendOffset={50}
            axisLeft
            axisLeftTickValues={5}
            axisLeftDecimals={5}
            axisLeftTickRotation={0}
            axisLeftLegend={ylabel}
            axisLeftLegendOffset={-80}
            marginTop={20}
            marginRight={20}
            marginLeft={90}
            marginBottom={60}
            pointSize={0}
            xDecimals={2}
            yDecimals={4}
        />
    );
}