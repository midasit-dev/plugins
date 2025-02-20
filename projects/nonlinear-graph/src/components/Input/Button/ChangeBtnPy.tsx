import { GuideBox } from "@midasit-dev/moaui";
import { Button, Alert } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  TableListState,
  TableErrState,
} from "../../../values/RecoilValue";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DoRequest, getIEHP } from "../../../utils_pyscript";
import { isEmpty } from "lodash";

const ChangeBtnPy = () => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const ElementValue = useRecoilValue(ElementState);
  const ComponentValue = useRecoilValue(ComponentState);
  const TableErr = useRecoilValue(TableErrState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bBtn, setbBtn] = useState(false);

  const TableErrMsg = translate("TableErrState");
  const changeDBBtn = translate("changeDBBtn");

  useEffect(() => {
    if (bBtn) {
      if (!isEmpty(TableList)) {
        request();
      }
    }
    setbBtn(false);
  }, [bBtn]);

  const request = async () => {
    try {
      const result = await DoRequest(
        ElementValue,
        ComponentValue - 1,
        TableList
      );
      if (result["result"] !== "success") throw Error("request error");
      // update table
      const tableData = getIEHP(ElementValue, ComponentValue - 1);
      setTableList(tableData);
    } catch (err) {
      console.error("Failed to chage IEHP data", err);
    }
  };

  // event
  async function onClickChange() {
    if (TableErr) {
    } else {
      setbBtn(true);
    }
  }

  return (
    <GuideBox horRight row spacing={5}>
      {TableErr && (
        <Alert
          style={{
            width: "100%",
            height: "45px",
            transition: "opacity 0.5s ease-out",
            opacity: 1,
          }}
          severity="error"
        >
          {TableErrMsg}
        </Alert>
      )}
      <Button
        disabled={TableErr ? true : false}
        sx={BtnStyle}
        onClick={onClickChange}
      >
        {changeDBBtn}
      </Button>
    </GuideBox>
  );
};

const BtnStyle: any = {
  textTransform: "none",
  backgroundColor: "#EEEEEE",
  color: "#1F2937",
  width: "300px", // 버튼의 너비
  height: "45px",
  borderRadius: "10px", // 버튼의 모서리 둥글기
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ":hover": {
    backgroundColor: "#5F666B",
    color: "#FFFFFF",
    border: "1px solid #5F666B",
  },
};

export default ChangeBtnPy;
