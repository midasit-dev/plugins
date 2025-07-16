import { useRecoilState } from "recoil";

import { CustomTextField, CustomBox } from "../../components";

import {
  ImportDataDialog,
  ExportDataDialog,
  MainCalculation,
  DownLoadSheets,
  CreateSpring,
} from "../interactions";
import { projectData } from "../../states";
import { OPERATION_CONTAINER } from "../../constants/common/translations";

import { useTranslation } from "react-i18next";

const OpeMain = () => {
  const { t } = useTranslation();
  const [project, setProject] = useRecoilState(projectData);

  const handleProjectNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProject({ ...project, projectName: event.target.value });
  };

  return (
    <CustomBox
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <CustomBox
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <CustomTextField
          label={t(OPERATION_CONTAINER.PROJECT_NAME)}
          value={project.projectName}
          onChange={handleProjectNameChange}
          width={180}
          textFieldWidth={100}
        />
        <ExportDataDialog />
        <ImportDataDialog />
      </CustomBox>
      <CustomBox
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <MainCalculation />
        <DownLoadSheets />
      </CustomBox>
      <CreateSpring />
    </CustomBox>
  );
};

export default OpeMain;
