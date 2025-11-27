const locations = require('../data/locations.json');

const getStates = (req, res) => {
    try {
        const states = Object.keys(locations).sort();
        res.json(states);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDistricts = (req, res) => {
    try {
        const { state } = req.params;
        if (!locations[state]) {
            return res.status(404).json({ message: 'State not found' });
        }
        const districts = Object.keys(locations[state]).sort();
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubDistricts = (req, res) => {
    try {
        const { state, district } = req.params;
        if (!locations[state] || !locations[state][district]) {
            return res.status(404).json({ message: 'State or District not found' });
        }
        const subDistricts = locations[state][district].sort();
        res.json(subDistricts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStates, getDistricts, getSubDistricts };
