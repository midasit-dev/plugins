import { GuideBox } from "@midasit-dev/moaui";
import { Button, Alert } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  TableListState,
  TableErrState,
  BusyState,
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
  const [Busy, setBusy] = useRecoilState(BusyState);
  const [bBtn, setbBtn] = useState(false);
  /** 저장 결과 알림. 성공/실패 모두 사용자에게 보여 준다. */
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState(false);

  const TableErrMsg = translate("TableErrState");
  const changeDBBtn = translate("changeDBBtn");

  // 그리드 알림과 같은 5초 후 자동 소멸
  useEffect(() => {
    if (saveMsg === "") return;
    const timer = setTimeout(() => setSaveMsg(""), 5000);
    return () => clearTimeout(timer);
  }, [saveMsg]);

  useEffect(() => {
    if (bBtn) {
      if (!isEmpty(TableList)) {
        request();
      }
    }
    setbBtn(false);
  }, [bBtn]);

  /**
   * DoRequest 가 돌려준 message 배열을 사용자에게 보여 줄 한 줄로 만든다.
   * 성분 불일치는 조치 방법이 정해져 있어 전용 문구로 바꿔 준다.
   */
  const toUserMessage = (messages: any): string => {
    const list: string[] = Array.isArray(messages)
      ? messages.map((m) => (typeof m === "string" ? m : JSON.stringify(m)))
      : [];
    if (list.some((m) => m.includes("ELEMENT_COMPONENT_MISMATCH")))
      return translate("save_mismatch");
    const detail = list.join(" / ");
    return isEmpty(detail)
      ? translate("save_failed")
      : `${translate("save_failed")} ${detail}`;
  };

  const request = async () => {
    setBusy(true);
    try {
      const result = await DoRequest(
        ElementValue,
        ComponentValue - 1,
        TableList
      );
      if (result["result"] !== "success") {
        setSaveError(true);
        setSaveMsg(toUserMessage(result["message"]));
        console.error("Failed to change IEHP data", result);
        return;
      }
      // update table
      const tableData = await getIEHP(ElementValue, ComponentValue - 1);
      setTableList(tableData);
      setSaveError(false);
      setSaveMsg(translate("success_save_data"));
    } catch (err) {
      setSaveError(true);
      setSaveMsg(translate("save_failed"));
      console.error("Failed to change IEHP data", err);
    } finally {
      setBusy(false);
    }
  };

  // event
  async function onClickChange() {
    if (TableErr || Busy) {
    } else {
      setbBtn(true);
    }
  }

  return (
    <GuideBox horRight row spacing={5}>
      {saveMsg !== "" && (
        <Alert
          style={{
            width: "100%",
            height: "45px",
            transition: "opacity 0.5s ease-out",
            opacity: 1,
          }}
          severity={saveError ? "error" : "success"}
        >
          {saveMsg}
        </Alert>
      )}
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
        disabled={TableErr || Busy}
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
