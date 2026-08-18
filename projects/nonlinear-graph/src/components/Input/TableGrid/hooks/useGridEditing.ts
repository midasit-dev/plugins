import { useState } from "react";
import { isEmpty } from "lodash";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  GridCallbackDetails,
  GridColDef,
  GridEventListener,
  GridRowModesModel,
} from "@mui/x-data-grid";
import {
  CheckBoxState,
  filteredTableListState,
  TableChangeState,
  TableListState,
  TableTypeState,
} from "../../../../values/RecoilValue";
import useGridClipboardPaste from "./useGridClipboardPaste";
import { GridAlertFunc } from "./useGridAlert";

interface UseGridEditingParams {
  rows: any[];
  setRows: React.Dispatch<React.SetStateAction<any[]>>;
  columns: GridColDef<any>[];
  /** 마지막 클릭 셀 (useGridCursor) */
  cursur: number;
  field: string;
  /** 붙여넣기한 행에서 비어 있으면 안 되는 컬럼. 앞에 있는 것부터 검사한다. */
  requiredFields: string[];
  /** 셀 단위 유효성 검사. 테이블마다 규칙이 다르다. */
  dataValid: (row: any, col: string, InputValue: any) => boolean;
  /** 검증에 실패했을 때 그리드를 원본 데이터로 되돌린다. */
  initRows: () => void;
  alert: GridAlertFunc;
}

/**
 * 세 테이블 그리드가 공유하는 편집 동작을 묶는다.
 *
 * 체크박스 선택, 셀 입력/Enter/Delete, 행 편집 확정, 다중 셀 붙여넣기까지를 담당하며
 * 테이블별로 다른 부분은 dataValid/requiredFields/initRows 로 주입받는다.
 */
const useGridEditing = ({
  rows,
  setRows,
  columns,
  cursur,
  field,
  requiredFields,
  dataValid,
  initRows,
  alert,
}: UseGridEditingParams) => {
  const TableType = useRecoilValue(TableTypeState);
  const setTableList = useSetRecoilState(TableListState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);
  const setbChange = useSetRecoilState(TableChangeState);

  const [bEnter, setbEnter] = useState(false);

  const checkboxSet = (selectedID: number[]) => {
    const checkBox = selectedID.filter((id) => !isEmpty(rows[id].NAME));
    setCheckBox(checkBox);
  };

  const onKeyDown: GridEventListener<"cellKeyDown"> = (params, event: any) => {
    const InputValue = event.target.value;
    if (InputValue === undefined) return;
    setRows((preRows) =>
      preRows.map((Item: any) =>
        Item.id === params.row.id
          ? {
              ...Item,
              [params.field]: InputValue,
            }
          : Item
      )
    );
    if (event.key === "Enter") {
      setbEnter(true);
    }
    if (event.keyCode === 46) {
      // del button
      if (isEmpty(CheckBox)) return;
      let existedList: any[] = [];
      for (let i = 0; i < filterList.length; i++) {
        if (CheckBox.includes(i)) continue;
        existedList.push(filterList[i]);
      }

      setTableList((preTable: any) => ({
        ...preTable,
        [TableType]: existedList,
      }));
      setCheckBox([]);
    }
  };

  const onRowChange = (
    rowModesModel: GridRowModesModel,
    details: GridCallbackDetails
  ) => {
    const rowID = Object.keys(rowModesModel)[0];
    const mode = rowModesModel[rowID]?.mode;
    if (bEnter && mode === undefined) {
      const newDataList = Object.values(
        (details as any).api.state.rows.dataRowIdToModelLookup
      ).filter((row: any) => row.id === cursur)[0] as any;

      const bErr = Object.entries(newDataList).some(([key, value]) => {
        if (dataValid(newDataList, key, value)) return false; // no err
        else return true; // err
      });

      if (bErr) {
        initRows();
      } else {
        setRows((preRows) =>
          preRows.map((row) => (row.id === newDataList.id ? newDataList : row))
        );
        setbChange(true);
      }
    } else initRows();
  };

  const onClipboardPaste = async (params: { data: string[][] }) => {
    const startRowId: number = cursur;
    const paramsData = params.data;
    // start Columns
    const index = columns.findIndex((col) => col.field === field);
    const startColumns = index !== -1 ? columns.slice(index) : [];

    // 붙여넣은 행 수만큼만 순회한다. 기존 행보다 아래로 넘어가는 만큼은
    // 아래 setRows 분기에서 새 행으로 덧붙는다.
    const copyErrMsg = "Paste operation cancelled";
    for (let i = startRowId; i < startRowId + paramsData.length; i++) {
      let data = paramsData[i - startRowId];
      if (data.length < startColumns.length)
        data = data.concat(Array(startColumns.length - data.length).fill(""));

      let dataObj: { [key: string]: any } = { id: i };
      startColumns.forEach((column: any, idx) => {
        const bCheck = dataValid(dataObj, column.field, data[idx]);

        if (bCheck) dataObj[column.field] = data[idx];
        else {
          // idx 는 컬럼 인덱스이므로, 행 인덱스로는 바깥 루프의 i 를 넘긴다.
          alert(false, i, column.field, copyErrMsg);
          throw new Error(copyErrMsg);
        }
      });

      const errCol = requiredFields.find((col) => isEmpty(dataObj[col]));

      if (errCol !== undefined) {
        const msg = `no data column [${errCol}]`;
        alert(false, i, errCol, msg);
        throw new Error(copyErrMsg);
      } else {
        if (rows.length - 1 < i) setRows((preRows) => [...preRows, dataObj]);
        else
          setRows((preRows) =>
            preRows.map((row) => (row.id === dataObj.id ? dataObj : row))
          );
        setbChange(true);
      }
    }
  };

  const pasteProps = useGridClipboardPaste(onClipboardPaste);

  return { checkboxSet, onKeyDown, onRowChange, pasteProps, setbEnter };
};

export default useGridEditing;
