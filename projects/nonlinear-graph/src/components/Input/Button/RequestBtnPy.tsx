import { Button, GuideBox } from "@midasit-dev/moaui";
import { dbRead, getIEHP } from "../../../utils_pyscript";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  UnitState,
  TableListState,
  RequestBtnState,
  BusyState,
} from "../../../values/RecoilValue";

const RequestBtnPy = () => {
  const ElementValue = useRecoilValue(ElementState);
  const ComponentValue = useRecoilValue(ComponentState);
  const [, setRequestBtn] = useRecoilState(RequestBtnState);
  const [Busy, setBusy] = useRecoilState(BusyState);
  const [, setTableList] = useRecoilState(TableListState);
  const [, setUnitData] = useRecoilState(UnitState);

  const { t: translate } = useTranslation();
  const requestBtn = translate("requestBtn");
  const onClick = async () => {
    if (!(pyscript && pyscript.interpreter)) return;
    if (Busy) return;
    setBusy(true);
    try {
      // 전송 계층이 비동기라 순차로 기다린다. 같은 API 를 동시에 두 번 치지 않는다.
      await Get_UNIT();
      await Get_IEHP();
      setRequestBtn(true);
    } finally {
      setBusy(false);
    }
  };

  const Get_UNIT = async () => {
    try {
      const getData = await dbRead("UNIT");
      setUnitData(getData["1"]);
    } catch (error) {
      console.error("Failed to load UNIT data", error);
    }
  };

  const Get_IEHP = async () => {
    try {
      const tableData = await getIEHP(ElementValue, ComponentValue - 1);
      setTableList(tableData);
    } catch (error) {
      console.error("Failed to load IEHP data", error);
    }
  };

  return (
    <GuideBox horLeft margin={2}>
      <Button onClick={onClick} disabled={Busy} loading={Busy}>
        {requestBtn}
      </Button>
    </GuideBox>
  );
};

export default RequestBtnPy;
