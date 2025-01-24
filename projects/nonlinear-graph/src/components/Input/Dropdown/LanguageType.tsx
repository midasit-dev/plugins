import { DropList, GuideBox } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { LanguageState } from "../../../values/RecoilValue";

const LanguageType = () => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const items = new Map<string, string>([
    ["en", "en"],
    ["jp", "jp"],
  ]);
  const [lan, setLan] = useRecoilState(LanguageState);

  function onChangeHandler(event: any) {
    const dropLan = items.get(event.target.value);
    internationalization.changeLanguage(dropLan);
    setLan(event.target.value);
  }
  return (
    <GuideBox horRight margin={2}>
      <DropList
        itemList={items}
        defaultValue="en"
        value={lan}
        onChange={onChangeHandler}
      />
    </GuideBox>
  );
};

export default LanguageType;
