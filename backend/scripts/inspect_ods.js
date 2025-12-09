const XLSX = require('xlsx');
const path = require('path');

const ODS_PATH = path.join(__dirname, '../../Indian Villages.ods');

try {
    const workbook = XLSX.readFile(ODS_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const header = rows[0];
    console.log('--- Header Mapping ---');
    header.forEach((col, idx) => {
        console.log(`${idx}: ${col}`);
    });

} catch (error) {
    console.error(error);
}
