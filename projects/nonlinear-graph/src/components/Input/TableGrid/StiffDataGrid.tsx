import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ALL_HistoryType_LNG,
  ALL_Histroy_PND,
  GetKeyFromLNG,
  getModelAlpa,
  getModelBeta,
  getModelGamma,
  getModelInitGap,
  SYMMETRIC,
} from "../../../values/EnumValue";
import { isEmpty } from "lodash";
// recoil
import { useRecoilState, useRecoilValue } from "recoil";
import {
  TableTypeState,
  TableListState,
  filteredTableListState,
  TableChangeState,
  CheckBoxState,
  HiddenBtnState,
  LanguageState,
  RequestBtnState,
  BusyState,
} from "../../../values/RecoilValue";
// UI
import { Grid, GuideBox } from "@midasit-dev/moaui";
import {
  DataGrid,
  GridColDef,
  GridColumnGroup,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Alert } from "@mui/material";
import useGridCursor from "./hooks/useGridCursor";
import useGridAlert from "./hooks/useGridAlert";
import useGridEditing from "./hooks/useGridEditing";
import { DataGridStyle } from "./shared/gridStyle";
import { setDisplayAndRaw, parseGridNumber } from "./shared/format";
import { numberColumn, textColumn } from "./shared/columns";
import {
  INIT_STIFF_TYPE,
  initStiffCell,
  isStiffTypeAllowed,
  isStiffValueAllowed,
  isStiffTypeSelectable,
  parseStiffType,
  stiffTypeLabel,
} from "./shared/initStiffCell";

