import React from "react";
import { Dialog, TabGroup, Tab, Typography } from "@midasit-dev/moaui";
import {
  sdm_table3_17,
  sdm_table3_18,
  sdm_table3_19,
  sdm_table3_20,
  sdm_table3_21,
  sdm_figure3_2,
  sdm_clause352_5,
  sdm_clause352_6,
} from "./svg";

const HelpSuperstructType = (open: any, setOpen: any) => {
  const typeConctent = `According to SDMHR 2013 rev 5,  the superstructure type
                            is classified into three types.`;
  const type1Content = `1a: Steel deck on steel girders
                        1b: Steel deck on steel truss or plate girders`;
  const type2Content = `2: Concrete deck on steel box, truss or plate girders`;
  const type3Content = `3a: Concrete slab
                        3b: Concrete beams
                        3c: Concrete box girder`;

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      json={{
        type: "help",
        data: {
          titleText: "Superstructure Type",
          body: [
            {
              type: "single",
              title: "Superstructure Type",
              content: typeConctent,
            },
            { type: "single", title: "Type 1", content: type1Content },
            { type: "single", title: "Type 2", content: type2Content },
            { type: "single", title: "Type 3", content: type3Content },
          ],
        },
      }}
    />
  );
};

const HelpStructType = (open: any, setOpen: any) => {
  const typeConctent = `According to SDMHR 2013 rev 5, the structure type is
                        classified into two types.`;
  const type1Content = `Normal structure except minor structures`;
  const type2Content = `Minor structures such as:
                        (a) foot/cycle track bridges
                        (b) carriageway joints and similar equipment likey
                            to be replaced during the life of the strcutre
                        (c) erection loading`;

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      json={{
        type: "help",
        data: {
          titleText: "Structure Type",
          body: [
            { type: "single", title: "Structure Type", content: typeConctent },
            { type: "single", title: "Normal", content: type1Content },
            { type: "single", title: "Minor", content: type2Content },
          ],
        },
      }}
    />
  );
};

const HelpSurfType = (open: any, setOpen: any) => {
  const typeConctent = `According to SDMHR 2013 rev 5, the deck surfacing type
                            is classified into four types.`;
  const type1Content = `Unsurfaced Plain`;
  const type2Content = `Unsurfaced Trafficked`;
  const type3Content = `Waterproofed`;
  const type4Content = `Thickness`;

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      json={{
        type: "help",
        data: {
          titleText: "Deck Surfacing Type",
          body: [
            { type: "single", title: "Structure Type", content: typeConctent },
            { type: "single", title: "Plain", content: type1Content },
            { type: "single", title: "Trafficked", content: type2Content },
            { type: "single", title: "Waterproofed", content: type3Content },
            { type: "single", title: "Thickness", content: type4Content },
          ],
        },
      }}
    />
  );
};

const HelpMain = (open: any, setOpen: any) => {
  const typeConctent = `The following are some limitations and considerations for
                        applying the load.`;
  const type1Content = `(1) Each load case must be identical
                        (2) The load case must be defined in the Load Case menu
                        (3) The load is applied as a relative temperature value 
                        to the initial temperature specified in MIDAS Civil.`;
  const type2Content = `(1) It can be applied to all elements type
                        (2) Element Temperature Load(MIDAS Civil) must not be assigned
                            in the selected load case`;
  const type3Content = `(1) It can be applied to beam elements only
                        (2) Only specifed types and shape of section can be applied
                        - Type1 -> USER: H, B
                        - Type2 -> COMPOSITE: B, I, Tub, GB, GI, GT
                        - Type3 -> PSC: 1CELL, 2CELL, 3CELL, NCEL, NCE2, PSCM, PSCI,
                        PSCH, PSCT, PSCB, VALU
                        (3) The Section/Slab height is for example calculations,
                        and the load is recalculated and applied based on the
                        selected each element section
                        (4) The minimum applicable section height varies depending
                        on the superstructure type
                        - Type1: 600 mm
                        - Type2: Slab height + 400 mm
                        - Type3: 135 mm`;

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      json={{
        type: "help",
        data: {
          titleText: "Limitations and Considerations",
          body: [
            {
              type: "single",
              title: "Limitations and Considerations",
              content: typeConctent,
            },
            { type: "single", title: "Common", content: type1Content },
            {
              type: "single",
              title: "Uniform Bridge Temperature",
              content: type2Content,
            },
            {
              type: "single",
              title: "Temperature Differences",
              content: type3Content,
            },
          ],
        },
      }}
    />
  );
};

