import { GuideBox } from "@midasit-dev/moaui";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { HiddenBtnState } from "../../../values/RecoilValue";

const GraphBtn = () => {
  const [hidden, setHidden] = useRecoilState(HiddenBtnState);
  const { t: translate, i18n: internationalization } = useTranslation();
  const BtnText = translate("GraphBtn");

  return (
    <GuideBox center margin={2}>
      <Button
        variant="contained"
        sx={BtnStyle}
        onClick={() => {
          setHidden(!hidden);
        }}
      >
        {BtnText.split("").map((txt) => (
          <span>{txt}</span>
        ))}
      </Button>
    </GuideBox>
  );
};

const BtnStyle: any = {
  backgroundColor: "#EEEEEE",
  color: "#1F2937",
  width: "1vw", // 버튼의 너비
  height: "80vh", // 버튼의 높이
  borderRadius: "10px", // 버튼의 모서리 둥글기
  display: "flex",
  flexDirection: "column", // 텍스트를 세로로 배치
  justifyContent: "center",
  alignItems: "center",
  ":hover": {
    backgroundColor: "#5F666B",
    color: "#FFFFFF",
    border: "1px solid #5F666B",
  },
};

export default GraphBtn;
