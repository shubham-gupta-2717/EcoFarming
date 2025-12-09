const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ODS_PATH = path.join(__dirname, '../../Indian Villages.ods');
const OUTPUT_PATH = path.join(__dirname, '../src/data/locations.json');

console.log('Processing:', ODS_PATH);

try {
    const workbook = XLSX.readFile(ODS_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Column Mapping based on inspection
    // 0: State Code
    // 1: District Code
    // 2: Sub District Code
    // 3: Level
    // 8: Name

    const stateMap = {}; // code -> name
    const districtMap = {}; // stateCode_distCode -> name
    const structure = {}; // StateName -> { DistrictName -> [SubDistricts] }

    let count = 0;

    // Start from row 1 (skip header)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 9) continue;

        const stateCode = row[0];
        const distCode = row[1];
        const subDistCode = row[2];
        const level = (row[3] || '').toString().toUpperCase();
        const name = (row[8] || '').toString().trim();

        if (!name) continue;

        // Populate State Map
        if (level === 'STATE' || (stateCode && !distCode && !subDistCode)) { // Heuristic if Level column is flaky
            stateMap[stateCode] = name;
            if (!structure[name]) structure[name] = {};
        }

        // Populate District Map
        // Usually District rows have a State Code and District Code, but empty SubDist Code
        if (level === 'DISTRICT' || (stateCode && distCode && (!subDistCode || subDistCode == 0))) {
            const distKey = `${stateCode}_${distCode}`;
            districtMap[distKey] = name;

            const stateName = stateMap[stateCode];
            if (stateName) {
                if (!structure[stateName]) structure[stateName] = {};
                if (!structure[stateName][name]) structure[stateName][name] = [];
            }
        }

        // Populate Sub District
        if (level === 'SUB-DISTRICT' || level === 'TEHSIL' || level.includes('SUB') || (stateCode && distCode && subDistCode && subDistCode != 0)) {
            const stateName = stateMap[stateCode];
            const distKey = `${stateCode}_${distCode}`;
            const distName = districtMap[distKey];

            if (stateName && distName) {
                if (!structure[stateName]) structure[stateName] = {};
                if (!structure[stateName][distName]) structure[stateName][distName] = [];

                if (!structure[stateName][distName].includes(name)) {
                    structure[stateName][distName].push(name);
                }
            } else {
                // If we encounter a sub-district before its parent district/state (unlikely in sorted census data but possible)
                // We could log it, but usually standard census files are sorted.
            }
        }
    }

    // Pass 2: Fallback filler if 'Level' column was missing or misleading
    // If we have rows but structure is empty, we might need a different heuristic

    // Prune empty states? No, keep them.

    const stateCount = Object.keys(structure).length;
    console.log(`Extracted ${stateCount} states.`);

    // Safety check
    if (stateCount === 0) {
        console.error('Extraction failed. Zero states found. Dumping maps for debug:');
        console.log('StateMap Keys:', Object.keys(stateMap));
    } else {
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(structure, null, 2));
        console.log(`Saved to ${OUTPUT_PATH}`);
    }

} catch (error) {
    console.error('Error:', error);
}
