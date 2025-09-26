import { Button } from "@midasit-dev/moaui";

const DownloadButton2 = ({
    valueToDownload = null,
    guideBoxProps = {},
    buttonProps = {},
    buttonName = "Download",
    fileName = "data.json"
}) => {
    const saveFile = async (content) => {
        const options = {
            suggestedName: fileName,
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
            }],
        };

        try {
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(content, null, 2)); // pretty-print
            await writable.close();
            console.log("File Saved.");
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("File save cancelled or failed.", err);
            }
        }
    };

    const handleDownload = () => {
        if (valueToDownload) {
            saveFile(valueToDownload);
        } else {
            // 예시: 각 키로 JSON을 저장
            saveFile({ message: "DownloadButton2, world!", count: 1 });
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            width="100%"   // 부모 크기에 맞춤
            height="100%"  // 부모 높이에 맞춤
            {...buttonProps}
        >
            {buttonName}
        </Button>
    );
};

export default DownloadButton2;