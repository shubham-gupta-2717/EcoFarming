const getBehaviorReport = async (req, res) => {
    try {
        // Mock Behavior Report Data
        // TODO: In production, calculate from user's completed missions
        const report = {
            totalWaterSaved: "12,500 Liters",
            chemicalReduction: "15 kg",
            carbonOffset: "450 kg CO2",
            soilHealthScore: "Good (+15%)",
            moneySaved: "₹4,500"
        };

        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBehaviorTimeline = async (req, res) => {
    try {
        // Mock Timeline Data
        const timeline = [
            { id: 1, date: "2023-11-15", action: "Switched to Drip Irrigation", impact: "Saved 500L water/day", type: "positive" },
            { id: 2, date: "2023-11-10", action: "Used Organic Compost", impact: "Improved soil quality", type: "positive" },
            { id: 3, date: "2023-11-05", action: "Attended Soil Health Workshop", impact: "Gained knowledge", type: "learning" },
            { id: 4, date: "2023-10-28", action: "Reduced Urea Usage", impact: "Saved ₹500", type: "positive" }
        ];

        res.json({ success: true, timeline });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBehaviorReport, getBehaviorTimeline };
