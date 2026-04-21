/**
 * @fileoverview 읽기(Import) 탭에 배치되는 汎用ばね支持 타입 선택 패널.
 * - 상단: 타이틀
 * - 중앙: Civil NX 좌표계 도식 (import_jp.svg)
 * - 하단: Type1 / Type2 선택 라디오 버튼
 * 선택 값은 `importTypeState` Recoil atom에 저장되어 CreateSpring 버튼이
 * 매트릭스 축 조합 순서를 결정할 때 사용합니다.
 */

import {
  GuideBox,
  Typography,
  Panel,
  Radio,
  RadioGroup,
} from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { useTranslation } from "react-i18next";

import { CivilImportType, importTypeState } from "../../states/stateCommon";
import { IMPORT_CONTAINER } from "../../constants/common/translations";

import importImage from "../../SVGs/import_jp.svg";

const ImportSpring = () => {
  const { t } = useTranslation();
  const [importType, setImportType] = useRecoilState(importTypeState);

  const imageSrc = importImage;

  const handleTypeChange = (_: unknown, value: string) => {
    if (value === "Type1" || value === "Type2") {
      setImportType(value as CivilImportType);
    }
  };

  return (
    <GuideBox marginRight={1} marginBottom={1}>
      <GuideBox>
        <Typography variant="h1" margin={1}>
          {t(IMPORT_CONTAINER.IMPORT_TITLE)}
        </Typography>
      </GuideBox>
      <Panel width={860} height={703}>
        <GuideBox spacing={1}>
          <div
            style={{
              width: "100%",
              height: 620,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={imageSrc}
              alt="Civil_Cord_System"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <GuideBox width={800} row verCenter spacing={1} horCenter>
            <Typography variant="h1">
              {t(IMPORT_CONTAINER.SELECT_IMPORT_TYPE)}
            </Typography>
            <RadioGroup
              onChange={handleTypeChange}
              value={importType}
              row
              spacing={2}
            >
              <Radio name={t(IMPORT_CONTAINER.TYPE1)} value="Type1" />
              <Radio name={t(IMPORT_CONTAINER.TYPE2)} value="Type2" />
            </RadioGroup>
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
};

export default ImportSpring;
