require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function backfillAllPosts() {
    console.log('--- Backfilling Location for ALL Posts ---');
    try {
        const postsSnapshot = await db.collection('communityPosts').get();
        console.log(`Found ${postsSnapshot.size} total posts.`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        const batchSize = 500;
        let batch = db.batch();
        let operationCounter = 0;

        for (const doc of postsSnapshot.docs) {
            const post = doc.data();

            // If post already has state, skip (optional, but good for efficiency)
            // Actually, let's update anyway in case they moved or it was partial

            if (!post.authorId) {
                console.log(`Skipping post ${doc.id}: No authorId`);
                skippedCount++;
                continue;
            }

            try {
                // Fetch author details
                // Note: In a massive DB, fetching one by one is slow. 
                // But for this size, it's fine.
                const userDoc = await db.collection('users').doc(post.authorId).get();

                if (!userDoc.exists) {
                    // Try institutions
                    const instDoc = await db.collection('institutions').doc(post.authorId).get();
                    if (instDoc.exists) {
                        const instData = instDoc.data();
                        // Check if institution has structured data
                        if (instData.state) {
                            const postRef = db.collection('communityPosts').doc(doc.id);
                            batch.update(postRef, {
                                state: instData.state,
                                district: instData.district || null,
                                subDistrict: instData.subDistrict || null,
                                village: instData.village || null,
                                institutionType: instData.type || 'Institution',
                                location: `${instData.village ? instData.village + ', ' : ''}${instData.subDistrict ? instData.subDistrict + ', ' : ''}${instData.district ? instData.district + ', ' : ''}${instData.state}`
                            });
                            updatedCount++;
                            operationCounter++;
                        } else {
                            console.log(`Institution ${instData.institutionName} has no location data. Skipping post ${doc.id}`);
                            skippedCount++;
                        }
                        continue;
                    } else {
                        console.log(`Author not found for post ${doc.id}`);
                        skippedCount++;
                        continue;
                    }
                }

                const userData = userDoc.data();

                if (userData.state) {
                    const postRef = db.collection('communityPosts').doc(doc.id);
                    batch.update(postRef, {
                        state: userData.state,
                        district: userData.district || null,
                        subDistrict: userData.subDistrict || null,
                        village: userData.village || null,
                        location: `${userData.village ? userData.village + ', ' : ''}${userData.subDistrict ? userData.subDistrict + ', ' : ''}${userData.district ? userData.district + ', ' : ''}${userData.state}`
                    });
                    updatedCount++;
                    operationCounter++;
                } else {
                    console.log(`User ${userData.name} has no location data. Skipping post ${doc.id}`);
                    skippedCount++;
                }

            } catch (err) {
                console.error(`Error processing post ${doc.id}:`, err);
                errorCount++;
            }

            // Commit batch if full
            if (operationCounter >= batchSize) {
                await batch.commit();
                batch = db.batch();
                operationCounter = 0;
                console.log(`Committed batch. Progress...`);
            }
        }

        // Commit remaining
        if (operationCounter > 0) {
            await batch.commit();
        }

        console.log('--- Backfill Complete ---');
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

backfillAllPosts();
