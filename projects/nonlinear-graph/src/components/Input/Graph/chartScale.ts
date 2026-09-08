export interface AxisScale {
  scaleX: number;
  stepX: number;
  scaleY: number;
  stepY: number;
}

/**
 * 눈금 후보 수열. 1 / 2 / 2.5 / 5 × 10^n 은 사람이 읽기 좋은 간격이다.
 * 고정 목록이 아니라 지수를 데이터에서 얻으므로 값의 크기를 가리지 않는다.
 */
const NICE_STEPS = [1, 2, 2.5, 5, 10];

/** 그릴 값이 없을 때 쓰는 축 반폭. 축이 0 폭이 되는 것만 막으면 된다. */
const FALLBACK_HALF = 1;

/**
 * extent 를 넘는 가장 작은 1/2/2.5/5 × 10^n.
 *
 * 곱셈의 부동소수 오차를 털어 낸다. 2 * 1e-4 는 0.00019999999999999998 이 되는데,
 * 그대로 두면 눈금 라벨에 그 자릿수가 그대로 나온다.
 */
function niceCeil(extent: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(extent)));
  for (const step of NICE_STEPS) {
    const candidate = Number((step * pow).toPrecision(12));
    if (candidate > extent) return candidate;
  }
  return Number((10 * pow).toPrecision(12));
}

/**
 * 축 반폭(= |min| = max). 곡선은 원점 대칭으로 그리므로 한쪽 폭만 정하면 된다.
 *
 * 예전에는 미리 정해 둔 후보 목록에서 골랐는데, 목록의 최대값(x 는 100)보다 넓은
 * 데이터가 오면 남는 후보가 없어 **목록의 최소값**으로 떨어졌다. 축이 데이터의
 * 몇 만분의 1 로 좁아져 곡선이 통째로 화면 밖으로 나가고 원점만 남았다.
 *
 * 탭2(P-alpha)의 x 는 (힘 차이 / 강성비)로 역산한 형상 좌표라 단위가 붙지 않고,
 * 모델의 힘 크기에 따라 1e5 도 1e-4 도 된다. 미리 범위를 정해 둘 수 있는 값이
 * 아니므로 데이터에서 자릿수를 얻는다.
 */
function axisHalf(extent: number): number {
  if (!Number.isFinite(extent) || extent <= 0) return FALLBACK_HALF;
  return niceCeil(extent);
}

/**
 * 모든 곡선을 감싸는 |x|, |y| 최대값.
 *
 * 곡선 하나가 유효성 검사에 걸렸는데 되돌릴 직전 곡선도 없으면 그 자리에
 * undefined 가 들어온다. NaN 점도 섞일 수 있다. 둘 다 건너뛴다 —
 * 하나 때문에 축 전체가 무너지면 나머지 곡선까지 못 보게 된다.
 */
export function calcExtent(xyPoint: any[]): [number, number] {
  let width = 0;
  let height = 0;

  for (const curve of xyPoint) {
    if (!Array.isArray(curve)) continue;
    for (const point of curve) {
      if (Number.isFinite(point?.x)) width = Math.max(width, Math.abs(point.x));
      if (Number.isFinite(point?.y)) height = Math.max(height, Math.abs(point.y));
    }
  }

  return [width, height];
}

/** 곡선 목록으로부터 축 범위와 눈금 간격을 정한다. */
export function calcAxisScale(xyPoint: any[]): AxisScale {
  const [width, height] = calcExtent(xyPoint);

  const scaleX = axisHalf(width);
  const scaleY = axisHalf(height);

  return { scaleX, stepX: scaleX / 10, scaleY, stepY: scaleY / 10 };
}

/** 모든 곡선이 x=0, y=0 지점을 지날 때만 원점 보조선을 그린다. */
export function hasZeroAxes(xyPoint: any[]) {
  const points = xyPoint.filter(Array.isArray);
  const findZeroX = points.some((arr: any) =>
    arr.some((point: any) => point?.x === 0)
  );
  const findZeroY = points.some((arr: any) =>
    arr.some((point: any) => point?.y === 0)
  );
  return findZeroX && findZeroY;
}