// 25-03-20 홍콩 교통부 요청 - 기준서의 표 또는 그림을 보여달라.
const HelpManual = (type: any, open: any, setOpen: any) => {
  const [tabValueUni, setTabValueUni] = React.useState("1");
  const [tabValueDiff, setTabValueDiff] = React.useState("1");

  return (
    <>
      {type === "Uniform" && (
        <Dialog
          open={open}
          setOpen={setOpen}
          json={{
            type: "help",
            data: {
              titleText: "Uniform Temperature",
              body: [
                {
                  type: "multiple",
                  title: "SDMHR 2013 rev 5",
                  content: [
                    <div style={{ width: "450px", height: "300px" }}>
                      <TabGroup
                        // orientation="vertical"
                        value={tabValueUni}
                        onChange={(
                          event: React.SyntheticEvent,
                          newValue: string
                        ) => setTabValueUni(newValue)}
                      >
                        <Tab value="1" label="Calc. Method" />
                        <Tab value="2" label="Table 3.17" />
                        <Tab value="3" label="Table 3.18" />
                        <Tab value="4" label="Clause 3.5.2" />
                      </TabGroup>
                      {tabValueUni === "1" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <Typography variant="body3">
                              To provide clarity on the calculation method for
                              the Adjustment values shown in Table 3.18, the
                              following guidance is provided:
                            </Typography>
                            <Typography variant="h1">
                              When selecting Plain, Trafficked, or Waterproofed
                              options
                            </Typography>
                            <Typography variant="body3">
                              • Use the values as provided in the table.
                            </Typography>
                            <Typography variant="h1">
                              When selecting Thickness
                            </Typography>
                            <Typography variant="body3">
                              • If the thickness exceeds 200mm, use the value
                              corresponding to 200mm.
                            </Typography>
                            <Typography variant="h1">Ceiling Method</Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="body3">
                                • Based on the Deck Surface values, identify the
                                next highest Deck Surface value available in the
                                table that is greater than the input value, and
                                apply that value.
                              </Typography>
                              <Typography variant="body3">
                                • For example, if the input is 20mm, apply the
                                value for 40mm; if the input is 120mm, apply the
                                value for 200mm.
                              </Typography>
                            </div>
                            <Typography variant="h1">
                              Linear Interpolation Method
                            </Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="body3">
                                • As per Note (1) of Table 3.18, assume the
                                waterproofing value as 0mm.
                              </Typography>
                              <Typography variant="body3">
                                • Apply linear interpolation using the values
                                provided in the table for the 0–200mm range.
                              </Typography>
                            </div>
                          </div>{" "}
                        </>
                      )}
                      {tabValueUni === "2" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_table3_17()}
                          </div>{" "}
                        </>
                      )}
                      {tabValueUni === "3" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_table3_18()}
                          </div>{" "}
                        </>
                      )}
                      {tabValueUni === "4" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_clause352_5()}
                            <div style={{ height: "20px" }}></div>
                            {sdm_clause352_6()}
                          </div>
                        </>
                      )}
                    </div>,
                  ],
                },
              ],
            },
          }}
        />
      )}
      {type === "Differ" && (
        <Dialog
          open={open}
          setOpen={setOpen}
          json={{
            type: "help",
            data: {
              titleText: "Temperautre Differences",
              body: [
                {
                  type: "multiple",
                  title: "SDMHR 2013 rev 5",
                  content: [
                    <div style={{ width: "450px", height: "600px" }}>
                      <TabGroup
                        // orientation="vertical"
                        value={tabValueDiff}
                        onChange={(
                          event: React.SyntheticEvent,
                          newValue: string
                        ) => setTabValueDiff(newValue)}
                      >
                        <Tab value="1" label="Calc. Method" />
                        <Tab value="2" label="Figrue 3.2" />
                        <Tab value="3" label="Table 3.19" />
                        <Tab value="4" label="Table 3.20" />
                        <Tab value="5" label="Table 3.21" />
                      </TabGroup>
                      {tabValueDiff === "1" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <Typography variant="body3">
                              To clarify the method for calculating intermediate
                              values in Tables 3.19–3.21, the following guidance
                              is provided:
                            </Typography>
                            <Typography variant="h1">
                              For Superstructure Type 1
                            </Typography>
                            <Typography variant="h1">
                              • When selecting Plain, Trafficked, or
                              Waterproofed options
                            </Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="body3">
                                • Use the values corresponding to unsurfaced.
                              </Typography>
                            </div>
                            <Typography variant="h1">
                              • When selecting Thickness
                            </Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="body3">
                                • Consider unsurfaced as 0 mm.
                              </Typography>
                              <Typography variant="h1">
                                • Ceiling Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • Based on the Surfaced Thickness values,
                                  identify the next highest value greater than
                                  the input, and apply that value.
                                </Typography>
                                <Typography variant="body3">
                                  • For example, if the input is between 20 mm
                                  and 40 mm, apply the value for 40 mm.
                                </Typography>
                              </div>
                              <Typography variant="h1">
                                • Linear Interpolation Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • Apply linear interpolation using the values
                                  in the table for the 0–40 mm range.
                                </Typography>
                              </div>
                            </div>
                            <Typography variant="h1">
                              For Superstructure Type 2 & Type 3
                            </Typography>
                            <Typography variant="h1">
                              • When selecting Plain, Trafficked, or
                              Waterproofed options
                            </Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="h1">
                                • Ceiling Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • Based on the Depth of Slab values, identify
                                  the next highest value greater than the input,
                                  and apply that value.
                                </Typography>
                              </div>
                            </div>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="h1">
                                • Linear Interpolation Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • Apply linear interpolation using the values
                                  in the table for the 0.2–0.3 m range (type 2)
                                  or 0.2-3.0 m range (type 3).
                                </Typography>
                              </div>
                            </div>
                            <Typography variant="h1">
                              • When selecting Thickness
                            </Typography>
                            <div style={{ paddingLeft: "20px" }}>
                              <Typography variant="body3">
                                • Assume waterproofed thickness as 0 mm.
                              </Typography>
                              <Typography variant="h1">
                                • Ceiling Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • First, identify the next highest Depth of
                                  Slab value greater than the input.
                                </Typography>
                                <Typography variant="body3">
                                  • Then, apply the same ceiling method to the
                                  Surfacing Thickness value.
                                </Typography>
                                <Typography variant="body3">
                                  • For example, if the input Depth of Slab is
                                  220 mm and the Surfacing Thickness is 120 mm,
                                  apply the values for Depth of Slab = 300 mm
                                  and Surfacing Thickness = 150 mm.
                                </Typography>
                              </div>
                              <Typography variant="h1">
                                • Linear Interpolation Method
                              </Typography>
                              <div style={{ paddingLeft: "20px" }}>
                                <Typography variant="body3">
                                  • First, interpolate the Depth of Slab using
                                  the internal table values at 0, 50, 100, 150,
                                  and 200 mm.
                                </Typography>
                                <Typography variant="body3">
                                  • Then, apply interpolation again based on the
                                  Surfacing Thickness to determine the final
                                  value.
                                </Typography>
                              </div>
                            </div>
                          </div>{" "}
                        </>
                      )}
                      {tabValueDiff === "2" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_figure3_2()}
                          </div>{" "}
                        </>
                      )}
                      {tabValueDiff === "3" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_table3_19()}
                          </div>{" "}
                        </>
                      )}
                      {tabValueDiff === "4" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_table3_20()}
                          </div>{" "}
                        </>
                      )}
                      {tabValueDiff === "5" && (
                        <>
                          <div
                            style={{
                              paddingTop: "10px",
                              paddingBottom: "10px",
                            }}
                          >
                            {sdm_table3_21()}
                          </div>{" "}
                        </>
                      )}
                    </div>,
                  ],
                },
              ],
            },
          }}
        />
      )}
    </>
  );
};

export {
  HelpSuperstructType,
  HelpStructType,
  HelpSurfType,
  HelpMain,
  HelpManual,
};
