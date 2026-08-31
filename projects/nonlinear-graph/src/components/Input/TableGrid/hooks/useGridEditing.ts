import { useState } from "react";
import { isEmpty } from "lodash";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  GridApiCommon,
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
import { META_FIELDS } from "../shared/format";
import { buildPastedRow } from "../shared/pasteRow";
import useGridClipboardPaste from "./useGridClipboardPaste";
import { GridAlertFunc } from "./useGridAlert";

interface UseGridEditingParams {
  rows: any[];
  /**
   * DataGrid 의 apiRef. 붙여넣기 전에 열려 있는 행 편집을 닫는 데 쓴다.
   *
   * 이 그리드는 셀을 한 번만 눌러도 그 행이 편집 모드로 들어간다. 그 상태에서
   * 붙여넣으면 화면은 MUI 의 편집 상태를 보여 주므로 rows 를 아무리 고쳐도
   * 반영되지 않고, 편집이 끝나는 순간 initRows() 로 되돌아간다.
   */
  apiRef?: React.MutableRefObject<GridApiCommon>;
  setRows: React.Dispatch<React.SetStateAction<any[]>>;
  columns: GridColDef<any>[];
  /** 마지막 클릭 셀 (useGridCursor) */
  cursur: number;
  field: string;
  /** 붙여넣기한 행에서 비어 있으면 안 되는 컬럼. 앞에 있는 것부터 검사한다. */
  requiredFields: string[];
  /** 셀 단위 유효성 검사. 테이블마다 규칙이 다르다. */
  dataValid: (row: any, col: string, InputValue: any) => boolean;
  /**
   * 붙여넣기에만 거는 추가 검열. 생략하면 dataValid 만 본다.
   *
   * dataValid 보다 좁아야 하는 칸이 있다. 행 편집을 확정하면 그 행의 모든 칸이
   * dataValid 를 타므로, 표에 이미 떠 있는 값은 전부 통과시켜야 한다 - 아니면
   * 무관한 편집이 롤백된다. 반면 붙여넣기는 사용자가 값을 **새로 넣는** 자리라
   * 플러그인이 다루지 않는 값을 여기서 막아야 한다.
   */
  pasteValid?: (row: any, col: string, InputValue: any) => boolean;
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
  apiRef,
  setRows,
  columns,
  cursur,
  field,
  requiredFields,
  dataValid,
  pasteValid,
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
    if (mode !== undefined) return;

    const newDataList = Object.values(
      (details as any).api.state.rows.dataRowIdToModelLookup
    ).filter((row: any) => row.id === cursur)[0] as any;

    if (bEnter) {

      const bErr = Object.entries(newDataList).some(([key, value]) => {
        // 사용자 입력이 아닌 필드는 검증하지 않는다 (원본 숫자 보관, 행 부가정보).
        if (META_FIELDS.has(key)) return false;
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

  /**
   * 열려 있는 행 편집을 **버리고** 닫는다.
   *
   * 편집 중인 값은 붙여넣기로 덮일 값이라 살릴 이유가 없다. 닫지 않으면
   * 붙여넣기가 rows 에는 들어가지만 화면에는 안 보이고, 편집이 끝날 때
   * onRowChange 가 initRows() 로 통째로 되돌린다.
   */
  const closeRowEdit = () => {
    const api: any = apiRef?.current;
    if (!api) return;
    const editing = api.state?.editRows ?? {};
    Object.keys(editing).forEach((id) => {
      const rowId = api.getRow?.(id) ? id : Number(id);
      api.stopRowEditMode({ id: rowId, ignoreModifications: true });
    });
  };

  const onClipboardPaste = async (params: { data: string[][] }) => {
    // 편집을 닫으면 onRowChange 가 initRows() 로 표를 되그린다. 그 갱신이
    // 커밋된 뒤에 붙여넣어야 한다 - 같은 틱에 넣으면 initRows 가 나중에 도착해
    // 붙여넣은 값을 도로 지운다.
    closeRowEdit();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const startRowId: number = cursur;
    const paramsData = params.data;
    // start Columns
    const index = columns.findIndex((col) => col.field === field);
    const startColumns = index !== -1 ? columns.slice(index) : [];

    const copyErrMsg = "Paste operation cancelled";

    // **전부 아니면 전무.** 먼저 전 행을 검증만 하고, 하나라도 걸리면 아무것도
    // 반영하지 않는다. 예전에는 행마다 setRows 를 불러, 중간에서 실패하면 앞선
    // 행만 적용된 채로 멈췄다 - 사용자는 취소된 줄 아는데 표는 반쯤 바뀌어 있었다.
    const built: any[] = [];
    for (let i = startRowId; i < startRowId + paramsData.length; i++) {
      let data = paramsData[i - startRowId];
      if (data.length < startColumns.length)
        data = data.concat(Array(startColumns.length - data.length).fill(""));

      const existing = rows.find((r: any) => r.id === i);
      const { row, invalidField } = buildPastedRow(
        i, existing, startColumns, data, pasteValid ?? dataValid
      );
      if (invalidField !== null) {
        // 행 인덱스로는 바깥 루프의 i 를 넘긴다 (컬럼 인덱스가 아니다).
      alert(false, i, invalidField, copyErrMsg);
        throw new Error(copyErrMsg);
      }

      const errCol = requiredFields.find((col) => isEmpty(row[col]));
      if (errCol !== undefined) {
        alert(false, i, errCol, `no data column [${errCol}]`);
        throw new Error(copyErrMsg);
      }

      built.push(row);
    }

    // 검증을 다 통과했으니 한 번에 반영한다.
    setRows((preRows) => {
      const byId = new Map(built.map((row) => [row.id, row]));
      const merged = preRows.map((row) => byId.get(row.id) ?? row);
      const existingIds = new Set(preRows.map((row) => row.id));
      // 기존 행보다 아래로 넘어간 만큼은 새 행으로 덧붙는다.
      return merged.concat(built.filter((row) => !existingIds.has(row.id)));
    });
    // **rows 가 커밋된 다음 렌더에서** 확정 신호를 준다.
    //
    // 확정 이펙트는 rows 를 의존성에 넣지 않는다 - 넣으면 편집 중 매 렌더마다
    // 다시 돈다. 대신 bChange 가 켜진 렌더의 rows 를 읽는데, bChange 는 Recoil
    // 상태라 로컬 setRows 와 같은 커밋에 묶인다는 보장이 없다. 같은 틱에서
    // 켜면 이펙트가 **붙여넣기 전 rows** 를 읽어, 붙여넣기가 성공했다고
    // 알리면서 표에는 아무것도 반영되지 않았다.
    setTimeout(() => setbChange(true), 0);
  };

  const pasteProps = useGridClipboardPaste(onClipboardPaste);

  return {
    checkboxSet,
    onKeyDown,
    onRowChange,
    pasteProps,
    setbEnter,
  };
};

export default useGridEditing;
