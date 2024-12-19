/**
 * @title 2-wrapper
 * @description Wrapper for Pyscript
 * @next ./src/App.tsx
 * ┬┌┐┌   ┌─┐┌─┐┌┬┐┬┬  ┬┌─┐
 * ││││───├─┤│   │ │└┐┌┘├┤ 	🌑🌑🌑🌑🌑
 * ┴┘└┘   ┴ ┴└─┘ ┴ ┴ └┘ └─┘
 */

import React, { useCallback } from "react";
import { RecoilRoot } from "recoil";
import App from "./App";
import {
  GuideBox,
  Panel,
  Typography,
  VerifyDialog,
  VerifyUtil,
  IconButton,
  Icon,
  Signature as SignatureMoaui,
} from "@midasit-dev/moaui";
import Signature from "./Signature";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { setGlobalVariable, getGlobalVariable } from "./utils_pyscript";
import { useTranslation } from "react-i18next";

const ValidWrapper = (props: any) => {
  const { isIntalledPyscript } = props;

  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [checkUri, setCheckUri] = React.useState(false);
  const [checkMapiKey, setCheckMapiKey] = React.useState(false);
  const [checkMapiKeyMsg, setCheckMapiKeyMsg] = React.useState("");
  const { i18n } = useTranslation();

  React.useEffect(() => {
    const callback = async () => {
      //redirectTo와 mapi-key 유효성 검사
      let _checkUri = true;
      let _checkMapiKey = true;

      const url = VerifyUtil.getProtocolDomainPort();
      const resUrl = await fetch(`${url}/health`);
      if (resUrl.status !== 200) {
        _checkUri = false;
      }
      setCheckUri(_checkUri);

      const mapiKey = VerifyUtil.getMapiKey();
      const verifyMapiKey = await VerifyUtil.getVerifyInfoAsync(mapiKey);
      if ("error" in verifyMapiKey && "message" in verifyMapiKey.error) {
        _checkMapiKey = false;
        setCheckMapiKeyMsg(verifyMapiKey.error.message);
      }
      if ("keyVerified" in verifyMapiKey) {
        if (!verifyMapiKey["keyVerified"]) {
          _checkMapiKey = false;
          setCheckMapiKeyMsg("keyVerified");
        }
      }
      if ("status" in verifyMapiKey) {
        if (verifyMapiKey["status"] !== "connected") {
          _checkMapiKey = false;
          setCheckMapiKeyMsg(verifyMapiKey["status"]);
        }
      }
      setCheckMapiKey(_checkMapiKey);
      //최종 결과 Set
      if (!_checkUri || !_checkMapiKey) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }

      setIsInitialized(true);
    };

    callback();
  }, []);

  const ValidationComponent = ({
    title = "undefiend",
    checkIf = false,
    strValid = "Valid",
    strInvalid = "Invalid",
  }: any) => {
    return (
      <GuideBox row horSpaceBetween width={350}>
        <Typography variant="body1">{title}: </Typography>
        {checkIf ? (
          <Typography variant="h1" color="#1f78b4">
            {strValid}
          </Typography>
        ) : (
          <Typography variant="h1" color="#D32F2F">
            {strInvalid}
          </Typography>
        )}
      </GuideBox>
    );
  };

  const [bgColor, setBgColor] = React.useState("#eee");
  React.useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/manifest.json`)
      .then((response) => response.json())
      .then((data) => (data.name ? setBgColor(data.background_color) : null))
      .catch((error) => console.error("Error fetching manifest.json:", error));
  }, []);

  React.useEffect(() => {
    if (isInitialized && isValid) {
      Signature.log();
      SignatureMoaui.log();
    }
  }, [isInitialized, isValid]);

  // language switcher
  React.useEffect(() => {
    if (window.location.pathname === "/") window.location.pathname = "/en"; // initialize
    i18n.changeLanguage(window.location.pathname.split("/")[1]); // change language when pathname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]);

  return (
    <>
      {isInitialized && isValid && (
        <RecoilRoot>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            action={(key) => (
              <IconButton
                transparent
                transparentColor="white"
                onClick={() => closeSnackbar(key)}
              >
                <Icon iconName="Close" />
              </IconButton>
            )}
          >
            <GuideBox
              tag="AppBackground"
              show
              center
              fill={bgColor}
              width="100%"
            >
              <App />
            </GuideBox>
          </SnackbarProvider>
        </RecoilRoot>
      )}

      {isInitialized && !isValid && (
        <GuideBox width="100%" height="100vh" center>
          <Panel variant="shadow2" padding={3} margin={3}>
            <GuideBox opacity={0.9} spacing={2}>
              <Typography variant="h1">Validation Check</Typography>
              <GuideBox spacing={2}>
                <ValidationComponent
                  title="pyscript"
                  checkIf={isIntalledPyscript}
                  strValid="Installed"
                  strInvalid={`Not Installed`}
                />
                <ValidationComponent
                  title="Base URI"
                  checkIf={checkUri}
                  strValid="Valid"
                  strInvalid="Invalid"
                />
                <ValidationComponent
                  title="MAPI-Key"
                  checkIf={checkMapiKey}
                  strValid="Valid"
                  strInvalid={`Invalid (${checkMapiKeyMsg})`}
                />
              </GuideBox>
            </GuideBox>
          </Panel>
        </GuideBox>
      )}
    </>
  );
};

const PyscriptWrapper = () => {
  const [installed, setInstalled] = React.useState(false);
  //fill in global variables
  React.useEffect(() => {
    function checkPyScriptReady(callback: any) {
      // if pyscript is ready, call callback function
      if (pyscript && pyscript.interpreter) {
        setGlobalVariable();
        getGlobalVariable();
        setInstalled(true);
      } else {
        // if not, wait 100ms and try again
        setTimeout(() => checkPyScriptReady(callback), 100);
      }
    }

    checkPyScriptReady(() => {});
  }, []);

  return (
    <>
      <VerifyDialog loading={!installed} />
      {installed && VerifyUtil.isExistQueryStrings("mapiKey") && (
        <ValidWrapper isIntalledPyscript={installed} />
      )}
    </>
  );
};

//변경
export default PyscriptWrapper;
