import React from 'react';
import {
    TemplatesFunctionalComponentsValidCheckDialog,
    Color,
} from "@midasit-dev/moaui";
import { useSnackbar } from 'notistack';
import { useRecoilState, useRecoilValue } from "recoil";
import {
    VarChartData,
    designSpectrumOptions,
    VarDesignSpectrumOption,
} from "./variables";
import { update_response_spectrum } from '../utils_pyscript';
import { update } from 'lodash';

const UpdateRS = (props: any) => {
    const { open, setOpen } = props;
    const [chartData, setChartData] = useRecoilState(VarChartData);
    const [spectrumOption, setSpectrumOption] = useRecoilState(VarDesignSpectrumOption);

    //for CheckList
    const [checkList, setCheckList] = React.useState<any>([]);
    const processing = React.useRef(false);

    const { enqueueSnackbar } = useSnackbar();

    let nIndex = 0;
    let spectrumName = '';
    for (const [key, value] of designSpectrumOptions) {
        if (value === spectrumOption) {
            spectrumName = key;
            break;
        }
        nIndex++;
    }

    React.useEffect(() => {
        setCheckList([
            { title: `ASCE7-22 : ${spectrumName}`, value: true, error: false, reason: "" },
        ]);
    }, []);

    return (
        <TemplatesFunctionalComponentsValidCheckDialog
            open={open}
            setOpen={setOpen}
            checkList={checkList}
            buttonText="Update Response Spectrum"
            buttonClick={() => {
                if (processing.current) return;
                setTimeout(() => {
                    try {
                        processing.current = true;

                        const x_values = chartData[nIndex].data.map((item: any) => Number(item.x));
                        const y_values = chartData[nIndex].data.map((item: any) => Number(item.y));
                        const result = update_response_spectrum(`ASCE7-22 : ${spectrumName}`, spectrumName, x_values, y_values);
                        
                    } catch (e: any) {
                        console.error(e);
                    } finally {
                        enqueueSnackbar("Update response spectrum successfully", {
                            variant: "success",
                            autoHideDuration: 1000,
                        });

                        processing.current = false;
                    }
                }, 500);
            }

            }
            maxPanelRows={8}
        />
    )
}

export default UpdateRS;
