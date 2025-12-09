const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/locations.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const locations = JSON.parse(rawData);

    let cleanedCount = 0;

    for (const state in locations) {
        for (const district in locations[state]) {
            const places = locations[state][district];
            if (Array.isArray(places)) {
                // Map over places and clean any strings with newlines
                const newPlaces = places.map(p => {
                    const clean = p.split('\n')[0].trim();
                    if (clean !== p) cleanedCount++;
                    return clean;
                });
                // Remove duplicates after cleaning
                locations[state][district] = [...new Set(newPlaces)];
            }
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
    console.log(`Successfully cleaned locations.json. Fixed ${cleanedCount} corrupted entries.`);
} catch (error) {
    console.error('Error processing file:', error);
}
