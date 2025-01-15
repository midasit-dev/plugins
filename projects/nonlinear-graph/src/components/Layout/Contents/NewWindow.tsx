import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useRecoilState } from "recoil";
import { HiddenBtnState } from "../../../values/RecoilValue";

interface NewWindowProps {
  children: React.ReactNode;
}

const NewWindow: React.FC<NewWindowProps> = ({ children }) => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [newWindow, setNewWindow] = React.useState<Window | null>(null);
  const [hidden, setHidden] = useRecoilState(HiddenBtnState);

  useEffect(() => {
    // 새 창 생성
    const win = window.open("", "_blank", "width=800,height=600");
    const div = document.createElement("div");
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    );
    styles.forEach((style) => {
      win?.document.head.appendChild(style.cloneNode(true));
    });
    if (win) {
      win.document.body.appendChild(div);
      setContainer(div);
      setNewWindow(win);
    }
    // 새 창이 닫힐 때 onClose 호출
    const handleUnload = () => {
      setHidden(false);
    };
    if (win) win.addEventListener("beforeunload", handleUnload);

    return () => {
      // 컴포넌트가 언마운트되면 새 창 닫기
      if (win) {
        win.removeEventListener("beforeunload", handleUnload);
        win.close();
        setHidden(false);
      }
    };
  }, []);

  if (!container) {
    return null;
  }

  // React Portal을 사용하여 새 창에 렌더링
  return ReactDOM.createPortal(children, container);
};

export default NewWindow;
