import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, BookOpen, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SCHOOL_INFO } from '../context/../constants/schoolData';

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

export default function PortalLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getDefaultRouteForRole = (role) => {
    if (role === 'teacher') return '/portal/teacher';
    return '/portal/overview';
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
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

  const handleFillDemo = (account) => {
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
        <span className="font-mono text-[11px] text-slate-400">{SCHOOL_INFO.registrationNo}</span>
      </div>

      {/* Main Login & Demo Container */}
      <div className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left: Institutional Branding & Quick Demo Access */}
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
                Staff, Administration &amp; Faculty Portal • Khanatti
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unified role-based portal for managing online admission enquiries, student follow-ups,
            staff accounts, public circulars, and daily classroom homework assignments.
          </p>

          {/* Quick Demo Credentials (Click to Autofill) */}
          <div className="bg-white/5 border border-brand-gold/30 rounded-xl p-4 sm:p-5 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                Quick Demo Credentials (Click to Autofill)
              </span>
              <span className="text-[11px] font-mono text-slate-300">Role-based Login</span>
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const IconComponent = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleFillDemo(acc)}
                    className={`w-full text-left p-3 rounded-lg border transition flex items-start justify-between gap-3 ${
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
                          {acc.email} • <span className="text-brand-goldSoft">Pass: {acc.password}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{acc.desc}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-brand-gold whitespace-nowrap">
                      Use →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8">
            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded bg-brand-goldSoft text-brand-gold font-bold text-xs uppercase tracking-wider mb-2">
                Authorized Staff Sign-In
              </span>
              <h2 className="text-2xl font-serif font-bold text-brand-navy">
                Portal Authentication
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in with your official school email to access your role workspace.
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>{submitting ? 'Signing In...' : 'Sign In to Staff Portal'}</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Protected by RBAC JWT Session</span>
              <a href={SCHOOL_INFO.phoneHref} className="text-brand-navy font-semibold">
                Desk: {SCHOOL_INFO.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-5xl w-full mx-auto text-center text-[11px] text-slate-400 z-10">
        © {new Date().getFullYear()} {SCHOOL_INFO.societyName} {SCHOOL_INFO.schoolName}, Khanatti.
      </div>
    </div>
  );
}
