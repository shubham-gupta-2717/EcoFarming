import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ImpactSection from '../components/landing/ImpactSection';
import InstitutionJoinSection from '../components/landing/InstitutionJoinSection';
import Footer from '../components/landing/Footer';
import { Loader2 } from 'lucide-react';

const Home = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (user) {
        if (user.role === 'farmer') {
            return <Navigate to="/dashboard" replace />;
        }
        if (user.role === 'admin' || user.role === 'institution') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === 'superadmin') {
            return <Navigate to="/super-admin/dashboard" replace />;
        }
    }

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
