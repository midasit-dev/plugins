import React from "react";
import { Button } from "@mui/material";
import { useSetRecoilState } from "recoil";
import { pileDataListState } from "../../states/statePileData";
import { pileSectionState } from "../../states/statePileSection";
import { pileInitSetState } from "../../states/statePileInitSet";
import { pileLocationState } from "../../states/statePileLocation";
import { pileReinforcedState } from "../../states/statePileReinforced";
import { pileBasicDimensions } from "../../states/statePileBasicDim";
import {
  convertLegacyToCurrent,
  validateLegacyData,
} from "../utils/pileDataConverter";

interface ImportJsonButtonProps {
  onFileSelect?: (file: File) => void;
}

export const ImportJsonButton: React.FC<ImportJsonButtonProps> = ({
  onFileSelect,
}) => {
  const setPileDataList = useSetRecoilState(pileDataListState);
  const setPileSection = useSetRecoilState(pileSectionState);
  const setPileInitSet = useSetRecoilState(pileInitSetState);
  const setPileLocation = useSetRecoilState(pileLocationState);
  const setPileReinforced = useSetRecoilState(pileReinforcedState);
  const setPileBasicDimensions = useSetRecoilState(pileBasicDimensions);

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
          const { pileData, basicDimensions } = convertLegacyToCurrent(data);
          // Recoil state 업데이트
          setPileDataList(pileData);
          setPileBasicDimensions(basicDimensions);
          // 첫 번째 말뚝 데이터를 각각의 state에 설정
          if (pileData.length > 0) {
            setPileSection(pileData[0].sectionData);
            setPileInitSet(pileData[0].initSetData);
            setPileLocation(pileData[0].locationData);
            setPileReinforced(pileData[0].reinforcedData);
          }
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
      <label htmlFor="json-file-input">
        <Button variant="contained" component="span" color="primary">
          JSON 파일 불러오기
        </Button>
      </label>
    </div>
  );
};

export default ImportJsonButton;
