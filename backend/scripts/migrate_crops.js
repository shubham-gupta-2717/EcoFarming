const { db } = require('../src/config/firebase');

const migrateCrops = async () => {
    console.log('Starting migration of supportedCrops...');
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();

        if (snapshot.empty) {
            console.log('No users found.');
            return;
        }

        let count = 0;
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            const crops = data.crops || [];

            // Generate supportedCrops array
            // Handle both array of objects AND legacy string/array formats if any
            let supportedCrops = [];

            if (Array.isArray(crops)) {
                supportedCrops = crops.map(c => typeof c === 'object' ? c.cropName : c).filter(Boolean);
            }

            // Standardize to array of strings
            supportedCrops = [...new Set(supportedCrops)]; // Unique

            if (supportedCrops.length > 0) {
                const docRef = usersRef.doc(doc.id);
                batch.update(docRef, { supportedCrops });
                count++;
            }
        });

        await batch.commit();
        console.log(`Successfully migrated ${count} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateCrops();
