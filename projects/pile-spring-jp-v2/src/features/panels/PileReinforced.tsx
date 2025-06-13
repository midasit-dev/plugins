import { CustomTable } from "../../components";
import { usePileReinforced } from "../../hooks/usePileReinforced";

const PileReinforced = () => {
  const { rows, renderRow, getHeaders } = usePileReinforced();

  return (
    <CustomTable
      totalWidth={540}
      rows={rows}
      renderRow={renderRow}
      headers={getHeaders()}
    />
  );
};

export default PileReinforced;
