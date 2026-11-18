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
  Users,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SCHOOL_INFO } from '../constants/schoolData';

const DEMO_ACCOUNTS = [
  {
    label: 'Office Admin',
    roleBadge: 'admin',
    email: 'admin@keskhanatti.org',
    password: 'KesAdmin@nyEZ-vavH-hMsW',
    desc: 'Overview, Admissions Desk, Staff & Attendance Register, Notices & Classroom',
    icon: UserCheck,
  },
  {
    label: 'Class Teacher / Staff',
    roleBadge: 'teacher',
    email: 'teacher@keskhanatti.org',
    password: 'KesTeacher@5SCd-S8Qx-RHCm',
    desc: 'My Classroom & Homework, Daily Timesheet & School Circulars',
    icon: BookOpen,
  },
];

const PARENT_PORTAL_CARDS = [
  {
    label: 'Multi-Sibling Family Access',
    roleBadge: 'siblings',
    meta: 'Login: 10-Digit Parent Mobile • Code: Admission No or DOB',
    desc: 'Switch between all enrolled children in 1 click with zero page reload',
    icon: Users,
  },
  {
    label: 'Fees, Homework & Report Cards',
    roleBadge: 'academics',
    meta: 'Official A4 Fee Receipts • Daily Homework • Term Progress Cards',
    desc: 'View fee ledger, class homework assignments, and printable exam results',
    icon: Award,
  },
];

export default function PortalLogin() {
  const { login, parentLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Login Mode: 'staff' | 'parent'
  const [loginMode, setLoginMode] = useState('staff');

  // Staff / Admin State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleFillDemo = (account) => {
    setLoginMode('staff');
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-navyDark flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Return Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs text-slate-300 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-goldSoft hover:text-white font-semibold transition"
        >
          <Home className="w-4 h-4 text-brand-gold" />
          <span>← Back to Public School Website</span>
        </Link>
        <span className="font-mono text-[11px] text-slate-400">
          {SCHOOL_INFO.registrationNo}
        </span>
      </div>

      {/* Main Login & Demo Container */}
      <div className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left: Institutional Branding & Role Info (Identical Height & Structure for Both Modes) */}
        <div className="lg:col-span-6 text-white space-y-5">
          <div className="flex items-center gap-3.5">
            <img
              src={SCHOOL_INFO.logoUrl}
              alt="Shri Siddharoodha EMS Logo"
              className="w-16 h-16 rounded-full object-contain border-2 border-brand-gold bg-white p-0.5 shadow-lg"
            />
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-gold font-bold block">
                {SCHOOL_INFO.societyName}
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                {SCHOOL_INFO.schoolName}
              </h1>
              <span className="text-xs text-slate-300">
                {loginMode === 'parent'
                  ? 'Student & Parent Multi-Sibling Portal • Khanatti'
                  : 'Staff, Administration & Faculty Portal • Khanatti'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {loginMode === 'parent'
              ? 'Unified family portal to switch between enrolled siblings, print official fee receipts, view daily classroom homework, and download report cards.'
              : 'Unified role-based portal for managing online admission enquiries, student follow-ups, staff accounts, public circulars, and daily classroom homework.'}
          </p>

          {/* Left Info Box — Identical 2-Row Card Layout & Height in Both Modes */}
          <div className="bg-white/5 border border-brand-gold/30 rounded-xl p-4 sm:p-5 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                {loginMode === 'parent'
                  ? 'Student & Parent Portal Access Guide'
                  : 'Quick Demo Credentials (Click to Autofill)'}
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {loginMode === 'parent' ? 'Multi-Sibling Login' : 'Role-based Login'}
              </span>
            </div>

            <div className="space-y-2.5">
              {loginMode === 'staff'
                ? DEMO_ACCOUNTS.map((acc) => {
                    const IconComponent = acc.icon;
                    const isSelected = email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleFillDemo(acc)}
                        className={`w-full text-left p-3 rounded-lg border transition flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-gold/20 border-brand-gold text-white'
                            : 'bg-brand-navy/60 hover:bg-brand-navy border-white/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <IconComponent className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                              <span>{acc.label}</span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-brand-goldSoft">
                                {acc.roleBadge}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                              {acc.email} •{' '}
                              <span className="text-brand-goldSoft">Pass: {acc.password}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{acc.desc}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-brand-gold whitespace-nowrap">
                          Use →
                        </span>
                      </button>
                    );
                  })
                : PARENT_PORTAL_CARDS.map((card) => {
                    const IconComponent = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="w-full text-left p-3 rounded-lg border bg-brand-navy/60 border-white/10 text-slate-200 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <IconComponent className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                              <span>{card.label}</span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-brand-goldSoft">
                                {card.roleBadge}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-brand-goldSoft mt-0.5">
                              {card.meta}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{card.desc}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Right: Login Card with Fixed Height & Identical Field Structure */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8">
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
                <span>Staff / Admin Login</span>
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
                <span>Student / Parent Login</span>
              </button>
            </div>

            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded bg-brand-goldSoft text-brand-gold font-bold text-xs uppercase tracking-wider mb-2">
                {loginMode === 'parent'
                  ? 'Student & Parent Sign-In'
                  : 'Authorized Staff Sign-In'}
              </span>
              <h2 className="text-2xl font-serif font-bold text-brand-navy">
                {loginMode === 'parent'
                  ? 'Student & Parent Portal'
                  : 'Portal Authentication'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                {loginMode === 'parent'
                  ? 'Sign in with your registered mobile number and Admission No / DOB.'
                  : 'Sign in with your official school email to access your role workspace.'}
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
              <form onSubmit={handleStaffSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="portalEmail"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="portalEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@keskhanatti.org"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="portalPassword"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="portalPassword"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>{submitting ? 'Signing In...' : 'Sign In to Staff Portal'}</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleParentSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="parentMobileNumber"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Registered Parent Mobile Number (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="parentMobileNumber"
                      type="tel"
                      maxLength={10}
                      required
                      value={mobileNumber}
                      onChange={(e) =>
                        setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="e.g. 9845012345"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="studentAccessCode"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Access Code (Admission No or DOB DDMMYYYY)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="studentAccessCode"
                      type="text"
                      required
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="e.g. KES_01 or 01062019"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>
                      {submitting
                        ? 'Signing In...'
                        : 'Sign In to Student & Parent Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Protected by RBAC JWT Session</span>
              <a href={SCHOOL_INFO.phoneHref} className="text-brand-navy font-semibold">
                Desk: {SCHOOL_INFO.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs text-slate-400 z-10">
        © {new Date().getFullYear()} {SCHOOL_INFO.societyName} • {SCHOOL_INFO.schoolName}, Khanatti
      </div>
    </div>
  );
}
