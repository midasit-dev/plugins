import { Button } from '@midasit-dev/moaui';
import { useCallback, useEffect, useRef, useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { __assign, __read } from "tslib";

var AddFileButton = function (props) {
    var onAfterUpload = props.onAfterUpload, buttonProps = props.buttonProps, buttonName = props.buttonName;
    var onClick = props.onClick;
    var inputRef = useRef(null);
    var _a = __read(useState(null), 2), uploadedData = _a[0], setUploadedData = _a[1];
    var _b = __read(useState(null), 2), fileName = _b[0], setFileName = _b[1];
    
    var handleClick = useCallback(function () {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }, []);
    
    var handleUpload = useCallback(function (e) {
        var file = e.target.files[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                if (!e.target)
                    return;
                if (e.target.result === null)
                    return;
                if (e.target.result instanceof ArrayBuffer)
                    return;
                var data = JSON.parse(e.target.result);

                setUploadedData(data);
            }
            catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };
        reader.readAsText(file);
        setFileName(file.name);
    }, []);
    
    useEffect(function () {
        if (uploadedData && onAfterUpload) {
            onAfterUpload(uploadedData, fileName);
        }
    }, [uploadedData, setUploadedData]);

    return (_jsxs("label", { 
        htmlFor: "upload-button", 
        style: { width: "100%", height: "100%", display: "block" },
        children: [
            _jsx("input", { 
                ref: inputRef, 
                id: "upload-button", 
                type: "file", 
                onChange: handleUpload, 
                style: { display: "none" } 
            }), 
            _jsx(Button, __assign({ 
                onClick: handleClick,
                width: "100%",
                height: "100%"
            }, buttonProps, { 
                children: buttonName !== null && buttonName !== void 0 ? buttonName : "Upload" 
            }))
        ] 
    }));
};

export default AddFileButton;