const getCropCalendar = async (req, res) => {
    try {
        const { crop } = req.query;

        // Mock crop calendar data
        const calendars = {
            wheat: {
                crop: 'Wheat',
                season: 'Rabi',
                stages: [
                    { stage: 'Sowing', month: 'November', days: '1-15', tasks: ['Prepare field', 'Sow seeds'] },
                    { stage: 'Germination', month: 'November', days: '16-30', tasks: ['Light irrigation', 'Monitor growth'] },
                    { stage: 'Tillering', month: 'December', days: '1-31', tasks: ['First fertilizer dose', 'Weed control'] },
                    { stage: 'Jointing', month: 'January', days: '1-31', tasks: ['Second irrigation', 'Pest monitoring'] },
                    { stage: 'Flowering', month: 'February', days: '1-28', tasks: ['Critical irrigation', 'Disease control'] },
                    { stage: 'Grain filling', month: 'March', days: '1-15', tasks: ['Final irrigation', 'Bird protection'] },
                    { stage: 'Harvesting', month: 'March', days: '16-31', tasks: ['Harvest', 'Threshing'] }
                ]
            },
            rice: {
                crop: 'Rice',
                season: 'Kharif',
                stages: [
                    { stage: 'Nursery', month: 'June', days: '1-15', tasks: ['Prepare nursery', 'Sow seeds'] },
                    { stage: 'Transplanting', month: 'July', days: '1-15', tasks: ['Prepare main field', 'Transplant seedlings'] },
                    { stage: 'Tillering', month: 'July', days: '16-31', tasks: ['Maintain water level', 'First weeding'] },
                    { stage: 'Panicle initiation', month: 'August', days: '1-31', tasks: ['Fertilizer application', 'Pest control'] },
                    { stage: 'Flowering', month: 'September', days: '1-15', tasks: ['Maintain water', 'Disease monitoring'] },
                    { stage: 'Grain filling', month: 'September', days: '16-30', tasks: ['Reduce water', 'Bird protection'] },
                    { stage: 'Harvesting', month: 'October', days: '1-15', tasks: ['Harvest', 'Drying'] }
                ]
            }
        };

        const calendar = calendars[crop?.toLowerCase()] || calendars.wheat;

        res.json({ success: true, calendar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCropCalendar };
