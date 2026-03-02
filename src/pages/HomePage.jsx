import React from 'react';
import Navbar from '../components/Layout/Navbar';
import HeroSection from '../components/Home/HeroSection';
import FeaturesGrid from '../components/Home/FeaturesGrid';
import WhyAgroW from '../components/Home/WhyAgroW';
import Testimonials from '../components/Home/Testimonials';
import Footer from '../components/Layout/Footer';

const HomePage = () => {
    return (
        <>
            <Navbar />
            <HeroSection />
            <FeaturesGrid />
            <WhyAgroW />
            <Testimonials />
            <Footer />
        </>
    );
};

export default HomePage;
