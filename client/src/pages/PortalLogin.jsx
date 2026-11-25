import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  BookOpen,
  Home,
  GraduationCap,
  Phone,
  KeyRound,
  ShieldCheck,
  CalendarCheck,
  Receipt,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SCHOOL_INFO } from '../constants/schoolData';
import LanguageToggle from '../components/LanguageToggle';

const STAFF_HIGHLIGHTS = [
  {
    title: 'Student Directory & Admissions',
    desc: 'Manage walk-in enrollments, Digital ID cards, and official fee receipts.',
    icon: GraduationCap,
  },
  {
    title: 'Attendance, Homework & Marks',
    desc: 'Record daily attendance, publish class homework, and generate report cards.',
    icon: BookOpen,
  },
  {
    title: 'Role-Based Secure Workspace',
    desc: 'Dedicated access controls for Office Administration and Faculty Teachers.',
    icon: ShieldCheck,
  },
];

const PARENT_HIGHLIGHTS = [
  {
    title: 'Live Attendance & Holiday Calendar',
    desc: 'Stay updated with daily attendance records and Karnataka school holidays.',
    icon: CalendarCheck,
  },
  {
    title: 'Fee Ledger & Official Receipts',
    desc: 'View term fee status, download A4 receipts, and track cab facility details.',
    icon: Receipt,
  },
  {
    title: 'Daily Homework & Report Cards',
    desc: 'Check classroom assignments and download official digital marks cards.',
    icon: BookOpen,
  },
];

