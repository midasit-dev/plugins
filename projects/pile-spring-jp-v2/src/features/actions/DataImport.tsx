import React, { useState } from "react";
import { Button } from "@midasit-dev/moaui";
import { CircularProgress, Modal, Typography } from "@mui/material";
import { useSetRecoilState } from "recoil";
import {
  pileDataListState,
  pileBasicDimState,
  soilBasicState,
  soilTableState,
  projectData,
  defaultPileInitSet,
  defaultPileLocation,
  defaultPileReinforced,
  defaultPileSection,
  pileInitSetState,
  pileLocationState,
  pileReinforcedState,
  pileSectionState,
} from "../../states";
import {
  convertPileLegacyToCurrent,
  validateLegacyData,
  convertSoilBasicLegacyToCurrent,
  convertSoilTableLegacyToCurrent,
} from "../../utils";
import { useTranslation } from "react-i18next";
import { usePileData } from "../../hooks";

const DataImport = () => {
  const { t } = useTranslation();
  const { deselectItem } = usePileData();

  const setPileDataList = useSetRecoilState(pileDataListState);
  const setPileBasicDimensions = useSetRecoilState(pileBasicDimState);
  const setSoilBasicData = useSetRecoilState(soilBasicState);
  const setSoilTableData = useSetRecoilState(soilTableState);
  const setProjectData = useSetRecoilState(projectData);

  const setInitSetData = useSetRecoilState(pileInitSetState);
  const setLocationData = useSetRecoilState(pileLocationState);
  const setReinforcedData = useSetRecoilState(pileReinforcedState);
  const setSectionData = useSetRecoilState(pileSectionState);

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
              content: t("Legacy_Data_Warning"),
              onConfirm: () => {
                // 레거시 데이터 변환
                const { pileData, basicDimensions } =
                  convertPileLegacyToCurrent(data);
                setPileDataList(pileData);
                setPileBasicDimensions(basicDimensions);
                setSoilBasicData(convertSoilBasicLegacyToCurrent(data));
                setSoilTableData(
                  convertSoilTableLegacyToCurrent(data.soilData)
                );

                // 입력창 초기화
                setInitSetData(defaultPileInitSet);
                setLocationData(defaultPileLocation);
                setReinforcedData(defaultPileReinforced);
                setSectionData(defaultPileSection);
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
            setPileDataList(data.pileDataList);
            setPileBasicDimensions(data.pileBasicDimValue);
            setSoilBasicData(data.soilBasic);
            setSoilTableData(data.soilTable);

            // 입력창 초기화
            setInitSetData(defaultPileInitSet);
            setLocationData(defaultPileLocation);
            setReinforcedData(defaultPileReinforced);
            setSectionData(defaultPileSection);
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
            content: t("Import_Error"),
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
        color="normal"
        onClick={() => {
          document.getElementById("json-file-input")?.click();
        }}
        disabled={isLoading}
      >
        {t("Upload_Data_Button")}
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
          <CircularProgress size={20} />
        </div>
      )}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
            padding: 4,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {t("Warning")}
          </Typography>
          <Typography sx={{ mt: 2, mb: 3 }}>{modalData?.content}</Typography>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={handleModalClose}>
              {t("Cancel")}
            </Button>
            <Button variant="contained" onClick={modalData?.onConfirm}>
              {t("Confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataImport;
