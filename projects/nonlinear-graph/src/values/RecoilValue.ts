import { atom, selector } from "recoil";
import { dbRead } from "../utils_pyscript";

export const UnitState = atom<any>({
  key: "UnitState",
  default: {},
});

export const GetDBState = atom<object>({
  key: "GetDBState",
  default: {},
});

export const TableTypeState = atom<number>({
  key: "TableTypeState",
  default: 1,
});

export const PointState = atom<number>({
  key: "PointState",
  default: 1,
});

export const TableListState = atom<any>({
  key: "TableListState",
  default: {},
});

export const filteredTableListState = selector({
  key: "filteredTableListState",
  get: ({ get }) => {
    const type = get(TableTypeState);
    const list = get(TableListState);

    if (list !== undefined) {
      switch (type) {
        case 1:
          return list[type];
        case 2:
          return list[type];
        case 3:
          return list[type];
        default:
          return list;
      }
    }
  },
});

export const TableChangeState = atom<boolean>({
  key: "tableChangeState",
  default: false,
});

export const ElementState = atom<number>({
  key: "ElementState",
  default: 1,
});

export const ComponentState = atom<number>({
  key: "ComponentValue",
  default: 1,
});

export const CheckBoxState = atom<number[]>({
  key: "CheckBoxState",
  default: [],
});

export const HiddenBtnState = atom<boolean>({
  key: "HiddenBtnState",
  default: false,
});

export const TableErrState = atom<boolean>({
  key: "TableErrState",
  default: false,
});
