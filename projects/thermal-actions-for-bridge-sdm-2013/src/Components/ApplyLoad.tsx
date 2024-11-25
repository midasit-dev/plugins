import React from "react";
import { useRecoilValue } from "recoil";
import { VarTabGroupMain, VarSuperType, VarStructType, VarDeckSurfType, VarDeckSurfThick, VarHeightSeaLevel } from "./variables";
import { VarLoadCase_TUH, VarLoadCase_TUC, VarLoadCase_TGH, VarLoadCase_TGC, VarAdjOpt, VarDiffOpt} from "./variables";
import { GuideBox, Button, Icon } from "@midasit-dev/moaui";
import { HelpMain } from "./Help";
import { checkPyScriptReady } from "../utils_pyscript";
import { enqueueSnackbar } from "notistack";

const ApplyLoad = () => {
	
    const tabGroupMain = useRecoilValue(VarTabGroupMain);
    const superType = useRecoilValue(VarSuperType);
    const structType = useRecoilValue(VarStructType);
    const deckSurfType = useRecoilValue(VarDeckSurfType);
    const deckSurfThick = useRecoilValue(VarDeckSurfThick);
    const heightSeaLevel = useRecoilValue(VarHeightSeaLevel);
    
    const loadCase_TUH = useRecoilValue(VarLoadCase_TUH);
    const loadCase_TUC = useRecoilValue(VarLoadCase_TUC);
    const loadCase_TGH = useRecoilValue(VarLoadCase_TGH);
    const loadCase_TGC = useRecoilValue(VarLoadCase_TGC);
    const adjOpt = useRecoilValue(VarAdjOpt);
    const diffOpt = useRecoilValue(VarDiffOpt);

    const [openMain, setOpenMain] = React.useState(false);

    function ApplyUnifLoad() {
        // Load Combinations 이 같거나, 입력값이 없으면 중지해
        if (loadCase_TUH === "" || loadCase_TUC === "") {
            enqueueSnackbar("Please input Load Case Expansion and Contraction.", { variant: "error" });
            return;
        } else if (loadCase_TUH === loadCase_TUC) {
            enqueueSnackbar("Load Case Expansion and Contraction should be different.", { variant: "error" });
            return;
        }

        // 입력값
        let uni_json_input = {
            "super_type": superType,
            "struct_type": structType,
            "deck_surf_type": deckSurfType,
            "deck_surf_thick": deckSurfThick,
            "height_sea_level": heightSeaLevel,
            "adj_option": adjOpt,
            "lcname_to_apply": [loadCase_TUH, loadCase_TUC]
        }

        // 실행!!!
        checkPyScriptReady(() => {
			const main = pyscript.interpreter.globals.get('assign_uniform_temperature');
			const result = main(JSON.stringify(uni_json_input));
			const result_json = JSON.parse(result);
			if ("error" in result_json) {
				enqueueSnackbar(result_json["error"]["message"], { variant: "error" });
			} else if ("success" in result_json) {
				enqueueSnackbar(result_json["success"]["message"], { variant: "success" });
			}
			return JSON.parse(result);
		});
    }

    function ApplyDiffLoad() {

        // Load Combinations 이 같거나, 입력값이 없으면 중지해
        if (loadCase_TGH === "" || loadCase_TGC === "") {
            enqueueSnackbar("Please input Load Case Heating and Cooling.", { variant: "error" });
            return;
        } else if (loadCase_TGH === loadCase_TGC) {
            enqueueSnackbar("Load Case Heating and Cooling should be different.", { variant: "error" });
            return;
        }

        // 입력값
        let diff_json_input = {
            "super_type": superType,
            "deck_surf_type": deckSurfType,
            "deck_surf_thick": deckSurfThick,
            "diff_option": diffOpt,
            "lcname_to_apply": [loadCase_TGH, loadCase_TGC]
        }

        // 실행!!!
        checkPyScriptReady(() => {
			const main = pyscript.interpreter.globals.get('assign_temperature_difference');
			const result = main(JSON.stringify(diff_json_input));
			const result_json = JSON.parse(result);
			if ("error" in result_json) {
				enqueueSnackbar(result_json["error"]["message"], { variant: "error" });
			} else if ("success" in result_json) {
				enqueueSnackbar(result_json["success"]["message"], { variant: "success" });
			}
			return JSON.parse(result);
		});
    }

	return (
		<GuideBox width='100%' row horSpaceBetween verCenter>
            <Icon iconName="HelpOutline" toButton onClick={() => setOpenMain(true)} />
            {HelpMain(openMain, setOpenMain)}
            <Button
                width='200px'
                onClick={tabGroupMain === "Uniform" ? ApplyUnifLoad : ApplyDiffLoad}
                variant="contained"
                color="negative"
                >
            {tabGroupMain === "Uniform" ? "APPLY UNIFORM LOAD" : "APPLY DIFFERENTIAL LOAD"}
            </Button>
		</GuideBox>
	);
};

export default ApplyLoad;
