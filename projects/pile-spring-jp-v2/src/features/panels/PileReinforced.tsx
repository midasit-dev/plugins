import React from "react";
import { CustomTable } from "../../components";
import { usePileReinforced } from "../../hooks/usePileReinforced";
import { GuideBox } from "@midasit-dev/moaui";

const PileReinforced = () => {
  const { rows, renderRow, getHeaders } = usePileReinforced();

  return (
    <CustomTable rows={rows} renderRow={renderRow} headers={getHeaders()} />
  );
};

export default PileReinforced;
