
export const UpdateCurrent = (copy, importData, setImportData) => {
    if (copy["DB"]) {
        const newImportData = JSON.parse(JSON.stringify(importData));
        newImportData["CURRENT"] = copy;
        setImportData(newImportData);
    }
}