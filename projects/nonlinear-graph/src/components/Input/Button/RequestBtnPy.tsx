import { Button } from "@midasit-dev/moaui";
import { dbRead } from "../../../utils_pyscript";

const RequestBtnPy = ({ setexampleAPI }: any) => {
  const onClick = () => {
    if (pyscript && pyscript.interpreter) {
      const result = dbRead("UNIT");
      const aResultKey = Object.keys(result);
      let data: Array<object> = [];
      aResultKey.forEach((key) => data.push(result[key]));
      setexampleAPI([data]);
    }
  };
  return (
    <div>
      <Button onClick={onClick}>RequestBtn</Button>
      <br />
    </div>
  );
};

export default RequestBtnPy;
