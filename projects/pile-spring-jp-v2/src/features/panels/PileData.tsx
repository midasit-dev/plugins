import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePileData } from "../../hooks/usePileData";
import {
  pileLocationState,
  pileSectionState,
  pileInitSetState,
  pileReinforcedState,
} from "../../states";
import { useRecoilState } from "recoil";
import {
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CustomDataGrid } from "../../components";
import { GuideBox } from "@midasit-dev/moaui";

const PileData = () => {
  const { t } = useTranslation();
  const { summaryList, selectedId, setSelectedId, loadData, deleteData } =
    usePileData();

  // Recoil 상태 설정을 위한 setter 함수들
  const [, setInitSetData] = useRecoilState(pileInitSetState);
  const [, setLocationData] = useRecoilState(pileLocationState);
  const [, setReinforcedData] = useRecoilState(pileReinforcedState);
  const [, setSectionData] = useRecoilState(pileSectionState);

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  //행 선택 처리
  const handleRowClick = (id: number) => {
    const item = summaryList.find((item) => item.id === id);
    if (!item) return;

    setSelectedId(id);
    loadData(id);

    console.log(`데이터 ${id} 로드됨`);
  };

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인 다이얼로그 닫기
  const confirmDelete = () => {
    if (idToDelete !== null) {
      deleteData(idToDelete);
      setDeleteDialogOpen(false);
      setIdToDelete(null);
    }
  };

  // 그리드 열 정의
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "pileName", headerName: t("Pile_Name"), width: 80 },
    { field: "pileType", headerName: t("Pile_Type"), width: 80 },
    {
      field: "constructionMethod",
      headerName: t("Construction_Method"),
      width: 80,
    },
    {
      field: "pileNumber",
      headerName: t("Pile_Number"),
      width: 80,
    },
    {
      field: "actions",
      headerName: t("Actions"),
      width: 80,
      sortable: false,
      renderCell: (params: any) => (
        <Button
          color="error"
          size="small"
          onClick={() => handleDeleteClick(params.row.id)}
        >
          {t("Delete")}
        </Button>
      ),
    },
  ];

  return (
    <GuideBox>
      <Paper elevation={2} sx={{ height: 400, width: "100%" }}>
        <CustomDataGrid
          rows={summaryList}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params: any) => handleRowClick(params.row.id)}
          selectedRowId={selectedId}
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("Confirm_Delete")}</DialogTitle>
        <DialogContent>{t("Delete_Confirmation_Message")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button color="error" onClick={confirmDelete}>
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </GuideBox>
  );
};

export default PileData;
