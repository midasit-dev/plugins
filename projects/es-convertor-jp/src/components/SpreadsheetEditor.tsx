// Spreadsheet Editor Component
// Excel-like grid using AG Grid Community

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  CellValueChangedEvent,
  GridReadyEvent,
  GridApi,
  CellContextMenuEvent,
  CellFocusedEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface SpreadsheetColumn {
  key: string;
  label: string;
  width?: number;
  options?: string[];  // Dropdown options for this column
}

export interface HeaderCellValue {
  row: number;      // 0-based row index within header rows
  col: number;      // 0-based column index
  value: string;    // Fixed value to display
}

interface SpreadsheetEditorProps {
  columns: SpreadsheetColumn[];
  data: (string | number)[][];
  onChange: (data: (string | number)[][]) => void;
  minRows?: number;
  height?: number;  // Grid height in pixels (default: 400)
  headerRows?: number;  // Number of header rows (default: 1)
  headerValues?: HeaderCellValue[];  // Fixed values for header cells
}

const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({
  columns,
  data,
  onChange,
  minRows = 20,
  height = 400,
  headerRows = 1,
  headerValues = [],
}) => {
  const { t } = useTranslation();
  const PLACEHOLDER = t('spreadsheet.pasteHere');
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    rowIndex: number;
  }>({ visible: false, x: 0, y: 0, rowIndex: -1 });

  // Focused cell row index
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  const hasData = data.length > 0;
  const rowCount = hasData ? Math.max(0, data.length - headerRows) : 0;  // Exclude header rows

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(prev => ({ ...prev, visible: false }));
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  // Get grid scroll container
  const getScrollContainer = useCallback(() => {
    return containerRef.current?.querySelector('.ag-body-viewport') as HTMLElement | null;
  }, []);

  // Insert row below selected row (from context menu)
  const handleInsertRowContext = useCallback(() => {
    const rowIndex = contextMenu.rowIndex;
    const newRow: (string | number)[] = columns.map(() => '');
    const newData = [...data];
    newData.splice(rowIndex + 1, 0, newRow);

    // Save scroll position
    const scrollContainer = getScrollContainer();
    const scrollTop = scrollContainer?.scrollTop ?? 0;

    onChange(newData);
    setContextMenu(prev => ({ ...prev, visible: false }));

    // Restore scroll position after render
    requestAnimationFrame(() => {
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = scrollTop;
      }
    });
  }, [contextMenu.rowIndex, columns, data, onChange, getScrollContainer]);

  // Delete selected row (from context menu)
  const handleDeleteRowContext = useCallback(() => {
    const rowIndex = contextMenu.rowIndex;
    if (rowIndex < 0 || rowIndex >= data.length) return;

    // Save scroll position
    const scrollContainer = getScrollContainer();
    const scrollTop = scrollContainer?.scrollTop ?? 0;

    const newData = data.filter((_, i) => i !== rowIndex);
    onChange(newData);
    setContextMenu(prev => ({ ...prev, visible: false }));

    // Restore scroll position after render
    requestAnimationFrame(() => {
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = scrollTop;
      }
    });
  }, [contextMenu.rowIndex, data, onChange, getScrollContainer]);

  // Insert row below focused cell (from button)
  const handleInsertRow = useCallback(() => {
    if (focusedRowIndex < 0) return;
    const newRow: (string | number)[] = columns.map(() => '');
    const newData = [...data];
    newData.splice(focusedRowIndex + 1, 0, newRow);

    const scrollContainer = getScrollContainer();
    const scrollTop = scrollContainer?.scrollTop ?? 0;

    onChange(newData);

    requestAnimationFrame(() => {
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = scrollTop;
      }
    });
  }, [focusedRowIndex, columns, data, onChange, getScrollContainer]);

  // Delete focused row (from button)
  const handleDeleteRow = useCallback(() => {
    if (focusedRowIndex < 0 || focusedRowIndex >= data.length) return;

    const scrollContainer = getScrollContainer();
    const scrollTop = scrollContainer?.scrollTop ?? 0;

    const newData = data.filter((_, i) => i !== focusedRowIndex);
    onChange(newData);

    requestAnimationFrame(() => {
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = scrollTop;
      }
    });
  }, [focusedRowIndex, data, onChange, getScrollContainer]);

  // Reset all data
  const handleReset = useCallback(() => {
    onChange([]);
    setFocusedRowIndex(-1);
  }, [onChange]);

  // Handle cell focus change
  const onCellFocused = useCallback((event: CellFocusedEvent) => {
    setFocusedRowIndex(event.rowIndex ?? -1);
  }, []);

  // Handle right-click on cells
  const onCellContextMenu = useCallback((event: CellContextMenuEvent) => {
    const colId = event.column?.getColId();
    // Only show context menu for row number column
    if (colId === 'rowNum') {
      event.event?.preventDefault();
      const mouseEvent = event.event as MouseEvent;
      setContextMenu({
        visible: true,
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
        rowIndex: event.rowIndex ?? -1,
      });
    }
  }, []);

  // Convert columns to AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(() => {
    // Row number column
    const rowNumCol: ColDef = {
      colId: 'rowNum',
      headerName: '',
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      editable: false,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellClass: 'row-number-cell',
      valueGetter: (params: any) => {
        if (params.node.rowIndex < headerRows) return '';  // No number for header rows
        return params.node.rowIndex - headerRows + 1;  // 1, 2, 3... (data rows only)
      },
    };

    // Check if a cell has a fixed header value
    const hasFixedValue = (rowIndex: number, colIndex: number) => {
      return headerValues.some(hv => hv.row === rowIndex && hv.col === colIndex);
    };

    // Data columns
    const dataCols = columns.map((col, index) => ({
      field: `col${index}`,
      headerName: col.label,
      editable: (params: any) => !hasFixedValue(params.node.rowIndex, index),  // Only fixed value cells are not editable
      minWidth: col.width || 60,
      width: col.width,
      flex: col.width ? undefined : 1,
      cellEditor: col.options ? 'agSelectCellEditor' : 'agTextCellEditor',
      cellEditorParams: col.options ? { values: ['', ...col.options] } : undefined,
      cellClassRules: {
        'header-row-cell': (params: any) => params.node.rowIndex < headerRows && hasData,
        'placeholder-cell-yellow': (params: any) => params.node.rowIndex === 0 && !hasData && index === 0,
        'placeholder-cell-gray': (params: any) => params.node.rowIndex < headerRows && !hasData && (params.node.rowIndex > 0 || index > 0),
      },
    }));

    return [rowNumCol, ...dataCols];
  }, [columns, hasData, headerRows, headerValues]);

  // Create a map of fixed header values for quick lookup
  const headerValueMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const hv of headerValues) {
      map.set(`${hv.row}-${hv.col}`, hv.value);
    }
    return map;
  }, [headerValues]);

  // Convert data to AG Grid row data format
  const rowData = useMemo(() => {
    const rows: Record<string, string | number>[] = [];
    const totalRows = Math.max(data.length, minRows + headerRows);

    for (let i = 0; i < totalRows; i++) {
      const row: Record<string, string | number> = { _rowIndex: i };

      for (let j = 0; j < columns.length; j++) {
        // Check for fixed header value
        const fixedValue = headerValueMap.get(`${i}-${j}`);
        if (fixedValue !== undefined) {
          row[`col${j}`] = fixedValue;
        } else if (i === 0 && !hasData) {
          // Placeholder row
          row[`col${j}`] = j === 0 ? PLACEHOLDER : '';
        } else {
          row[`col${j}`] = data[i]?.[j] ?? '';
        }
      }

      rows.push(row);
    }

    return rows;
  }, [data, columns, minRows, hasData, headerRows, headerValueMap]);

  // Handle cell value changes - only update the changed cell
  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      const rowIndex = event.rowIndex;
      const colField = event.column.getColId();
      const colIndex = parseInt(colField.replace('col', ''), 10);
      const newValue = event.newValue === PLACEHOLDER ? '' : (event.newValue ?? '');

      if (rowIndex === undefined || rowIndex === null || isNaN(colIndex)) return;

      // Create a copy of data with the changed cell
      const newData = data.map((row, i) => {
        if (i === rowIndex) {
          const newRow = [...row];
          newRow[colIndex] = newValue;
          return newRow;
        }
        return row;
      });

      // Ensure row exists if it's a new row
      while (newData.length <= rowIndex) {
        newData.push(columns.map(() => ''));
      }
      if (newData[rowIndex] !== undefined) {
        const newRow = [...newData[rowIndex]];
        newRow[colIndex] = newValue;
        newData[rowIndex] = newRow;
      }

      // Trim trailing empty rows
      let lastNonEmptyRow = -1;
      for (let i = 0; i < newData.length; i++) {
        const hasValue = newData[i].some(v => v !== undefined && v !== '' && v !== PLACEHOLDER);
        if (hasValue) lastNonEmptyRow = i;
      }

      const trimmedData = newData.slice(0, lastNonEmptyRow + 1);
      onChange(trimmedData);
    },
    [data, columns, onChange]
  );

  // Handle paste
  const onPasteEnd = useCallback(() => {
    if (!gridApiRef.current) return;

    const newData: (string | number)[][] = [];
    let lastNonEmptyRow = -1;

    gridApiRef.current.forEachNode((node, index) => {
      const row: (string | number)[] = [];
      let hasValue = false;

      for (let j = 0; j < columns.length; j++) {
        const value = node.data[`col${j}`];
        if (value !== undefined && value !== '' && value !== PLACEHOLDER) {
          hasValue = true;
        }
        row.push(value === PLACEHOLDER ? '' : (value ?? ''));
      }

      if (hasValue) {
        lastNonEmptyRow = index;
      }

      newData.push(row);
    });

    const trimmedData = newData.slice(0, lastNonEmptyRow + 1);
    onChange(trimmedData);
  }, [columns, onChange]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
  }, []);

  // Handle paste from clipboard
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData || !gridApiRef.current) return;

    const focusedCell = gridApiRef.current.getFocusedCell();
    if (!focusedCell) return;

    const startRowIndex = focusedCell.rowIndex;
    const startColIndex = columnDefs.findIndex(col => col.field === focusedCell.column.getColId());

    // Skip if pasting into row number column
    if (startColIndex <= 0) return;

    // Parse clipboard data (tab-separated values)
    const rows = clipboardData.split(/\r?\n/).filter(row => row.trim() !== '');
    const pastedData = rows.map(row => row.split('\t'));

    // Build new data array (deep copy)
    const newData = data.map(row => [...row]);

    for (let i = 0; i < pastedData.length; i++) {
      const targetRowIndex = startRowIndex + i;

      // Ensure row exists
      while (newData.length <= targetRowIndex) {
        newData.push(columns.map(() => ''));
      }

      // Ensure row is a mutable array
      if (!newData[targetRowIndex]) {
        newData[targetRowIndex] = columns.map(() => '');
      } else {
        // Make sure existing row is a new array (deep copy)
        newData[targetRowIndex] = [...newData[targetRowIndex]];
      }

      for (let j = 0; j < pastedData[i].length; j++) {
        const targetColIndex = (startColIndex - 1) + j;  // -1 because of row number column
        if (targetColIndex >= 0 && targetColIndex < columns.length) {
          newData[targetRowIndex][targetColIndex] = pastedData[i][j];
        }
      }
    }

    onChange(newData);
    e.preventDefault();
  }, [data, columns, columnDefs, onChange]);


  // Default column settings
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: false,
    filter: false,
    resizable: true,
    suppressMovable: true,
  }), []);

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <style>{`
        .ag-theme-alpine {
          --ag-font-size: 11px;
          --ag-row-height: 24px;
          --ag-header-height: 28px;
          font-size: 11px !important;
        }
        .ag-theme-alpine .ag-cell {
          border-right: 1px solid #d0d0d0 !important;
        }
        .ag-theme-alpine .ag-cell-focus {
          border: 2px solid #2196f3 !important;
          outline: none !important;
          z-index: 1;
          position: relative;
        }
        .ag-theme-alpine .ag-cell {
          font-size: 11px !important;
        }
        .ag-theme-alpine .ag-cell-value {
          font-size: 11px !important;
        }
        .ag-theme-alpine input.ag-input-field-input {
          font-size: 11px !important;
        }
        .ag-theme-alpine .ag-row-first .ag-cell {
          font-weight: 500;
        }
        .header-row-cell {
          background-color: #e3f2fd !important;
          font-weight: 500 !important;
        }
        .placeholder-cell-yellow {
          background-color: #fff3cd !important;
          color: #856404 !important;
          font-weight: 500 !important;
        }
        .placeholder-cell-gray {
          background-color: #e9ecef !important;
        }
        .row-number-cell {
          background-color: #f5f5f5 !important;
          color: #666 !important;
          text-align: center !important;
          font-size: 10px !important;
          cursor: pointer;
        }
        .ag-theme-alpine .ag-cell {
          line-height: 22px;
        }
        .ag-theme-alpine .ag-header-cell-label {
          font-size: 11px;
        }
        /* Hide row numbers header but keep row numbers */
        .ag-theme-alpine .ag-header-row .ag-header-cell:first-child {
          background-color: #f5f5f5;
        }
      `}</style>

      <div
        ref={containerRef}
        className="ag-theme-alpine"
        style={{
          width: '100%',
          height: height,
        }}
        onContextMenu={(e) => e.preventDefault()}
        onPaste={handlePaste}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onPasteEnd={onPasteEnd}
          onCellContextMenu={onCellContextMenu}
          onCellFocused={onCellFocused}
          rowSelection="multiple"
          enableRangeSelection={false}
          suppressRowClickSelection={true}
          stopEditingWhenCellsLoseFocus={true}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
          headerHeight={0}
          suppressContextMenu={true}
          getRowId={(params) => String(params.data?._rowIndex ?? 0)}
          animateRows={false}
        />
      </div>

      {/* Footer with buttons and row count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleInsertRow}
            disabled={focusedRowIndex < 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: '1px solid #ccc',
              borderRadius: 4,
              backgroundColor: focusedRowIndex < 0 ? '#eee' : 'white',
              cursor: focusedRowIndex < 0 ? 'not-allowed' : 'pointer',
              opacity: focusedRowIndex < 0 ? 0.5 : 1,
            }}
            title={t('spreadsheet.insertRow')}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleDeleteRow}
            disabled={focusedRowIndex < 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: '1px solid #ccc',
              borderRadius: 4,
              backgroundColor: focusedRowIndex < 0 ? '#eee' : 'white',
              cursor: focusedRowIndex < 0 ? 'not-allowed' : 'pointer',
              opacity: focusedRowIndex < 0 ? 0.5 : 1,
            }}
            title={t('spreadsheet.deleteRow')}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: '1px solid #ccc',
              borderRadius: 4,
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            title={t('spreadsheet.reset')}
          >
            <RotateCcw size={14} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#666' }}>
          {t('spreadsheet.rowCount', { count: rowCount })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: 100,
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            onClick={handleInsertRowContext}
          >
            {t('spreadsheet.insert')}
          </div>
          <div
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              borderTop: '1px solid #eee',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            onClick={handleDeleteRowContext}
          >
            {t('spreadsheet.delete')}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetEditor;
