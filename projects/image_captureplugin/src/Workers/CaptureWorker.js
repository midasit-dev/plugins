import { useRecoilState } from "recoil";

import { loadData, hasError, isDemo, sendData } from "../utils";
import { DBVARIANT } from "./dictionary";

export const CaptureWorker = async (json) => {




    // var json = {
    //     Argument:{
    //         SET_MODE:"post",
    //         SET_HIDDEN:
    //     }
    // }
    const cmd = "/VIEW/CAPTURE";
    const rawData = await sendData(cmd, json, "POST");
    if (hasError(rawData)) return [];

};
