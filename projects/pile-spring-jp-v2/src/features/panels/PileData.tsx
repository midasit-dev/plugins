/**
 * 파일 데이터 관리를 위한 컴포넌트
 * 파일 목록을 표시하고 선택, 로드, 삭제 기능을 제공합니다.
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePileData, useNotification } from "../../hooks";
import {
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CustomDataGrid } from "../../components";
import { GuideBox, Button } from "@midasit-dev/moaui";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * 파일 데이터 목록 및 관리 컴포넌트
 * 사용자가 파일을 조회, 선택, 삭제할 수 있는 인터페이스를 제공합니다.
 */
const PileData = () => {
  const { t } = useTranslation();
  const { summaryList, selectedId, loadData, deleteData, deselectItem } =
    usePileData();
  const { showNotification } = useNotification();

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  /**
   * 행 선택 처리 함수
   */
  const handleRowClick = (id: number) => {
    // 이미 선택된 행을 다시 클릭한 경우 선택 해제
    if (selectedId === id) {
      deselectItem();
      console.log("[PileData] 데이터 선택이 해제되었습니다.");
      return;
    }

    const item = summaryList.find((item) => item.id === id);
    if (!item) {
      console.error("[PileData] 데이터를 찾을 수 없습니다.");
      return;
    }

    const success = loadData(id);

    if (success) {
      console.log("[PileData] 데이터가 성공적으로 로드되었습니다.");
    } else {
      console.error("[PileData] 데이터 로드에 실패했습니다.");
    }
  };

  /**
   * 삭제 버튼 클릭 처리 함수
   */
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  /**
   * 삭제 확인 다이얼로그 확인 처리 함수
   * 사용자가 삭제를 확인하면 항목을 실제로 삭제합니다.
   */
  const confirmDelete = () => {
    if (idToDelete !== null) {
      const success = deleteData(idToDelete);
      setDeleteDialogOpen(false);
      setIdToDelete(null);

      if (success) {
        showNotification("Delete_Success", "success");
      } else {
        showNotification("Delete_Failed", "error");
      }
    }
  };

  /**
   * 데이터 그리드 열 정의
   * 각 열의 필드, 헤더명, 너비 및 렌더링 방식을 정의합니다.
   */
  const columns = [
    { field: "id", headerName: "ID", sortable: false, width: 40 },
    {
      field: "pileName",
      headerName: t("Pile_Table_Name"),
      sortable: false,
      width: 80,
    },
    {
      field: "pileType",
      headerName: t("Pile_Table_Type"),
      sortable: false,
      width: 100,
      renderCell: (params: any) => t(params.value),
    },
    {
      field: "constructionMethod",
      headerName: t("Pile_Table_ConstructionMethod"),
      sortable: false,
      width: 120,
      renderCell: (params: any) => t(params.value),
    },
    {
      field: "pileNumber",
      headerName: t("Pile_Table_PileNum"),
      sortable: false,
      width: 60,
    },
    {
      field: "actions",
      headerName: t("Pile_Table_Actions"),
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
    <GuideBox>
      <Paper elevation={2} sx={{ width: "100%", height: "244px" }}>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            width: "300px",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "16px" }}>
          {t("Dialog_Title_Delete")}
        </DialogTitle>
        <DialogContent sx={{ fontSize: "14px" }}>
          {t("Dialog_Content_Delete")}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("Dialog_Button_Cancel")}
          </Button>
          <Button color="negative" onClick={confirmDelete}>
            {t("Dialog_Button_Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </GuideBox>
  );
};

export default PileData;
