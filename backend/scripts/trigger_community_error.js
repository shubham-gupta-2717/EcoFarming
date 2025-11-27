require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function triggerCommunityErrors() {
    console.log('--- Triggering Community Index Errors ---');

    const scopes = [
        { name: 'State', filter: { field: 'state', value: 'BIHAR' } },
        { name: 'District', filter: { field: 'district', value: 'Nawada' } },
        { name: 'SubDistrict', filter: { field: 'subDistrict', value: 'Hisua' } }
    ];

    for (const scope of scopes) {
        console.log(`\n--- Triggering ${scope.name} Filter Error ---`);
        try {
            // Simulate the query in communityController.js
            // query.where(field, '==', value).orderBy('createdAt', 'desc')
            await db.collection('communityPosts')
                .where(scope.filter.field, '==', scope.filter.value)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            console.log(`Success? (Unexpected if index is missing for ${scope.name})`);
        } catch (error) {
            console.log(`Caught Expected Error for ${scope.name}:`);
            console.log(error.message);
        }
    }
    process.exit(0);
}

triggerCommunityErrors();
