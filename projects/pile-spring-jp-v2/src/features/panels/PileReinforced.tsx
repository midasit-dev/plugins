import { CustomTable } from "../../components";
import { usePileReinforced } from "../../hooks/usePileReinforced";

const PileReinforced = () => {
  /**
  보강단면 패널

  | 보강 방법 | 보강 시작 | 보강 종료 | 보강 두께 | 보강 탄성계수 |
  |   피복   | 보강 시작 | 보강 종료 | 보강 두께 | 보강 탄성계수 |
  |  +충진   |    -     |    -    | 보강 두께 | 보강 탄성계수 |
  **/
  const { rows, renderRow, getHeaders } = usePileReinforced();

  return (
    <CustomTable
      totalWidth={540}
      rows={rows}
      renderRow={renderRow}
      headers={getHeaders()}
    />
  );
};

export default PileReinforced;
