import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ImpactSection from '../components/landing/ImpactSection';
import InstitutionJoinSection from '../components/landing/InstitutionJoinSection';
import Footer from '../components/landing/Footer';

const Home = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    return (
        <div className="font-sans text-gray-800">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <ImpactSection />
            <InstitutionJoinSection />
            <Footer />
        </div>
    );
};

export default Home;
