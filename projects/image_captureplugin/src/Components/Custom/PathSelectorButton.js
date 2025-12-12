import { Button } from "@midasit-dev/moaui";
import { useState } from 'react';

const PathSelectorButton = ({
    onPathSelected = null,
    guideBoxProps = {},
    buttonProps = {},
    buttonName = "Select Path",
    showSelectedPath = true
}) => {
    const [selectedPath, setSelectedPath] = useState("");

    const selectDirectory = async () => {
        try {
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite', // 읽기/쓰기 권한
            });
            
            // 선택된 디렉토리의 전체 경로 구성
            const pathParts = [];
            let currentHandle = directoryHandle;
            
            // 브라우저 보안상 전체 시스템 경로는 직접 접근할 수 없으므로
            // 선택된 폴더명과 핸들 정보를 사용
            const folderName = directoryHandle.name;
            const fullPath = folderName; // 브라우저에서는 상대 경로만 가능
            
            setSelectedPath(fullPath);
            
            // 상위 컴포넌트에 경로와 핸들을 전달
            if (onPathSelected) {
                onPathSelected({
                    path: fullPath,
                    directoryHandle: directoryHandle,
                    name: folderName
                });
            }
            
            console.log("선택된 경로:", fullPath);
            console.log("디렉토리 핸들:", directoryHandle);
            
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("폴더 선택이 취소되거나 실패했습니다.", err);
            }
        }
    };

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                onClick={selectDirectory}
                width="100%"
                height="100%"
                {...buttonProps}
            >
                {buttonName}
            </Button>
            
            {showSelectedPath && selectedPath && (
                <div style={{ 
                    marginTop: "8px", 
                    padding: "8px", 
                    backgroundColor: "#f5f5f5", 
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#666"
                }}>
                    선택된 경로: {selectedPath}
                </div>
            )}
        </div>
    );
};

export default PathSelectorButton;