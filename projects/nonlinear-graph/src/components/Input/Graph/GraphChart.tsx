import { useEffect, useState, useRef } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Alert } from "@mui/material";
import { Grid } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  filteredTableListState,
  TableTypeState,
  CheckBoxState,
  TableErrState,
} from "../../../values/RecoilValue";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import {
  eSubType,
  getBinlinearCase,
  getMultiCase,
  getSlipCase,
  getTetralinearCase,
  getTrilinearCase,
  TableTypeName,
} from "../../../values/EnumValue";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
  annotationPlugin
);

const GraphChart = () => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const filterList = useRecoilValue(filteredTableListState);
  const TableType = useRecoilValue(TableTypeState);
  const CheckBox = useRecoilValue(CheckBoxState);
  const [TableErr, setTableErr] = useRecoilState(TableErrState);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [scaleX, setScaleX] = useState(0);
  const [scaleY, setScaleY] = useState(0);
  const [stepX, setStepX] = useState(0);
  const [stepY, setStepY] = useState(0);
  const [xyPoint, setxyPoint] = useState<object[]>([]);
  const [dataList, setyDataList] = useState<any[]>([]);
  const [errmsg, setyErrmsg] = useState<string>("");

  useEffect(() => {
    // 차트 크기 계산
    const [width, height] = xyPoint.reduce(
      (acc: number[], arr: any) => {
        if (arr.length > 0) {
          const maxXY = arr.reduce(
            (mm: number[], point: any) => {
              mm[0] = Math.max(mm[0], point.x);
              mm[1] = Math.max(mm[1], point.y);
              return mm;
            },
            [0, 0]
          );
          const minXY = arr.reduce(
            (mm: number[], point: any) => {
              mm[0] = Math.min(mm[0], point.x);
              mm[1] = Math.min(mm[1], point.y);
              return mm;
            },
            [0, 0]
          );

          acc[0] = Math.max(
            acc[0],
            Math.max(Math.abs(maxXY[0]), Math.abs(minXY[0]))
          );
          acc[1] = Math.max(
            acc[1],
            Math.max(Math.abs(maxXY[1]), Math.abs(minXY[1]))
          );
        }
        return acc;
      },
      [0, 0]
    );

    // scale set
    const Xrange = [
      100, 50, 10, 5, 2.5, 1, 0.75, 0.5, 0.25, 0.1, 0.075, 0.05, 0.025, 0.01,
      0.0075, 0.005, 0.0025, 0.001, 0.00075, 0.0005, 0.00025, 0.0001, 0.000075,
      0.00005, 0.000025, 0.00001,
    ].filter((value) => value > width);
    const Yrange = [
      10000000, 5000000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000,
      7500, 5000, 2500, 1000, 750, 500, 250, 100, 75, 50, 10, 5, 2.5, 1,
    ].filter((value) => value > height);
    if (isEmpty(Xrange)) {
      setScaleX(0.001);
      setStepX(0.0001);
    } else {
      setScaleX(Xrange[Xrange.length - 1]);
      setStepX(Xrange[Xrange.length - 1] / 10);
    }
    if (isEmpty(Yrange)) {
      setScaleY(1);
      setStepY(1 / 10);
    } else {
      setStepY(Yrange[Yrange.length - 1] / 10);
      setScaleY(Yrange[Yrange.length - 1]);
    }

    // 차트 업데이트
    if (chartRef !== undefined) {
      const annotation = {
        xLine: {
          type: "line" as const,
          scaleID: "x",
          value: 0,
          borderColor: "gray",
          borderWidth: 2,
          label: {
            content: "x=0",
            enabled: true,
            position: "start" as const,
          },
          // callbacks: function (value: any) {
          // },
        },
        yLine: {
          type: "line" as const,
          scaleID: "y",
          value: 0,
          borderColor: "gray",
          borderWidth: 2,
          label: {
            content: "y=0",
            enabled: true,
            position: "start" as const,
          },
        },
      };

      const findZeroX = xyPoint.some((arr: any) =>
        arr.some((point: any) => point.x === 0)
      );
      const findZeroY = xyPoint.some((arr: any) =>
        arr.some((point: any) => point.y === 0)
      );
      if (findZeroX && findZeroY)
        setTimeout(() => {
          chartRef.current.options.plugins.annotation.annotations = annotation;
          chartRef.current.update();
        }, 500);
    }
  }, [xyPoint]);

  useEffect(() => {
    if (filterList === undefined) return;
    initChart();
  }, [filterList, CheckBox]);

  const initChart = () => {
    initDataList();
  };

  const initDataList = () => {
    let errArr: boolean[] = [];

    switch (TableType) {
      case 1:
      case 2:
        errArr = setDataGraph();
        break;
      case 3:
        errArr = setMulDataGraph();
        break;
    }

    const bErr = errArr.some((bool) => bool === true);
    if (bErr) setyErrmsg(translate("Graph_err"));
    else setyErrmsg("");
    setTableErr(bErr);
  };

  const setDataGraph = (): boolean[] => {
    const backupXY = [...xyPoint];
    setxyPoint([]);
    let errArr: boolean[] = [];

    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);
    list.forEach((value, idx) => {
      const HistoryModel = value.HISTORY_MODEL;
      const nPnd = TableType === 1 ? value.DATA.PND : value.DATA.PND + 1;
      switch (nPnd) {
        case 2: // Binlinear
          {
            if (
              HistoryModel === "SLBI" ||
              HistoryModel === "SLBT" ||
              HistoryModel === "SLBC"
            ) {
              const xyValied = getSlipCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Bilinear"]
              );
              const xyPoint = setOtherXYPoint(value.DATA, HistoryModel);
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyValied) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyValied))
                // set err
                errArr.push(true);
              else errArr.push(false);
            } else {
              const xyValied = getBinlinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Bilinear"]
              );
              const xyPoint = setOtherXYPoint(value.DATA, HistoryModel);
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyValied) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyValied))
                // set err
                errArr.push(true);
              else errArr.push(false);
            }
          }
          break;
        case 3: // Trilinear
          {
            if (
              HistoryModel === "SLTR" ||
              HistoryModel === "SLTT" ||
              HistoryModel === "SLTC"
            ) {
              const xyValied = getSlipCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Trilinear"]
              );
              const xyPoint = setOtherXYPoint(value.DATA, HistoryModel);
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyValied) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyValied))
                // set err
                errArr.push(true);
              else errArr.push(false);
            } else {
              const xyValied = getTrilinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Trilinear"]
              );
              const xyPoint = setOtherXYPoint(value.DATA, HistoryModel);
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyValied) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyValied))
                // set err
                errArr.push(true);
              else errArr.push(false);
            }
          }
          break;
        case 4: // Tetralinear
          {
            const xyValied = getTetralinearCase(
              value.DATA,
              TableType,
              HistoryModel,
              eSubType["Tetralinear"]
            );
            const xyPoint = setOtherXYPoint(value.DATA, HistoryModel);
            setxyPoint((preXY) => [
              ...preXY,
              isEmpty(xyValied) ? backupXY[idx] : xyPoint,
            ]);
            if (isEmpty(xyValied))
              // set err
              errArr.push(true);
            else errArr.push(false);
          }
          break;
        default:
          break;
      }
    });
    return errArr;
  };

  const setMulDataGraph = (): boolean[] => {
    const backupXY = [...xyPoint];
    setxyPoint([]);
    let errArr: boolean[] = [];

    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);
    list.forEach((value, idx) => {
      const HistoryModel = value.HISTORY_MODEL;
      const xyPoint = setMultiXYPoint(value.DATA);
      setxyPoint((preXY) => [
        ...preXY,
        isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
      ]);
      if (isEmpty(xyPoint))
        // set err
        errArr.push(true);
      else errArr.push(false);
    });
    return errArr;
  };

  const setOtherXYPoint = (DATA: any, HistoryModel: string) => {
    let xyPoint: object[] = [];
    switch (TableType) {
      case 1: // disp
        xyPoint = setDispPoint(DATA, HistoryModel);
        break;
      case 2: // stiff
        xyPoint = setStiffPoint(DATA, HistoryModel);
        break;
    }

    return xyPoint;
  };

  const setDispPoint = (DATA: any, HistoryModel: string) => {
    // x point
    const xPoint = DATA.D_DATA;
    // y point
    const yPoint = DATA.P_DATA;

    const xyPoint = [];
    let plusGap = 0.0;
    let mlusGap = 0.0;
    if (DATA.INIT_GAP[0] !== undefined && DATA.INIT_GAP[1] !== undefined) {
      plusGap = DATA.INIT_GAP[0];
      mlusGap = DATA.INIT_GAP[1] * -1;
    }
    // slip type
    if (
      HistoryModel === "SLBI" ||
      HistoryModel === "SLBT" ||
      HistoryModel === "SLBC" ||
      HistoryModel === "SLTR" ||
      HistoryModel === "SLTT" ||
      HistoryModel === "SLTC"
    ) {
      // + values
      const bPlus =
        HistoryModel === "SLBC" || HistoryModel === "SLTC" ? false : true;
      for (let i = xPoint.length - 1; i >= 0; i--) {
        const xyValue = {
          x: plusGap + xPoint[i][0],
          y: bPlus ? yPoint[i][0] : 0,
        };
        xyPoint.push(xyValue);
      }

      // plus gap
      if (plusGap !== 0) xyPoint.push({ x: plusGap, y: 0 });

      // zero value
      xyPoint.push({ x: 0, y: 0 });

      // minus gap
      if (mlusGap !== 0) xyPoint.push({ x: mlusGap, y: 0 });

      // - values
      const bMinus =
        HistoryModel === "SLBT" || HistoryModel === "SLTT" ? false : true;
      for (let i = 0; i < xPoint.length; i++) {
        const xyValue = {
          x: mlusGap + xPoint[i][1] * -1,
          y: bMinus ? yPoint[i][1] * -1 : 0,
        };
        xyPoint.push(xyValue);
      }
    } else {
      // + values
      for (let i = xPoint.length - 1; i >= 0; i--) {
        const xyValue = { x: plusGap + xPoint[i][0], y: yPoint[i][0] };
        xyPoint.push(xyValue);
      }
      // plus gap
      if (plusGap !== 0) xyPoint.push({ x: plusGap, y: 0 });

      // zero
      xyPoint.push({ x: 0, y: 0 });

      // minus gap
      if (mlusGap !== 0) xyPoint.push({ x: mlusGap, y: 0 });

      // - values
      for (let i = 0; i < xPoint.length; i++) {
        const xyValue = {
          x: mlusGap + xPoint[i][1] * -1,
          y: yPoint[i][1] * -1,
        };
        xyPoint.push(xyValue);
      }
    }
    return xyPoint;
  };

  const setStiffPoint = (DATA: any, HistoryModel: string) => {
    // x point
    const [xPoint, nextY]: any = getStiffFromXpoint(
      DATA.P_DATA,
      DATA.A_DATA,
      DATA.PND
    );

    // y point
    const yPoint = [];
    for (let i = 0; i < DATA.PND; i++) {
      yPoint.push(DATA.P_DATA[i]);
    }
    yPoint.push(nextY);

    const xyPoint = [];
    let plusGap = 0.0;
    let mlusGap = 0.0;
    if (DATA.INIT_GAP[0] !== undefined && DATA.INIT_GAP[1] !== undefined) {
      plusGap = DATA.INIT_GAP[0];
      mlusGap = DATA.INIT_GAP[1] * -1;
    }
    // slip type
    if (
      HistoryModel === "SLBI" ||
      HistoryModel === "SLBT" ||
      HistoryModel === "SLBC" ||
      HistoryModel === "SLTR" ||
      HistoryModel === "SLTT" ||
      HistoryModel === "SLTC"
    ) {
      // + values
      const bPlus =
        HistoryModel === "SLBC" || HistoryModel === "SLTC" ? false : true;
      for (let i = xPoint.length - 1; i >= 0; i--) {
        const xyValue = {
          x: plusGap + xPoint[i][0],
          y: bPlus ? yPoint[i][0] : 0,
        };
        xyPoint.push(xyValue);
      }

      // plus gap
      if (plusGap !== 0) xyPoint.push({ x: plusGap, y: 0 });

      // zero value
      xyPoint.push({ x: 0, y: 0 });

      // minus gap
      if (mlusGap !== 0) xyPoint.push({ x: mlusGap, y: 0 });

      // - values
      const bMinus =
        HistoryModel === "SLBT" || HistoryModel === "SLTT" ? false : true;
      for (let i = 0; i < xPoint.length; i++) {
        const xyValue = {
          x: mlusGap + xPoint[i][1] * -1,
          y: bMinus ? yPoint[i][1] * -1 : 0,
        };
        xyPoint.push(xyValue);
      }
    } else {
      // + values
      for (let i = xPoint.length - 1; i >= 0; i--) {
        const xyValue = { x: plusGap + xPoint[i][0], y: yPoint[i][0] };
        xyPoint.push(xyValue);
      }
      // plus gap
      if (plusGap !== 0) xyPoint.push({ x: plusGap, y: 0 });

      // zero
      xyPoint.push({ x: 0, y: 0 });

      // minus gap
      if (mlusGap !== 0) xyPoint.push({ x: mlusGap, y: 0 });

      // - values
      for (let i = 0; i < xPoint.length; i++) {
        const xyValue = {
          x: mlusGap + xPoint[i][1] * -1,
          y: yPoint[i][1] * -1,
        };
        xyPoint.push(xyValue);
      }
    }
    return xyPoint;
  };

  const getStiffFromXpoint = (P_DATA: any, A_DATA: any, pnd: number) => {
    const xValue: number[][] = [];
    let init_x = 0;
    switch (pnd) {
      case 1:
        init_x = 0.2;
        break;
      case 2:
      case 3:
        init_x = 0.1;
        break;
    }
    xValue.push([init_x, init_x]);

    let nextY: number[] = [0, 0];
    for (let i = 0; i < pnd; i++) {
      if (i >= pnd - 1) {
        nextY[0] = xValue[xValue.length - 1][0] * A_DATA[i][0] + P_DATA[i][0];
        nextY[1] = xValue[xValue.length - 1][1] * A_DATA[i][1] + P_DATA[i][1];

        xValue.push([
          xValue[xValue.length - 1][0] * 2,
          xValue[xValue.length - 1][0] * 2,
        ]);

        break;
      }
      const plusX: number =
        (P_DATA[i + 1][0] - P_DATA[i][0]) / A_DATA[i][0] + xValue[i][0];

      const minusX: number =
        (P_DATA[i + 1][1] - P_DATA[i][1]) / A_DATA[i][1] + xValue[i][1];
      xValue.push([plusX, minusX]);
    }

    return [xValue, nextY];
  };

  const setMultiXYPoint = (DATA: any) => {
    const PnD = DATA.PnD_Data;
    if (PnD.length === 0) return [];

    const xyPoint = PnD.map((value: number[]) => {
      console.log(value);
      return { x: value[1], y: value[0] };
    });
    return xyPoint;
  };

  const dataSets = {
    datasets: xyPoint.map((list, idx) => {
      return {
        type: "line" as const,
        label: `${dataList[idx].NAME}`,
        data: xyPoint[idx],
        borderDash:
          lineStyle[
            lineStyle.length <= Math.floor(idx / LineColor.length)
              ? Math.floor(idx / LineColor.length) % lineStyle.length
              : Math.floor(idx / LineColor.length)
          ],
        borderColor:
          LineColor[LineColor.length <= idx ? idx % LineColor.length : idx], //"#8884d8",
        backgroundColor:
          LineColor[LineColor.length <= idx ? idx % LineColor.length : idx], //label color
        borderWidth: 1,
        pointStyle:
          pointerStyle[
            lineStyle.length <=
            Math.floor(idx / (LineColor.length * lineStyle.length))
              ? Math.floor(idx / (LineColor.length * lineStyle.length)) %
                pointerStyle.length
              : Math.floor(idx / (LineColor.length * lineStyle.length))
          ],
        pointRadius: 3, // 포인트 크기
        pointBackgroundColor: "#FFFFFF", // 포인트 내부 배경색
        pointBorderColor:
          LineColor[LineColor.length <= idx ? idx - LineColor.length : idx], // 포인트 테두리 색
        pointBorderWidth: 1, // 포인트 테두리 두께
        pointHoverRadius: 5, // 호버 시 포인트 크기
        pointHoverBackgroundColor: "#FFFFFF", // 호버 시 포인트 배경색
        pointHoverBorderColor:
          LineColor[LineColor.length <= idx ? idx - LineColor.length : idx], // 호버 시 포인트 테두리 색
        pointHoverBorderWidth: 3, // 포인트 테두리 두께
        fill: false, // 라인 그래프에서 영역 채우기 비활성화
      };
    }),
  };

  const options = {
    responsive: true, // 반응형
    maintainAspectRatio: false, // 크기 비율 유지 비활성
    layouts: {
      padding: {
        top: 30,
        bottom: 30,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      title: {
        display: true,
        text: translate(TableTypeName[TableType]),
        position: "left" as const,
      },
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 20, // 범례 아이콘(색상 박스)의 너비
          boxHeight: 10, // 범례 아이콘의 높이 (Chart.js 3.7+)
          color: "black" as const, // 범례 텍스트 색상
          borderDash: [5, 5],
          font: {
            size: 12, // 폰트 크기
            // family: "Arial" as const, // 폰트 패밀리
            // style: "normal" as const, // 폰트 스타일 ('normal', 'italic', 'oblique')
            // weight: "bold" as const, // 폰트 굵기
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true, // 툴팁 활성화 여부
        mode: "nearest" as const, // 툴팁 표시 모드: 'nearest', 'index', 'dataset' 등
        intersect: true, // 데이터 포인트와 교차할 때만 표시
        callbacks: {
          title: function (tooltipItems: any) {
            const toolItem = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.dataset.label))
            );
            return `Name : ${toolItem.join(",  ")} `;
          },
          label: function (tooltipItem: any) {
            // if (tooltipItem.raw) {
            //   return ` X: ${tooltipItem.raw.x},  Y: ${tooltipItem.raw.y}`;
            // }
            return "";
          },
          footer: function (tooltipItems: any) {
            const toolItemX = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.raw.x))
            );
            const toolItemY = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.raw.y))
            );
            return ` X: ${toolItemX},  Y: ${toolItemY}`;
          },
        },
      },
      annotation: {
        annotations: {}, // 초기에는 애너테이션 없음
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        beginAtZero: false,
        min: -scaleX,
        max: scaleX,
        ticks: {
          color: "gray", // 눈금 색상 설정
          stepSize: stepX,
          callbacks: function (value: number) {
            return value.toFixed(6); // 소수점
          },
        },
      },
      y: {
        type: "linear" as const,
        beginAtZero: false,
        min: -scaleY,
        max: scaleY,
        ticks: {
          color: "gray",
          stepSize: stepY,
          callbacks: function (value: number) {
            return value.toFixed(6); // 소수점
          },
        },
      },
    },
  };

  return (
    <Grid style={{ width: "100%", height: "100%" }}>
      <Grid
        container
        style={{
          width: "100%",
          height: "10%",
        }}
      >
        {errmsg !== "" && (
          <Alert
            style={{
              width: "100%",
              height: "100%",
              transition: "opacity 0.5s ease-out",
              opacity: errmsg === "" ? 0 : 1,
            }}
            severity="error"
          >
            {errmsg}
          </Alert>
        )}
      </Grid>
      <Grid ref={chartContainerRef} style={gridStyle}>
        <Chart
          ref={chartRef}
          type="scatter"
          data={dataSets}
          options={options}
        />
      </Grid>
    </Grid>
  );
};

const gridStyle: any = {
  width: "80%",
  height: "80%",
  margin: "0 auto",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const LineColor: string[] = [
  "#FF0000",
  // "#FF4000",
  // "#FF8000",
  // "#FFBF00",
  "#FFA500", // Red -> Orange
  // "#FFA500",
  // "#FFD100",
  // "#FFF000",
  // "#FFFF00", // Orange -> Yellow
  // "#FFFF00",
  // "#BFFF00",
  // "#80FF00",
  // "#40FF00",
  "#008000", // Yellow -> Green
  // "#008000",
  // "#0066AA",
  // "#004CFF",
  // "#0028FF",
  "#0000FF", // Green -> Blue
  // "#0000FF",
  // "#1A00E6",
  // "#3300CC",
  // "#4B00B2",
  "#4B0082", // Blue -> Indigo
  // "#4B0082",
  // "#7B048C",
  // "#AD1095",
  // "#DD209F",
  "#EE82EE", // Indigo -> Violet
  // "black",
];

const pointerStyle: string[] = [
  "circle",
  "rect",
  "rectRot",
  "triangle",
  "cross",
  "crossRot",
  "star",
];

const lineStyle: number[][] = [
  [0, 0],
  [5, 5],
  [30, 10],
];

export default GraphChart;
