const CROP_PIPELINES = {
    Wheat: [
        {
            id: 1,
            title: 'Soil Sampling & Testing',
            task: 'Collect soil samples from different parts of your field for testing.',
            steps: [
                { text: 'Collect samples from 5-10 spots', needsVisual: true, videoQuery: 'soil sampling wheat field', imageQuery: 'soil sampling agriculture' },
                { text: 'Mix all samples in a bucket', needsVisual: true, videoQuery: 'soil sampling wheat field', imageQuery: 'mixing soil samples' },
                { text: 'Take 500g composite sample', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Label with name and date', needsVisual: false, videoQuery: null, imageQuery: null }
            ],
            description: 'Before sowing, it is crucial to know your soil health. Collect samples in a zig-zag pattern, mix them, and send for analysis to determine fertilizer needs.',
            audioText: 'Before sowing, it is crucial to know your soil health. Collect samples in a zig-zag pattern, mix them, and send for analysis to determine fertilizer needs.',
            audioTextHindi: 'बुवाई से पहले मिट्टी की जाँच करें। खेत के अलग-अलग हिस्सों से नमूने लें, उन्हें मिलाएं और खाद की जरूरत जानने के लिए प्रयोगशाला भेजें।',
            verification: 'Upload a photo of your soil sample collection or the test report.',
            category: 'soil',
            difficulty: 'Easy',
            points: 50
        },
        {
            id: 2,
            title: 'Seed Selection & Treatment',
            task: 'Select certified seeds and treat them with fungicides/bio-agents.',
            steps: [
                { text: 'Buy certified high-yield seeds', needsVisual: true, videoQuery: 'wheat seed varieties', imageQuery: 'certified wheat seeds' },
                { text: 'Prepare fungicide solution', needsVisual: true, videoQuery: 'wheat seed treatment fungicide', imageQuery: 'seed treatment fungicide' },
                { text: 'Coat seeds evenly', needsVisual: true, videoQuery: 'how to treat wheat seeds', imageQuery: 'coating seeds' },
                { text: 'Dry in shade before sowing', needsVisual: false, videoQuery: null, imageQuery: 'drying seeds in shade' }
            ],
            description: 'Use high-yielding certified seeds. Treat them with Trichoderma or Carbendazim to protect against soil-borne diseases.',
            audioText: 'Use high-yielding certified seeds. Treat them with Trichoderma or Carbendazim to protect against soil-borne diseases.',
            audioTextHindi: 'प्रमाणित और अच्छी उपज वाले बीजों का प्रयोग करें। मिट्टी से होने वाले रोगों से बचाने के लिए बीजों का फफूंदनाशी से उपचार करें।',
            verification: 'Upload a photo of the seed packet or the seed treatment process.',
            category: 'crop_practices',
            difficulty: 'Medium',
            points: 40
        },
        {
            id: 3,
            title: 'Land Preparation & Sowing',
            task: 'Plough the field and sow seeds at the recommended depth.',
            steps: [
                { text: 'Plough field to fine tilth', needsVisual: true, videoQuery: 'wheat field preparation', imageQuery: 'fine tilth soil' },
                { text: 'Level the land', needsVisual: true, videoQuery: 'land levelling for wheat', imageQuery: 'land leveller' },
                { text: 'Use seed drill for sowing', needsVisual: true, videoQuery: 'wheat sowing seed drill', imageQuery: 'seed drill machine' },
                { text: 'Maintain 20cm row spacing', needsVisual: true, videoQuery: 'wheat sowing spacing', imageQuery: 'wheat row spacing' }
            ],
            description: 'Plough the field 2-3 times to achieve fine tilth. Sow seeds at 4-5 cm depth using a seed drill for uniform spacing.',
            audioText: 'Plough the field 2-3 times to achieve fine tilth. Sow seeds at 4-5 cm depth using a seed drill for uniform spacing.',
            audioTextHindi: 'खेत की 2-3 बार जुताई करें ताकि मिट्टी भुरभुरी हो जाए। सीड ड्रिल का उपयोग करके 4-5 सेमी गहराई पर बीज बोएं।',
            verification: 'Upload a photo of your field preparation or the sowing process.',
            category: 'crop_practices',
            difficulty: 'Hard',
            points: 100
        },
        {
            id: 4,
            title: 'First Irrigation (CRI Stage)',
            task: 'Apply the first irrigation at Crown Root Initiation stage (20-25 days).',
            steps: [
                { text: 'Check days since sowing (20-25 days)', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Ensure field is evenly leveled', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Apply light irrigation', needsVisual: true, videoQuery: 'wheat crown root initiation irrigation', imageQuery: 'wheat CRI stage irrigation' },
                { text: 'Avoid stagnation', needsVisual: true, videoQuery: 'water stagnation in wheat', imageQuery: 'water stagnation crop' }
            ],
            description: 'The CRI stage is critical. Delay in irrigation here can reduce yield by up to 30%. Ensure uniform moisture.',
            audioText: 'The CRI stage is critical. Delay in irrigation here can reduce yield by up to 30%. Ensure uniform moisture.',
            audioTextHindi: 'CRI अवस्था (20-25 दिन) महत्वपूर्ण है। यहाँ सिंचाई में देरी से पैदावार घट सकती है। हल्की सिंचाई करें।',
            verification: 'Upload a photo of your field being irrigated.',
            category: 'water',
            difficulty: 'Medium',
            points: 60
        },
        {
            id: 5,
            title: 'Weed Control',
            task: 'Remove weeds manually or apply recommended herbicides.',
            steps: [
                { text: 'Inspect field for weeds', needsVisual: true, videoQuery: 'identify weeds in wheat', imageQuery: 'weeds in wheat' },
                { text: 'Hand pull visible weeds', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Spray herbicide if needed', needsVisual: true, videoQuery: 'herbicide spray wheat', imageQuery: 'spraying herbicide' },
                { text: 'Ensure crop safety', needsVisual: false, videoQuery: null, imageQuery: null }
            ],
            description: 'Check for broadleaf and grassy weeds. Remove them to prevent competition for nutrients.',
            audioText: 'Check for broadleaf and grassy weeds. Remove them to prevent competition for nutrients.',
            audioTextHindi: 'खेत में खरपतवार की जाँच करें। उन्हें निकाल दें ताकि फसल को पूरा पोषण मिले। आवश्यकतानुसार शाकनाशी का प्रयोग करें।',
            verification: 'Upload a photo of the weeded field or herbicide application.',
            category: 'pest',
            difficulty: 'Medium',
            points: 50
        },
        {
            id: 6,
            title: 'Harvesting',
            task: 'Harvest the crop when grains are hard and moisture is low.',
            steps: [
                { text: 'Check if grains are hard', needsVisual: true, videoQuery: 'checking wheat grain maturity', imageQuery: 'mature wheat grain' },
                { text: 'Ensure moisture < 20%', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Cut close to ground', needsVisual: true, videoQuery: 'wheat harvesting manual', imageQuery: 'cutting wheat crop' },
                { text: 'Thresh and clean grains', needsVisual: true, videoQuery: 'wheat threshing machine', imageQuery: 'threshing wheat' }
            ],
            description: 'Harvest when grains have less than 20% moisture. Use a combine harvester or sickles.',
            audioText: 'Harvest when grains have less than 20% moisture. Use a combine harvester or sickles.',
            audioTextHindi: 'जब दानों में नमी कम हो और वे सख्त हो जाएं, तब कटाई करें। कंबाइन हार्वेस्टर या दरांती का उपयोग करें।',
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
            steps: [
                { text: 'Remove old cotton stalks', needsVisual: true, videoQuery: 'clearing cotton stalks', imageQuery: 'cotton stalks removal' },
                { text: 'Deep plough the field (20-30cm)', needsVisual: true, videoQuery: 'deep ploughing cotton field', imageQuery: 'deep ploughing agriculture' },
                { text: 'Expose soil to sunlight', needsVisual: false, videoQuery: null, imageQuery: null }
            ],
            description: 'Deep ploughing helps in destroying soil-borne pests and improving aeration.',
            audioText: 'Deep ploughing helps in destroying soil-borne pests and improving aeration.',
            audioTextHindi: 'खेत की गहरी जुताई करें। इससे मिट्टी के कीड़े नष्ट होते हैं और हवा का संचार बढ़ता है।',
            verification: 'Upload a photo of the ploughed field.',
            category: 'soil',
            difficulty: 'Medium',
            points: 50
        },
        {
            id: 2,
            title: 'Seed Sowing',
            task: 'Sow Bt-Cotton seeds with proper spacing (e.g., 90x60 cm).',
            steps: [
                { text: 'Mark rows at 90cm distance', needsVisual: true, videoQuery: 'marking rows for cotton sowing', imageQuery: 'cotton row spacing' },
                { text: 'Sow seeds at 60cm spacing', needsVisual: true, videoQuery: 'how to sow cotton seeds', imageQuery: 'sowing cotton seeds' },
                { text: 'Cover seeds with soil', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Ensure soil moisture is adequate', needsVisual: false, videoQuery: null, imageQuery: 'soil moisture check hand' }
            ],
            description: 'Ensure proper spacing for aeration and sunlight. Sow seeds when soil moisture is adequate.',
            audioText: 'Ensure proper spacing for aeration and sunlight. Sow seeds when soil moisture is adequate.',
            audioTextHindi: 'हवा और धूप के लिए उचित दूरी (90x60 सेमी) रखें। मिट्टी में नमी होने पर ही बीज बोएं।',
            verification: 'Upload a photo of the sowing process.',
            category: 'crop_practices',
            difficulty: 'Medium',
            points: 60
        },
        {
            id: 3,
            title: 'Gap Filling & Thinning',
            task: 'Fill gaps with new seeds and thin out weak seedlings.',
            steps: [
                { text: 'Identify gaps where seeds failed', needsVisual: true, videoQuery: 'germination gaps cotton', imageQuery: 'germination gaps field' },
                { text: 'Resow seeds immediately', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Remove weak seedlings (Thinning)', needsVisual: true, videoQuery: 'thinning cotton seedlings', imageQuery: 'thinning seedlings' }
            ],
            description: 'Perform gap filling within 10 days and thinning within 15 days to maintain optimum plant population.',
            audioText: 'Perform gap filling within 10 days and thinning within 15 days to maintain optimum plant population.',
            audioTextHindi: '10 दिनों के भीतर खाली जगहों पर बीज दोबारा बोएं (गैप फिलिंग) और 15 दिनों में कमजोर पौधों को हटा दें।',
            verification: 'Upload a photo of the healthy seedlings.',
            category: 'crop_practices',
            difficulty: 'Easy',
            points: 40
        },
        {
            id: 4,
            title: 'Pest Monitoring',
            task: 'Install pheromone traps to monitor bollworm activity.',
            steps: [
                { text: 'Buy Pheromone traps', needsVisual: true, videoQuery: 'pheromone trap cotton', imageQuery: 'pheromone trap' },
                { text: 'Install 5 traps per hectare', needsVisual: true, videoQuery: 'installing pheromone traps cotton', imageQuery: 'installing pheromone traps' },
                { text: 'Install at crop height', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Check daily for moths', needsVisual: true, videoQuery: 'checking pheromone trap catch', imageQuery: 'cotton bollworm moth' }
            ],
            description: 'Install 5 traps per hectare to detect Pink Bollworm early. Check traps weekly.',
            audioText: 'Install 5 traps per hectare to detect Pink Bollworm early. Check traps weekly.',
            audioTextHindi: 'गुलाबी सुंडी का ज्लदी पता लगाने के लिए प्रति हेक्टेयर 5 फेरोमोन ट्रैप लगाएं। साप्ताहिक जाँच करें।',
            verification: 'Upload a photo of the installed trap.',
            category: 'pest',
            difficulty: 'Medium',
            points: 70
        },
        {
            id: 5,
            title: 'Harvesting (Picking)',
            task: 'Pick fully opened bolls during dry hours.',
            steps: [
                { text: 'Pick only fully open bolls', needsVisual: true, videoQuery: 'cotton picking manual', imageQuery: 'ripe cotton bolls' },
                { text: 'Avoid picking during early morning (dew)', needsVisual: false, videoQuery: null, imageQuery: null },
                { text: 'Keep separate from dry leaves', needsVisual: true, videoQuery: 'clean cotton picking', imageQuery: 'clean cotton heap' }
            ],
            description: 'Pick clean cotton. Avoid mixing dry leaves or trash. Store in distinct heaps.',
            audioText: 'Pick clean cotton. Avoid mixing dry leaves or trash. Store in distinct heaps.',
            audioTextHindi: 'साफ कपास ही चुनें। सूखी पत्तियों या कचरे को न मिलाएं। पूरी तरह खिले हुए बॉल्स को ही तोड़ें।',
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
