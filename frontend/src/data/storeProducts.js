export const storeProducts = [
    // Seeds & Fertilizers
    {
        id: 1,
        name: 'Hybrid Wheat Seeds',
        category: 'seeds',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
        description: 'High-yield hybrid wheat seeds suitable for all soil types. Resistant to common pests.',
        stock: 50
    },
    {
        id: 2,
        name: 'Organic Urea Fertilizer',
        category: 'seeds',
        price: 450,
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400',
        description: 'Eco-friendly urea fertilizer for enhanced crop growth. 50kg bag.',
        stock: 100
    },
    // Agri Equipment
    {
        id: 3,
        name: 'Solar Insect Trap',
        category: 'equipment',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400',
        description: 'Automatic solar-powered insect trap to protect crops from pests.',
        stock: 20
    },
    {
        id: 4,
        name: 'Knapsack Sprayer',
        category: 'equipment',
        price: 1800,
        image: 'https://plus.unsplash.com/premium_photo-1664302152990-570163e0ac93?auto=format&fit=crop&q=80&w=400',
        description: '16L manual knapsack sprayer for pesticides and fertilizers.',
        stock: 30
    },
    // Gift Cards
    {
        id: 1001,
        name: 'Money Gift Card',
        category: 'giftcards',
        price: 0, // Special handling for variable amount
        image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=400',
        description: 'Convert your accumulated credits into real money! Exchange rate: 100 Credits = ₹10.',
        isGiftCard: true
    }
];

export const categories = [
    { id: 'seeds', label: 'Seeds & Fertilizers', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400' },
    { id: 'equipment', label: 'Agri Equipment', image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=400' },
    { id: 'schemes', label: 'Govt. Schemes', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400', link: '/dashboard/schemes' },
    { id: 'giftcards', label: 'Gift Card', image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=400' }
];
