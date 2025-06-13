import { CustomTable } from "../../components";
import { usePileLocation } from "../../hooks/usePileLocation";

const PileLocation = () => {
  const { rows, renderRow, getHeaders } = usePileLocation();

  return (
    <CustomTable
      totalWidth={540}
      rows={rows}
      renderRow={renderRow}
      headers={getHeaders()}
    />
  );
};

export default PileLocation;
