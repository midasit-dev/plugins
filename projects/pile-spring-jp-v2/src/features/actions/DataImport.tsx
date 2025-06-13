import React from "react";
import { Button } from "@midasit-dev/moaui";
import { useSetRecoilState } from "recoil";
import {
  pileDataListState,
  pileBasicDimensions,
  soilBasicData,
  soilTableData,
  projectData,
  defaultPileInitSetData,
  defaultPileLocationData,
  defaultPileReinforcedData,
  defaultPileSectionData,
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
} from "../utils";
import { useTranslation } from "react-i18next";
import { usePileData } from "../../hooks";

interface ImportJsonButtonProps {
  onFileSelect?: (file: File) => void;
}

export const DataImport: React.FC<ImportJsonButtonProps> = ({
  onFileSelect,
}) => {
  const { t } = useTranslation();
  const { deselectItem } = usePileData();

  const setPileDataList = useSetRecoilState(pileDataListState);
  const setPileBasicDimensions = useSetRecoilState(pileBasicDimensions);
  const setSoilBasicData = useSetRecoilState(soilBasicData);
  const setSoilTableData = useSetRecoilState(soilTableData);
  const setProjectData = useSetRecoilState(projectData);

  const setInitSetData = useSetRecoilState(pileInitSetState);
  const setLocationData = useSetRecoilState(pileLocationState);
  const setReinforcedData = useSetRecoilState(pileReinforcedState);
  const setSectionData = useSetRecoilState(pileSectionState);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          // 데이터 유효성 검사
          if (!validateLegacyData(data)) {
            throw new Error("유효하지 않은 데이터 형식입니다.");
          }
          // 데이터 변환
          const { pileData, basicDimensions } =
            convertPileLegacyToCurrent(data);
          // 입력창 초기화
          setInitSetData(defaultPileInitSetData);
          setLocationData(defaultPileLocationData);
          setReinforcedData(defaultPileReinforcedData);
          setSectionData(defaultPileSectionData);

          // Recoil state 업데이트
          setPileDataList(pileData);
          setPileBasicDimensions(basicDimensions);
          setSoilBasicData(convertSoilBasicLegacyToCurrent(data));
          setSoilTableData(convertSoilTableLegacyToCurrent(data.soilData));
          setProjectData({ projectName: data.projectName });

          // 데이터 임포트 성공 시 선택된 행 해제
          deselectItem();
        } catch (error) {
          console.error("JSON 파일 처리 중 오류 발생:", error);
          // TODO: 사용자에게 에러 메시지 표시
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
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
      >
        {t("Upload_Data_Button")}
      </Button>
    </div>
  );
};

export default DataImport;
