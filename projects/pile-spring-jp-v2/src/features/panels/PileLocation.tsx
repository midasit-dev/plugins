import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
import { CustomTable } from "../../components";
import { usePileLocation } from "../../hooks/usePileLocation";

const PileLocation = () => {
  const { rows, renderRow, getHeaders } = usePileLocation();

  return (
    <GuideBox>
      <CustomTable rows={rows} renderRow={renderRow} headers={getHeaders()} />
    </GuideBox>
  );
};

export default PileLocation;
