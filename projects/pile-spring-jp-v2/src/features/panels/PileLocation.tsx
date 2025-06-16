import { CustomTable } from "../../components";
import { usePileLocation } from "../../hooks/usePileLocation";

const PileLocation = () => {
  /**
  말뚝 배치 패널

  | 말뚝 위치   |    참조기준   | 위치 | 간격 | 각도 |
  |   재하방향  |  우측 or 좌측 | 위치 | 간격 | 각도 |
  | 재하직각방향 |  상단 or 하단 | 위치 | 간격 | 각도 |

  간격은 3@1.0, 2.0 형식으로 입력
  각도는 간격보다 갯수가 +1

  재하 직각방향의 간격은 없음
  **/
  const { rows, renderRow, getHeaders } = usePileLocation();

  return (
    <CustomTable
      totalWidth={540}
      rows={rows}
      renderRow={renderRow}
      headers={getHeaders()}
    />
  );
};

export default PileLocation;
