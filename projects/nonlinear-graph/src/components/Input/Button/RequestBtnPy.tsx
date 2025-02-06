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
} from "../../../values/RecoilValue";
import { isEmpty } from "lodash";

const RequestBtnPy = () => {
  const ElementValue = useRecoilValue(ElementState);
  const ComponentValue = useRecoilValue(ComponentState);
  const [RequestBtn, setRequestBtn] = useRecoilState(RequestBtnState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [UnitData, setUnitData] = useRecoilState(UnitState);

  const { t: translate, i18n: internationalization } = useTranslation();
  const requestBtn = translate("requestBtn");
  const onClick = () => {
    if (pyscript && pyscript.interpreter) {
      Get_UNIT();
      Get_IEHP();
      setRequestBtn(true);
    }
  };

  const Get_UNIT = async () => {
    try {
      const getData = dbRead("UNIT");
      setUnitData(getData["1"]);
    } catch (error) {
      console.error("Failed to load UNIT data", error);
    }
  };

  const Get_IEHP = async () => {
    try {
      const tableData = getIEHP(ElementValue, ComponentValue - 1);
      if (!isEmpty(tableData)) setTableList(tableData);
    } catch (error) {
      console.error("Failed to load IEHP data", error);
    }
  };

  return (
    <GuideBox horLeft margin={2}>
      <Button onClick={onClick}>{requestBtn}</Button>
    </GuideBox>
  );
};

export default RequestBtnPy;
