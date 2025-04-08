import React from "react";
import { GridColDef, GridColumnGroupingModel } from "@mui/x-data-grid";
import { useRecoilState } from "recoil";
import { pileLocationState } from "../../states";
import { PileRefPointLongItems, PileRefPointTranItems } from "../../constants";
import { GuideBox, DropList, TabGroup, Tab } from "@midasit-dev/moaui";
import { CustomDataGrid, CustomCheckBox } from "../../components";

const PileLocation = () => {
  const [rows, setRows] = useRecoilState(pileLocationState);

  const baseColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "",
    },
  ];

  return (
    <GuideBox>
      <CustomDataGrid
        height={190}
        width={"100%"}
        rows={[]}
        columns={baseColumns}
      />
    </GuideBox>
  );
};

export default PileLocation;
