import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
} from "@midasit-dev/moaui";
import { useState } from "react";

const DefalutTable = () => {
  /**
   * Don't interaction!
   * just view data
   */
  const [value, setValue] = useState(1);
  function onChangeHandler(event: any) {
    //setValue(event);
  }
  return (
    <div>
      {/* {Radio Components} */}
      Table
      <Table
        padding="normal"
        // onClick={onChangeHandler}
        // onKeyDown={onChangeHandler} // 안됨...
      >
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>head 1</Typography>
            </TableCell>
            <TableCell>
              <Typography>head 2</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography>body 1</Typography>
            </TableCell>
            <TableCell>
              <Typography>body 2</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default DefalutTable;
