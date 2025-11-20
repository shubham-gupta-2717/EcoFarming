const API_BASE = 'http://localhost:5000/api/learning';

async function testLearningModule() {
    console.log('Testing Learning Module APIs...');

    try {
        // Test Snippets
        console.log('\n1. Testing /snippets...');
        const snippetsRes = await fetch(`${API_BASE}/snippets`);
        const snippetsData = await snippetsRes.json();
        if (snippetsRes.ok && snippetsData.success && snippetsData.snippets.length > 0) {
            console.log('✅ Snippets fetched successfully');
            console.log(`   Count: ${snippetsData.snippets.length}`);
        } else {
            console.error('❌ Failed to fetch snippets');
        }

        // Test Quiz
        console.log('\n2. Testing /quiz...');
        const quizRes = await fetch(`${API_BASE}/quiz`);
        const quizData = await quizRes.json();
        if (quizRes.ok && quizData.success && quizData.quiz.length > 0) {
            console.log('✅ Quiz fetched successfully');
            console.log(`   Count: ${quizData.quiz.length}`);
        } else {
            console.error('❌ Failed to fetch quiz');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testLearningModule();