export default function PortalLogin() {
  const { login, parentLogin, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Login Mode: 'staff' | 'parent'
  const [loginMode, setLoginMode] = useState('staff');

  // Staff / Admin State (always starts clean — zero autofill)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student / Parent State
  const [mobileNumber, setMobileNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getDefaultRouteForRole = (role) => {
    if (role === 'parent') return '/portal/student';
    if (role === 'teacher') return '/portal/teacher';
    return '/portal/overview';
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your official school email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      navigate(getDefaultRouteForRole(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter your 10-digit registered Parent Mobile Number.');
      return;
    }
    if (!accessCode.trim()) {
      setError(
        'Please enter the Access Code (Student Admission Number or DOB in DDMMYYYY format).'
      );
      return;
    }

    setSubmitting(true);
    try {
      await parentLogin(cleanPhone, accessCode.trim());
      navigate('/portal/student', { replace: true });
    } catch (err) {
      setError(
        err.message ||
          'Could not verify Student / Parent credentials. Please check your registered mobile number and Admission No / DOB.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeHighlights =
    loginMode === 'parent' ? PARENT_HIGHLIGHTS : STAFF_HIGHLIGHTS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B33] via-[#13294B] to-[#1A365D] flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Ambient Decorative Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D97706]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-28 w-[28rem] h-[28rem] rounded-full bg-sky-400/10 blur-3xl"
      />

      {/* Top Return Bar + Language Toggle */}
      <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-goldSoft hover:text-white font-semibold transition"
        >
          <Home className="w-4 h-4 text-brand-gold" />
          <span>← {t('common.backToWebsite')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle variant="dark" />
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
            {SCHOOL_INFO.registrationNo}
          </span>
        </div>
      </div>

      {/* Main Executive Login Container */}
      <div className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center z-10">
        {/* Left: Institutional Identity & Portal Highlights (No Demo Credentials) */}
        <div className="lg:col-span-6 text-white space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={SCHOOL_INFO.logoUrl}
              alt="Shri Siddharoodha EMS Logo"
              className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full object-contain border-2 border-[#D97706] bg-white p-0.5 shadow-xl flex-shrink-0"
            />
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#F59E0B] font-bold block">
                {t('common.societyName')}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-serif font-bold text-white leading-snug mt-0.5">
                {t('common.schoolName')}
              </h1>
              <span className="text-xs text-slate-300 block mt-0.5">
                {loginMode === 'parent' ? t('auth.parentHeroSub') : t('auth.staffHeroSub')}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            {loginMode === 'parent' ? t('auth.parentHeroDesc') : t('auth.staffHeroDesc')}
          </p>

          {/* Clean Institutional Feature Highlights */}
          <div className="space-y-3">
            {activeHighlights.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-300/90 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span>
              Khanatti, Mudalgi Taluk, Belagavi Dist – 591312 • Helpdesk: {SCHOOL_INFO.phone}
            </span>
          </div>
        </div>

        {/* Right: Clean Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 sm:p-8">
            {/* Role Toggle Tabs at Top */}
            <div
              className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 mb-6"
              role="tablist"
              aria-label="Portal Login Role Selection"
            >
              <button
                type="button"
                role="tab"
                aria-selected={loginMode === 'staff'}
                onClick={() => {
                  setLoginMode('staff');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  loginMode === 'staff'
                    ? 'bg-[#1A365D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#1A365D] hover:bg-white/60'
                }`}
              >
                <UserCheck
                  className={`w-4 h-4 ${
                    loginMode === 'staff' ? 'text-[#D97706]' : 'text-slate-400'
                  }`}
                />
                <span>{t('auth.staffTab')}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={loginMode === 'parent'}
                onClick={() => {
                  setLoginMode('parent');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  loginMode === 'parent'
                    ? 'bg-[#1A365D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#1A365D] hover:bg-white/60'
                }`}
              >
                <GraduationCap
                  className={`w-4 h-4 ${
                    loginMode === 'parent' ? 'text-[#D97706]' : 'text-slate-400'
                  }`}
                />
                <span>{t('auth.parentTab')}</span>
              </button>
            </div>

            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded bg-amber-50 border border-amber-200/80 text-[#B45309] font-bold text-[11px] uppercase tracking-wider mb-2">
                {loginMode === 'parent' ? t('auth.parentBadge') : t('auth.staffBadge')}
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1A365D]">
                {loginMode === 'parent' ? t('auth.parentTitle') : t('auth.staffTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {loginMode === 'parent' ? t('auth.parentSubtitle') : t('auth.staffSubtitle')}
              </p>
            </div>

            {error && (
              <div
                className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-medium"
                role="alert"
              >
                {error}
              </div>
            )}

            {loginMode === 'staff' ? (
              <form
                onSubmit={handleStaffSubmit}
                className="space-y-4"
                autoComplete="off"
                noValidate
              >
                <div>
                  <label
                    htmlFor="portalEmail"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="portalEmail"
                      name="staff-official-email"
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/15 focus:outline-none bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="portalPassword"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="portalPassword"
                      name="staff-official-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/15 focus:outline-none bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-[#1A365D] transition cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1A365D] hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>{submitting ? t('auth.signingIn') : t('auth.signInStaff')}</span>
                    <ArrowRight className="w-4 h-4 text-[#D97706]" />
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleParentSubmit}
                className="space-y-4"
                autoComplete="off"
                noValidate
              >
                <div>
                  <label
                    htmlFor="parentMobileNumber"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('auth.parentMobile')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="parentMobileNumber"
                      name="parent-registered-mobile"
                      type="tel"
                      maxLength={10}
                      required
                      autoComplete="off"
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder={t('auth.parentMobilePlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/15 focus:outline-none bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="studentAccessCode"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {t('auth.accessCode')}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="studentAccessCode"
                      name="student-access-code"
                      type="text"
                      required
                      autoComplete="off"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder={t('auth.accessCodePlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#1A365D] focus:ring-2 focus:ring-[#1A365D]/15 focus:outline-none bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1A365D] hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>{submitting ? t('auth.verifying') : t('auth.signInParent')}</span>
                    <ArrowRight className="w-4 h-4 text-[#D97706]" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{t('auth.protectedJwt')}</span>
              <span className="font-semibold text-[#1A365D]">
                {t('auth.desk')}: {SCHOOL_INFO.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-5xl w-full mx-auto text-center text-[11px] text-slate-400 z-10">
        © {new Date().getFullYear()} {SCHOOL_INFO.societyName} • {SCHOOL_INFO.schoolName}, Khanatti
      </div>
    </div>
  );
}
