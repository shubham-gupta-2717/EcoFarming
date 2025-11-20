const getFeed = async (req, res) => {
    try {
        // Mock Community Feed
        const posts = [
            {
                id: 1,
                author: 'Ramesh Kumar',
                location: 'Rampur',
                content: 'Successfully harvested my organic wheat today! Thanks to EcoFarming missions.',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: 24,
                comments: 5,
                time: '2 hours ago'
            },
            {
                id: 2,
                author: 'Suresh Patel',
                location: 'Kishanpur',
                content: 'Installed a drip irrigation system. Saving water is saving life! 💧',
                image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: 45,
                comments: 12,
                time: '5 hours ago'
            },
            {
                id: 3,
                author: 'Anita Devi',
                location: 'Rampur',
                content: 'Just completed the "Soil Health Check" mission. Highly recommend everyone to do it.',
                likes: 18,
                comments: 2,
                time: '1 day ago'
            }
        ];

        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        // In a real app, save to Firestore
        res.json({ success: true, message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFeed, createPost };
