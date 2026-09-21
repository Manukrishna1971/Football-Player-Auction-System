import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Gavel, 
  SkipForward, 
  RotateCcw, 
  Database, 
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function AdminAuctionPanel({ onRefreshData }) {
  const { isAdmin } = useAuth();
  const { 
    auctionState, 
    startAuction, 
    pauseAuction, 
    resumeAuction, 
    hammerSell, 
    passPlayer, 
    nextPlayer 
  } = useSocket();

  const [loadingAction, setLoadingAction] = useState(false);

  if (!isAdmin) {
    return null; // Only for Admin
  }

  const isBidding = auctionState?.status === 'bidding';
  const isPaused = auctionState?.status === 'paused';
  const hasBidder = !!auctionState?.currentBidder;

  const handleResetAuction = async () => {
    if (!window.confirm('Reset auction? This resets all sold players, bids, and team expenditures.')) {
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch('http://localhost:5000/api/auction/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Auction reset successfully!');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Error resetting auction: ' + e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReSeed = async () => {
    if (!window.confirm('Re-seed entire database? This wipes all changes and restores default star players & clubs.')) {
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch('http://localhost:5000/api/auction/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database seeded with fresh teams, players and accounts!');
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert('Error seeding database: ' + e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 shadow-neon-gold space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
            Auctioneer Command Deck
          </h3>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
          Admin Privileges
        </span>
      </div>

      {/* Main Gavel Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Start / Resume */}
        {!isBidding && !isPaused ? (
          <button
            onClick={() => startAuction()}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green active:scale-95"
          >
            <Play className="w-4 h-4 fill-pitch-950" />
            <span>Open Bidding</span>
          </button>
        ) : isBidding ? (
          <button
            onClick={pauseAuction}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 shadow-neon-gold active:scale-95"
          >
            <Pause className="w-4 h-4 fill-pitch-950" />
            <span>Pause Timer</span>
          </button>
        ) : (
          <button
            onClick={resumeAuction}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-neon-green active:scale-95"
          >
            <Play className="w-4 h-4 fill-pitch-950" />
            <span>Resume Bids</span>
          </button>
        )}

        {/* Sell / Hammer Gavel */}
        <button
          onClick={hammerSell}
          disabled={!hasBidder}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            hasBidder
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-pitch-950 shadow-neon-gold hover:opacity-95 active:scale-95'
              : 'bg-pitch-900 border border-pitch-800 text-slate-500 opacity-50 cursor-not-allowed'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Hammer (Sold)</span>
        </button>

        {/* Pass / Unsold */}
        <button
          onClick={passPlayer}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold uppercase tracking-wider active:scale-95"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Mark Unsold</span>
        </button>

        {/* Next Player */}
        <button
          onClick={nextPlayer}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-700 text-xs font-bold uppercase tracking-wider active:scale-95"
        >
          <SkipForward className="w-4 h-4" />
          <span>Next in Queue</span>
        </button>
      </div>

      {/* Auxiliary maintenance actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-pitch-800/80 justify-between items-center text-xs">
        <span className="text-slate-400">Environment Actions:</span>
        <div className="flex gap-2">
          <button
            onClick={handleResetAuction}
            disabled={loadingAction}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pitch-900 hover:bg-pitch-850 text-slate-300 border border-pitch-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Auction</span>
          </button>
          <button
            onClick={handleReSeed}
            disabled={loadingAction}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pitch-900 hover:bg-pitch-850 text-emerald-400 border border-pitch-700 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Restore Fresh Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
