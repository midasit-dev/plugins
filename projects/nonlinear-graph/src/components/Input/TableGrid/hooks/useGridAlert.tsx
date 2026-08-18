import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridColDef } from "@mui/x-data-grid";
import AlertToolbar from "../shared/AlertToolbar";

export type GridAlertFunc = (
  bSuccess: boolean,
  rowID?: number,
  colFild?: string,
  msg?: string
) => void;

interface UseGridAlertParams {
  rows: any[];
  columns: GridColDef<any>[];
  /** 마지막 클릭 행. rowID를 -1로 넘겼을 때 대상 행이 된다. */
  cursur: number;
}

/**
 * 그리드 툴바에 띄우는 성공/에러 알림을 관리한다.
 *
 * 메시지는 5초 뒤 자동으로 지워지며, alertMsg가 바뀌면 호출부가 행을 다시 그린다.
 */
const useGridAlert = ({ rows, columns, cursur }: UseGridAlertParams) => {
  const { t: translate } = useTranslation();

  const [bError, setbError] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    // 5초 후에 Alert를 숨기기
    const timer = setTimeout(() => {
      setAlertMsg("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [alertMsg]);

  const AlertFunc: GridAlertFunc = (
    bSuccess,
    rowID = -1,
    colFild = "",
    msg = ""
  ) => {
    if (bSuccess) {
      const succesMsg = translate("success_change_data");
      setbError(false);
      setAlertMsg(succesMsg);
    } else {
      const rowIdx = rowID === -1 ? cursur : rowID;
      const colIdx = columns.findIndex((col) => col.field === colFild);
      if (colIdx !== -1) {
        // 아직 그리드에 없는 행(붙여넣기로 새로 생기는 행)을 가리킬 수 있다.
        const name = rows[rowIdx]?.NAME ?? "";
        const errMsg =
          translate("row_col_valid_error") +
          `: [Name : ${name}, Header : ${columns[colIdx].headerName}] -> Input : ${msg}`;
        setbError(true);
        setAlertMsg(errMsg);
      }
    }
  };

  const alertToolbar = useCallback(
    () => <AlertToolbar bError={bError} alertMsg={alertMsg} />,
    [bError, alertMsg]
  );

  return { alertMsg, AlertFunc, alertToolbar };
};

export default useGridAlert;
