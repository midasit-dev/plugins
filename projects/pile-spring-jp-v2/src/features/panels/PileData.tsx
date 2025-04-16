/**
 * 파일 데이터 관리를 위한 컴포넌트
 * 파일 목록을 표시하고 선택, 로드, 삭제 기능을 제공합니다.
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePileData, useNotification } from "../../hooks";
import {
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { CustomDataGrid } from "../../components";
import { GuideBox } from "@midasit-dev/moaui";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * 파일 데이터 목록 및 관리 컴포넌트
 * 사용자가 파일을 조회, 선택, 삭제할 수 있는 인터페이스를 제공합니다.
 */
const PileData = () => {
  const { t } = useTranslation();
  const { summaryList, selectedId, loadData, deleteData } = usePileData();
  const { showNotification } = useNotification();

  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  /**
   * 행 선택 처리 함수
   */
  const handleRowClick = (id: number) => {
    const item = summaryList.find((item) => item.id === id);
    if (!item) {
      showNotification("Data_Not_Found", "error");
      return;
    }

    const success = loadData(id);

    if (success) {
      showNotification("Data_Loaded_Successfully", "success");
    } else {
      showNotification("Data_Load_Failed", "error");
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
      width: 80,
      renderCell: (params: any) => t(params.value),
    },
    {
      field: "constructionMethod",
      headerName: t("Pile_Table_ConstructionMethod"),
      sortable: false,
      width: 100,
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
      width: 40,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // 행 선택 이벤트 방지
            handleDeleteClick(params.row.id);
          }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <GuideBox>
      <Paper elevation={2} sx={{ width: "100%", height: "260px" }}>
        <CustomDataGrid
          rows={summaryList}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          onRowClick={(params: any) => handleRowClick(params.row.id)}
          selectedRowId={selectedId}
          disableColumnResize
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{"Confirm_Delete"}</DialogTitle>
        <DialogContent>{"Delete_Confirmation_Message"}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{"Cancel"}</Button>
          <Button color="error" onClick={confirmDelete}>
            {"Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </GuideBox>
  );
};

export default PileData;
