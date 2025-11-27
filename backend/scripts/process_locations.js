const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ODS_PATH = '/Users/shubhamgupta/EcoFarming/Indian Villages.ods';
const OUTPUT_PATH = path.join(__dirname, '../src/data/locations.json');

try {
    console.log('Reading ODS file...');
    const workbook = XLSX.readFile(ODS_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Processing data...');

    // Structure: { State: { District: [SubDistricts] } }
    const hierarchy = {};

    // Headers are at index 0
    // Indices based on previous analysis:
    // 3: Level (STATE, DISTRICT, SUB-DISTRICT)
    // 8: Name
    // 0: State Code
    // 1: District Code
    // 2: Sub District Code

    // We need to map codes to names to build the hierarchy correctly because
    // the rows are flat but ordered.
    // However, a simpler approach for this specific dataset structure (which seems to be census data):
    // It usually lists STATE, then its DISTRICTs, then SUB-DISTRICTs.
    // But looking at the sample:
    // Row 2: STATE "JAMMU & KASHMIR"
    // Row 3: DISTRICT "Kupwara" (State 01, Dist 001)
    // Row 4: SUB-DISTRICT "Kupwara" (State 01, Dist 001, SubDist 00001)

    // Better approach: Store mapping of codes to names.
    const stateMap = {}; // code -> name
    const districtMap = {}; // stateCode_distCode -> name

    // First pass: Identify States and Districts
    data.forEach((row, index) => {
        if (index === 0) return; // Skip header

        const stateCode = row[0];
        const distCode = row[1];
        const subDistCode = row[2];
        const level = row[3];
        const name = row[8];

        if (!name) return;

        if (level === 'STATE') {
            stateMap[stateCode] = name;
            if (!hierarchy[name]) {
                hierarchy[name] = {};
            }
        } else if (level === 'DISTRICT') {
            const stateName = stateMap[stateCode];
            if (stateName) {
                districtMap[`${stateCode}_${distCode}`] = name;
                if (!hierarchy[stateName][name]) {
                    hierarchy[stateName][name] = [];
                }
            }
        }
    });

    // Second pass: Add Sub-Districts
    data.forEach((row, index) => {
        if (index === 0) return;

        const stateCode = row[0];
        const distCode = row[1];
        const level = row[3];
        const name = row[8];

        if (level === 'SUB-DISTRICT') {
            const stateName = stateMap[stateCode];
            const districtName = districtMap[`${stateCode}_${distCode}`];

            if (stateName && districtName) {
                // Avoid duplicates if any
                if (!hierarchy[stateName][districtName].includes(name)) {
                    hierarchy[stateName][districtName].push(name);
                }
            }
        }
    });

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(hierarchy, null, 2));
    console.log(`Successfully wrote locations to ${OUTPUT_PATH}`);

    // Log stats
    const stateCount = Object.keys(hierarchy).length;
    console.log(`Processed ${stateCount} states.`);

} catch (error) {
    console.error('Error processing locations:', error);
}
