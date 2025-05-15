import { useTranslation } from "react-i18next";

export const HeadConditionItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Head_Condition_Fixed"), "Head_Condition_Fixed"],
    [t("Head_Condition_Hinge"), "Head_Condition_Hinge"],
  ]);
};

export const ConstructionMethodItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("CM_DropHammer"), "CM_DropHammer"],
    [t("CM_VibroHammer"), "CM_VibroHammer"],
    [t("CM_InSitu"), "CM_InSitu"],
    [t("CM_Boring"), "CM_Boring"],
    [t("CM_Preboring"), "CM_Preboring"],
    [t("CM_SoilCement"), "CM_SoilCement"],
    [t("CM_Rotate"), "CM_Rotate"],
  ]);
};

export const BottomConditionItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Bottom_Condition_Free"), "Bottom_Condition_Free"],
    [t("Bottom_Condition_Hinge"), "Bottom_Condition_Hinge"],
    [t("Bottom_Condition_Fixed"), "Bottom_Condition_Fixed"],
  ]);
};

export const PileTypeItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Cast_In_Situ"), "Cast_In_Situ"],
    [t("PHC_Pile"), "PHC_Pile"],
    [t("SC_Pile"), "SC_Pile"],
    [t("Steel_Pile"), "Steel_Pile"],
    [t("Soil_Cement_Pile"), "Soil_Cement_Pile"],
  ]);
};

export const PileRefPointLongItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Ref_Point_Right"), "Ref_Point_Right"],
    [t("Ref_Point_Left"), "Ref_Point_Left"],
  ]);
};

export const PileRefPointTranItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Ref_Point_Top"), "Ref_Point_Top"],
    [t("Ref_Point_Bottom"), "Ref_Point_Bottom"],
  ]);
};

export const PileLocRefXItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Ref_Point_Right"), "Ref_Point_Right"],
    [t("Ref_Point_Left"), "Ref_Point_Left"],
  ]);
};

export const PileLocRefYItems = () => {
  const { t } = useTranslation();

  return new Map<string, string | number>([
    [t("Ref_Point_Top"), "Ref_Point_Top"],
    [t("Ref_Point_Bottom"), "Ref_Point_Bottom"],
  ]);
};
