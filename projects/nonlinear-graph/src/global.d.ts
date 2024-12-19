// global.d.ts
import React from "react";

declare global {
  const pyscript: any;
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_MUI_LICENSE: string;
  }
}
