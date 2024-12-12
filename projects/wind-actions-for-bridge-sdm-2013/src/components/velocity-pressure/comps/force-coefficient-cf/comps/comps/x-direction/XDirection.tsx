import {
  Button,
  DropList,
  TextField,
  Typography,
  GuideBox,
  Icon,
  IconButton,
} from "@midasit-dev/moaui";
import Graph from "./Graph";
import { useCallback, useEffect } from "react";
import { useState } from "react";

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import type { SelectChangeEvent } from "@mui/material";
import { useRecoilState } from "recoil";
import { mainTempCfValueSelector } from "../../../../../../../defines/applyDefines";
import { isOpenCfDialogSelector } from "../../../../../../../defines/openDefines";
import { isBlurSelector } from "../../../../../../../defines/blurDefines";
import { type Type, typeA, typeB } from "./type";
import useGraph from "./hooks/useGraph";
import InfoWrapper from "../../../../../../common/InfoWrapper";
import {
  DoneBanner,
  useChangeBanner,
} from "../../../../../../../utils/loadingUtils";

export default function XDirection() {
  const [, setIsOpen] = useRecoilState(isOpenCfDialogSelector);
  const [, setIsBlur] = useRecoilState(isBlurSelector);

  const [type, setType] = useState<Type>(typeA);
  const [b_dtot, setB_dtot] = useState<number>(4);
  const [cfx, setCfx] = useState<number>(0);

  // Graph hook
  const { getBasePoints, getX, getInterpolatedY } = useGraph();

  const [isError, setIsError] = useState<boolean>(false);
  useEffect(() => {
    setIsError(b_dtot < 0 || b_dtot > 12 || Number.isNaN(b_dtot));
    setCfx(getInterpolatedY(b_dtot, type));
  }, [b_dtot, getInterpolatedY, type]);

  // 전역으로 쓰이는 cf
  const [, setTempCf] = useRecoilState(mainTempCfValueSelector);

  const onOkHandler = useCallback(() => {
    setTempCf(cfx.toString());
    setIsOpen(false);
    setIsBlur(false);
  }, [cfx, setIsBlur, setIsOpen, setTempCf]);

  // Cf 값 변환시 이벤트
  const { isVisible } = useChangeBanner(cfx, 500);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full bg-white p-2 border border-[#e3e3e3] rounded-md h-[290px]">
        <Graph
          basePoints={[
            {
              name: typeA,
              x: getBasePoints(typeA).x,
              y: getBasePoints(typeA).y,
              type: "scatter",
              mode: "lines",
              marker: { color: "#6b9d72" },
            },
            {
              name: typeB,
              x: getBasePoints(typeB).x,
              y: getBasePoints(typeB).y,
              type: "scatter",
              mode: "lines",
              marker: { color: "#e48352" },
            },
          ]}
          fixedX={getX(b_dtot)}
          fixedY={cfx}
          width={350}
          height={275}
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex gap-2 items-center justify-between">
          <GuideBox width={"100%"} horLeft verCenter row spacing={0}>
            <Typography>Bridge Type</Typography>

            <InfoWrapper
              tooltipProps={{
                left: -50,
                bottom: 30,
              }}
              tooltip={
                <GuideBox width={300} spacing={1}>
                  <Typography variant="h1" color="gray">
                    Refer to Figure 8.3 of BS EN 1991-1-4
                  </Typography>
                  <img src="./assets/cf_bridge_type.png" alt="Bridge Type" />
                </GuideBox>
              }
            >
              <IconButton transparent>
                <Icon iconName="Help" />
              </IconButton>
            </InfoWrapper>
          </GuideBox>
          <DropList
            width={150}
            itemList={[
              [typeA, typeA],
              [typeB, typeB],
            ]}
            onChange={(e: SelectChangeEvent) => {
              setType(e.target.value as Type);
            }}
            defaultValue={type}
            value={type}
          />
        </div>

        <div className="w-full flex gap-2 items-center justify-between">
          <p
            className="text-xs flex items-center"
            style={{
              color: isError ? "#FF5733" : "#000",
            }}
          >
            <InlineMath math={"b/d_{tot}"} />
          </p>

          <TextField
            defaultValue={String(b_dtot)}
            width="150px"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const cur = e.target.value;
              if (!cur) return;

              const curNumber = Number(cur);
              if (Number.isNaN(curNumber)) return;
              setB_dtot(curNumber);
            }}
            error={isError}
          />
        </div>

        <div className="w-full flex gap-2 items-center justify-between">
          <p className="text-xs flex items-center">
            <InlineMath math={"C_{f,x}"} />
          </p>

          <div className="flex items-center gap-4">
            <DoneBanner isVisible={isVisible} />
            <TextField
              defaultValue={cfx.toString()}
              width="150px"
              value={cfx.toString()}
              disabled
            />
          </div>
        </div>

        <div className="w-full flex justify-end gap-2 mt-4">
          <Button width={"71px"} onClick={onOkHandler} disabled={isError}>
            OK
          </Button>
          <Button
            width={"71px"}
            color="negative"
            onClick={() => {
              setIsOpen(false);
              setIsBlur(false);
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
