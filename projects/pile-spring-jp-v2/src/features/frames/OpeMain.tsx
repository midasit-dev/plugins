import { GuideBox, Button } from "@midasit-dev/moaui";
import { DataImport, DataExport, Calculation } from "../actions";
import { useRecoilValue, useRecoilState } from "recoil";
import { pileDataListState, soilBasicState, projectData } from "../../states";
import { CustomTextField } from "../../components";
import { useTranslation } from "react-i18next";

const OpeMain = () => {
  const { t } = useTranslation();
  const pileDataList = useRecoilValue(pileDataListState);
  const soilBasic = useRecoilValue(soilBasicState);
  const [project, setProject] = useRecoilState(projectData);

  const clickbutton = () => {
    console.log("================PileDataList=================");
    console.log(pileDataList);
    console.log("================SoilBasic=================");
    console.log(soilBasic);
  };

  const handleProjectNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProject({ ...project, projectName: event.target.value });
  };

  return (
    <GuideBox id="OpeMain" width="100%" row spacing={1} horRight>
      <CustomTextField
        label={t("Project_Name")}
        value={project.projectName}
        onChange={handleProjectNameChange}
        width={180}
        textFieldWidth={100}
      />
      <DataExport />
      <DataImport />
      <Calculation />
      <Button onClick={clickbutton}>Click</Button>
    </GuideBox>
  );
};

export default OpeMain;
