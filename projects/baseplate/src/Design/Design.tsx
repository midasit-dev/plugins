import React, { useEffect, useState } from "react";
import {
  GuideBox,
  Panel,
  Check,
  Typography,
  TabGroup,
  Tab,
  Button,
  DataGrid,
} from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import TypoGraphyTextField from "../NewComponents/TypoGraphyTextField";
import { selectNodeList, setColumnInfo } from ".././utils_pyscript";
import {
  SelectedNodes,
  SelectedColumnList,
  SelectedColumnIndex_DBName,
  SelectedColumnIndex,
  HSectionDB,
  SelectedDBIndex,
  HBeamH,
  HBeamB,
  HBeamtf,
  HBeamtw,
  HBeamr,
  BasePlateWidth,
  BasePlateHeight,
  Node_BP_Data,
  MinMaxCoordinates,
  ReactionResult,
  DesignResult,
  MDResult, BP_List, BP_Node
} from "../variables";
import PlanViewDrawing from "../Components/PlanViewDrawing";
import TypoGraphyDropList from "../NewComponents/TypoGraphyDropList";
import {
  dbReadItem,
  postNewProject,
  CreateBasePlateOutlines,
  AutoMeshing,
  Applyloads,
  Analysis,
  GetResult,
  calculate_baseplate,
  covertMarkdown,
} from "../utils_pyscript";
import { set } from "lodash";
import MDReport from "../Design/MDReport";
import { useSnackbar } from "notistack";
import InfiniLoading from "../InfinitLoading";
import TreeView from "../SimpleTreeView";
function Design() {
  const marked = require("marked");
  const [tabName, setTabName] = React.useState("Column");
  const [loading, setLoading] = React.useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] =
    useRecoilState(SelectedColumnIndex);
  const [hSectionDB, setHSectionDB] = useRecoilState(HSectionDB);
  const [selectedDBIndex, setSelectedDBIndex] = useRecoilState(SelectedDBIndex);
  const [columnIndex_DBName, setcolumnIndex_DBName] = useRecoilState(
    SelectedColumnIndex_DBName
  );
  const [selectedColumnList, setSelectedColumnList] =
    useRecoilState(SelectedColumnList);

  const node_BP_Data = useRecoilValue(Node_BP_Data);
  const [hBeamH, setHBeamH] = useRecoilState(HBeamH);
  const [hBeamB, setHBeamB] = useRecoilState(HBeamB);
  const [hBeamtf, setHBeamtf] = useRecoilState(HBeamtf);
  const [hBeamtw, setHBeamtw] = useRecoilState(HBeamtw);
  const [hBeamr, setHBeamr] = useRecoilState(HBeamr);
  const [basePlateWidth, setBasePlateWidth] = useRecoilState(BasePlateWidth);
  const [basePlateHeight, setBasePlateHeight] = useRecoilState(BasePlateHeight);

  const [minMaxCoordinates, setMinMaxCoordinates] =
    useRecoilState(MinMaxCoordinates);
  const [reactionResult, setReactionResult] = useRecoilState(ReactionResult);
  const [designResult, setDesignResult] = useRecoilState(DesignResult);
  const [mDResult, setMDResult] = useRecoilState(MDResult);
  const [bpList, setBPList] = useRecoilState(BP_List);
  const { enqueueSnackbar } = useSnackbar();
  const [bpNode, setBPNode] = useRecoilState(BP_Node);
  const columns: any = [
    {
      field: "ItemName",
      headerName: "Check Item.",
      width: 100,
      editable: true,
      sortable: false,
    },
    {
      field: "Demand",
      headerName: "Demand",
      width: 80,
      editable: true,
      sortable: false,
    },
    {
      field: "Capacity",
      headerName: "Capacity",
      width: 80,
      editable: true,
      sortable: false,
    },
    {
      field: "Ratio",
      headerName: "Ratio",
      width: 80,
      editable: true,
      sortable: false,
    },
  ];

  let rows_ENV: any = [
    { id: 1, ItemName: "Bearing Stress", Demand: "", Capacity: "", Ratio: "" },
    { id: 2, ItemName: "Comp. (MPa)", Demand: "", Capacity: "", Ratio: "" },
    { id: 3, ItemName: "Tens. (kN)", Demand: "", Capacity: "", Ratio: "" },
    { id: 4, ItemName: "Baseplate", Demand: "", Capacity: "", Ratio: "" },
    { id: 5, ItemName: "Mxx (kN.m/m)", Demand: "", Capacity: "", Ratio: "" },
    { id: 6, ItemName: "Myy (kN.m/m)", Demand: "", Capacity: "", Ratio: "" },
    { id: 7, ItemName: "Anchor Bolt", Demand: "", Capacity: "", Ratio: "" },
    { id: 8, ItemName: "Vu (kN)", Demand: "", Capacity: "", Ratio: "" },
    { id: 9, ItemName: "Tu (kN)", Demand: "", Capacity: "", Ratio: "" },
    { id: 10, ItemName: "Length (mm)", Demand: "", Capacity: "", Ratio: "" },
  ];

  const [rows_ADD, setRows_ADD] = useState<any>(rows_ENV);

  const ColumnSelected = (e: any) => {
    setSelectedBPName(e.target.value);
  };

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        handleDesignClick();
      }, 1000);
    }
  }, [loading]);

  const [selectedBPName, setSelectedBPName] = useState(bpList[0][0]);
  
  console.log(node_BP_Data)
  const handleDesignClick = () => {
    try {
      postNewProject();
      const BPData = JSON.parse(JSON.stringify(node_BP_Data));
      let PlateWidth = 0;
      let PlateHeight = 0;
      let SectionDim = "";
      let PlateMaterial = "";
      let PlateThickness = 0;
      let keyindex = "";
      for (let key in BPData) {
        if (BPData[key].BASEPLATE.PLATE.NAME == selectedBPName) {
          keyindex = key;
          PlateWidth = BPData[key].BASEPLATE.PLATE.WIDTH;
          PlateHeight = BPData[key].BASEPLATE.PLATE.HEIGHT;
          SectionDim = BPData[key].BASEPLATE.COLUMN.DB;
          PlateMaterial = BPData[key].BASEPLATE.PLATE.MATL;
          PlateThickness = BPData[key].BASEPLATE.PLATE.THIK;
          break;
        }
      }

      const splitspace = SectionDim.split(" ");
      const splitdim = splitspace[1].split("x");
      const HBeamHeight = Number(splitdim[0]);
      const HBeamWidth = Number(splitdim[1]);
      CreateBasePlateOutlines(PlateWidth, PlateHeight, HBeamHeight, HBeamWidth);
      AutoMeshing(PlateWidth, PlateHeight, PlateMaterial, PlateThickness);

      let loaddata = [];
      for (let key in BPData) {
        if (BPData[key].BASEPLATE.PLATE.NAME == selectedBPName) {
          for (let reaction_key in reactionResult) {
            if (reaction_key == key) {
              for (let load_key in reactionResult[reaction_key]) {
                loaddata.push(reactionResult[reaction_key][load_key][2]);
              }
            }
          }
        }
      }

      Applyloads(loaddata, PlateWidth, PlateHeight);
      Analysis(selectedColumnIndex);
      const Pu_Result = GetResult();
      console.log('key index', keyindex)
      console.log()
      let new_DesignResult = JSON.parse(JSON.stringify(designResult));
      new_DesignResult.Pu = 1.47;
      new_DesignResult.Mux = Math.abs(Number(Pu_Result["min"]));
      new_DesignResult.Muy = 13.5;
      new_DesignResult.Vux = 1.48;
      new_DesignResult.Vuy = 0.97;
      new_DesignResult.Tu = 1;
      new_DesignResult.Sigma_max = 1;
      new_DesignResult.Sigma_min = 1;
      new_DesignResult.fck = Number(BPData[keyindex].BASEPLATE.COLUMN.MATL);
      new_DesignResult.BP_Area =
        Number(BPData[keyindex].BASEPLATE.PLATE.WIDTH) *
        Number(BPData[keyindex].BASEPLATE.PLATE.HEIGHT);
      new_DesignResult.BP_thick = Number(BPData[keyindex].BASEPLATE.PLATE.THIK);
      new_DesignResult.BP_Fy = 1;
      new_DesignResult.Bolt_Dia = 1;
      new_DesignResult.Bolt_Length = 1;
      new_DesignResult.Bolt_Num = 1;
      setDesignResult(new_DesignResult);
      const calculate_result = calculate_baseplate(
        JSON.stringify(new_DesignResult)
      );
      console.log(JSON.stringify(calculate_result))
      rows_ENV = [
        { id: 1, ItemName: "Bearing Stress", Demand: "", Capacity: "", Ratio: "" },
        { id: 2, ItemName: "Comp. (MPa)", Demand: "None", Capacity: "None", Ratio: "None" },
        { id: 3, ItemName: "Tens. (kN)", Demand: "None", Capacity: "None", Ratio: "None" },
        { id: 4, ItemName: "Baseplate", Demand: "", Capacity: "", Ratio: "" },
        { id: 5, ItemName: "Mxx (kN.m/m)", Demand: calculate_result["Mux"], Capacity: calculate_result["BPlate_PhiMn"], Ratio: calculate_result["BPlate_Ratio"] },
        { id: 6, ItemName: "Myy (kN.m/m)", Demand: calculate_result["Muy"], Capacity: calculate_result["BPlate_PhiMn"], Ratio: calculate_result["BPlate_Ratio"] },
        { id: 7, ItemName: "Anchor Bolt", Demand: "", Capacity: "", Ratio: "" },
        { id: 8, ItemName: "Vu (kN)", Demand: calculate_result["AnchorBody_Vu1"], Capacity: calculate_result["AnchorBody_PhiRnv"], Ratio: calculate_result["AnchorBody_RatioV"] },
        { id: 9, ItemName: "Tu (kN)", Demand: "1", Capacity: calculate_result["AnchorBody_Rnt"], Ratio: calculate_result["AnchorBody_Ratiot"] },
        { id: 10, ItemName: "Length (mm)", Demand: calculate_result["AnchorLength_Len0"], Capacity: calculate_result["AnchorLength_Lanc"], Ratio: calculate_result["AnchorLength_Ratio"] },
      ];
      setRows_ADD(rows_ENV);
      const markdown = covertMarkdown(JSON.stringify(calculate_result));
      setMDResult(markdown);

      

    } catch (e) {
      setLoading(false);
      enqueueSnackbar("Design check Failed", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
      enqueueSnackbar("Design Check Completed", {
        variant: "success",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <GuideBox show row spacing={1}>
      {loading && <InfiniLoading />}
      <Panel height={550}>
        <GuideBox spacing={1}>
          <GuideBox marginTop={1} spacing={1}>
            <TypoGraphyDropList
              title="Baseplate :"
              width={350}
              dropListwidth={200}
              items={bpList}
              defaultValue={selectedBPName}
              value={selectedBPName}
              onChange={ColumnSelected}
            />
          </GuideBox>

          <Typography variant="h1">Design Result</Typography>

          <div style={{ height: 365, width: "100%" }}>
            <DataGrid
              columnHeaderHeight={60}
              rowHeight={80}
              hideFooter
              columns={columns}
              rows={rows_ADD}
            ></DataGrid>
          </div>
          <GuideBox width={350} horRight>
            <Button variant="outlined" onClick={() => setLoading(true)}>
              Design Check
            </Button>
          </GuideBox>
        </GuideBox>
      </Panel>
      <Panel height={550} width={430}>
        <GuideBox spacing={1}>
          <Typography variant="h1">Design Report</Typography>
          <div
            style={{
              height: 500,
              width: "100%",
              overflowY: "scroll",
              fontSize: 12,
            }}
          >
            <MDReport></MDReport>
          </div>
        </GuideBox>
      </Panel>
      <Panel width={200 } height={550} overflow='scroll' textOverflow= 'ellipsis'>
        <Typography>BasePlate Info.</Typography>
        <TreeView />
      </Panel>
      
    </GuideBox>
  );
}

export default Design;
