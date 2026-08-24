import { atom, selector } from "recoil";

export const UnitState = atom<any>({
  key: "UnitState",
  default: {},
});

export const LanguageState = atom<string>({
  key: "LanguageState",
  default: "jp",
});

export const TableTypeState = atom<number>({
  key: "TableTypeState",
  default: 1,
});

export const PointState = atom<number>({
  key: "PointState",
  default: 2,
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

export const RequestBtnState = atom<boolean>({
  key: "RequestBtnState",
  default: false,
});

/**
 * 요청이 진행 중인지. Request / Change 가 시작할 때 켜고 끝날 때 끈다.
 *
 * RequestBtnState 는 "한 번이라도 조회했는가"를 나타내는 1회성 플래그라
 * 두 번째 이후 요청에는 아무 표시가 없다. 전송 계층이 비동기가 된 뒤에는
 * 화면이 멈추지도 않으므로, 진행 중임을 알리고 중복 요청을 막는 상태가 따로 필요하다.
 */
export const BusyState = atom<boolean>({
  key: "BusyState",
  default: false,
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
  default: 5,
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
