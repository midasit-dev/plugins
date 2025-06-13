// PileSectionTable.tsx
import React from "react";
import { CustomTable } from "../../components";
import { usePileSectionTable } from "../../hooks";
import { GuideBox } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";

const PileSectionTable = () => {
  const { rows, tabValue, setTabValue, renderRow, getHeaders, setEditingRow } =
    usePileSectionTable();
  const { t } = useTranslation();

  return (
    <GuideBox width="100%" height="100%">
      <CustomTable
        headers={getHeaders()}
        rows={rows}
        renderRow={renderRow}
        tabs={[
          { value: "concrete", label: t("Basic_Concrete_Total_Title") },
          { value: "steel", label: t("Basic_Steel_Total_Title") },
        ]}
        currentTab={tabValue}
        onTabChange={(newValue) => {
          setTabValue(newValue);
          setEditingRow(null);
        }}
        headerStartIndex={4}
      />
    </GuideBox>
  );
};

export default PileSectionTable;
