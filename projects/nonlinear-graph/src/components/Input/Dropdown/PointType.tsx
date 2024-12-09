import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { PointState } from "../../../values/RecoilValue";
const PointType = () => {
  const [PointValue, setPointValue] = useRecoilState(PointState);

  const { t: translate, i18n: internationalization } = useTranslation();
  const pointType = translate("pointType");
  const items = new Map<string, number>([
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
  ]);
  function onChangeHandler(event: any) {
    setPointValue(event.target.value);
  }
  return (
    <GuideBox horRight margin={2}>
      <Stack direction="row" spacing={2} content="center">
        <Typography variant="body1" size="small" center>
          {pointType}
        </Typography>
        <DropList
          itemList={items}
          value={PointValue}
          onChange={onChangeHandler}
        />
      </Stack>
    </GuideBox>
  );
};

export default PointType;