const StiffDataGrid = () => {
  const RequestBtn = useRecoilValue(RequestBtnState);
  const Busy = useRecoilValue(BusyState);
  const TableType = useRecoilValue(TableTypeState);
  const [, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const CheckBox = useRecoilValue(CheckBoxState);
  const hidden = useRecoilValue(HiddenBtnState);
  const lan = useRecoilValue(LanguageState);

  const { t: translate } = useTranslation();

  const [columns, setColumns] = useState<GridColDef<any>[]>([]);
  const [groupColumns, setGroupColumns] = useState<GridColumnGroup[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  // 붙여넣기 전에 열려 있는 행 편집을 닫는 데 쓴다 (useGridEditing.closeRowEdit).
  const apiRef = useGridApiRef();

  const { cursur, field, onClickCell } = useGridCursor();
  const { alertMsg, AlertFunc, alertToolbar } = useGridAlert({
    rows,
    columns,
    cursur,
  });

  useEffect(() => {
    initRows();
    initCloumns();
    initGroupColumns();
  // init* 함수는 렌더마다 새로 만들어진다. 넣으면 무한 루프.
  // 조회 결과·언어 변경 시에만 다시 그린다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterList, alertMsg, lan]);

  const AddBlankRow = () => {
    const len = filterList === undefined ? 0 : filterList.length;
    const obj: { [key: string]: any } = {};
    columns.forEach((col: any) => {
      obj[col.field] = "";
    });
    obj["id"] = len;
    setRows((row) => [...row, obj]);
  };

  const initRows = () => {
    setRows([]);
    if (filterList !== undefined) {
      filterList.forEach((value: any, idx: any) => {
        const HISTORY_MODEL = ALL_HistoryType_LNG[value.HISTORY_MODEL];

        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(HISTORY_MODEL),
          SYMMETRIC: translate(SYMMETRIC[value.DATA.SYMMETRIC]),
        };
        // SYMMETRIC disable
        obj["SYMMETRIC_DISABLE"] = value.DATA.SYMMETRIC === 0 ? true : false;

        // PnD data init
        const nPnd = value.DATA.PND;
        obj["pnd"] = nPnd;
        let maxPnd = nPnd;
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value], idx) => {
          if (value === HISTORY_MODEL)
            maxPnd = Math.max(maxPnd, ALL_Histroy_PND[key] - 1);
        });
        const pDataArr = [
          ["Plus_P1", "Minus_P1"],
          ["Plus_P2", "Minus_P2"],
          ["Plus_P3", "Minus_P3"],
        ];
        const aDataArr = [
          ["Plus_A1", "Minus_A1"],
          ["Plus_A2", "Minus_A2"],
          ["Plus_A3", "Minus_A3"],
        ];
        pDataArr.forEach(([plusField, minusField], idx) => {
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const pData = value.DATA.P_DATA?.[idx];
            if (isEmpty(pData)) {
              obj[plusField] = "";
              obj[minusField] = "";
            } else {
              setDisplayAndRaw(obj, plusField, pData[0], false);
              setDisplayAndRaw(obj, minusField, pData[1] * -1, false);
            }
          }
        });
        aDataArr.forEach(([plusField, minusField], idx) => {
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const dData = value.DATA.A_DATA?.[idx];
            if (isEmpty(dData)) {
              obj[plusField] = "";
              obj[minusField] = "";
            } else {
              setDisplayAndRaw(obj, plusField, dData[0], true);
              setDisplayAndRaw(obj, minusField, dData[1] * -1, true);
            }
          }
        });

        if (value.HISTORY_MODEL === "SLBT" || value.HISTORY_MODEL === "SLTT")
          obj["disable"] = "Minus";
        else if (
          value.HISTORY_MODEL === "SLBC" ||
          value.HISTORY_MODEL === "SLTC"
        )
          obj["disable"] = "Plus";
        else obj["disable"] = undefined;

        // Init Stiff
        //
        // 초기강성은 서버에 슬롯이 넷인데 그중 하나만 유효하다. 어느 것인지는 값이
        // 아니라 INITSTIFFTYPE + PALPHADELTA + HINGE_TYPE 이 정하고, 파이썬이
        // K0_SLOT / K0_INPUT 으로 정리해 보내 준다 (py_stiffness.userSlot).
        //
        // 슬롯이 없으면 사용자가 넣는 값이 아니다 - 타입 4(E·I)는 요소의 재료·단면
        // 에서, 타입 5 는 골격곡선에서 나온다. 그때는 "E" 로 표시하고 잠근다.
        //
        // toFixed(1) 로 표시하면 1.999 가 "2.0" 이 되고, 저장 때 그 문자열을
        // 되읽어 모델의 값까지 2.0 으로 덮어썼다. 원본을 함께 보관해 편집하지
        // 않은 셀은 원본 그대로 돌려준다 (P/A 데이터와 같은 방식).
        const cell = initStiffCell(value.DATA);
        if (cell.value !== null)
          setDisplayAndRaw(obj, "INITSTIFFNESS", cell.value, true);
        else obj["INITSTIFFNESS"] = cell.label;
        // 편집 가능 여부 판정용 행 부가정보 (컬럼이 아니다).
        obj["INITSTIFF_EDITABLE"] = cell.editable;
        // 값이 아니라 **라벨**을 싣는다 (SYMMETRIC 컬럼과 같은 방식).
        // 내부 코드 3/4 가 표에 드러나거나 붙여넣기로 들어오지 않게 한다.
        obj["INITSTIFFTYPE"] = stiffTypeLabel(value.DATA.INITSTIFFTYPE, translate);

        // b, a, g
        const HistoryModelLNG = ALL_HistoryType_LNG[value.HISTORY_MODEL];
        const bBeta = getModelBeta(HistoryModelLNG);
        const bAlpa = getModelAlpa(HistoryModelLNG);
        const bGamma = getModelGamma(HistoryModelLNG);
        if (bBeta) setDisplayAndRaw(obj, "B", value.DATA.BETA, true);
        if (bAlpa) setDisplayAndRaw(obj, "a", value.DATA.ALPA, true);
        if (bGamma) setDisplayAndRaw(obj, "g", value.DATA.GAMMA, true);

        // init gap
        const bInitGap = getModelInitGap(HistoryModelLNG);
        if (bInitGap) {
          setDisplayAndRaw(obj, "Plus_gap", value.DATA.INIT_GAP[0], true);
          setDisplayAndRaw(obj, "Minus_gap", value.DATA.INIT_GAP[1] * -1, true);
        }
        setRows((row) => [...row, obj]);
      });
    }
    AddBlankRow();
  };

  const initCloumns = () => {
    // colums
    const baseColumns = [
      textColumn("NAME", translate("Name"), 68),
      textColumn("MATERIAL_TYPE", translate("Material"), 68),
      textColumn("HISTORY_MODEL", translate("Hysteresis_model"), 135),
      textColumn("SYMMETRIC", translate("Axisymmetric"), 87),
    ];

    const PnA = [
      ["P1", "P1"],
      ["P2", "P2"],
      ["P3", "P3"],
      ["A1", "α1"],
      ["A2", "α2"],
      ["A3", "α3"],
    ];
    const Plus_Columns = PnA.map(([name, header]) =>
      numberColumn(`Plus_${name}`, header, isCellEnabled)
    );
    const Minus_Columns = PnA.map(([name, header]) =>
      numberColumn(`Minus_${name}`, header, isCellEnabled)
    );

    const remainColumns = [
      // 다른 칸과 같은 방식으로 **입력하고 Enter 로 확정**한다.
      //
      // 목록(콤보박스)을 뒀다가 뺐다. 이 그리드는 편집 확정을 MUI 가 아니라
      // 자신의 rows 상태 + Enter 로 판정하는데, 목록은 키 입력이 없어 그 경로에
      // 얹히지 않는다. 편집 상태와 rows 를 따로 맞춰 줘야 하고, 확정 시점도
      // 달라 계속 어긋났다. 받는 값은 검증(isStiffTypeSelectable)이 좁힌다.
      textColumn("INITSTIFFTYPE", translate("Init_Stiff_Type"), 110),
      numberColumn("INITSTIFFNESS", translate("Init_Stiff"), isCellEnabled, 75),
      numberColumn("B", "β", isCellEnabled, 68),
      numberColumn("a", "α", isCellEnabled, 68),
      numberColumn("g", "λ", isCellEnabled, 68),
      numberColumn("Plus_gap", "(+)", isCellEnabled, 68),
      numberColumn("Minus_gap", "(-)", isCellEnabled, 68),
    ];
    setColumns(baseColumns.concat(Plus_Columns, Minus_Columns, remainColumns));
  };
  const initGroupColumns = () => {
    setGroupColumns([]);
    const Plus_children = [
      { field: "Plus_P1" },
      { field: "Plus_P2" },
      { field: "Plus_P3" },
      { field: "Plus_A1" },
      { field: "Plus_A2" },
      { field: "Plus_A3" },
    ];
    const Minus_children = [
      { field: "Minus_P1" },
      { field: "Minus_P2" },
      { field: "Minus_P3" },
      { field: "Minus_A1" },
      { field: "Minus_A2" },
      { field: "Minus_A3" },
    ];
    const groupColumn = [
      {
        groupId: "PnD_Plus",
        headerName: `(+) ${translate("Direction")}`,
        children: Plus_children,
      },
      {
        groupId: "PnD_Minus",
        headerName: `(-) ${translate("Direction")}`,
        children: Minus_children,
      },
      {
        groupId: "Gap",
        headerName: translate("Gap"),
        children: [{ field: "Plus_gap" }, { field: "Minus_gap" }],
      },
    ];

    setGroupColumns(groupColumn);
  };

  const isCellEnabled = (params: any) => {
    const disableField = params.field;

    // 초기강성은 사용자 지정(INITSTIFFTYPE == 3)일 때만 편집할 수 있다.
    // 타입 4(E·I)는 요소의 재료·단면에서, 타입 5 는 골격곡선에서 나오는 값이라
    // 이 칸에 넣어도 모델에 반영되지 않는다.
    if (disableField === "INITSTIFFNESS")
      return params.row?.INITSTIFF_EDITABLE === true;

    if (params.row["disable"] !== undefined) {
      if (params.row["disable"] === "Plus") {
        switch (disableField) {
          case "Plus_P1":
          case "Plus_P2":
          case "Plus_P3":
          case "Plus_A1":
          case "Plus_A2":
          case "Plus_A3":
          case "B":
          case "a":
          case "g":
          case "Plus_gap":
            return false;
          default:
            return true;
        }
      } else {
        switch (disableField) {
          case "Minus_P1":
          case "Minus_P2":
          case "Minus_P3":
          case "Minus_A1":
          case "Minus_A2":
          case "Minus_A3":
          case "B":
          case "a":
          case "g":
          case "Minus_gap":
            return false;
          default:
            return true;
        }
      }
    } else {
      if (params.row["SYMMETRIC_DISABLE"]) {
        switch (disableField) {
          case "Minus_P1":
          case "Minus_P2":
          case "Minus_P3":
          case "Minus_A1":
          case "Minus_A2":
          case "Minus_A3":
          case "Minus_gap":
            return false;
          default:
            break;
        }
      }

      if (params.row[disableField] === undefined) return false;
      else return true;
    }
  };

  // tableList 변경
  useEffect(() => {
    if (bChange === false) return;
    for (let row = 0; row < rows.length; row++) {
      // name
      const NAME: string = rows[row].NAME;
      // MATERIAL_TYPE
      const MATERIAL_TYPE: string = rows[row].MATERIAL_TYPE;

      // SYMMETRIC
      let symmetric: number = 0;
      Object.entries(SYMMETRIC).forEach(([key, value]) => {
        if (translate(value) === rows[row].SYMMETRIC) symmetric = parseInt(key);
      });
      if (
        NAME === "" ||
        NAME === undefined ||
        MATERIAL_TYPE === "" ||
        MATERIAL_TYPE === undefined
      )
        continue;

      // p_data
      const pData = [];
      for (let i = 1; i < 4; i++) {
        if (
          isEmpty(rows[row][`Plus_P${i}`]) ||
          isEmpty(rows[row][`Minus_P${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_P${i}`]) === false) {
            if (symmetric === 0) {
              pData.push([
                parseGridNumber(rows[row], `Plus_P${i}`),
                parseGridNumber(rows[row], `Plus_P${i}`),
              ]);
              continue;
            } else AlertFunc(false, -1, `Minus_P${i}`, noData);
          } else if (isEmpty(rows[row][`Minus_P${i}`]) === false)
            AlertFunc(false, -1, `Plus_P${i}`, noData);
          continue;
        } else {
          pData.push([
            parseGridNumber(rows[row], `Plus_P${i}`),
            symmetric === 0
              ? parseGridNumber(rows[row], `Plus_P${i}`)
              : parseGridNumber(rows[row], `Minus_P${i}`) * -1,
          ]);
        }
      }

      // A_data
      const aData = [];
      for (let i = 1; i < 4; i++) {
        if (
          isEmpty(rows[row][`Plus_A${i}`]) ||
          isEmpty(rows[row][`Minus_A${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_A${i}`]) === false) {
            if (symmetric === 0) {
              aData.push([
                parseGridNumber(rows[row], `Plus_A${i}`, true),
                parseGridNumber(rows[row], `Plus_A${i}`, true),
              ]);
              continue;
            } else AlertFunc(false, -1, `Minus_A${i}`, noData);
          } else if (isEmpty(rows[row][`Minus_A${i}`]) === false)
            AlertFunc(false, -1, `Plus_A${i}`, noData);
          continue;
        } else
          aData.push([
            parseGridNumber(rows[row], `Plus_A${i}`, true),
            symmetric === 0
              ? parseGridNumber(rows[row], `Plus_A${i}`, true)
              : parseGridNumber(rows[row], `Minus_A${i}`, true) * -1,
          ]);
      }

      if (pData.length !== aData.length) {
        const noData = "+ or - No Data";
        const col =
          pData.length > aData.length
            ? `Plus_A${aData.length + 1}`
            : `Plus_P${pData.length + 1}`;
        AlertFunc(false, -1, col, noData);
        continue;
      }

      // HISTORY_MODEL
      let HISTORY_MODEL: string = "";
      let HISTORY_MODEL_LNG: string = "";
      Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
        if (translate(value) === rows[row].HISTORY_MODEL) {
          const getKey = GetKeyFromLNG(value, pData.length + 1);
          if (key === getKey) {
            HISTORY_MODEL = key;
            HISTORY_MODEL_LNG = value;
          }
        }
      });
      if (HISTORY_MODEL === "") {
        const noData = `[P or α] Data don't match ${translate(
          "Hysteresis_model"
        )}`;
        const col = "HISTORY_MODEL";
        AlertFunc(false, row, col, noData);
        continue;
      }
      // Init Stiff
      //
      // 숫자로만 읽고 **쓸지 말지는 editedStiffness 가 정한다.** 여기서 거르면
      // 안 되는 이유는 한 번의 붙여넣기로 타입과 값이 같이 들어오기 때문이다 -
      // 행의 INITSTIFF_EDITABLE 은 직전 렌더에서 계산된 값이라 타입이 방금
      // User 가 된 행에서도 아직 false 다. 그걸 게이트로 쓰면 같은 붙여넣기의
      // 값이 조용히 잘려, 사용자는 같은 데이터를 두 번 붙여넣어야 했다.
      //
      // 계산값(E·I / Skeleton)이 실린 칸을 되쓸 걱정은 없다. 그 행은 타입이
      // User 가 아니라 editedStiffness 가 값 슬롯을 손대지 않고 빠져나간다.
      //
      // 빈 칸이나 숫자가 아닌 입력은 편집으로 치지 않는다. dataValid 는 "" 를
      // 통과시키는데(isNaN("") === false) 그대로 두면 NaN 이 저장 본문까지 간다.
      const initStiffInput = parseGridNumber(rows[row], "INITSTIFFNESS", true);
      const InitStiff = Number.isFinite(initStiffInput) ? initStiffInput : null;

      // PnD err check
      const [bErr, errCol, errMsg] = pndErrCheck(pData, aData, HISTORY_MODEL);
      if (!bErr) {
        AlertFunc(false, row, errCol, errMsg);
        continue;
      }

      // b, a, g, Plus_gap, Minus_gap- values
      const bBeta = getModelBeta(HISTORY_MODEL_LNG);
      const bAlpa = getModelAlpa(HISTORY_MODEL_LNG);
      const bGamma = getModelGamma(HISTORY_MODEL_LNG);
      const bInitGap = getModelInitGap(HISTORY_MODEL_LNG);

      const Beta = isEmpty(rows[row].B) ? 0.5 : parseGridNumber(rows[row], "B", true);
      const Alpa = isEmpty(rows[row].a) ? 1.0 : parseGridNumber(rows[row], "a", true);
      const Gamma = isEmpty(rows[row].g) ? 0.5 : parseGridNumber(rows[row], "g", true);
      const PlusGap = isEmpty(rows[row].Plus_gap)
        ? 0.0
        : parseGridNumber(rows[row], "Plus_gap", true);
      const MinusGap = isEmpty(rows[row].Minus_gap)
        ? 0.0
        : parseGridNumber(rows[row], "Minus_gap", true) * -1;

      // 초기강성 타입. 라벨이나 빈 칸으로 올 수 있어 숫자로 되돌린다.
      // null 이면 editedStiffness 가 원래 타입을 유지한다.
      const StiffType = parseStiffType(rows[row].INITSTIFFTYPE, translate);

      const dValues: any = {
        INITSTIFFNESS: InitStiff,
        INITSTIFFTYPE: StiffType,
        B: bBeta ? Beta : undefined,
        a: bAlpa ? Alpa : undefined,
        g: bGamma ? Gamma : undefined,
        Plus_gap: bInitGap ? PlusGap : undefined,
        Minus_gap: bInitGap ? MinusGap : undefined,
      };

      if (bChange === true)
        updateTableList(
          row,
          NAME,
          MATERIAL_TYPE,
          HISTORY_MODEL,
          symmetric,
          pData,
          aData,
          dValues
        );
    }
    if (bChange === true) {
      setbChange(false);
      setbEnter(false);
    }
  // bChange 트리거로만 실행한다 (편집 확정 시 검증 → TableList 반영).
  // rows/updateTableList 를 넣으면 편집 중 매 렌더 재실행된다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bChange]);

  /**
   * 초기강성 편집 결과를 DATA 에 얹을 조각으로 만든다.
   *
   * 타입과 값이 함께 움직인다 - 타입을 User 로 바꾸면 그 순간 화면에 보이던
   * 값이 사용자 지정값이 되고, 다른 타입으로 바꾸면 값은 CIVIL 이 정하므로
   * 우리가 쓰지 않는다.
   *
   * `K0` 까지 같이 갱신하는 이유는 그래프 x축 배율이 이 값이기 때문이다.
   * 안 건드리면 편집 직후엔 곡선이 그대로였다가 저장 후 재조회에서야 움직인다.
   */
  const editedStiffness = (prev: any, dValues: any, isNew = false) => {
    let type = dValues.INITSTIFFTYPE ?? prev.INITSTIFFTYPE;

    // 초기강성 칸에 **값을 직접 넣으면** 타입이 사용자 지정으로 바뀐다.
    //
    // 그 칸에 숫자를 적는다는 건 "이 값을 쓰겠다"는 뜻이다. 타입을 먼저 바꾸라고
    // 요구하면 붙여넣기로는 방법이 없다 - 값만 담긴 열을 붙여넣을 수 없게 된다.
    //
    // 두 가지는 전환하지 않는다.
    //
    //  - 화면에 보이던 값과 같으면 편집이 아니다. 편집하지 않은 행도 표가 바뀔
    //    때마다 이 경로를 지나므로, 그것까지 바꾸면 안 건드린 행의 산정 방식이
    //    통째로 뒤집힌다.
    //  - 타입 자체를 **바꿔서** 넣었으면 그 뜻이 우선이다. 값이 함께 왔더라도
    //    그 값은 이전 타입이 계산해 둔 것이다 (E*I 행을 통째로 복사한 경우).
    //    신규 행도 같다 - 복사해 온 타입을 그대로 쓴다.
    const typeChanged =
      dValues.INITSTIFFTYPE != null &&
      dValues.INITSTIFFTYPE !== prev.INITSTIFFTYPE;

    if (type !== INIT_STIFF_TYPE.USER && !typeChanged && !isNew) {
      const shownValue = Array.isArray(prev.K0) ? prev.K0[0] : undefined;
      const typed = dValues.INITSTIFFNESS;
      if (
        typeof typed === "number" &&
        Number.isFinite(typed) &&
        typed !== shownValue
      )
        type = INIT_STIFF_TYPE.USER;
    }

    if (type !== INIT_STIFF_TYPE.USER) {
      // 사용자 지정이 아니면 값 슬롯은 그대로 둔다. K0 는 재조회 때 다시 계산된다.
      return { INITSTIFFTYPE: type };
    }

    // 편집값이 없으면(칸이 비었거나 방금 User 로 바꿨으면) 화면에 보이던 값을
    // 그대로 사용자 지정값으로 삼는다 - 보이는 대로 저장되는 게 예측 가능하다.
    const shown = Array.isArray(prev.K0) ? prev.K0[0] : undefined;
    const value =
      dValues.INITSTIFFNESS !== null
        ? dValues.INITSTIFFNESS
        : prev.K0_INPUT ?? shown ?? null;

    if (typeof value !== "number" || !Number.isFinite(value))
      return { INITSTIFFTYPE: type };

    // 사용자 지정 초기강성은 부호를 가리지 않는다.
    return { INITSTIFFTYPE: type, K0_INPUT: value, K0: [value, value] };
  };

  const updateTableList = (
    row: number,
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    aData: Array<Array<number>>,
    dValues: any
  ) => {
    if (
      isEmpty(NAME) ||
      isEmpty(MATERIAL_TYPE) ||
      isEmpty(HISTORY_MODEL) ||
      pData.length === 0 ||
      aData.length === 0
    )
      return;
    if (filterList === undefined || row > filterList.length - 1) {
      // add
      addTable(
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        SYMMETRIC,
        pData,
        aData,
        dValues
      );
    } else {
      // modify
      modifyTable(
        row,
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        SYMMETRIC,
        pData,
        aData,
        dValues
      );
    }
  };
  const addTable = (
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    aData: Array<Array<number>>,
    dValues: any
  ) => {
    setTableList((preTable: any) => ({
      ...preTable,
      [TableType]: preTable[TableType]
        ? [
            ...preTable[TableType],
            {
              NAME: NAME,
              MATERIAL_TYPE: MATERIAL_TYPE,
              HISTORY_MODEL: HISTORY_MODEL,
              DATA: {
                SYMMETRIC: SYMMETRIC,
                // 붙여넣거나 입력한 초기강성 타입/값을 그대로 싣는다.
                //
                // 예전에는 여기서 dValues 를 아예 보지 않아, 다른 행을 통째로
                // 복사해 새 행에 붙여넣어도 초기강성만 빠졌다.
                //
                // 타입을 안 넣었으면 사용자 지정(3)으로 시작한다. 비워 두면
                // CIVIL 이 구조체 기본값 0(6EI/L)을 쓰는데(DB_ST_DT_ITHA.h:3802,
                // 검증 경로도 보정하지 않는다), 6EI/L 은 Lumped 전용이라 이
                // 플러그인이 다루는 DIST·TRUSS·SPR 에는 맞지 않는다.
                ...editedStiffness(
                  { INITSTIFFTYPE: dValues.INITSTIFFTYPE ?? INIT_STIFF_TYPE.USER },
                  dValues,
                  true
                ),
                // 값 슬롯의 서버 기본값. 실제로 쓸 값은 K0_INPUT 으로 가고,
                // 어느 슬롯에 되쓸지는 힌지 타입이 정한다 (py_stiffness.userSlot).
                INITSTIFFNESS: 1,
                BETA: dValues.B,
                ALPA: dValues.a,
                GAMMA: dValues.g,
                INIT_GAP: [dValues.Plus_gap, dValues.Minus_gap],
                P_DATA: pData,
                A_DATA: aData,
                PND: pData.length,
              },
            },
          ]
        : [
            {
              NAME: NAME,
              MATERIAL_TYPE: MATERIAL_TYPE,
              HISTORY_MODEL: HISTORY_MODEL,
              DATA: {
                SYMMETRIC: SYMMETRIC,
                // 붙여넣거나 입력한 초기강성 타입/값을 그대로 싣는다.
                //
                // 예전에는 여기서 dValues 를 아예 보지 않아, 다른 행을 통째로
                // 복사해 새 행에 붙여넣어도 초기강성만 빠졌다.
                //
                // 타입을 안 넣었으면 사용자 지정(3)으로 시작한다. 비워 두면
                // CIVIL 이 구조체 기본값 0(6EI/L)을 쓰는데(DB_ST_DT_ITHA.h:3802,
                // 검증 경로도 보정하지 않는다), 6EI/L 은 Lumped 전용이라 이
                // 플러그인이 다루는 DIST·TRUSS·SPR 에는 맞지 않는다.
                ...editedStiffness(
                  { INITSTIFFTYPE: dValues.INITSTIFFTYPE ?? INIT_STIFF_TYPE.USER },
                  dValues,
                  true
                ),
                // 값 슬롯의 서버 기본값. 실제로 쓸 값은 K0_INPUT 으로 가고,
                // 어느 슬롯에 되쓸지는 힌지 타입이 정한다 (py_stiffness.userSlot).
                INITSTIFFNESS: 1,
                BETA: dValues.B,
                ALPA: dValues.a,
                GAMMA: dValues.g,
                INIT_GAP: [dValues.Plus_gap, dValues.Minus_gap],
                P_DATA: pData,
                A_DATA: aData,
                PND: pData.length,
              },
            },
          ],
    }));
  };

  const modifyTable = (
    row: number,
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    aData: Array<Array<number>>,
    dValues: any
  ) => {
    setTableList((preTable: any) => ({
      ...preTable,
      [TableType]: preTable[TableType].map((item: any, idx: number) => ({
        ...item,
        NAME: idx === row ? NAME : item.NAME,
        MATERIAL_TYPE: idx === row ? MATERIAL_TYPE : item.MATERIAL_TYPE,
        HISTORY_MODEL: idx === row ? HISTORY_MODEL : item.HISTORY_MODEL,
        DATA: {
          ...item.DATA,
          SYMMETRIC: idx === row ? SYMMETRIC : item.DATA.SYMMETRIC,
          // 초기강성 편집값은 K0_INPUT 으로 간다. 어느 서버 슬롯에 되쓸지는
          // K0_SLOT 이 정하고(py_stiffness), INITSTIFFNESS 원본은 왕복을 위해
          // 손대지 않는다. 편집 대상이 아닌 행은 null 이 와도 원본을 지킨다.
          ...(idx === row ? editedStiffness(item.DATA, dValues) : {}),
          BETA: idx === row ? dValues.B : item.DATA.BETA,
          ALPA: idx === row ? dValues.a : item.DATA.ALPA,
          GAMMA: idx === row ? dValues.g : item.DATA.GAMMA,
          INIT_GAP:
            idx === row
              ? [dValues.Plus_gap, dValues.Minus_gap]
              : item.DATA.INIT_GAP,
          P_DATA: idx === row ? pData : item.DATA.P_DATA,
          A_DATA: idx === row ? aData : item.DATA.A_DATA,
          PND: idx === row ? pData.length : item.DATA.PND,
        },
      })),
    }));
  };

  const DataValid = (row: any, col: string, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    if (InputValue === undefined) dbUpdate = true;

    switch (col) {
      case "id":
      case "pnd":
      case "disable":
      case "SYMMETRIC_DISABLE":
        dbUpdate = true;
        break;
      case "NAME": // name
        if (!isEmpty(InputValue)) dbUpdate = true;
        break;
      case "MATERIAL_TYPE": // material
        if (InputValue === "RC" || InputValue === "S") dbUpdate = true;
        break;
      case "HISTORY_MODEL": // historyType
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
          if (translate(value) === InputValue) {
            const nPnd = ALL_Histroy_PND[key];
            const getKey = GetKeyFromLNG(value, nPnd);
            if (key === getKey) dbUpdate = true;
          }
        });
        break;
      case "SYMMETRIC": // SYMMETRIC
        let sysValue = "";
        Object.entries(SYMMETRIC).forEach(([key, value]) => {
          if (translate(value) === InputValue) {
            sysValue = value;
            dbUpdate = true;
          }
        });
        const HISTORY_MODEL = row.HISTORY_MODEL;
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
          if (translate(value) === HISTORY_MODEL) {
            const nPnd = ALL_Histroy_PND[key];
            const getKey = GetKeyFromLNG(value, nPnd);
            if (key === getKey) {
              if (
                sysValue === "Symmetric" &&
                (getKey === "SLBT" ||
                  getKey === "SLTT" ||
                  getKey === "SLBC" ||
                  getKey === "SLTC")
              )
                dbUpdate = false;
            }
          }
        });
        break;
      case "INITSTIFFTYPE":
        // 목록에서 고른 숫자, 표에 보이는 라벨("User"), 붙여넣기가 채운 빈 칸을
        // 모두 받는다. 빈 칸은 "변경 없음"이다 - 거부하면 열을 다 채우지 않는
        // 붙여넣기가 통째로 취소된다.
        if (isStiffTypeAllowed(InputValue, translate)) dbUpdate = true;
        break;
      case "INITSTIFFNESS":
        // 숫자 외에 산정 방식 이름(E*I / Skeleton / 6EI/L ...)도 이 칸에 뜬다.
        // 거부하면 그 행 위에서 Enter 를 누를 때마다 행 전체가 롤백된다.
        if (isStiffValueAllowed(InputValue)) dbUpdate = true;
        break;
      case "B": // B
      case "a": // a
      case "g": // a
      case "Plus_gap": // b1
      case "Minus_gap": // b2
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          // plus, minus check
          if (col === "Plus_gap" || col === "Minus_gap") {
            const fieldPM = col.split("_")[0];
            if (fieldPM === "Plus" && InputValue < 0) break;
            if (fieldPM === "Minus" && InputValue > 0) break;

            if (row["disable"] !== undefined) {
              if (
                row["disable"] === fieldPM &&
                rows[row.id][col] !== InputValue
              )
                break;
            }
          }
          let bBeta = false;
          let bAlpa = false;
          let bGamma = false;
          let bInitGap = false;
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              bBeta = getModelBeta(value);
              bAlpa = getModelAlpa(value);
              bGamma = getModelGamma(value);
              bInitGap = getModelInitGap(value);
            }
          });
          if (bInitGap && col === "Plus_gap") dbUpdate = true;
          if (bInitGap && col === "Minus_gap") dbUpdate = true;

          if (
            col === "B" &&
            bBeta &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
          if (
            col === "a" &&
            bAlpa &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
          if (
            col === "g" &&
            bGamma &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
        }
        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          const fieldPM = col.split("_")[0];
          if (fieldPM === "Plus" && InputValue <= 0) break;
          if (fieldPM === "Minus" && InputValue >= 0) break;

          if (row["disable"] !== undefined) {
            if (row["disable"] === fieldPM && rows[row.id][col] !== InputValue)
              break;
          } else {
            if (
              row["SYMMETRIC_DISABLE"] &&
              fieldPM === "Minus" &&
              rows[row.id][col] !== InputValue
            )
              break;
          }

          // data check
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              const nPnd = ALL_Histroy_PND[key];
              const getKey = GetKeyFromLNG(value, nPnd);
              if (key === getKey) {
                if (parseInt(col.slice(-1)) <= nPnd - 1) dbUpdate = true;
              }
            }
          });
        }

        if (InputValue === "") {
          const HISTORY_MODEL = row.HISTORY_MODEL;
          let minPnd = 10;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              const nPnd = ALL_Histroy_PND[key] - 1;
              minPnd = Math.min(minPnd, nPnd);
            }
          });
          if (minPnd < parseInt(col.slice(-1))) dbUpdate = true;
          if (parseInt(col.slice(-1)) <= minPnd) dbUpdate = false;
        }
        break;
    }

    AlertFunc(dbUpdate, row.id, col, InputValue);
    return dbUpdate;
  };

  const pndErrCheck = (
    pData: number[][],
    aData: number[][],
    HISTORY_MODEL: string
  ): any[] => {
    const PnD = pData.length;
    switch (PnD) {
      case 3:
        if (pData[1][0] > pData[2][0]) return [false, "Plus_P2", "P2 > P3"];
        if (pData[1][1] > pData[2][1]) return [false, "Minus_P2", "P2 > P3"];

      // falls through — 낮은 차수의 제약도 누적 검증한다 (4점 -> 3점 -> 2점). break 를 넣으면 검증이 빠진다.
      case 2:
        if (pData[0][0] > pData[1][0]) return [false, "Plus_P1", "P1 > P2"];
        if (pData[0][1] > pData[1][1]) return [false, "Minus_P1", "P1 > P2"];

        break;
      default:
        break;
    }
    return [true, "", ""];
  };

  // alert
  const {
    checkboxSet,
    onKeyDown,
    onRowChange,
    pasteProps,
    setbEnter,
  } =
    useGridEditing({
      rows,
      apiRef,
      setRows,
      columns,
      cursur,
      field,
      requiredFields: ["MATERIAL_TYPE", "HISTORY_MODEL", "SYMMETRIC"],
      // 붙여넣기는 값을 **새로 넣는** 자리라 타입을 둘로 좁힌다.
      // (dataValid 는 표에 이미 떠 있는 타입을 전부 통과시켜야 한다 - 그 행 위에서
      //  편집을 확정하면 행 전체가 검증을 타기 때문이다.)
      pasteValid: (row: any, col: string, InputValue: any) =>
        col === "INITSTIFFTYPE"
          ? isStiffTypeSelectable(InputValue, translate)
          : DataValid(row, col, InputValue),
      dataValid: DataValid,
      initRows,
      alert: AlertFunc,
    });

  return (
    <GuideBox
      height={hidden ? "800px" : "650px"}
      width={"100%"}
      loading={!RequestBtn || Busy}
    >
      {filterList === undefined && RequestBtn && (
        <Grid width={"100%"}>
          <Alert
            style={{
              transition: "opacity 0.5s ease-out",
              opacity: 1,
            }}
            severity="error"
          >
            {translate("TabStiff") + translate("request_noData")}
          </Alert>
        </Grid>
      )}
      {RequestBtn && (
        <div {...pasteProps}>
          {/* paste 이벤트는 pasteProps 로 처리 */}
          <DataGrid
            apiRef={apiRef}
            rows={rows} // rows
            columns={columns} // columns
            columnGroupingModel={groupColumns} // header group text
            // 다른 칸의 기존 동작은 그대로 두고 초기강성만 잠근다.
            isCellEditable={(params) =>
              params.field === "INITSTIFFNESS" ? isCellEnabled(params) : true
            }
            columnGroupHeaderHeight={56} // header group height
            rowHeight={30}
            sx={DataGridStyle} // style
            editMode="row" // edit mode
            ignoreValueFormatterDuringExport // copy paste setting
            disableRowSelectionOnClick // click no row
            checkboxSelection // checkbox setting
            rowSelectionModel={CheckBox} // checkbox value
            onRowSelectionModelChange={(selectedID: any) => {
              checkboxSet(selectedID);
            }} // checkbox 이벤트
            // pagination // page setting
            // autoPageSize // auto page
            onCellClick={onClickCell} // cell click 이벤트
            onCellKeyDown={(params, event, details) =>
              onKeyDown(params, event, details)
            } // enter 이벤트
            onRowModesModelChange={(rowModesModel, details) =>
              onRowChange(rowModesModel, details)
            } // blur 이벤트
            slots={{
              toolbar: alertToolbar, // toolbar
            }}
            disableColumnSorting // disable sort
          />
        </div>
      )}
    </GuideBox>
  );
};

export default StiffDataGrid;
