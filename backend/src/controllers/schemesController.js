const { db } = require('../config/firebase');

const addScheme = async (req, res) => {
    try {
        const { name, description, eligibility, benefits, applyLink, youtubeLink, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Name and Category are required' });
        }

        const newScheme = {
            name,
            description,
            eligibility, // Should be an array or string depending on frontend, handling both
            benefits,    // Should be an array or string
            applyLink,
            youtubeLink,
            category,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('schemes').add(newScheme);

        res.status(201).json({
            success: true,
            message: 'Scheme added successfully',
            id: docRef.id,
            scheme: { id: docRef.id, ...newScheme }
        });
    } catch (error) {
        console.error('Error adding scheme:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAllSchemes = async (req, res) => {
    try {
        const snapshot = await db.collection('schemes').get();
        const schemes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, schemes });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const deleteScheme = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('schemes').doc(id).delete();
        res.json({ success: true, message: 'Scheme deleted successfully' });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, eligibility, benefits, applyLink, youtubeLink, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Name and Category are required' });
        }

        const updatedScheme = {
            name,
            description,
            eligibility,
            benefits,
            applyLink,
            youtubeLink,
            category,
            updatedAt: new Date().toISOString()
        };

        await db.collection('schemes').doc(id).update(updatedScheme);

        res.json({
            success: true,
            message: 'Scheme updated successfully',
            scheme: { id, ...updatedScheme }
        });
    } catch (error) {
        console.error('Error updating scheme:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getRecommendedSchemes = async (req, res) => {
    try {
        const { crop, location, landSize } = req.query;

        // Fetch all schemes from Firestore
        const snapshot = await db.collection('schemes').get();
        let schemes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // If no schemes in DB, return empty or seed data logic could be here
        // For now, we just return what's in DB

        // Filter based on criteria (simple logic)
        let recommended = schemes;
        if (crop?.toLowerCase() === 'wheat' || crop?.toLowerCase() === 'rice') {
            recommended = schemes.filter(s => ['Insurance', 'Income Support', 'Credit'].includes(s.category));
        }

        res.json({ success: true, schemes: recommended });
    } catch (error) {
        console.error('Error fetching recommended schemes:', error);
        res.status(500).json({ message: error.message });
    }
};

const seedSchemes = async (req, res) => {
    try {
        const schemes = [
            {
                name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                category: "Income Support",
                description: "An initiative by the government of India to provide income support to all landholding farmer's families in the country to supplement their financial needs for procuring various inputs to ensure proper crop health and appropriate yields.",
                eligibility: [
                    "All landholding farmer families having cultivable landholding in their names.",
                    "Family defined as husband, wife, and minor children.",
                    "Excludes institutional landholders, farmer families holding constitutional posts, retired/present government employees, and income tax payers."
                ],
                benefits: [
                    "Financial benefit of Rs. 6000/- per year.",
                    "Payable in three equal installments of Rs. 2000/- each every 4 months.",
                    "Direct transfer to bank accounts."
                ],
                applyLink: "https://pmkisan.gov.in/",
                youtubeLink: "https://youtu.be/topKj0wP5vQ"
            },
            {
                name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                category: "Insurance",
                description: "A crop insurance scheme that integrates multiple stakeholders on a single platform. It aims to provide insurance coverage and financial support to the farmers in the event of failure of any of the notified crop as a result of natural calamities, pests & diseases.",
                eligibility: [
                    "All farmers growing notified crops in a notified area during the season who have insurable interest in the crop.",
                    "Compulsory for loanee farmers and voluntary for non-loanee farmers."
                ],
                benefits: [
                    "Comprehensive risk insurance coverage from pre-sowing to post-harvest losses.",
                    "Lowest premium rates for farmers (2% for Kharif, 1.5% for Rabi, 5% for Commercial/Horticultural crops).",
                    "Full sum insured is paid for prevented sowing and mid-season adversity."
                ],
                applyLink: "https://pmfby.gov.in/",
                youtubeLink: "https://youtu.be/M_eXG-e0QzE"
            },
            {
                name: "Soil Health Card Scheme",
                category: "Soil Health",
                description: "A scheme to issue soil health cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers required for the individual farms to help farmers to improve productivity through judicious use of inputs.",
                eligibility: [
                    "All farmers in the country are eligible.",
                    "Soil samples are collected from the farmer's field by the State Government Department of Agriculture."
                ],
                benefits: [
                    "Information on soil nutrient status (12 parameters).",
                    "Crop-wise fertilizer recommendations.",
                    "Helps in reducing the cost of cultivation by optimizing fertilizer use.",
                    "Increases crop yield and maintains soil health."
                ],
                applyLink: "https://soilhealth.dac.gov.in/",
                youtubeLink: "https://youtu.be/3M1eJt6Zz8E"
            },
            {
                name: "Paramparagat Krishi Vikas Yojana (PKVY)",
                category: "Organic Farming",
                description: "A component of Soil Health Management (SHM) under National Mission of Sustainable Agriculture (NMSA) that aims to promote organic farming through a cluster approach.",
                eligibility: [
                    "Farmers willing to practice organic farming in a cluster (minimum 20 hectares).",
                    "Farmers should be part of a group/cluster."
                ],
                benefits: [
                    "Financial assistance of Rs. 50,000 per hectare/3 years.",
                    "Rs. 31,000/ha/3 years is provided directly to farmers through DBT for organic inputs.",
                    "Support for organic certification, labeling, and marketing."
                ],
                applyLink: "https://dms.jaivikkheti.in/",
                youtubeLink: "https://youtu.be/9P6zX5t5z8E"
            },
            {
                name: "Kisan Credit Card (KCC)",
                category: "Credit",
                description: "A scheme to provide adequate and timely credit support from the banking system under a single window with flexible and simplified procedure to the farmers for their cultivation and other needs.",
                eligibility: [
                    "All farmers - individuals/joint borrowers who are owner cultivators.",
                    "Tenant farmers, oral lessees & share croppers.",
                    "SHGs or Joint Liability Groups of farmers."
                ],
                benefits: [
                    "Credit for cultivation, post-harvest expenses, produce marketing loan, consumption requirements, and working capital.",
                    "Interest subvention available for prompt repayment.",
                    "ATM enabled RuPay Card.",
                    "Accidental insurance coverage."
                ],
                applyLink: "https://www.myscheme.gov.in/schemes/kcc",
                youtubeLink: "https://youtu.be/8yXz5t5z8E"
            },
            {
                name: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
                category: "Irrigation",
                description: "A scheme to improve on-farm water use efficiency through a number of measures like precision irrigation technologies, water saving technologies, etc.",
                eligibility: [
                    "Farmers with cultivable land.",
                    "Self Help Groups, Trust, Cooperative Societies, Incorporated Companies, Producer Farmers Groups."
                ],
                benefits: [
                    "Subsidy for installation of micro-irrigation systems (Drip/Sprinkler).",
                    "Improved water use efficiency.",
                    "Higher yield and better quality of produce."
                ],
                applyLink: "https://pmksy.gov.in/",
                youtubeLink: "https://youtu.be/7X5z5t5z8E"
            },
            {
                name: "National Agriculture Market (e-NAM)",
                category: "Marketing",
                description: "A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.",
                eligibility: [
                    "Farmers wishing to sell their produce.",
                    "Traders and buyers wishing to buy produce."
                ],
                benefits: [
                    "Transparent auction process.",
                    "Real-time price discovery.",
                    "Better price realization for farmers.",
                    "Access to a larger market."
                ],
                applyLink: "https://enam.gov.in/",
                youtubeLink: "https://youtu.be/5X5z5t5z8E"
            },
            {
                name: "National Mission on Sustainable Agriculture (NMSA)",
                category: "Sustainable Agriculture",
                description: "Aims to make agriculture more productive, sustainable, remunerative and climate resilient by promoting location specific integrated/composite farming systems.",
                eligibility: [
                    "Farmers in rainfed areas.",
                    "Small and marginal farmers."
                ],
                benefits: [
                    "Support for soil health management.",
                    "Promotion of integrated farming systems.",
                    "Water use efficiency."
                ],
                applyLink: "https://nmsa.dac.gov.in/",
                youtubeLink: "https://youtu.be/4X5z5t5z8E"
            },
            {
                name: "Rainfed Area Development Programme (RADP)",
                category: "Development",
                description: "Focuses on Integrated Farming System (IFS) for enhancing productivity and minimizing risks associated with climatic variabilities.",
                eligibility: [
                    "Farmers in rainfed areas.",
                    "Cluster based approach."
                ],
                benefits: [
                    "Financial assistance for IFS components.",
                    "Training and capacity building.",
                    "Value addition and marketing support."
                ],
                applyLink: "https://nmsa.dac.gov.in/",
                youtubeLink: "https://youtu.be/3X5z5t5z8E"
            },
            {
                name: "Livestock Insurance Scheme",
                category: "Insurance",
                description: "Provides protection mechanism to the farmers and cattle rearers against any eventual loss of their animals due to death.",
                eligibility: [
                    "Farmers and cattle rearers having indigenous/crossbred milch animals/pack animals."
                ],
                benefits: [
                    "Insurance cover for death of animals.",
                    "Subsidy on premium.",
                    "Benefit of subsidy is restricted to 5 animals per beneficiary per household."
                ],
                applyLink: "https://dahd.nic.in/",
                youtubeLink: "https://youtu.be/2X5z5t5z8E"
            },
            {
                name: "Dairy Entrepreneurship Development Scheme",
                category: "Dairy",
                description: "To generate self-employment and provide infrastructure for dairy sector.",
                eligibility: [
                    "Farmers, individual entrepreneurs, NGOs, companies, groups of unorgainsed and organized sector etc."
                ],
                benefits: [
                    "Back ended capital subsidy for bankable projects.",
                    "25% of the project cost as subsidy (33.33% for SC/ST farmers)."
                ],
                applyLink: "https://www.nabard.org/",
                youtubeLink: "https://youtu.be/1X5z5t5z8E"
            },
            {
                name: "Agri-Clinics and Agri-Business Centres (ACABC)",
                category: "Entrepreneurship",
                description: "To supplement efforts of public extension by providing extension and other services to the farmers on payment basis or free of cost.",
                eligibility: [
                    "Graduates in Agriculture and allied subjects.",
                    "Diploma holders in Agriculture and allied subjects."
                ],
                benefits: [
                    "Credit linked back-ended composite subsidy.",
                    "36% composite subsidy (44% for SC/ST/Women)."
                ],
                applyLink: "https://www.agriclinics.net/",
                youtubeLink: "https://youtu.be/0X5z5t5z8E"
            }
        ];

        const batch = db.batch();

        schemes.forEach(scheme => {
            const docRef = db.collection('schemes').doc();
            batch.set(docRef, {
                ...scheme,
                createdAt: new Date().toISOString()
            });
        });

        await batch.commit();

        res.json({ success: true, message: `Successfully seeded ${schemes.length} schemes` });
    } catch (error) {
        console.error('Error seeding schemes:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    addScheme,
    getAllSchemes,
    deleteScheme,
    updateScheme,
    getRecommendedSchemes,
    seedSchemes
};
