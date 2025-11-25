export const storeProducts = [
    // Vouchers
    {
        id: 3,
        name: 'Fertilizer Subsidy Voucher',
        category: 'vouchers',
        price: 50,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400',
        description: 'Get ₹200 off on your next fertilizer purchase.',
        couponCode: 'FERT200OFF',
        validity: 'Valid for 3 months',
        validityDays: 90,
        validAt: 'All Authorized Fertilizer Dealers',
        applicableOn: 'Chemical & Organic Fertilizers',
        terms: ['Minimum purchase ₹1000', 'Valid on all fertilizer brands']
    },
    {
        id: 8,
        name: 'Tractor Rental Voucher',
        category: 'vouchers',
        price: 100,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400',
        description: 'Get 1 hour free tractor rental service.',
        couponCode: 'TRACFREE1H',
        validity: 'Valid for 1 month',
        validityDays: 30,
        validAt: 'Local Custom Hiring Centers',
        applicableOn: 'Tractor Rental Services',
        terms: ['Advance booking required', 'Subject to availability']
    },
    {
        id: 17,
        name: 'Seed Store Discount',
        category: 'vouchers',
        price: 25,
        image: 'https://images.unsplash.com/photo-1556742046-806950936702?auto=format&fit=crop&q=80&w=400',
        description: 'Flat 10% off at local certified seed stores.',
        couponCode: 'SEED10PERC',
        validity: 'Valid for 6 months',
        validityDays: 180,
        validAt: 'Certified Seed Stores',
        applicableOn: 'All Certified Seeds',
        terms: ['Max discount ₹500', 'Valid at participating stores only']
    },
    {
        id: 18,
        name: 'Free Soil Test Coupon',
        category: 'vouchers',
        price: 75,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400',
        description: 'One free comprehensive soil test at KVK labs.',
        couponCode: 'SOILTESTFREE',
        validity: 'Valid for 1 year',
        validityDays: 365,
        validAt: 'Krishi Vigyan Kendra (KVK) Labs',
        applicableOn: 'Soil Testing Services',
        terms: ['One sample per coupon', 'Report within 7 days']
    },
    {
        id: 21,
        name: 'Govt. Agri Shop Discount Voucher',
        category: 'vouchers',
        price: 500,
        image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=400',
        description: 'Get ₹500 off at any government agricultural shop.',
        couponCode: 'GOVTAGRI500',
        validity: 'Valid for 2 months',
        validityDays: 60,
        validAt: 'Government Agricultural Shops',
        applicableOn: 'Tools, Seeds & Fertilizers',
        terms: ['Minimum purchase ₹2000', 'Not valid on subsidized items']
    },

    // Government Schemes
    {
        id: 9,
        name: 'PM Kisan Application Help',
        category: 'schemes',
        price: 20,
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
        description: 'Assistance for filling PM Kisan Samman Nidhi form.'
    },
    {
        id: 10,
        name: 'Crop Insurance Form',
        category: 'schemes',
        price: 30,
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
        description: 'Processing for Pradhan Mantri Fasal Bima Yojana.'
    },
    {
        id: 19,
        name: 'Kisan Credit Card (KCC)',
        category: 'schemes',
        price: 40,
        image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=400',
        description: 'Application guidance for Kisan Credit Card scheme.'
    },
    {
        id: 20,
        name: 'Organic Certification',
        category: 'schemes',
        price: 150,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
        description: 'Process assistance for NPOP Organic Certification.'
    }
];

export const categories = [
    { id: 'vouchers', label: 'Vouchers', image: 'https://images.unsplash.com/photo-1556742046-806950936702?auto=format&fit=crop&q=80&w=400' },
    { id: 'schemes', label: 'Govt. Schemes', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400' }
];
