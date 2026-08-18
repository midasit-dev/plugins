import { useEffect, useState, useRef } from "react";
import { Chart } from "react-chartjs-2";
import { Alert } from "@mui/material";
import { Grid } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  filteredTableListState,
  TableTypeState,
  CheckBoxState,
  TableErrState,
} from "../../../values/RecoilValue";
import { useTranslation } from "react-i18next";
import { TableTypeName } from "../../../values/EnumValue";
import "./chartSetup";
import { buildCurve } from "./points";
import { AxisScale, calcAxisScale, hasZeroAxes } from "./chartScale";
import {
  buildDatasets,
  buildOptions,
  ZERO_AXIS_ANNOTATION,
} from "./chartConfig";
import { gridStyle } from "./chartTheme";

const INIT_SCALE: AxisScale = { scaleX: 0, stepX: 0, scaleY: 0, stepY: 0 };

const GraphChart = () => {
  const { t: translate } = useTranslation();
  const filterList = useRecoilValue(filteredTableListState);
  const TableType = useRecoilValue(TableTypeState);
  const CheckBox = useRecoilValue(CheckBoxState);
  const [TableErr, setTableErr] = useRecoilState(TableErrState);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [scale, setScale] = useState<AxisScale>(INIT_SCALE);
  const [xyPoint, setxyPoint] = useState<object[]>([]);
  const [dataList, setyDataList] = useState<any[]>([]);
  const [errmsg, setyErrmsg] = useState<string>("");

  // 곡선이 바뀌면 축을 다시 맞추고, 원점을 지나면 보조선을 얹는다
  useEffect(() => {
    setScale(calcAxisScale(xyPoint));

    if (chartRef !== undefined && hasZeroAxes(xyPoint))
      setTimeout(() => {
        chartRef.current.options.plugins.annotation.annotations =
          ZERO_AXIS_ANNOTATION;
        chartRef.current.update();
      }, 500);
  }, [xyPoint]);

  useEffect(() => {
    if (filterList === undefined) return;
    initDataList();
  }, [filterList, CheckBox]);

  const initDataList = () => {
    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);

    // 유효성 검사에 걸린 곡선은 직전 곡선을 그대로 유지한다
    const backupXY = [...xyPoint];
    const nextXY: object[] = [];
    const errArr: boolean[] = [];

    list.forEach((value, idx) => {
      const curve = buildCurve(TableType, value);
      if (curve === null) return; // 지원하지 않는 점 개수는 건너뛴다

      nextXY.push(curve.valid ? curve.points : backupXY[idx]);
      errArr.push(!curve.valid);
    });
    setxyPoint(nextXY);

    const bErr = errArr.some((bool) => bool === true);
    setyErrmsg(bErr ? translate("Graph_err") : "");
    setTableErr(bErr);
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
          data={buildDatasets(xyPoint, dataList)}
          options={buildOptions(translate(TableTypeName[TableType]), scale)}
        />
      </Grid>
    </Grid>
  );
};

export default GraphChart;
