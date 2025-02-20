import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  GuideBox,
  Tab,
  TabGroup,
  TemplatesFunctionalComponentsUploadButton as UploadButton,
  TextField,
} from "@midasit-dev/moaui";
import PileProperties from "./PileProperties/PileMainWindow";
import SoilProperties from "./SoilProperties/SoilProperties";
import {
  ProjectName,
  PileTableData,
  SoilData,
  TopLevel,
  GroundLevel,
  Waterlevel,
  GroupEffectValue,
  SlopeEffectState,
  FoundationWidth,
  SideLength,
  DownloadData,
  LiquefactionState,
  GroupEffectState,
  CalVsiState,
  ReportJsonResult,
  HeadCondition,
  BottomCondition,
  Beta_Normal_Result,
  Beta_Seismic_Result,
  Beta_Period_Result,
  AlphaHTheta_Result,
  KValue_Normal_Result,
  KValue_Seismic_Result,
  KValue_Seismic_liq_Result,
  KValue_Period_Result,
  Force_Point_X,
  Force_Point_Y,
  Matrix_Normal_X_Result,
  Matrix_Normal_Z_Result,
  Matrix_Seismic_X_Result,
  Matrix_Seismic_Z_Result,
  Matrix_Seismic_Liq_X_Result,
  Matrix_Seismic_Liq_Z_Result,
  Matrix_Period_X_Result,
  Matrix_Period_Z_Result,
  ImportType,
  Language,
} from "./variables";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import ImportSpring from "./Springs/ImportSpring";
import { useSnackbar } from "notistack";
import ExcelJsonResult from "./ExcelReport/ExcelJson";
import InfiniLoading from "./Loading/InfinitLoading";
import ExcelReport from "./ExcelReport/ExcelReport";
import {
  CalculateBeta,
  CalAlphaHTheta,
  CalculateKvalue,
  CalculateKv,
  CalculateMatrix,
  py_db_get_maxid,
  dbCreateItem,
  dbUpdateItem,
} from "../utils_pyscript";
import PlanViewDrawing from "./ExcelReport/PlanViewDrawing";
import FrontViewDrawing from "./ExcelReport/FrontViewDrawing";
import SideViewDrawing from "./ExcelReport/SideViewDrawing";
import { useTranslation } from "react-i18next";
import DownloadButton from "./NewComponents/DownloadButton";

