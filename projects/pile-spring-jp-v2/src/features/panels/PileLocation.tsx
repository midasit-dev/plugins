import React from "react";
import { CustomTable } from "../../components";
import { usePileLocation } from "../../hooks/usePileLocation";
import { GuideBox } from "@midasit-dev/moaui";

const PileLocation = () => {
  const { rows, renderRow, getHeaders } = usePileLocation();

  return (
    <CustomTable rows={rows} renderRow={renderRow} headers={getHeaders()} />
  );
};

export default PileLocation;
