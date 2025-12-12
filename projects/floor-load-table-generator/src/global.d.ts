// global.d.ts
import React from "react";

declare global {
  const pyscript: any;
}

// Font file declarations
declare module "*.ttf" {
  const content: string;
  export default content;
}
