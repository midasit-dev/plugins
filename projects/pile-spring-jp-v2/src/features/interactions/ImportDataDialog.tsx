/**
 * @fileoverview 데이터 임포트 대화상자
 * @description
 * 데이터 임포트 대화상자를 표시하고, 데이터를 임포트합니다.
 */

import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

import { Typography, CircularProgress } from "@mui/material";
import { Button } from "@midasit-dev/moaui";
import { CustomDialog } from "../../components";

import { projectData } from "../../states";
import {
  defaultPileInitSet,
  defaultPileLocation,
  defaultPileReinforced,
  createDefaultPileSections,
} from "../../constants/pile/defaults";
import {
  convertPileLegacyToCurrent,
  validateLegacyData,
  convertSoilBasicLegacyToCurrent,
  convertSoilTableLegacyToCurrent,
} from "../../utils";
import { usePileDomain, useSoilDomain } from "../../hooks";

import { useTranslation } from "react-i18next";
import { IMPORT_DATA_DIALOG } from "../../constants/common/translations";

const ImportDataDialog = () => {
  const { t } = useTranslation();
  const {
    deselectItem,
    updateCurrentPileInitSet,
    updateCurrentPileLocations,
    updateCurrentPileReinforced,
    updateCurrentPileSections,
    updateBasicDim,
    updatePileDataList,
  } = usePileDomain();

  const { setSoilDomain } = useSoilDomain();
  const setProjectData = useSetRecoilState(projectData);

  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    content: string;
    onConfirm: () => void;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // 레거시 데이터 형식인지 확인
          const isLegacyData = validateLegacyData(data);

          if (isLegacyData) {
            // 레거시 데이터 모달 표시
            setModalData({
              content: t(IMPORT_DATA_DIALOG.LEGACY_DATA_WARNING),
              onConfirm: () => {
                // 레거시 데이터 변환
                const { pileData, basicDimensions } =
                  convertPileLegacyToCurrent(data);

                // pileDataList 업데이트
                updatePileDataList(pileData);
                updateBasicDim(basicDimensions);

                // 새로운 soil domain으로 업데이트
                setSoilDomain({
                  basic: convertSoilBasicLegacyToCurrent(data),
                  resistance: {
                    useResistance: false,
                    clayFrictionMethod: "Calculate_by_N",
                    tipCapacity: 0,
                    groundSlopeAngle: 0,
                    groundSurfaceLoad: 0,
                  },
                  soilLayers: convertSoilTableLegacyToCurrent(data.soilData),
                });

                // 입력창 초기화
                updateCurrentPileInitSet(defaultPileInitSet);
                updateCurrentPileLocations(defaultPileLocation);
                updateCurrentPileReinforced(defaultPileReinforced);
                updateCurrentPileSections(createDefaultPileSections());
                setProjectData({ projectName: data.projectName });

                // 데이터 임포트 성공 시 선택된 행 해제
                deselectItem();
                setModalOpen(false);
                setIsLoading(false);
              },
            });
            setModalOpen(true);
            return;
          } else {
            // 새로운 데이터 형식 처리
            if (data.pileDataList && Array.isArray(data.pileDataList)) {
              // pileDataList가 있는 경우 업데이트
              updatePileDataList(data.pileDataList);
            }
            updateBasicDim(data.pileBasicDimValue);

            // 새로운 soil domain으로 업데이트
            setSoilDomain({
              basic: data.soilBasic,
              resistance: data.soilResistance || {
                useResistance: false,
                clayFrictionMethod: "Calculate_by_N",
                tipCapacity: 0,
                groundSlopeAngle: 0,
                groundSurfaceLoad: 0,
              },
              soilLayers: data.soilTable,
            });

            // 입력창 초기화
            updateCurrentPileInitSet(defaultPileInitSet);
            updateCurrentPileLocations(defaultPileLocation);
            updateCurrentPileReinforced(defaultPileReinforced);
            updateCurrentPileSections(createDefaultPileSections());
            setProjectData({
              projectName: data.common?.projectName || data.projectName,
            });

            // 데이터 임포트 성공 시 선택된 행 해제
            deselectItem();
            setIsLoading(false);
          }
        } catch (error) {
          console.error("JSON 파일 처리 중 오류 발생:", error);
          setModalData({
            content: t(IMPORT_DATA_DIALOG.IMPORT_ERROR),
            onConfirm: () => {
              setModalOpen(false);
              setIsLoading(false);
            },
          });
          setModalOpen(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        id="json-file-input"
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          document.getElementById("json-file-input")?.click();
        }}
        disabled={isLoading}
      >
        {t(IMPORT_DATA_DIALOG.IMPORT_DATA_BUTTON)}
      </Button>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <CircularProgress size={16} />
        </div>
      )}
      <CustomDialog
        open={modalOpen}
        onClose={handleModalClose}
        title={t(IMPORT_DATA_DIALOG.WARNING)}
        width="300px"
        children={<Typography>{modalData?.content}</Typography>}
        actions={
          <>
            <Button variant="outlined" onClick={handleModalClose}>
              {t(IMPORT_DATA_DIALOG.CANCEL)}
            </Button>
            <Button variant="contained" onClick={modalData?.onConfirm}>
              {t(IMPORT_DATA_DIALOG.CONFIRM)}
            </Button>
          </>
        }
      />
    </div>
  );
};

export default ImportDataDialog;
