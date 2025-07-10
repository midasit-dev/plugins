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
    (table) => table.status === "PROCESSING"
  );

  const allCompleted = tableStatuses.every((table) => table.status === "OK");

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
                    </Typography>
                  }
                  secondary={
                    table.errorMessage && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        Error: {table.errorMessage}
                      </Typography>
                    )
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
          {allCompleted && onDownloadPDF && (
            <Button onClick={onDownloadPDF} variant="contained">
              DOWNLOAD ALL PDF
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
