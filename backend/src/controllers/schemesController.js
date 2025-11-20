const getRecommendedSchemes = async (req, res) => {
    try {
        const { crop, location, landSize } = req.query;

        // Mock government schemes data
        const schemes = [
            {
                id: 1,
                name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                description: 'Crop insurance scheme providing financial support to farmers in case of crop failure',
                eligibility: 'All farmers growing notified crops',
                benefits: 'Premium subsidy up to 2% for Kharif crops',
                applyLink: 'https://pmfby.gov.in',
                category: 'Insurance'
            },
            {
                id: 2,
                name: 'PM-KISAN',
                description: 'Income support of ₹6000 per year to all farmer families',
                eligibility: 'All landholding farmer families',
                benefits: '₹2000 every 4 months',
                applyLink: 'https://pmkisan.gov.in',
                category: 'Income Support'
            },
            {
                id: 3,
                name: 'Soil Health Card Scheme',
                description: 'Free soil testing and health card for farmers',
                eligibility: 'All farmers',
                benefits: 'Free soil testing, fertilizer recommendations',
                applyLink: 'https://soilhealth.dac.gov.in',
                category: 'Soil Health'
            },
            {
                id: 4,
                name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
                description: 'Organic farming promotion scheme',
                eligibility: 'Farmers willing to adopt organic farming',
                benefits: '₹50,000 per hectare for 3 years',
                applyLink: 'https://pgsindia-ncof.gov.in',
                category: 'Organic Farming'
            },
            {
                id: 5,
                name: 'Kisan Credit Card (KCC)',
                description: 'Credit facility for farmers',
                eligibility: 'All farmers with land ownership',
                benefits: 'Low-interest credit up to ₹3 lakh',
                applyLink: 'https://www.india.gov.in/kisan-credit-card-kcc-scheme',
                category: 'Credit'
            }
        ];

        // Filter based on criteria (simple mock logic)
        let recommended = schemes;
        if (crop?.toLowerCase() === 'wheat' || crop?.toLowerCase() === 'rice') {
            recommended = schemes.filter(s => ['Insurance', 'Income Support', 'Credit'].includes(s.category));
        }

        res.json({ success: true, schemes: recommended });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRecommendedSchemes };
