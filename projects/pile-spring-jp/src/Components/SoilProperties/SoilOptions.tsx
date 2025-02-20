import {
  GuideBox,
  Typography,
  Panel,
  Check,
  TemplatesDualComponentsTypographyTextFieldSpaceBetween,
  TemplatesDualComponentsTypographyDropListSpaceBetween,
} from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import {
  ResistCal,
  ResistVerMethod,
  ResistVerUltimate,
  ResistLatAngle,
  ResistLatLoad,
} from "../variables";
import { useRecoilValue, useRecoilState } from "recoil";
import TypoGraphyTextFieldV2 from "../NewComponents/TypoGraphyTextFieldV2";

function SoilOptions() {
  const { t: translate, i18n: internationalization } = useTranslation();

  // 계산 고려에 따른 입력창 활성화 여부
  const resistCal = useRecoilValue(ResistCal);
  const disabledInput = resistCal ? false : true;

  // 점성토의 최대 주면 마찰력도 산출 방법
  const [resistVerMethod, setResistVerMethod] = useRecoilState(ResistVerMethod);
  const resistVerMethodList = [
    [translate("Resist_Ver_Method_1"), 1],
    [translate("Resist_Ver_Method_2"), 2],
  ];

  // 말뚝 선단의 단위 면적당 극한 지지력도
  const [resistVerUltimate, setResistVerUltimate] =
    useRecoilState(ResistVerUltimate);

  // 지표면과 수평면이 이루는 각
  const [resistLatAngle, setResistLatAngle] = useRecoilState(ResistLatAngle);

  // 지표면 재하하중
  const [resistLatLoad, setResistLatLoad] = useRecoilState(ResistLatLoad);

  return (
    <GuideBox opacity={resistCal ? 1 : 0.5}>
      <Typography variant="h1">{translate("Resist_Vertical")}</Typography>
      <GuideBox>
        <Panel>
          <TemplatesDualComponentsTypographyDropListSpaceBetween
            title={translate("Resist_Ver_Method")}
            width={380}
            items={resistVerMethodList}
            defaultValue={1}
            value={resistVerMethod}
            onChange={(e: any) => {
              setResistVerMethod(e.target.value);
            }}
            dropListWidth={200}
            droplistDisabled={disabledInput}
          />
          <TypoGraphyTextFieldV2
            title={translate("Resist_Ver_Ultimate")}
            width={380}
            textFieldWidth={150}
            defaultValue={0}
            value={resistVerUltimate}
            onChange={(e: any) => {
              setResistVerUltimate(e.target.value);
            }}
            disabled={disabledInput}
            placeholder=""
          />
        </Panel>
      </GuideBox>
      <Typography marginTop={1} variant="h1">
        {translate("Resist_Lateral")}
      </Typography>
      <GuideBox>
        <Panel>
          <TypoGraphyTextFieldV2
            title={translate("Resist_Lat_Angle")}
            width={380}
            textFieldWidth={150}
            defaultValue={0}
            value={resistLatAngle}
            onChange={(e: any) => {
              setResistLatAngle(e.target.value);
            }}
            disabled={disabledInput}
            placeholder=""
          />
          <TypoGraphyTextFieldV2
            title={translate("Resist_Lat_Load")}
            width={380}
            textFieldWidth={150}
            value={resistLatLoad}
            defaultValue={0}
            onChange={(e: any) => {
              setResistLatLoad(e.target.value);
            }}
            disabled={disabledInput}
            placeholder=""
          />
        </Panel>
      </GuideBox>
    </GuideBox>
  );
}

export default SoilOptions;
