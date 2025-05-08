import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { pileReinforcedState, PileReinforcedRowData } from "../states";
import {
  CustomCheckBox,
  CustomTableCell,
  CustomNumberField,
} from "../components";

export const usePileReinforced = () => {
  const [rows, setRows] = useRecoilState(pileReinforcedState);
  const { t } = useTranslation();

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileReinforcedRowData,
    value: string | boolean
  ) => {
    setRows((prev) => {
      const updatedRows = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // id=1이고 3,4열(reinforced_start, reinforced_end)이 변경될 때만 2행에도 적용
      if (
        id === 1 &&
        (field === "reinforced_start" || field === "reinforced_end")
      ) {
        return updatedRows.map((row) =>
          row.id === 2 ? { ...row, [field]: value } : row
        );
      }

      return updatedRows;
    });
  };

  const renderRow = (row: PileReinforcedRowData) => {
    // 첫 번째 행의 데이터
    const firstRow = rows.find((r) => r.id === 1);

    return (
      <>
        <CustomTableCell padding="checkbox">
          <CustomCheckBox
            checked={row.checked}
            disabled={row.id === 1}
            onChange={(e) => handleChange(row.id, "checked", e.target.checked)}
          />
        </CustomTableCell>
        <CustomTableCell width={100}>
          {t(row.reinforced_method)}
        </CustomTableCell>
        <CustomTableCell width={100}>
          <CustomNumberField
            value={
              row.id === 2
                ? firstRow?.reinforced_start || ""
                : row.reinforced_start
            }
            onChange={(e) =>
              handleChange(row.id, "reinforced_start", e.target.value)
            }
            width={100}
            numberFieldWidth={100}
            placeholder="number.."
            disabled={row.id === 2}
          />
        </CustomTableCell>
        <CustomTableCell width={100}>
          <CustomNumberField
            value={
              row.id === 2 ? firstRow?.reinforced_end || "" : row.reinforced_end
            }
            onChange={(e) =>
              handleChange(row.id, "reinforced_end", e.target.value)
            }
            width={100}
            numberFieldWidth={100}
            placeholder="number.."
            disabled={row.id === 2}
          />
        </CustomTableCell>
        <CustomTableCell width={100}>
          <CustomNumberField
            value={row.reinforced_thickness}
            onChange={(e) =>
              handleChange(row.id, "reinforced_thickness", e.target.value)
            }
            width={100}
            numberFieldWidth={100}
            placeholder="number.."
          />
        </CustomTableCell>
        <CustomTableCell width={100}>
          <CustomNumberField
            value={row.reinforced_modulus}
            onChange={(e) =>
              handleChange(row.id, "reinforced_modulus", e.target.value)
            }
            width={100}
            numberFieldWidth={100}
            placeholder="number.."
          />
        </CustomTableCell>
      </>
    );
  };

  const getHeaders = () => {
    return [
      <CustomCheckBox
        indeterminate={
          rows.slice(1).some((r) => r.checked) &&
          !rows.slice(1).every((r) => r.checked)
        }
        checked={rows.slice(1).every((r) => r.checked)}
        onChange={(e) => {
          const checked = e.target.checked;
          setRows((prev) =>
            prev.map((r) => (r.id === 1 ? r : { ...r, checked }))
          );
        }}
      />,
      t("Reinforced_Method"),
      t("Reinforced_Start"),
      t("Reinforced_End"),
      t("Reinforced_Thickness"),
      t("Reinforced_Modulus"),
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
