import { isEmpty } from "lodash";

export interface AxisScale {
  scaleX: number;
  stepX: number;
  scaleY: number;
  stepY: number;
}

/** 축 후보 눈금. 데이터 폭보다 큰 값 중 가장 작은 것을 고른다. */
const X_RANGE = [
  100, 50, 10, 5, 2.5, 1, 0.75, 0.5, 0.25, 0.1, 0.075, 0.05, 0.025, 0.01,
  0.0075, 0.005, 0.0025, 0.001, 0.00075, 0.0005, 0.00025, 0.0001, 0.000075,
  0.00005, 0.000025, 0.00001,
];
const Y_RANGE = [
  10000000, 5000000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000, 7500,
  5000, 2500, 1000, 750, 500, 250, 100, 75, 50, 10, 5, 2.5, 1,
];

/** 모든 곡선을 감싸는 |x|, |y| 최대값 */
export function calcExtent(xyPoint: any[]): [number, number] {
  return xyPoint.reduce(
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
  ) as [number, number];
}

/** 곡선 목록으로부터 축 범위와 눈금 간격을 정한다. */
export function calcAxisScale(xyPoint: any[]): AxisScale {
  const [width, height] = calcExtent(xyPoint);

  const Xrange = X_RANGE.filter((value) => value > width);
  const Yrange = Y_RANGE.filter((value) => value > height);

  const scaleX = isEmpty(Xrange) ? 0.001 : Xrange[Xrange.length - 1];
  const stepX = isEmpty(Xrange) ? 0.0001 : Xrange[Xrange.length - 1] / 10;
  const scaleY = isEmpty(Yrange) ? 1 : Yrange[Yrange.length - 1];
  const stepY = isEmpty(Yrange) ? 1 / 10 : Yrange[Yrange.length - 1] / 10;

  return { scaleX, stepX, scaleY, stepY };
}

/** 모든 곡선이 x=0, y=0 지점을 지날 때만 원점 보조선을 그린다. */
export function hasZeroAxes(xyPoint: any[]) {
  const findZeroX = xyPoint.some((arr: any) =>
    arr.some((point: any) => point.x === 0)
  );
  const findZeroY = xyPoint.some((arr: any) =>
    arr.some((point: any) => point.y === 0)
  );
  return findZeroX && findZeroY;
}
