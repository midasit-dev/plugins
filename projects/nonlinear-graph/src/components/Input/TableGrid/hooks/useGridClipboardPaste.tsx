import { useCallback, useRef } from "react";

/**
 * 클립보드 텍스트(TSV)를 2차원 배열로 변환한다.
 *
 * Excel/스프레드시트는 셀을 탭, 행을 개행으로 구분하며 탭·개행·큰따옴표를 포함한
 * 셀은 큰따옴표로 감싸고 내부 큰따옴표는 두 번 반복해서 내보낸다.
 */
export function parseClipboardTable(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char !== '"') {
        value += char;
      } else if (text[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        quoted = false;
      }
      continue;
    }

    if (char === '"' && value === "") quoted = true;
    else if (char === "\t") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") value += char;
  }
  row.push(value);
  rows.push(row);

  // 마지막 개행 때문에 생긴 빈 행 제거
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === ""))
    rows.pop();

  return rows;
}

/**
 * DataGrid(Community)에 다중 셀 붙여넣기를 붙인다.
 *
 * Premium의 onBeforeClipboardPasteStart 대체용으로, 반환된 props를 그리드를 감싸는
 * 요소에 펼쳐 넣으면 된다. 감싸는 요소는 display: contents 라 레이아웃에 영향이 없다.
 *
 * @param onPaste 파싱된 데이터를 받는 핸들러. 붙여넣기를 취소할 때는 예외를 던진다.
 */
const useGridClipboardPaste = (
  onPaste: (params: { data: string[][] }) => void | Promise<void>
) => {
  const handlerRef = useRef(onPaste);
  handlerRef.current = onPaste;

  const onPasteCapture = useCallback((event: React.ClipboardEvent) => {
    const text = event.clipboardData?.getData("text/plain");
    if (!text) return;

    // 편집 중인 셀에 단일 값을 붙여넣는 경우는 기본 동작을 유지한다.
    const tagName = (event.target as HTMLElement)?.tagName;
    const editing = tagName === "INPUT" || tagName === "TEXTAREA";
    if (editing && !/[\t\r\n]/.test(text)) return;

    event.preventDefault();
    event.stopPropagation();

    const data = parseClipboardTable(text);
    if (isEmptyTable(data)) return;

    // 핸들러는 유효성 검사 실패 시 예외로 붙여넣기를 취소하며, 사용자 알림은
    // 핸들러 내부에서 처리한다.
    Promise.resolve()
      .then(() => handlerRef.current({ data }))
      .catch(() => {});
  }, []);

  return {
    style: { display: "contents" } as const,
    onPasteCapture,
  };
};

function isEmptyTable(data: string[][]) {
  return data.length === 0 || data.every((row) => row.every((cell) => !cell));
}

export default useGridClipboardPaste;
