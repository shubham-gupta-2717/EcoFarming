import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ExternalLink, CheckCircle, Info, ArrowLeft } from 'lucide-react';

const Schemes = () => {
    const navigate = useNavigate();
    const schemes = [
        {
            id: 1,
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
            applyLink: "https://pmkisan.gov.in/"
        },
        {
            id: 2,
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
            applyLink: "https://pmfby.gov.in/"
        },
        {
            id: 3,
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
            applyLink: "https://soilhealth.dac.gov.in/"
        },
        {
            id: 4,
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
            applyLink: "https://dms.jaivikkheti.in/"
        },
        {
            id: 5,
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
            applyLink: "https://www.myscheme.gov.in/schemes/kcc"
        },
        {
            id: 6,
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
            applyLink: "https://pmksy.gov.in/"
        },
        {
            id: 7,
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
            applyLink: "https://enam.gov.in/"
        },
        {
            id: 8,
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
            applyLink: "https://nmsa.dac.gov.in/"
        },
        {
            id: 9,
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
            applyLink: "https://nmsa.dac.gov.in/"
        },
        {
            id: 10,
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
            applyLink: "https://dahd.nic.in/"
        },
        {
            id: 11,
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
            applyLink: "https://www.nabard.org/"
        },
        {
            id: 12,
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
            applyLink: "https://www.agriclinics.net/"
        }
    ];

    const getCategoryColor = (category) => {
        const colors = {
            'Insurance': 'bg-blue-100 text-blue-700',
            'Income Support': 'bg-green-100 text-green-700',
            'Soil Health': 'bg-yellow-100 text-yellow-700',
            'Organic Farming': 'bg-emerald-100 text-emerald-700',
            'Credit': 'bg-purple-100 text-purple-700',
            'Irrigation': 'bg-cyan-100 text-cyan-700',
            'Marketing': 'bg-orange-100 text-orange-700',
            'Sustainable Agriculture': 'bg-teal-100 text-teal-700',
            'Development': 'bg-indigo-100 text-indigo-700',
            'Dairy': 'bg-pink-100 text-pink-700',
            'Entrepreneurship': 'bg-rose-100 text-rose-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-8 pb-10">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors mb-4"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>
            <header className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Government Schemes 🏛️</h1>
                <p className="text-gray-600 text-lg">Access real-world benefits, financial support, and subsidies designed for you.</p>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {schemes.map((scheme) => (
                    <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-50 rounded-xl">
                                        <Award className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{scheme.name}</h3>
                                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(scheme.category)}`}>
                                            {scheme.category}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={scheme.applyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-green-200"
                                >
                                    Apply Now <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed">{scheme.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <h4 className="font-bold text-gray-800">Eligibility Criteria</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {scheme.eligibility.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-blue-50/50 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-bold text-gray-800">Key Benefits</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {scheme.benefits.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schemes;
