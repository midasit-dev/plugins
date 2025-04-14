import React, { useEffect } from "react";
import { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { useRecoilState } from "recoil";
import { pileLocationState } from "../../states";
import { PileLocRefXItems, PileLocRefYItems } from "../../constants";
import { GuideBox, DropList, TabGroup, Tab } from "@midasit-dev/moaui";
import {
  CustomDataGrid,
  CustomCheckBox,
  CustomTextField,
  CustomDropList,
  CustomNumberField,
} from "../../components";
import { useTranslation } from "react-i18next";

const PileReinforced = () => {
  const [rows, setRows] = useRecoilState(pileLocationState);
  const { t } = useTranslation();

  return <GuideBox></GuideBox>;
};

export default PileReinforced;
