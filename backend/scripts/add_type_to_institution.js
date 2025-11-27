require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function addTypeToInstitution() {
    console.log('--- Adding Type to Test Institution ---');
    try {
        const instId = 'J6cVtxCzfOhnMbRBHsEL';
        await db.collection('institutions').doc(instId).update({
            type: 'NGO'
        });
        console.log(`Updated institution ${instId} with type: NGO`);
    } catch (error) {
        console.error('Error:', error);
    }
}

addTypeToInstitution();
