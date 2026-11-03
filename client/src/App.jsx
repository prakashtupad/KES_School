import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Landing Page Components
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

function PublicHomePage() {
  const { isAuthenticated, logout } = useAuth();

  // Automatically end staff portal session whenever the user returns to the public website
  // so clicking "Staff Portal" requires signing in again.
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public School Website */}
          <Route path="/" element={<PublicHomePage />} />

          {/* Portal Authentication */}
          <Route path="/portal/login" element={<PortalLogin />} />

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

            {/* Staff & Account Management (Admin) */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffManagement />
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
  );
}
