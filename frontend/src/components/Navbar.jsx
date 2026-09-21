import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  UserPlus, 
  Volume2, 
  VolumeX, 
  LogOut, 
  LogIn, 
  Flame, 
  BarChart3, 
  Radio, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { soundManager } from '../utils/soundEffects';
import { formatMoney } from '../utils/formatters';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, isManager, logout } = useAuth();
  const { connected, auctionState } = useSocket();
  const [soundOn, setSoundOn] = useState(soundManager.isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = soundManager.toggleSound();
    setSoundOn(newState);
  };

  const isBidding = auctionState?.status === 'bidding';

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-pitch-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Live Status */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setActiveTab('arena')} 
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-neon-green group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-pitch-950 rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-wider text-white flex items-center gap-1.5">
                  KICK<span className="text-emerald-400">OFF</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-normal font-semibold">
                    AUCTION
                  </span>
                </span>
              </div>
            </div>

            {/* Real-time connection & state badge */}
            <div className="hidden md:flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                !connected 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                  : isBidding 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse-fast' 
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700'
              }`}>
                <Radio className={`w-3 h-3 mr-1.5 ${isBidding ? 'animate-ping' : ''}`} />
                {!connected ? 'Disconnected' : isBidding ? 'LIVE BIDDING' : (auctionState?.status?.toUpperCase() || 'STANDBY')}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'arena', label: 'Live Arena', icon: Flame },
              { id: 'players', label: 'Players Hub', icon: Users },
              { id: 'teams', label: 'Teams & Squads', icon: Shield },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-pitch-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions: Audio, User Profile, Login */}
          <div className="flex items-center space-x-3">
            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Mute Stadium Audio' : 'Unmute Stadium Audio'}
              className="p-2 rounded-lg bg-pitch-900 border border-pitch-800 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Session Info */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isManager && user.team && (
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-300 flex items-center justify-end gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: user.team.color || '#10B981' }} />
                      {user.team.name}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Rem: {formatMoney(user.team.remainingBudget ?? user.team.budget)}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-pitch-900 border border-pitch-800 px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-200 border border-slate-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-100 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium capitalize">
                      {isAdmin ? 'Auctioneer (Admin)' : 'Team Manager'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-bold text-sm hover:opacity-95 shadow-neon-green transition-transform active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-pitch-800/60 no-scrollbar">
          {[
            { id: 'arena', label: 'Arena', icon: Flame },
            { id: 'players', label: 'Players', icon: Users },
            { id: 'teams', label: 'Teams', icon: Shield },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'text-slate-400 bg-pitch-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
