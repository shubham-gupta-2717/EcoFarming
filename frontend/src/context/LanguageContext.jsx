import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
    en: {
        welcome: 'Welcome back',
        dashboard: 'Dashboard',
        missions: 'Missions',
        community: 'Community',
        leaderboard: 'Leaderboard',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Sign In',
        register: 'Sign Up',
        email: 'Email',
        password: 'Password',
        name: 'Full Name',
        location: 'Location',
        crop: 'Main Crop',
        ecoScore: 'EcoScore',
        badges: 'Badges',
        streak: 'Day Streak',
        todayMission: "Today's Priority Mission",
        startMission: 'Start Mission',
        generateMission: 'Generate New Mission',
        myProfile: 'My Profile',
        myBadges: 'My Badges',
        verification: 'Verify'
    },
    hi: {
        welcome: 'वापस स्वागत है',
        dashboard: 'डैशबोर्ड',
        missions: 'मिशन',
        community: 'समुदाय',
        leaderboard: 'लीडरबोर्ड',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
        login: 'साइन इन करें',
        register: 'साइन अप करें',
        email: 'ईमेल',
        password: 'पासवर्ड',
        name: 'पूरा नाम',
        location: 'स्थान',
        crop: 'मुख्य फसल',
        ecoScore: 'इको स्कोर',
        badges: 'बैज',
        streak: 'दिन की लकीर',
        todayMission: 'आज का प्राथमिकता मिशन',
        startMission: 'मिशन शुरू करें',
        generateMission: 'नया मिशन बनाएं',
        myProfile: 'मेरी प्रोफ़ाइल',
        myBadges: 'मेरे बैज',
        verification: 'सत्यापन'
    },
    mr: {
        welcome: 'परत स्वागत आहे',
        dashboard: 'डॅशबोर्ड',
        missions: 'मिशन',
        community: 'समुदाय',
        leaderboard: 'लीडरबोर्ड',
        profile: 'प्रोफाइल',
        logout: 'लॉग आउट',
        login: 'साइन इन करा',
        register: 'साइन अप करा',
        email: 'ईमेल',
        password: 'पासवर्ड',
        name: 'पूर्ण नाव',
        location: 'स्थान',
        crop: 'मुख्य पीक',
        ecoScore: 'इको स्कोर',
        badges: 'बॅज',
        streak: 'दिवसांची पट्टी',
        todayMission: 'आजचे प्राधान्य मिशन',
        startMission: 'मिशन सुरू करा',
        generateMission: 'नवीन मिशन तयार करा',
        myProfile: 'माझे प्रोफाइल',
        myBadges: 'माझे बॅज',
        verification: 'पडताळणी'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang);
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
