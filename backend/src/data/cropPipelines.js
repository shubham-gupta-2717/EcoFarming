const CROP_PIPELINES = {
    Wheat: [
        {
            id: 1,
            title: 'Soil Sampling & Testing',
            task: 'Collect soil samples from different parts of your field for testing.',
            description: 'Before sowing, it is crucial to know your soil health. Collect samples in a zig-zag pattern, mix them, and send for analysis to determine fertilizer needs.',
            audioText: 'Before sowing, it is crucial to know your soil health. Collect samples in a zig-zag pattern, mix them, and send for analysis to determine fertilizer needs.',
            verification: 'Upload a photo of your soil sample collection or the test report.',
            category: 'soil',
            difficulty: 'Easy',
            points: 50
        },
        {
            id: 2,
            title: 'Seed Selection & Treatment',
            task: 'Select certified seeds and treat them with fungicides/bio-agents.',
            description: 'Use high-yielding certified seeds. Treat them with Trichoderma or Carbendazim to protect against soil-borne diseases.',
            audioText: 'Use high-yielding certified seeds. Treat them with Trichoderma or Carbendazim to protect against soil-borne diseases.',
            verification: 'Upload a photo of the seed packet or the seed treatment process.',
            category: 'crop_practices',
            difficulty: 'Medium',
            points: 40
        },
        {
            id: 3,
            title: 'Land Preparation & Sowing',
            task: 'Plough the field and sow seeds at the recommended depth.',
            description: 'Plough the field 2-3 times to achieve fine tilth. Sow seeds at 4-5 cm depth using a seed drill for uniform spacing.',
            audioText: 'Plough the field 2-3 times to achieve fine tilth. Sow seeds at 4-5 cm depth using a seed drill for uniform spacing.',
            verification: 'Upload a photo of your field preparation or the sowing process.',
            category: 'crop_practices',
            difficulty: 'Hard',
            points: 100
        },
        {
            id: 4,
            title: 'First Irrigation (CRI Stage)',
            task: 'Apply the first irrigation at Crown Root Initiation stage (20-25 days).',
            description: 'The CRI stage is critical. Delay in irrigation here can reduce yield by up to 30%. Ensure uniform moisture.',
            audioText: 'The CRI stage is critical. Delay in irrigation here can reduce yield by up to 30%. Ensure uniform moisture.',
            verification: 'Upload a photo of your field being irrigated.',
            category: 'water',
            difficulty: 'Medium',
            points: 60
        },
        {
            id: 5,
            title: 'Weed Control',
            task: 'Remove weeds manually or apply recommended herbicides.',
            description: 'Check for broadleaf and grassy weeds. Remove them to prevent competition for nutrients.',
            audioText: 'Check for broadleaf and grassy weeds. Remove them to prevent competition for nutrients.',
            verification: 'Upload a photo of the weeded field or herbicide application.',
            category: 'pest',
            difficulty: 'Medium',
            points: 50
        },
        {
            id: 6,
            title: 'Harvesting',
            task: 'Harvest the crop when grains are hard and moisture is low.',
            description: 'Harvest when grains have less than 20% moisture. Use a combine harvester or sickles.',
            audioText: 'Harvest when grains have less than 20% moisture. Use a combine harvester or sickles.',
            verification: 'Upload a photo of the harvesting process or the harvested grain.',
            category: 'harvest',
            difficulty: 'Hard',
            points: 200
        }
    ],
    Cotton: [
        {
            id: 1,
            title: 'Field Preparation',
            task: 'Deep plough the field to remove old crop residues.',
            description: 'Deep ploughing helps in destroying soil-borne pests and improving aeration.',
            audioText: 'Deep ploughing helps in destroying soil-borne pests and improving aeration.',
            verification: 'Upload a photo of the ploughed field.',
            category: 'soil',
            difficulty: 'Medium',
            points: 50
        },
        {
            id: 2,
            title: 'Seed Sowing',
            task: 'Sow Bt-Cotton seeds with proper spacing (e.g., 90x60 cm).',
            description: 'Ensure proper spacing for aeration and sunlight. Sow seeds when soil moisture is adequate.',
            audioText: 'Ensure proper spacing for aeration and sunlight. Sow seeds when soil moisture is adequate.',
            verification: 'Upload a photo of the sowing process.',
            category: 'crop_practices',
            difficulty: 'Medium',
            points: 60
        },
        {
            id: 3,
            title: 'Gap Filling & Thinning',
            task: 'Fill gaps with new seeds and thin out weak seedlings.',
            description: 'Perform gap filling within 10 days and thinning within 15 days to maintain optimum plant population.',
            audioText: 'Perform gap filling within 10 days and thinning within 15 days to maintain optimum plant population.',
            verification: 'Upload a photo of the healthy seedlings.',
            category: 'crop_practices',
            difficulty: 'Easy',
            points: 40
        },
        {
            id: 4,
            title: 'Pest Monitoring',
            task: 'Install pheromone traps to monitor bollworm activity.',
            description: 'Install 5 traps per hectare to detect Pink Bollworm early. Check traps weekly.',
            audioText: 'Install 5 traps per hectare to detect Pink Bollworm early. Check traps weekly.',
            verification: 'Upload a photo of the installed trap.',
            category: 'pest',
            difficulty: 'Medium',
            points: 70
        },
        {
            id: 5,
            title: 'Harvesting (Picking)',
            task: 'Pick fully opened bolls during dry hours.',
            description: 'Pick clean cotton. Avoid mixing dry leaves or trash. Store in distinct heaps.',
            audioText: 'Pick clean cotton. Avoid mixing dry leaves or trash. Store in distinct heaps.',
            verification: 'Upload a photo of the picked cotton.',
            category: 'harvest',
            difficulty: 'Hard',
            points: 150
        }
    ]
    // Other crops can be added similarly
};

const getPipelineForCrop = (cropName) => {
    // Basic normalization
    const name = Object.keys(CROP_PIPELINES).find(k => k.toLowerCase() === cropName.toLowerCase());
    return name ? CROP_PIPELINES[name] : null;
};

module.exports = {
    CROP_PIPELINES,
    getPipelineForCrop
};
