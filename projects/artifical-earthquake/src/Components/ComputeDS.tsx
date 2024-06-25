import React from 'react';
import {
    TemplatesFunctionalComponentsValidCheckDialog,
    Color,
} from "@midasit-dev/moaui";
import { useSnackbar } from 'notistack';
import { useRecoilState, useRecoilValue } from "recoil";
import {
    VarValids,
    getDesignSpectrumCodeName,
    VarChartData,
    VarCalcDS,
    VarFindAddress,
    VarLatitude,
    VarLongitude,
    VarRiskCategory,
    VarSiteSoilClass,
    VarDesignSpectrum,
    VarInputAddress,
    designSpectrumOptions,
    VarMessage,
} from "./variables";
import axios from 'axios';

const ComputeDS = (props: any) => {
    const { open, setOpen } = props;

    const [chartData, setChartData] = useRecoilState(VarChartData);
    const [calcDS, setCalcDS] = useRecoilState(VarCalcDS);
    const latitude = useRecoilValue(VarLatitude);
    const longitude = useRecoilValue(VarLongitude);
    const riskCategory = useRecoilValue(VarRiskCategory);
    const siteSoilClass = useRecoilValue(VarSiteSoilClass);
    const spectrumCode = useRecoilValue(VarDesignSpectrum);
    const [inputAddress, setInputAddress] = useRecoilState(VarInputAddress);
    const [findAddress, setFindAddress] = useRecoilState(VarFindAddress);
    const [message, setMessage] = useRecoilState(VarMessage);

    //for CheckList
    const [checkList, setCheckList] = React.useState<any>([]);
    const processing = React.useRef(false);

    const { enqueueSnackbar } = useSnackbar();

    //Create CheckList
    const valids = useRecoilValue(VarValids);
    React.useEffect(() => {
        console.log(findAddress);
        setCheckList([
            { title: "Design Spectrum", value: getDesignSpectrumCodeName(spectrumCode), error: !valids.VarDesignSpectrum(spectrumCode), reason: "" },
            { title: "Valid Location", value: inputAddress, error: !valids.VarFindAddress(findAddress), reason: "" },
        ]);
    }, [inputAddress, valids]);

    const fetchSpectrumData = async () => {
        if (processing.current || !findAddress) return;

        processing.current = true;
        const url = `https://earthquake.usgs.gov/ws/designmaps/${spectrumCode}.json?latitude=${latitude}&longitude=${longitude}&riskCategory=${riskCategory}&siteClass=${siteSoilClass}&title=Example`;
        try {
            const response = await axios.get(url);
            // 
            const pgam = response.data.response.data['pgam'];
            const sms = response.data.response.data['sms'];
            const sm1 = response.data.response.data['sm1'];
            const sds = response.data.response.data['sds'];
            const sd1 = response.data.response.data['sd1'];
            const sdc = response.data.response.data['sdc'];
            const ss = response.data.response.data['ss'];
            const s1 = response.data.response.data['s1'];
            const ts = response.data.response.data['ts'];
            const t0 = response.data.response.data['ts'];
            const tl = response.data.response.data['tl'];
            const cv = response.data.response.data['cv'];

            const message = `
$PGA_{M}$ = __${pgam}__ : the Geometric-Mean Maximum Considered Earthquake ($MCE_{G}$) peak ground acceleration for the user-specified Site Class ($g$)  
$S_{MS}$ = 1.5 x $S_{DS}$ = __${sms}__ : the Risk-Targeted Maximum Considered Earthquake ($MCE_{R}$) spectral response acceleration (of the two-period spectrum) and the user-specified Site Class ($g$)  
$S_{M1}$ = 1.5 x $S_{D1}$ = __${sm1}__ : the $MCE_{R}$ design spectral response acceleration for 1 second (of the two-period spectrum) and the user-specified Site Class ($g$)  
$S_{DS}$ = __${sds}__ : the design spectral response acceleration for short periods (of the two-period spectrum) and the user-specified Site Class ($g$)  
$S_{D1}$ = __${sd1}__ : the design spectral response acceleration for 1 second (of the two-period spectrum) and the user-specified Site Class ($g$)  
$SDC$ = __${sdc}__ : the Seismic Design Category  
$S_{S}$ = __${ss}__ : the $MCE_{R}$ spectral response acceleration at 0.2 seconds for Site Class BC ($g$)  
$S_{1}$ = __${s1}__ : the $MCE_{R}$ spectral response acceleration at 1 second for Site Class BC ($g$)  
$T_{S}$ = $S_{D1}$/$S_{DS}$ = __${ts}__ : in seconds, for construction of the two-period design spectrum  
$T_{0}$ = 0.2 x $T_{S}$ = __${t0}__ : in seconds, for construction of the two-period design response spectrum  
$T_{L}$ = __${tl}__ : the long-period transition period, in seconds, for construction of the two-period design response spectrum)  
$C_{V}$ = __${cv}__ : the vertical coefficient`;
            setMessage(message);
            
            const null_data = { id: '', color: '', data: [] };
            let new_chartdata = Array.from({ length: 6 }, () => null_data);

            let nIndex = 0;
            for (const [key, value] of designSpectrumOptions) {
                const data = response.data.response.data[value];

                const periods = data.periods;
                const ordinates = data.ordinates;
                const chartD = periods.map((period: number, index: number) => ({
                    x: period,
                    y: ordinates[index],
                }));

                new_chartdata[nIndex] = {
                    id: value,
                    color: Color.secondary.main,
                    data: chartD
                };
                nIndex++;
            }

            setChartData(new_chartdata);
            setCalcDS(true);

            enqueueSnackbar("Calculate design spectrum graph data successfully", {
                variant: "success",
                autoHideDuration: 2000,
            });
        } catch (error) {
            enqueueSnackbar('Invalid Address', { variant: 'error' });
            const null_data = { id: '', color: '', data: [] };
            const new_chartdata = [null_data, null_data, null_data, null_data, null_data, null_data];
            setChartData(new_chartdata);
            setCalcDS(false);
        } finally {
            processing.current = false;
        }
    };

    return (
        <TemplatesFunctionalComponentsValidCheckDialog
            open={open}
            setOpen={setOpen}
            checkList={checkList}
            buttonText="Calculate Design Spectrum"
            buttonClick={() => {
                fetchSpectrumData();
            }}
            maxPanelRows={8}
        />

    )
}

export default ComputeDS;
