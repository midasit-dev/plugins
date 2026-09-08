import { useState } from "react";
import { GridEventListener } from "@mui/x-data-grid";

/**
 * 마지막으로 클릭한 셀의 행/열을 기억한다.
 *
 * 붙여넣기 시작 지점, 에러 메시지의 대상 행, 편집 확정 대상을 정하는 기준이 된다.
 */
const useGridCursor = () => {
  const [cursur, setCursur] = useState<number>(0);
  const [field, setField] = useState<string>("");

  const onClickCell: GridEventListener<"cellClick"> = (params) => {
    setCursur(params.id as number);
    setField(params.field);
  };

  return { cursur, field, onClickCell };
};

export default useGridCursor;
