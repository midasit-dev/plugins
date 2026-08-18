import { Grid } from "@midasit-dev/moaui";
import { Alert } from "@mui/material";

interface AlertToolbarProps {
  bError: boolean;
  alertMsg: string;
}

/** 그리드 상단 툴바 자리에 성공/에러 메시지를 띄운다. 메시지가 비면 서서히 사라진다. */
const AlertToolbar = ({ bError, alertMsg }: AlertToolbarProps) => {
  return (
    <Grid width={"100%"}>
      <Alert
        style={{
          transition: "opacity 0.5s ease-out",
          opacity: alertMsg === "" ? 0 : 1,
        }}
        severity={bError ? "error" : "success"}
      >
        {alertMsg}
      </Alert>
    </Grid>
  );
};

export default AlertToolbar;
