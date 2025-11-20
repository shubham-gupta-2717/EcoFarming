const pullData = async (req, res) => {
    try {
        // Mock Data to be synced to client
        const syncData = {
            missions: [
                { id: 101, task: "Check Soil Moisture", status: "pending" },
                { id: 102, task: "Clean Irrigation Filters", status: "pending" }
            ],
            alerts: [
                { id: 1, message: "Heavy rain expected tomorrow", type: "warning" }
            ],
            lastSyncedAt: new Date().toISOString()
        };

        res.json({ success: true, data: syncData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const pushData = async (req, res) => {
    try {
        const { offlineActions } = req.body;

        // Mock processing of offline actions
        console.log("Received offline actions:", offlineActions);

        res.json({
            success: true,
            message: "Data synced successfully",
            processedCount: offlineActions ? offlineActions.length : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { pullData, pushData };
