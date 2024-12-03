import {
  GuideBox,
  Grid,
  Panel,
  Color,
  Typography,
  Stack,
  Button,
} from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import LanguageType from "../../Input/Dropdown/LanguageType";
import RequestBtnPy from "../../Input/Button/RequestBtnPy";
import { useState } from "react";
import DefalutTextEdit from "../../Input/TextEdit/TextEdit";

const Contents = () => {
  const [exampleAPI, setexampleAPI] = useState([]);
  const [examplePython, setexamplePython] = useState(0);
  const [resultPython, setresultPython] = useState(0);
  const { t: translate } = useTranslation();
  const resultPython2 = translate("example");

  const onClick = () => {
    if (pyscript && pyscript.interpreter) {
      const exampleFunc = pyscript.interpreter.globals.get("example");
      if (examplePython > 0) setresultPython(exampleFunc(examplePython));
      else setresultPython(0);
    }
  };
  return (
    <GuideBox verCenter width={"100%"} padding={2}>
      {/* Language Change */}
      <GuideBox verCenter width={"100%"} padding={2}>
        <Panel
          width="100%"
          variant="shadow2"
          padding={2}
          border={`1px solid ${Color.secondary.main}`}
        >
          <LanguageType />
          <Grid container direction={"column"} spacing={2} margin={2}>
            <Grid item>
              <Typography variant="h1" size="large">
                {translate("welcome_midas_plugin")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1" size="medium">
                {translate("dev_mode_developing")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" size="small">
                {translate("turn_on_development_mode")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body3" size="small">
                {translate("type_command_below")}
              </Typography>
            </Grid>
          </Grid>
        </Panel>
      </GuideBox>

      {/* API test  */}
      <GuideBox verCenter width={"100%"} padding={2}>
        <Panel
          width="100%"
          variant="shadow2"
          padding={2}
          border={`1px solid ${Color.secondary.main}`}
        >
          <Stack direction="row" spacing={2}>
            <Grid margin={2}>
              <Typography variant="h1" size="large">
                API test
              </Typography>
            </Grid>
            <Grid margin={2}>
              <RequestBtnPy setexampleAPI={setexampleAPI} />
            </Grid>
          </Stack>
          <Grid margin={2}>
            <Typography variant="h1" size="large">
              {exampleAPI && JSON.stringify(exampleAPI)}
            </Typography>
          </Grid>
        </Panel>
      </GuideBox>

      {/* factorial example  */}
      <GuideBox verCenter width={"100%"} padding={2}>
        <Panel
          width="100%"
          variant="shadow2"
          padding={2}
          border={`1px solid ${Color.secondary.main}`}
        >
          <Grid margin={2}>
            <Typography variant="h1" size="large">
              factorial example
            </Typography>
          </Grid>
          <Grid margin={2}>
            <DefalutTextEdit setexamplePython={setexamplePython} />
          </Grid>
          <Grid margin={2}>
            <Button onClick={onClick}> factorial </Button>
          </Grid>
          <Grid margin={2}>
            Result : {resultPython > 0 ? resultPython : resultPython2}
          </Grid>
        </Panel>
      </GuideBox>
    </GuideBox>
  );
};

export default Contents;
