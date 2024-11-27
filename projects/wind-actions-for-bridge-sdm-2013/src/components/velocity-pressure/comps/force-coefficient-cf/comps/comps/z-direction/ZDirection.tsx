import {
  Button,
  DropList,
  TextField,
  Icon,
  IconButton,
  GuideBox,
  Typography,
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
import useGraph from "./hooks/useGraph";
import InfoWrapper from "../../../../../../common/InfoWrapper";

export default function ZDirection() {
  const [, setIsOpen] = useRecoilState(isOpenCfDialogSelector);
  const [, setIsBlur] = useRecoilState(isBlurSelector);

  const [theta, setTheta] = useState<number>(0);
  const [b_dtot, setB_dtot] = useState<number>(0);
  const [cfz, setCfz] = useState<number>(0.75);

  // Graph hook
  const { getBasePoints, getX, getInterpolatedY } = useGraph();

  const [isError, setIsError] = useState<boolean>(false);
  useEffect(() => {
    setIsError(b_dtot < 0 || b_dtot > 22 || Number.isNaN(b_dtot));
    setCfz(getInterpolatedY(b_dtot, theta));
  }, [b_dtot, getInterpolatedY, theta]);

  // 전역으로 쓰이는 cf
  const [, setTempCf] = useRecoilState(mainTempCfValueSelector);

  const onOkHandler = useCallback(() => {
    setTempCf(cfz.toString());
    setIsOpen(false);
    setIsBlur(false);
  }, [cfz, setIsBlur, setIsOpen, setTempCf]);

  // theta전용 에러 핸들러
  const [isErrorTheta, setIsErrorTheta] = useState<boolean>(false);
  const isErrorThetaFunction = useCallback((value: number) => {
    return Number.isNaN(value) || value < 0;
  }, []);
  useEffect(() => {
    setIsErrorTheta(isErrorThetaFunction(theta));
  }, [isErrorThetaFunction, theta]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full bg-white p-4 border border-[#e3e3e3] rounded-md h-[290px]">
        <Graph
          basePoints={[
            {
              name: "(0)",
              x: getBasePoints(0).x,
              y: getBasePoints(0).y,
              type: "scatter",
              mode: "lines",
              marker: { color: "#47824d" },
            },
            {
              name: "(6)",
              x: getBasePoints(6).x,
              y: getBasePoints(6).y,
              type: "scatter",
              mode: "lines",
              marker: { color: "#e89d47" },
            },
            {
              name: "(10)",
              x: getBasePoints(10).x,
              y: getBasePoints(10).y,
              type: "scatter",
              mode: "lines",
              marker: { color: "8ed4f1" },
            },
          ]}
          fixedX={getX(b_dtot)}
          fixedY={cfz}
          width={350}
          height={270}
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex gap-2 items-center justify-between">
          <p
            className="text-xs"
            style={{
              color: isErrorTheta ? "#FF5733" : "#000",
            }}
          >
            <InlineMath math={"\\theta"} />
          </p>
          <GuideBox width={"100%"} horLeft verCenter row>
            <InfoWrapper
              tooltipProps={{
                left: 0,
                bottom: 30,
              }}
              tooltip={
                <GuideBox width={300} spacing={1}>
                  <Typography variant="h1" color="gray">
                    Refer to Figure 8.6 of BS EN 1991-1-4
                  </Typography>
                  <img src="./assets/cf_bridge_type2.png" alt="Bridge Angle" />
                </GuideBox>
              }
            >
              <IconButton transparent>
                <Icon iconName="Help" />
              </IconButton>
            </InfoWrapper>
          </GuideBox>
          <TextField
            defaultValue="0"
            width={150}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              let cur = e.target.value;
              if (!cur) return;
              const curNumber = Number(cur);
              setTheta(curNumber);
            }}
            error={isErrorTheta}
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
              setB_dtot(curNumber);
            }}
            error={isError}
          />
        </div>

        <div className="w-full flex gap-2 items-center justify-between">
          <p className="text-xs flex items-center">
            <InlineMath math={"C_{f,z}"} />
          </p>

          <TextField
            defaultValue={cfz.toString()}
            width="150px"
            value={cfz.toString()}
            disabled
          />
        </div>
      </div>
      <div className="w-full flex justify-end gap-2 mt-2">
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
  );
}
