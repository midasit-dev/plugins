import { TextField } from "@midasit-dev/moaui";
import { isNumber } from "lodash";
import { useState } from "react";

const DefalutTextEdit = ({ setexamplePython }: any) => {
  function onChangeHandler(event: any) {
    if (!isNaN(parseInt(event.target.value))) {
      setexamplePython(parseInt(event.target.value));
    } else {
      setexamplePython(0);
    }
  }
  return (
    <div>
      {/* {TextEdit Components} */}
      <TextField
        onChange={onChangeHandler}
        spacing={1}
        textAlign="left"
        title=""
        titlePosition="left"
        type="text"
      />
    </div>
  );
};

export default DefalutTextEdit;
