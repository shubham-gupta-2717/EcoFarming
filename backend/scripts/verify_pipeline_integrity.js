const { getPipelineForCrop } = require('../src/data/cropPipelines');

async function verifyPipelines() {
    console.log('🔍 Starting Pipeline Verification...\n');

    const cropsToTest = ['Wheat', 'Cotton', 'Sugarcane', 'Tomato'];
    let passed = 0;
    let failed = 0;

    for (const crop of cropsToTest) {
        console.log(`Checking pipeline for: ${crop}`);
        const pipeline = getPipelineForCrop(crop);

        if (pipeline) {
            console.log(`✅ Pipeline found for ${crop} with ${pipeline.length} stages.`);

            // Check Stage 1
            const stage1 = pipeline.find(s => s.id === 1);
            if (stage1) {
                console.log(`   - Stage 1: "${stage1.title}" found.`);

                // Check Hindi Audio
                if (stage1.audioTextHindi) {
                    console.log(`   - 🔊 Hindi Audio: Present ("${stage1.audioTextHindi.substring(0, 20)}...")`);
                } else {
                    console.error(`   - ❌ Hindi Audio: MISSING in Stage 1!`);
                    failed++;
                    continue;
                }

                // Check other critical fields
                if (stage1.task && stage1.description) {
                    console.log(`   - 📝 Task & Description: Present`);
                } else {
                    console.error(`   - ❌ Missing Task or Description`);
                    failed++;
                }
            } else {
                console.error(`   - ❌ Stage 1 MISSING!`);
                failed++;
            }
            passed++;
        } else {
            console.log(`ℹ️ No static pipeline for ${crop}. (This is expected for non-pipeline crops like Tomato/Sugarcane which use pure AI)`);
        }
        console.log('-----------------------------------');
    }

    if (failed === 0) {
        console.log('\n✨ ALL PIPELINE CHECKS PASSED!');
    } else {
        console.log(`\n⚠️ ${failed} CHECKS FAILED.`);
        process.exit(1);
    }
}

verifyPipelines();
