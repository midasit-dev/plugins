import React from 'react'; 
import { Dialog } from "@midasit-dev/moaui";

const HelpSuperstructType = (open: any, setOpen: any) => {

    const typeConctent = `According to SDM 2013 rev 5,  the superstructure type
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
                        { type: "single", title: "Superstructure Type", content: typeConctent },
                        { type: "single", title: "Type 1", content: type1Content },
                        { type: "single", title: "Type 2", content: type2Content },
                        { type: "single", title: "Type 3", content: type3Content }
                    ]
            }
        }}
    />
    );
}

const HelpStructType = (open: any, setOpen: any) => {

    const typeConctent = `According to SDM 2013 rev 5, the structure type is
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
                        { type: "single", title: "Minor", content: type2Content }
                    ]
            }
        }}
    />
    );
}

const HelpSurfType = (open: any, setOpen: any) => {

    const typeConctent = `According to SDM 2013 rev 5, the deck surfacing type
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
                        { type: "single", title: "Thickness", content: type4Content }
                    ]
            }
        }}
    />
    );
}

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
                        { type: "single", title: "Limitations and Considerations", content: typeConctent },
                        { type: "single", title: "Common", content: type1Content },
                        { type: "single", title: "Uniform Bridge Temperature", content: type2Content },
                        { type: "single", title: "Temperature Differences", content: type3Content },
                    ]
            }
        }}
    />
    );
}

export {HelpSuperstructType, HelpStructType, HelpSurfType, HelpMain};