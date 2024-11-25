import { useRecoilState } from "recoil";
import { isOpenCfDialogSelector } from "../../../../../defines/openDefines";
import Plot from "react-plotly.js";
import { Button, TextField } from "@midasit-dev/moaui";
import { useState } from "react";
import { isBlurSelector } from "../../../../../defines/blurDefines";

interface PlotWithFixedAnnotationProps {
  x?: number;

  width: number;
  height: number;
}

type PlotData = {
  x: number[];
  y: number[];
};

const PlotWithFixedAnnotation = (props: PlotWithFixedAnnotationProps) => {
  const data: PlotData = {
    x: [0, 1, 2, 3, 4, 5],
    y: [0, 10, 15, 13, 17, 21],
  };

  // 특정 x값과 해당 y값
  const fixedX = props?.x ?? 3;
  const fixedY = data.y[data.x.indexOf(fixedX)];

  return (
    <Plot
      data={[
        {
          x: data.x,
          y: data.y,
          type: "scatter",
          mode: "lines+markers",
          marker: { color: "blue" },
        },
      ]}
      layout={{
        title: "Titles",
        width: props?.width ?? 300,
        height: props?.height ?? 400,
        shapes: [
          // x축 수직선: X축에서 교차점까지만
          {
            type: "line",
            x0: fixedX,
            x1: fixedX,
            y0: 0, // Y축의 0에서 시작
            y1: fixedY, // 교차점까지만
            line: {
              color: "red",
              width: 2,
              dash: "solid",
            },
          },
          // y축 수평선: Y축에서 교차점까지만
          {
            type: "line",
            x0: 0, // X축의 0에서 시작
            x1: fixedX, // 교차점까지만
            y0: fixedY,
            y1: fixedY,
            line: {
              color: "green",
              width: 2,
              dash: "solid",
            },
          },
        ],
        annotations: [
          // 교차점에 (3, 13) 표기
          {
            x: fixedX,
            y: fixedY,
            xref: "x",
            yref: "y",
            text: `(${fixedX}, ${fixedY})`,
            showarrow: true,
            arrowhead: 2,
            ax: 20, // 텍스트 위치 조정 (X축 방향)
            ay: -20, // 텍스트 위치 조정 (Y축 방향)
            font: {
              size: 12,
              color: "black",
            },
          },
        ],
        xaxis: {
          title: "X Axis",
          zeroline: false, // X축의 0선 숨김
        },
        yaxis: {
          title: "Y Axis",
          zeroline: false, // Y축의 0선 숨김
        },
      }}
      config={{
        responsive: true,
      }}
    />
  );
};

export default function GraphSample() {
  const [, setIsOpen] = useRecoilState(isOpenCfDialogSelector);
  const [, setIsBlur] = useRecoilState(isBlurSelector);
  const [x, setX] = useState<number>(3);

  return (
    <div className="absolute -top-[120px] right-0 w-auto z-20 shadow-lg rounded-md bg-[#f4f5f6] border border-gray-300 flex flex-col gap-2 p-4">
      <TextField
        placeholder="Placeholder"
        defaultValue={String(x)}
        width="100px"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const cur = e.target.value;
          if (!cur) return;

          const curNumber = Number(cur);
          if (Number.isNaN(curNumber)) return;
          setX(curNumber);
        }}
      />

      <PlotWithFixedAnnotation x={x} width={400} height={400} />

      <div className="flex justify-center items-center p-4">
        <Button
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
