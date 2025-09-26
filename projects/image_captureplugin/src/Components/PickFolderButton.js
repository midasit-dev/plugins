import { __assign, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from '@midasit-dev/moaui';

const PickFolderButton = (props) => {
    const { onAfterUpload, buttonProps, buttonName } = props;
    const inputRef = useRef(null);
    const [folderName, setFolderName] = useState(null);

    const handleClick = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }, []);

    const handleUpload = useCallback((e) => {
        const files = e.target.files;
        if (!files.length) return;

        const paths = Array.from(files).map(file => file.webkitRelativePath);
        const folderNames = paths.map(path => path.split('/')[0]);
        setFolderName([...new Set(folderNames)].join(", "));
    }, []);

    useEffect(() => {
        if (folderName && onAfterUpload) {
            onAfterUpload(folderName);
        }
    }, [folderName, onAfterUpload]);

    return (
        _jsxs("label", { htmlFor: "upload-button", children: [
            _jsx("input", {
                ref: inputRef,
                id: "upload-button",
                type: "file",
                onChange: handleUpload,
                style: { display: "none" },
                webkitdirectory: "true",
                mozdirectory: "true",
                directory: "true"
            }),
            _jsx(Button, __assign({ onClick: handleClick }, buttonProps, { children: buttonName !== null && buttonName !== void 0 ? buttonName : "Select Folder" }))
        ] })
    );
};

export default PickFolderButton;
