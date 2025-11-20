const getPendingVerifications = async (req, res) => {
    try {
        // Mock Pending Verifications
        const requests = [
            {
                id: 101,
                farmerName: 'Mahesh Singh',
                missionTitle: 'Install Drip Irrigation',
                proofImage: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                submittedAt: '2023-10-25T10:00:00Z'
            },
            {
                id: 102,
                farmerName: 'Geeta Verma',
                missionTitle: 'Use Neem Cake',
                proofImage: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                submittedAt: '2023-10-26T14:30:00Z'
            }
        ];

        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveVerification = async (req, res) => {
    try {
        const { id } = req.body;
        // Logic to update mission status and award points
        res.json({ success: true, message: `Request ${id} approved` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectVerification = async (req, res) => {
    try {
        const { id, reason } = req.body;
        // Logic to reject
        res.json({ success: true, message: `Request ${id} rejected` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingVerifications, approveVerification, rejectVerification };
