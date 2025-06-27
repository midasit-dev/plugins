/**
 * @fileoverview 파일 목록 패널
 * @description
 * 파일 목록을 표시하고 선택, 로드, 삭제 기능을 제공합니다.
 */
import { useState } from "react";

import { Paper, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { CustomDataGrid, CustomDialog } from "../../../components";
import { Button } from "@midasit-dev/moaui";

import { usePileDomain } from "../../../hooks/pile/usePileDomain";
import { useNotification } from "../../../hooks/common/useNotification";
import { PILE_DATA_LIST } from "../../../constants/pile/translations";

import { useTranslation } from "react-i18next";

const PileDataList = () => {
  const { t } = useTranslation();
  const {
    summaryList,
    selectedPileDataId: selectedId,
    loadData,
    deleteData,
    deselectItem,
  } = usePileDomain();
  const { showNotification } = useNotification();

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // 행 선택 처리 함수
  const handleRowClick = (id: number) => {
    // 이미 선택된 행을 다시 클릭한 경우 선택 해제
    if (selectedId === id) {
      deselectItem();
      console.log("[PileDataList] 데이터 선택이 해제되었습니다.");
      return;
    }

    const item = summaryList.find((item: any) => item.id === id);
    if (!item) {
      console.error("[PileDataList] 데이터를 찾을 수 없습니다.");
      return;
    }

    const success = loadData(id);

    if (success) {
      console.log("[PileDataList] 데이터가 성공적으로 로드되었습니다.");
    } else {
      console.error("[PileDataList] 데이터 로드에 실패했습니다.");
    }
  };

  // 삭제 버튼 클릭 처리 함수
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인 다이얼로그 확인 처리 함수
  const confirmDelete = () => {
    if (idToDelete !== null) {
      const success = deleteData(idToDelete);
      setDeleteDialogOpen(false);
      setIdToDelete(null);

      if (success) {
        showNotification(PILE_DATA_LIST.DELETE_DIALOG_SUCCESS, "success");
      } else {
        showNotification(PILE_DATA_LIST.DELETE_DIALOG_FAILED, "error");
      }
    }
  };

  // 데이터 그리드 열 정의
  const columns = [
    { field: "id", headerName: "ID", sortable: false, width: 40 },
    {
      field: "pileName",
      headerName: t(PILE_DATA_LIST.PILE_TABLE_NAME),
      sortable: false,
      width: 80,
    },
    {
      field: "pileType",
      headerName: t(PILE_DATA_LIST.PILE_TABLE_TYPE),
      sortable: false,
      width: 100,
      renderCell: (params: any) => t(params.value),
    },
    {
      field: "constructionMethod",
      headerName: t(PILE_DATA_LIST.PILE_TABLE_CONSTRUCTION_METHOD),
      sortable: false,
      width: 120,
      renderCell: (params: any) => t(params.value),
    },
    {
      field: "pileNumber",
      headerName: t(PILE_DATA_LIST.PILE_TABLE_PILE_NUMBER),
      sortable: false,
      width: 60,
    },
    {
      field: "actions",
      headerName: t(PILE_DATA_LIST.PILE_TABLE_ACTIONS),
      flex: 1,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // 행 선택 이벤트 방지
            handleDeleteClick(params.row.id);
          }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Paper elevation={2} sx={{ width: "100%", height: 300 }}>
        <CustomDataGrid
          rows={summaryList}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params: any) => handleRowClick(params.row.id)}
          selectedRowId={selectedId || undefined}
          disableColumnResize
          disableHoverStyle={!selectedId}
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}

      <CustomDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        width="300px"
        title={t(PILE_DATA_LIST.DIALOG_TITLE_DELETE)}
        children={
          <Typography>{t(PILE_DATA_LIST.DIALOG_CONTENT_DELETE)}</Typography>
        }
        actions={
          <>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t(PILE_DATA_LIST.DIALOG_BUTTON_CANCEL)}
            </Button>
            <Button color="negative" onClick={confirmDelete}>
              {t(PILE_DATA_LIST.DIALOG_BUTTON_DELETE)}
            </Button>
          </>
        }
      />
    </>
  );
};

export default PileDataList;
