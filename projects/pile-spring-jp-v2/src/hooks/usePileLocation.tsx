import { useRecoilState } from "recoil";
import { pileLocationState, PileLocationRowData } from "../states";
import { PileLocRefXItems, PileLocRefYItems } from "../constants";
import { useTranslation } from "react-i18next";
import {
  CustomNumberField,
  CustomTableCell,
  CustomDropList,
  CustomTextField,
} from "../components";

export const usePileLocation = () => {
  const [rows, setRows] = useRecoilState(pileLocationState);

  const { t } = useTranslation();

  // 테이블 데이터 변경 함수
  const handleChange = (
    id: number,
    field: keyof PileLocationRowData,
    value: string | boolean
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const inputWidth = 100;
  // 테이블 렌더링 함수
  const renderRow = (row: PileLocationRowData) => {
    return (
      <>
        <CustomTableCell width={100}>{t(row.loc_title)}</CustomTableCell>
        <CustomTableCell width={inputWidth}>
          <CustomDropList
            value={row.ref_point}
            onChange={(e) => handleChange(row.id, "ref_point", e.target.value)}
            itemList={
              row.id === 1
                ? Array.from(PileLocRefXItems())
                : Array.from(PileLocRefYItems())
            }
            width={inputWidth}
            droplistWidth={inputWidth}
          />
        </CustomTableCell>
        <CustomTableCell width={inputWidth}>
          <CustomNumberField
            value={row.loc}
            onChange={(e) => handleChange(row.id, "loc", e.target.value)}
            width={inputWidth}
            numberFieldWidth={inputWidth}
            placeholder="0"
          />
        </CustomTableCell>
        <CustomTableCell width={inputWidth}>
          <CustomTextField
            value={row.space}
            onChange={(e) => handleChange(row.id, "space", e.target.value)}
            width={inputWidth}
            textFieldWidth={inputWidth}
            placeholder="3@2.0, 1.0"
          />
        </CustomTableCell>
        <CustomTableCell width={inputWidth}>
          <CustomTextField
            value={row.angle}
            onChange={(e) => handleChange(row.id, "angle", e.target.value)}
            width={inputWidth}
            textFieldWidth={inputWidth}
            placeholder="4@0.0, 1.0"
          />
        </CustomTableCell>
      </>
    );
  };

  const getHeaders = () => {
    return [
      t("Pile_Location_Title"),
      t("Pile_Ref_Point"),
      t("Pile_Loc"),
      t("Pile_Space"),
      t("Pile_Angle"),
    ];
  };

  return {
    rows,
    renderRow,
    getHeaders,
  };
};
