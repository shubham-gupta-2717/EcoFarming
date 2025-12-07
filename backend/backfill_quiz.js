const { db, admin } = require('./src/config/firebase');

async function backfillQuizPoints() {
    try {
        const userId = 'SED3LBYAFBSmEBf32OTFuMSpx7C3'; // Ram(Checking)
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log('User not found');
            return;
        }

        // We know the discrepancy is 25 points (1030 - 1005)
        // We will add a HISTORY entry for this, but NOT update the score (since score is already 1030)

        console.log(`Backfilling missing 25 points history for ${userId}...`);

        await db.collection('ecoscore_history').add({
            userId,
            oldScore: 1005,
            newScore: 1030,
            change: 25,
            reason: 'Quiz Completion (Restored History)',
            actionType: 'QUIZ_COMPLETION',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Backfill complete.');

    } catch (error) {
        console.error('Error:', error);
    }
}

backfillQuizPoints();