function MainWindow() {
  const [projectName, setProjectName] = useRecoilState(ProjectName);
  const [piletableData, setSetPileTableData] = useRecoilState(PileTableData);
  const [soilData, setSetSoilData] = useRecoilState(SoilData);
  const [topLevel, setTopLevel] = useRecoilState(TopLevel);
  const [groundLevel, setGroundLevel] = useRecoilState(GroundLevel);
  const [waterlevel, setWaterlevel] = useRecoilState(Waterlevel);
  const [groupEffectValue, setGroupEffectValue] =
    useRecoilState(GroupEffectValue);
  const [slopeEffectState, setSlopeEffectState] =
    useRecoilState(SlopeEffectState);
  const [foundationWidth, setFoundationWidth] = useRecoilState(FoundationWidth);
  const [sideLength, setSideLength] = useRecoilState(SideLength);
  const [liquefactionState, setLiquefactionState] =
    useRecoilState(LiquefactionState);
  const [groupEffectState, setGroupEffectState] =
    useRecoilState(GroupEffectState);
  const [calVsiState, setCalVsiState] = useRecoilState(CalVsiState);
  const [reportJsonResult, setReportJsonResult] =
    useRecoilState(ReportJsonResult);
  const [headCondition, setHeadCondition] = useRecoilState(HeadCondition);
  const [bottomCondition, setBottomCondition] = useRecoilState(BottomCondition);
  const [betaNormalResult, setBetaNormalResult] =
    useRecoilState(Beta_Normal_Result);
  const [betaSeismicResult, setBetaSeismicResult] =
    useRecoilState(Beta_Seismic_Result);
  const [betaPeriodResult, setBetaPeriodResult] =
    useRecoilState(Beta_Period_Result);
  const [alphaHThetaResult, setAlphaHThetaResult] =
    useRecoilState(AlphaHTheta_Result);
  const [kValueNormalResult, setKValueNormalResult] =
    useRecoilState(KValue_Normal_Result);
  const [kValueSeismicResult, setKValueSeismicResult] = useRecoilState(
    KValue_Seismic_Result
  );
  const [kValueSeismicLiqResult, setKValueSeismicLiqResult] = useRecoilState(
    KValue_Seismic_liq_Result
  );
  const [kValuePeriodResult, setKValuePeriodResult] =
    useRecoilState(KValue_Period_Result);
  const [forcePointX, setForcePointX] = useRecoilState(Force_Point_X);
  const [forcePointY, setForcePointY] = useRecoilState(Force_Point_Y);
  const [matrixNormalXResult, setMatrixNormalXResult] = useRecoilState(
    Matrix_Normal_X_Result
  );
  const [matrixNormalZResult, setMatrixNormalZResult] = useRecoilState(
    Matrix_Normal_Z_Result
  );
  const [matrixSeismicXResult, setMatrixSeismicXResult] = useRecoilState(
    Matrix_Seismic_X_Result
  );
  const [matrixSeismicZResult, setMatrixSeismicZResult] = useRecoilState(
    Matrix_Seismic_Z_Result
  );
  const [matrixSeismicLiqXResult, setMatrixSeismicLiqXResult] = useRecoilState(
    Matrix_Seismic_Liq_X_Result
  );
  const [matrixSeismicLiqZResult, setMatrixSeismicLiqZResult] = useRecoilState(
    Matrix_Seismic_Liq_Z_Result
  );
  const [matrixPeriodXResult, setMatrixPeriodXResult] = useRecoilState(
    Matrix_Period_X_Result
  );
  const [matrixPeriodZResult, setMatrixPeriodZResult] = useRecoilState(
    Matrix_Period_Z_Result
  );
  const [importType, setImportType] = useRecoilState(ImportType);

  const [tabName, setTabName] = useState("Pile");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t: translate, i18n: internationalization } = useTranslation();
  const [language, setLanguage] = useRecoilState(Language);
  const handelTabChange = (event: React.SyntheticEvent, newvalue: string) => {
    setTabName(newvalue);
  };

  // 다운로드 JSON 파일
  const downloadData = useRecoilValue(DownloadData);
  // JSON 데이터 업로드
  const uploadData = useCallback((data: any) => {
    const {
      piletableData,
      soilData,
      topLevel,
      groundLevel,
      waterlevel,
      groupEffectValue,
      slopeEffectState,
      foundationWidth,
      sideLength,
      projectName,
      liquefactionState,
      groupEffectState,
      calVsiState,
      forcepointX,
      forcepointY,
      language,
    } = data;
    setSetPileTableData(piletableData);
    setSetSoilData(soilData);
    setTopLevel(topLevel);
    setGroundLevel(groundLevel);
    setWaterlevel(waterlevel);
    setGroupEffectValue(groupEffectValue);
    setSlopeEffectState(slopeEffectState);
    setFoundationWidth(foundationWidth);
    setSideLength(sideLength);
    setProjectName(projectName);
    setLiquefactionState(liquefactionState);
    setGroupEffectState(groupEffectState);
    setCalVsiState(calVsiState);
    setForcePointX(forcepointX);
    setForcePointY(forcepointY);
    setLanguage(language);
  }, []);

  React.useEffect(() => {
    if (loading) {
      handleExcelReport(reportJsonResult);
    }
  }, [loading]);

  // 엑셀 출력
  const handleExcelReport = async (reportJsonResult: any) => {
    try {
      const Result = await ExcelReport(reportJsonResult, language, projectName);
    } catch (e) {
      setLoading(false);
      enqueueSnackbar(translate("Fail_Calculation_Sheet_Download"), {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
      enqueueSnackbar(translate("Success_Calculation_Sheet_Download"), {
        variant: "success",
        autoHideDuration: 3000,
      });
    }
  };

  // Error 체크
  // PileData 에 대한 에러 체크는 PileMainWindow 에서 파일 정보 입력 시 수행
  // 해당 에러 체크는 지반 정보에 대한 체크임
  const errorCheck = () => {
    // 지층 테이블 입력값에 대한 Error Check
    for (let i = 0; i < soilData.length; i++) {
      if (soilData[i].ED == 0 || soilData[i].Vsi == 0) {
        enqueueSnackbar(translate("SoilData_Error"), {
          variant: "error",
          autoHideDuration: 3000,
        });
        return "error";
      }
    }
    return "success";
  };
  // 계산을 수행하고, Excel 출력용 Json 데이터를 생성
  const handleCalCulation = () => {
    const CheckResult = errorCheck();
    if (CheckResult === "error") {
      return;
    }

    console.log("projectName", projectName);
    console.log("soilData", soilData);
    console.log("piletableData", piletableData);
    console.log("slopeEffectState", slopeEffectState);
    console.log("groupEffectValue", groupEffectValue);
    console.log("topLevel", topLevel);
    console.log("groundLevel", groundLevel);
    // Beta 값 계산
    const Beta_Normal = CalculateBeta(
      soilData,
      piletableData,
      "normal",
      slopeEffectState,
      groupEffectValue,
      topLevel,
      groundLevel
    );
    const Beta_Seismic = CalculateBeta(
      soilData,
      piletableData,
      "seismic",
      slopeEffectState,
      groupEffectValue,
      topLevel,
      groundLevel
    );
    const Beta_Period = CalculateBeta(
      soilData,
      piletableData,
      "period",
      slopeEffectState,
      groupEffectValue,
      topLevel,
      groundLevel
    );
    setBetaNormalResult(Beta_Normal);
    setBetaSeismicResult(Beta_Seismic);
    setBetaPeriodResult(Beta_Period);

    // AlphaHTheta 값 계산
    const AlphaHTheta = CalAlphaHTheta(
      soilData,
      slopeEffectState,
      piletableData
    );
    setAlphaHThetaResult(AlphaHTheta);

    // K1 ~ K4 값 계산 (상시, 지진시, 고유주기)
    const KValue_Normal = CalculateKvalue(
      piletableData,
      groundLevel,
      topLevel,
      soilData,
      "normal",
      headCondition,
      bottomCondition,
      AlphaHTheta,
      Beta_Normal,
      Beta_Seismic,
      Beta_Period,
      "no"
    );
    const KValue_Seismic = CalculateKvalue(
      piletableData,
      groundLevel,
      topLevel,
      soilData,
      "seismic",
      headCondition,
      bottomCondition,
      AlphaHTheta,
      Beta_Normal,
      Beta_Seismic,
      Beta_Period,
      "no"
    );
    const KValue_Seismic_Liq = CalculateKvalue(
      piletableData,
      groundLevel,
      topLevel,
      soilData,
      "seismic",
      headCondition,
      bottomCondition,
      AlphaHTheta,
      Beta_Normal,
      Beta_Seismic,
      Beta_Period,
      "yes"
    );
    const KValue_Period = CalculateKvalue(
      piletableData,
      groundLevel,
      topLevel,
      soilData,
      "period",
      headCondition,
      bottomCondition,
      AlphaHTheta,
      Beta_Normal,
      Beta_Seismic,
      Beta_Period,
      "no"
    );
    console.log("KValue_Normal", KValue_Normal);
    setKValueNormalResult(KValue_Normal);
    setKValueSeismicResult(KValue_Seismic);
    setKValueSeismicLiqResult(KValue_Seismic_Liq);
    setKValuePeriodResult(KValue_Period);

    // Kv 값 계산
    const KvResult = CalculateKv(piletableData, groundLevel, topLevel);
    // Axx ~ Aaa Matrix 계산
    const Matrix_Normal_X = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "normal",
      "X",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    const Matrix_Noraml_Z = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "normal",
      "Z",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    const Matrix_Seismic_X = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "seismic",
      "X",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    const Matrix_Seismic_Z = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "seismic",
      "Z",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    const Matrix_Seismic_Liq_X = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "seismic",
      "X",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "yes"
    );
    const Matrix_Seismic_Liq_Z = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "seismic",
      "Z",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "yes"
    );
    const Matrix_Period_X = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "period",
      "X",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    const Matrix_Period_Z = CalculateMatrix(
      piletableData,
      foundationWidth,
      sideLength,
      soilData,
      "period",
      "Z",
      KvResult,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      forcePointX,
      forcePointY,
      "no"
    );
    setMatrixNormalXResult(Matrix_Normal_X);
    setMatrixNormalZResult(Matrix_Noraml_Z);
    setMatrixSeismicXResult(Matrix_Seismic_X);
    setMatrixSeismicZResult(Matrix_Seismic_Z);
    setMatrixSeismicLiqXResult(Matrix_Seismic_Liq_X);
    setMatrixSeismicLiqZResult(Matrix_Seismic_Liq_Z);
    setMatrixPeriodXResult(Matrix_Period_X);
    setMatrixPeriodZResult(Matrix_Period_Z);

    // Excel 출력용 이미지 base64 데이터 생성
    const PlanViewImage = PlanViewDrawing(
      translate,
      sideLength,
      foundationWidth,
      forcePointX,
      forcePointY,
      piletableData
    );
    const FrontViewImage = FrontViewDrawing(
      translate,
      sideLength,
      foundationWidth,
      piletableData,
      topLevel,
      groundLevel
    );
    const SideViewImage = SideViewDrawing(
      translate,
      sideLength,
      foundationWidth,
      piletableData,
      topLevel,
      groundLevel
    );
    // Excel 출력용 Json 데이터 생성
    const JsonResult = ExcelJsonResult(
      translate,
      projectName,
      piletableData,
      soilData,
      topLevel,
      groundLevel,
      waterlevel,
      groupEffectValue,
      Beta_Normal,
      Beta_Period,
      AlphaHTheta,
      KValue_Normal,
      KValue_Seismic,
      KValue_Seismic_Liq,
      KValue_Period,
      liquefactionState,
      KvResult,
      Matrix_Normal_X,
      Matrix_Noraml_Z,
      Matrix_Seismic_X,
      Matrix_Seismic_Z,
      Matrix_Seismic_Liq_X,
      Matrix_Seismic_Liq_Z,
      Matrix_Period_X,
      Matrix_Period_Z,
      PlanViewImage,
      FrontViewImage,
      SideViewImage,
      forcePointX,
      forcePointY
    );
    setReportJsonResult(JsonResult);

    enqueueSnackbar(translate("Success_Calulation"), {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const handleCivilImport = () => {
    let Normal_Matrix = [];
    let Seismic_Matrix = [];
    let Seismic_Liq_Matrix = [];
    let Period_Matrix = [];

    if (importType === "Type1") {
      Normal_Matrix = CombineMatrix(matrixNormalXResult, matrixNormalZResult);
      Seismic_Matrix = CombineMatrix(
        matrixSeismicXResult,
        matrixSeismicZResult
      );
      Seismic_Liq_Matrix = CombineMatrix(
        matrixSeismicLiqXResult,
        matrixSeismicLiqZResult
      );
      Period_Matrix = CombineMatrix(matrixPeriodXResult, matrixPeriodZResult);
    } else if (importType === "Type2") {
      Normal_Matrix = CombineMatrix(matrixNormalZResult, matrixNormalXResult);
      Seismic_Matrix = CombineMatrix(
        matrixSeismicZResult,
        matrixSeismicXResult
      );
      Seismic_Liq_Matrix = CombineMatrix(
        matrixSeismicLiqZResult,
        matrixSeismicLiqXResult
      );
      Period_Matrix = CombineMatrix(matrixPeriodZResult, matrixPeriodXResult);
    }

    const NormalInputJson = {
      NAME: projectName + "_N",
      SPRING: Normal_Matrix,
      MASS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      DAMPING: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      OPT_STIFFNESS: true,
      OPT_MASS: false,
      OPT_DAMPING: false,
    };

    const SeismicInputJson = {
      NAME: projectName + "_S",
      SPRING: Seismic_Matrix,
      MASS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      DAMPING: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      OPT_STIFFNESS: true,
      OPT_MASS: false,
      OPT_DAMPING: false,
    };

    const SeismicLiqInputJson = {
      NAME: projectName + "_SL",
      SPRING: Seismic_Liq_Matrix,
      MASS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      DAMPING: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      OPT_STIFFNESS: true,
      OPT_MASS: false,
      OPT_DAMPING: false,
    };

    const PeriodInputJson = {
      NAME: projectName + "_P",
      SPRING: Period_Matrix,
      MASS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      DAMPING: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      OPT_STIFFNESS: true,
      OPT_MASS: false,
      OPT_DAMPING: false,
    };

    // 단위계 설정 (KN, m)
    const UnitJson = {
      FORCE: "KN",
      DIST: "M",
      HEAT: "KCAL",
      TEMPER: "C",
    };
    const updateUnit = dbUpdateItem("UNIT", "1", UnitJson);
    const MaxID = py_db_get_maxid("GSTP");
    console.log(JSON.stringify(NormalInputJson));
    const Import_NormalMatrix = dbCreateItem(
      "GSTP",
      MaxID + 1,
      NormalInputJson
    );
    const Import_SeismicMatrix = dbCreateItem(
      "GSTP",
      MaxID + 2,
      SeismicInputJson
    );
    const Import_SeismicLiqMatrix = dbCreateItem(
      "GSTP",
      MaxID + 3,
      SeismicLiqInputJson
    );
    const Import_PeriodMatrix = dbCreateItem(
      "GSTP",
      MaxID + 4,
      PeriodInputJson
    );

    if (
      Import_NormalMatrix.includes("GSTP") &&
      Import_SeismicMatrix.includes("GSTP") &&
      Import_SeismicLiqMatrix.includes("GSTP") &&
      Import_PeriodMatrix.includes("GSTP")
    ) {
      enqueueSnackbar("Import General Spring Success", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } else {
      enqueueSnackbar("Import General Spring Fail", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const CombineMatrix = (XResult: any, ZResult: any) => {
    let matrix = [];
    matrix = [
      XResult[0],
      ZResult[0],
      XResult[3],
      ZResult[5],
      XResult[5],
      1000000000000,
      0,
      XResult[1],
      0,
      XResult[2],
      0,
      ZResult[1],
      -ZResult[2],
      0,
      0,
      ZResult[4],
      -XResult[4],
      0,
      0,
      0,
      0,
    ];
    return matrix;
  };

  return (
    <GuideBox width="auto">
      {loading && <InfiniLoading />}
      <>
        <GuideBox row width="100%">
          <TabGroup
            orientation="vertical"
            value={tabName}
            onChange={handelTabChange}
          >
            <Tab value="Pile" label={translate("TabName_Pile")} />
            <Tab value="Soil" label={translate("TabName_Soil")} />
            <Tab value="Import" label={translate("TabName_Import")} />
            {/* <Tab value="Report" label="계산서" /> */}
          </TabGroup>
          {tabName === "Pile" && <PileProperties />}
          {tabName === "Soil" && <SoilProperties />}
          {/* {tabName === "Report" && <ExcelConnect />} */}
          {tabName === "Import" && <ImportSpring />}
        </GuideBox>
        <GuideBox width={900} row horRight spacing={1} marginBottom={1}>
          <DownloadButton
            textFieldProps={{ value: projectName }}
            valueToDownload={downloadData}
            buttonProps={{
              color: "normal",
            }}
            buttonName={translate("Download_Data_Button")}
          />
          <UploadButton
            onAfterUpload={uploadData}
            buttonProps={{
              color: "normal",
            }}
            buttonName={translate("Upload_Data_Button")}
          />
          <Button onClick={handleCalCulation}>
            {translate("Calculate_Button")}
          </Button>
          <Button onClick={() => setLoading(true)}>
            {translate("Export_CalSheet_Button")}
          </Button>
          <Button onClick={handleCivilImport}>
            {translate("Import_General_Spring_Button")}
          </Button>
        </GuideBox>
      </>
    </GuideBox>
  );
}

export default MainWindow;
