import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Landing Page Components
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import AboutSection from './components/AboutSection';
import OurLeadership from './components/OurLeadership';
import CampusLifeSection from './components/CampusLifeSection';
import AdmissionsCallout from './components/AdmissionsCallout';
import NewsSection from './components/NewsSection';
import UpcomingHolidaysSection from './components/UpcomingHolidaysSection';
import EnquiryForm from './components/EnquiryForm';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

// Staff & Teacher Portal Pages & Modules
import PortalLogin from './pages/PortalLogin';
import PortalDashboard from './pages/PortalDashboard';
import PortalLayout from './components/portal/PortalLayout';
import AdminEnquiryDesk from './components/portal/AdminEnquiryDesk';
import TeacherClassDesk from './components/portal/TeacherClassDesk';
import StaffManagement from './components/portal/StaffManagement';
import NoticePublisher from './components/portal/NoticePublisher';
import OverviewDashboard from './components/portal/OverviewDashboard';
import StaffTimesheetDesk from './components/portal/StaffTimesheetDesk';
import AdminStaffAttendanceRegister from './components/portal/AdminStaffAttendanceRegister';
import StudentDirectoryDesk from './components/portal/StudentDirectoryDesk';
import WebsiteContentDesk from './components/portal/WebsiteContentDesk';
import DailyAttendanceDesk from './components/portal/DailyAttendanceDesk';
import HolidayCalendarDesk from './components/portal/HolidayCalendarDesk';
import StudentParentPortal from './components/portal/StudentParentPortal';

function PublicHomePage({ defaultHash = '' }) {
  const { isAuthenticated, logout } = useAuth();
  const { hash } = useLocation();

  // Automatically end staff portal session whenever the user returns to the public website
  // so clicking "Staff Portal" requires signing in again.
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  // Reliably scroll to hash anchors (e.g. /#enquiry from Instagram/Facebook bio links)
  // on cold first load even while images & async sections above finish decoding.
  useEffect(() => {
    const targetHash =
      hash || defaultHash || (typeof window !== 'undefined' ? window.location.hash : '');
    if (!targetHash) return undefined;

    const targetId = targetHash.replace(/^#/, '');
    if (!targetId) return undefined;

    let userInteracted = false;
    let lockWindowActive = true;
    const markInteracted = () => {
      userInteracted = true;
    };

    const scrollToTarget = (behavior = 'auto') => {
      if (userInteracted || !lockWindowActive) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      const headerOffset = 88;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, top), behavior });
    };

    window.addEventListener('wheel', markInteracted, { passive: true });
    window.addEventListener('touchstart', markInteracted, { passive: true });
    window.addEventListener('pointerdown', markInteracted, { passive: true });

    const onWindowLoad = () => scrollToTarget('auto');
    window.addEventListener('load', onWindowLoad);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(() => {
        scrollToTarget('auto');
      });
      resizeObserver.observe(document.body);
    }

    const rafId = window.requestAnimationFrame(() => scrollToTarget('auto'));
    const t1 = window.setTimeout(() => scrollToTarget('auto'), 250);
    const t2 = window.setTimeout(() => scrollToTarget('auto'), 700);
    const t3 = window.setTimeout(() => scrollToTarget('smooth'), 1400);
    const releaseLockTimer = window.setTimeout(() => {
      lockWindowActive = false;
      if (resizeObserver) resizeObserver.disconnect();
    }, 3200);

    return () => {
      lockWindowActive = false;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(releaseLockTimer);
      window.removeEventListener('wheel', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('load', onWindowLoad);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [hash, defaultHash]);

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

        {/* Our Leadership Messages Section (Founder, Co-Founder, Chairman) */}
        <OurLeadership />

        {/* Student & Campus Life Section */}
        <CampusLifeSection />

        {/* Admissions Gradient Callout Banner */}
        <AdmissionsCallout />

        {/* Official Notices & News Updates Section */}
        <NewsSection />

        {/* Academic Calendar & Upcoming Holidays Section */}
        <UpcomingHolidaysSection />

        {/* Validated Admissions Enquiry Form */}
        <EnquiryForm />

        {/* Contact Office & Location Map Section */}
        <ContactSection />
      </main>

      {/* 4. Navy Footer */}
      <Footer />

      {/* Floating Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public School Website */}
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/enquiry" element={<PublicHomePage defaultHash="#enquiry" />} />

          {/* Portal Authentication */}
          <Route path="/portal/login" element={<PortalLogin />} />

          {/* Unified Student & Parent Multi-Sibling Portal */}
          <Route
            path="/portal/student"
            element={
              <ProtectedRoute allowedRoles={['parent', 'admin', 'teacher']}>
                <StudentParentPortal />
              </ProtectedRoute>
            }
          />

          {/* Protected Role-Based Portal Shell */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on logged-in user's role */}
            <Route index element={<PortalDashboard />} />

            {/* Admin Overview */}
            <Route
              path="overview"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OverviewDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admissions Enquiry Desk (Admin) */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEnquiryDesk />
                </ProtectedRoute>
              }
            />

            {/* Enrolled Student Directory & Parent WhatsApp Connect (Admin & Teacher) */}
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <StudentDirectoryDesk />
                </ProtectedRoute>
              }
            />

            {/* Admin Staff Attendance Register (Admin, includes personal clock sub-tab) */}
            <Route
              path="attendance-register"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStaffAttendanceRegister />
                </ProtectedRoute>
              }
            />

            {/* Teacher & Staff Personal Timesheet & Punch Clock */}
            <Route
              path="timesheet"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <StaffTimesheetDesk />
                </ProtectedRoute>
              }
            />

            {/* Official Notice Board Publisher (Admin & Teacher) */}
            <Route
              path="notices"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <NoticePublisher />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Website Content CMS (Admin) */}
            <Route
              path="cms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <WebsiteContentDesk />
                </ProtectedRoute>
              }
            />

            {/* Staff & Account Management (Admin) */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />

            {/* Daily Student Attendance & Instant Absentee Alert Desk (Teacher & Admin) */}
            <Route
              path="daily-attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'super_admin']}>
                  <DailyAttendanceDesk />
                </ProtectedRoute>
              }
            />

            {/* 2026 & 2027 School Holiday Calendar & Term Break Manager */}
            <Route
              path="holidays"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'super_admin']}>
                  <HolidayCalendarDesk />
                </ProtectedRoute>
              }
            />

            {/* Teacher Classroom & Homework Desk (Teacher & Admin) */}
            <Route
              path="teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherClassDesk />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}
