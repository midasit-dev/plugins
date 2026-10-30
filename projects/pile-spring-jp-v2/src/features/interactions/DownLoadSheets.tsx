/**
 * @fileoverview 엑셀 계산서 다운로드
 * @description
 * 버튼 클릭 시:
 *   1) 계산 결과(pileSpringCalcResultState)가 존재하는지 확인 (미계산 시 경고)
 *   2) 평면도/정면도/측면도를 템플릿 그림 영역 크기(250px)의 2D 도면으로 생성
 *   3) report JSON 생성 → BaseSheet_jp.xlsx 템플릿과 함께 function-executor에 전송
 *   4) 반환된 엑셀 파일 다운로드
 */

import { useState } from "react";
import { Button } from "@midasit-dev/moaui";
import { Backdrop, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";

import { DOWN_LOAD_SHEETS } from "../../constants/common/translations";
import { useNotification } from "../../hooks/common/useNotification";
import { projectData } from "../../states/stateCommon";
import { pileDomainState } from "../../states/statePileDomain";
import { soilDomainState } from "../../states/stateSoilDomain";
import { pileSpringCalcResultState } from "../../states/stateCalcResult";
import { buildExcelReportJson } from "../../utils/calculators/excelJsonBuilder";
import { drawPileReportImages } from "../../utils/calculators/pileReportDrawing";
import { convertPileDataForCalc } from "../../utils/converters/pileCalcInputConverter";
import { downloadExcelReport } from "../../utils/calculators/excelReportDownloader";

const DownLoadSheets = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();

  const project = useRecoilValue(projectData);
  const pileDomain = useRecoilValue(pileDomainState);
  const soilDomain = useRecoilValue(soilDomainState);
  const calcResult = useRecoilValue(pileSpringCalcResultState);

  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    if (!calcResult.isCalculated) {
      showNotification(DOWN_LOAD_SHEETS.NOT_CALCULATED_ERROR, "warning");
      return;
    }

    setLoading(true);
    try {
      // 1) 평면도 / 정면도 / 측면도 (v1과 같은 250×250 2D 도면)
      //    3D 뷰어 캡처는 화면 배율에 따라 크기가 커져 엑셀에서 서로 겹쳤음
      const images = drawPileReportImages({
        translate: t,
        piles: convertPileDataForCalc(pileDomain.pileDataList),
        basicDim: pileDomain.basicDim,
        groundLevel: Number(soilDomain.basic.groundLevel),
      });

      // 2) report JSON 빌드
      const reportJson = buildExcelReportJson({
        translate: t,
        projectName: project.projectName || "report",
        pileDataList: pileDomain.pileDataList,
        pileBasicDim: pileDomain.basicDim,
        soilBasic: soilDomain.basic,
        soilLayers: soilDomain.soilLayers,
        calcResult,
        planViewImage: images.plan,
        frontViewImage: images.front,
        sideViewImage: images.side,
      });

      // 3) 서버로 전송 → 결과 엑셀 다운로드
      await downloadExcelReport({
        reportJson,
        language: i18n.language || "jp",
        projectName: project.projectName || "report",
      });

      showNotification(DOWN_LOAD_SHEETS.SUCCESS_DOWNLOAD, "success");
    } catch (error) {
      console.error("[DownLoadSheets] excel export failed", error);
      showNotification(DOWN_LOAD_SHEETS.FAIL_DOWNLOAD, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleDownload}
        disabled={loading}
      >
        {t(DOWN_LOAD_SHEETS.DOWN_LOAD_SHEETS_BUTTON)}
      </Button>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default DownLoadSheets;
