import {
  DropList,
  GuideBox,
  Typography,
  Check,
  IconButton,
  Icon,
} from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import type { SelectChangeEvent } from "@mui/material";
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../../hooks/useTemporaryValue";
import { SimplifiedLocationEnum } from "../../../../../../../../../../../defines/applyDefines";
import InfoWrapper from "../../../../../../../../../../common/InfoWrapper";

export default function CategoryOption3() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  return (
    <>
      <GuideBox width="100%" spacing={2} column>
        {/* 첫 번째 줄: Degree of Exposure 텍스트 + DropList */}
        <GuideBox width="100%" row verCenter horSpaceBetween>
          <Typography>Degree of Exposure</Typography>
          <DropList
            width={PANEL_3_R_WIDTH}
            itemList={[
              ["1", "1"],
              ["2", "2"],
              ["3", "3"],
              ["4", "4"],
            ]}
            onChange={(e: SelectChangeEvent) => {
              const selIndex = Number(e.target.value);
              setTempValueCallback({
                procedureSimplified: {
                  ...asSimplified(tempValue), // 기존 데이터 유지
                  degree: selIndex.toString() as TypeSimplified["degree"],
                } as TypeSimplified,
              });
            }}
            value={asSimplified(tempValue)?.degree ?? "1"}
            defaultValue={"1"}
            placeholder="Select ..."
          />
        </GuideBox>

        {/* 두 번째 줄: 체크박스 */}
        <GuideBox width="100%" row verCenter>
          <Check
            name="Apply 20% Reduction"
            checked={asSimplified(tempValue)?.reducedBy20 ?? false} // ✅ undefined 방지
            onChange={(e: React.SyntheticEvent, checked: boolean) => {
              setTempValueCallback({
                procedureSimplified: {
                  ...asSimplified(tempValue), // 기존 데이터 유지
                  reducedBy20: checked, // ✅ 체크 상태 반영
                } as TypeSimplified,
              });
            }}
          />
          <InfoWrapper
            tooltipProps={{
              left: -150,
              bottom: 30,
            }}
            tooltip={
              <GuideBox width={300}>
                <Typography variant="h1" color="gray">
                  Refer to Clause 3.4.2.1(3)
                </Typography>
                <Typography>
                  According to Clause 3.4.2.1(3), a 20% reduction to the peak
                  velocity pressure is allowed for walkway covers,sign gantries
                  and noise barriers/enclosures.
                </Typography>
              </GuideBox>
            }
          >
            <IconButton transparent>
              <Icon iconName="Help" />
            </IconButton>
          </InfoWrapper>
        </GuideBox>
      </GuideBox>
    </>
  );
}
