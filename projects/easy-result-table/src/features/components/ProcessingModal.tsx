import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  keyframes,
} from "@mui/material";

// 로딩 애니메이션 정의
const loadingDots = keyframes`
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
`;

interface TableStatus {
  tableName: string;
  status: "PENDING" | "PROCESSING" | "OK" | "NG";
  errorMessage?: string;
  pdfStatus?: "PENDING" | "PROCESSING" | "OK" | "NG";
  pdfErrorMessage?: string;
}

interface ProcessingModalProps {
  open: boolean;
  onClose?: () => void;
  tableStatuses: TableStatus[];
  currentTableName: string;
  canClose: boolean;
  onStop?: () => void;
  isStopping?: boolean;
  onDownloadPDF?: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  open,
  onClose,
  tableStatuses,
  currentTableName,
  canClose,
  onStop,
  isStopping,
  onDownloadPDF,
}) => {
  const hasProcessing = tableStatuses.some(
    (table) => table.status === "PROCESSING" || table.pdfStatus === "PROCESSING"
  );

  const allCompleted = tableStatuses.every((table) => table.status === "OK");
  const hasSuccessfulTables = tableStatuses.some(
    (table) => table.status === "OK"
  );
  const allProcessed = tableStatuses.every(
    (table) => table.status === "OK" || table.status === "NG"
  );

  return (
    <Dialog
      open={open}
      // onClose={canClose ? onClose : undefined}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Table Processing Status</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            maxHeight: 400,
            overflow: "auto",
            "& .MuiListItem-root": {
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              py: 1,
            },
          }}
        >
          {/* 헤더 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 4,
              py: 2,
              borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            }}
          >
            <Typography variant="body1">TABLE NAME</Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Typography variant="body1">API</Typography>
              <Typography variant="body1">PDF</Typography>
            </Box>
          </Box>
          <List>
            {tableStatuses.map((table) => (
              <ListItem key={table.tableName}>
                <ListItemText
                  sx={{ paddingRight: 4, paddingLeft: 4 }}
                  primary={
                    <Typography
                      component="div"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{table.tableName}</span>
                      <Box sx={{ display: "flex", gap: 5 }}>
                        <Typography
                          component="span"
                          sx={{
                            color:
                              table.status === "OK"
                                ? "success.main"
                                : table.status === "NG"
                                ? "error.main"
                                : "info.main",
                            ...(table.status === "PROCESSING" && {
                              "&::after": {
                                animation: `${loadingDots} 1s steps(5, end) infinite`,
                                content: '""',
                                display: "inline-block",
                                width: "20px",
                              },
                            }),
                          }}
                        >
                          {table.status === "PENDING"
                            ? "Pending"
                            : table.status === "PROCESSING"
                            ? "Processing"
                            : table.status === "OK"
                            ? "OK"
                            : "NG"}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            color:
                              table.pdfStatus === "OK"
                                ? "success.main"
                                : table.pdfStatus === "NG"
                                ? "error.main"
                                : table.pdfStatus === "PROCESSING"
                                ? "info.main"
                                : "text.secondary",
                            ...(table.pdfStatus === "PROCESSING" && {
                              "&::after": {
                                animation: `${loadingDots} 1s steps(5, end) infinite`,
                                content: '""',
                                display: "inline-block",
                                width: "20px",
                              },
                            }),
                          }}
                        >
                          {table.pdfStatus === "PENDING"
                            ? "Pending"
                            : table.pdfStatus === "PROCESSING"
                            ? "Processing"
                            : table.pdfStatus === "OK"
                            ? "OK"
                            : table.pdfStatus === "NG"
                            ? "NG"
                            : "-"}
                        </Typography>
                      </Box>
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {table.errorMessage && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          Error: {table.errorMessage}
                        </Typography>
                      )}
                      {table.pdfErrorMessage && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          PDF Error: {table.pdfErrorMessage}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
        <Button
          variant="contained"
          onClick={onStop}
          color="error"
          disabled={!hasProcessing || isStopping}
          sx={{ visibility: hasProcessing ? "visible" : "hidden" }}
        >
          {isStopping ? "Stopping..." : "Stop"}
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          {hasSuccessfulTables &&
            allProcessed &&
            onDownloadPDF &&
            !hasProcessing && (
              <Button onClick={onDownloadPDF} variant="contained">
                DOWNLOAD SUCCESSFUL PDF
              </Button>
            )}
          {canClose && (
            <Button variant="contained" onClick={onClose}>
              CLOSE
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessingModal;
