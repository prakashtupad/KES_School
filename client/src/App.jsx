import React from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import AboutSection from './components/AboutSection';
import CampusLifeSection from './components/CampusLifeSection';
import AdmissionsCallout from './components/AdmissionsCallout';
import NewsSection from './components/NewsSection';
import EnquiryForm from './components/EnquiryForm';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="bg-brand-cream text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-brand-goldSoft selection:text-brand-navyDark">
      {/* 1. Top Navy Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Sticky Header & Mobile Drawer Navigation */}
      <Header />

      {/* 3. Main Content Container */}
      <main className="flex-grow" id="home">
        {/* Hero Photo Carousel Section */}
        <HeroCarousel />

        {/* Welcome & About Us Section */}
        <AboutSection />

        {/* Student & Campus Life Section */}
        <CampusLifeSection />

        {/* Admissions Gradient Callout Banner */}
        <AdmissionsCallout />

        {/* Official Notices & News Updates Section */}
        <NewsSection />

        {/* Validated Admissions Enquiry Form */}
        <EnquiryForm />

        {/* Contact Office & Location Map Section */}
        <ContactSection />
      </main>

      {/* 4. Navy Footer */}
      <Footer />
    </div>
  );
}
