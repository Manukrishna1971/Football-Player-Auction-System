import React, { useState } from 'react';
import { X, LogIn, UserPlus, Zap, Shield, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, demoAccounts } = useAuth();
  const [tab, setTab] = useState('demo'); // 'demo' | 'login' | 'register'

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTeamName, setRegTeamName] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: 'manager',
        teamName: regTeamName
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (email, password = 'admin123') => {
    setError('');
    setSubmitting(true);
    try {
      // Find actual password based on role/email
      let pass = password;
      if (email.includes('madrid')) pass = 'madrid123';
      else if (email.includes('city')) pass = 'city123';
      else if (email.includes('arsenal')) pass = 'arsenal123';
      else if (email.includes('bayern')) pass = 'bayern123';
      else if (email.includes('psg')) pass = 'psg123';
      else if (email.includes('barca')) pass = 'barca123';
      else if (email.includes('admin')) pass = 'admin123';

      await login(email, pass);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-lg border border-pitch-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-pitch-800 flex items-center justify-between bg-pitch-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-white">Sign In to Kickoff Auction</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-pitch-800 bg-pitch-900/40 p-1">
          <button
            onClick={() => { setTab('demo'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'demo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Demo Profiles</span>
          </button>

          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Credentials</span>
          </button>

          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* 1-Click Demo Logins */}
          {tab === 'demo' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Instantly switch roles to test bidding, auctioneer controls, and budget management:
              </p>

              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@auction.com', 'admin123')}
                disabled={submitting}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 hover:border-amber-400 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                    🔨
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-amber-300 block">
                      Auctioneer Chief (Admin)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Full control: Hammer gavel, start/pause timer, reset draft
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  Login →
                </span>
              </button>

              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 pt-2 border-t border-pitch-800">
                Club Franchises (Managers)
              </div>

              {/* Club Managers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {[
                  { name: 'Real Madrid CF', email: 'manager@madrid.com', manager: 'Carlo Ancelotti', logo: '👑', color: '#F59E0B' },
                  { name: 'Manchester City', email: 'manager@city.com', manager: 'Pep Guardiola', logo: '⚡', color: '#06B6D4' },
                  { name: 'Arsenal FC', email: 'manager@arsenal.com', manager: 'Mikel Arteta', logo: '🔴', color: '#EF4444' },
                  { name: 'Bayern Munich', email: 'manager@bayern.com', manager: 'Vincent Kompany', logo: '🛡️', color: '#DC2626' },
                  { name: 'Paris Saint-Germain', email: 'manager@psg.com', manager: 'Luis Enrique', logo: '🗼', color: '#3B82F6' },
                  { name: 'FC Barcelona', email: 'manager@barca.com', manager: 'Hansi Flick', logo: '🔵', color: '#A855F7' }
                ].map(club => (
                  <button
                    key={club.email}
                    type="button"
                    onClick={() => handleQuickLogin(club.email)}
                    disabled={submitting}
                    className="p-2.5 rounded-xl bg-pitch-900/80 border border-pitch-800 hover:border-emerald-500/50 flex items-center justify-between text-left group transition-all"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-xl flex-shrink-0">{club.logo}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">
                          {club.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {club.manager}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0 ml-2">
                      Bid →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Standard Login */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@auction.com"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green"
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Zinedine Zidane"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="manager@club.com"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Club Franchise Name</label>
                <input
                  type="text"
                  required
                  value={regTeamName}
                  onChange={e => setRegTeamName(e.target.value)}
                  placeholder="e.g. Liverpool FC"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green"
              >
                {submitting ? 'Registering...' : 'Create Manager Account'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
