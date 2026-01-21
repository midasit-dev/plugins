import * as React from "react";
import { GuideBox, Panel, Stack, TextField, Typography } from "@midasit-dev/moaui";
import ImageTextButton from "../ImageTextButton";
import { useRecoilState, useResetRecoilState } from "recoil";
import { VarPrintSize, VarPrintSizeH, VarPrintSizeUser, VarPrintSizeV } from "../var";


export const PrintSize = () => {


    const [printSizeH, setPrintSizeH] = useRecoilState(VarPrintSizeH);
    const [printSizeV, setPrintSizeV] = useRecoilState(VarPrintSizeV);

    const [printSizeUser, setPrintSizeUser] = useRecoilState(VarPrintSizeUser);

    const [printSize, setPrintSize] = useRecoilState(VarPrintSize);

    return (<Panel
        width="100%"
        variant="shadow2"
        border={
            // isClickedLcomTableCell ? 
            // `1px solid ${Color.primaryNegative.enable_strock}` : 
            '1px solid #eee'
        }
    >
        <GuideBox spacing={2}>
            <Stack width="100%" height="100%" spacing={1}>
                <Typography variant="body2">Print Size</Typography>
                <GuideBox horSpaceBetween row spacing={0.25}>
                    <ImageTextButton iconSrc="svg/A3.svg" text="4961x3508" isActive={printSize == "A3"} onClick={() => { setPrintSize("A3"); setPrintSizeH(4961); setPrintSizeV(3508); setPrintSizeUser(false); }} />
                    <ImageTextButton iconSrc="svg/A4.svg" text="3508x2480" isActive={printSize == "A4"} onClick={() => { setPrintSize("A4"); setPrintSizeH(3508); setPrintSizeV(2480); setPrintSizeUser(false); }} />
                    <ImageTextButton iconSrc="svg/FHD.svg" text="1920x1080" isActive={printSize == "FHD"} onClick={() => { setPrintSize("FHD"); setPrintSizeH(1920); setPrintSizeV(1080); setPrintSizeUser(false); }} />
                    <ImageTextButton iconSrc="svg/HD.svg" text="1366x768" isActive={printSize == "HD"} onClick={() => { setPrintSize("HD"); setPrintSizeH(1366); setPrintSizeV(768); setPrintSizeUser(false); }} />
                    <ImageTextButton iconSrc="svg/User.svg" text="HxV" isActive={printSize == "USER"} onClick={() => { setPrintSize("USER"); setPrintSizeUser(true); }} />
                </GuideBox>
                <GuideBox horSpaceBetween row spacing={0.25}>
                    <TextField value={printSizeH} disabled={!printSizeUser} onChange={(e) => setPrintSizeH(e.target.value)} />
                    <TextField value={printSizeV} disabled={!printSizeUser} onChange={(e) => setPrintSizeV(e.target.value)} />
                </GuideBox>
            </Stack>
        </GuideBox>
    </Panel>
    );
}