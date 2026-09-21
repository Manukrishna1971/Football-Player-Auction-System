import React, { useState } from 'react';
import { Gavel, AlertCircle, ArrowUpCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatMoney } from '../../utils/formatters';

export default function BiddingControls({ onOpenAuth }) {
  const { user, isAuthenticated, isManager } = useAuth();
  const { auctionState, placeBid } = useSocket();
  const [customBid, setCustomBid] = useState('');

  const currentBid = auctionState?.currentBid || 0;
  const isBiddingOpen = auctionState?.status === 'bidding';
  const myTeam = user?.team;

  // Increments
  const increments = [
    { label: '+$500K', value: 500000 },
    { label: '+$1.0M', value: 1000000 },
    { label: '+$2.0M', value: 2000000 },
    { label: '+$5.0M', value: 5000000 }
  ];

  const handleIncrementBid = (incr) => {
    const nextAmount = currentBid + incr;
    placeBid(nextAmount);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customBid);
    if (!amount || amount <= currentBid) {
      alert(`Bid must be higher than current bid of ${formatMoney(currentBid)}`);
      return;
    }
    placeBid(amount);
    setCustomBid('');
  };

  // Check if my team is currently holding the highest bid
  const isCurrentLeader = myTeam && auctionState?.currentBidder?._id === (myTeam._id || myTeam.id);

  // Check budget
  const remainingBudget = myTeam ? (myTeam.remainingBudget ?? (myTeam.budget - (myTeam.spent || 0))) : 0;
  const isBudgetSufficient = (increment) => remainingBudget >= (currentBid + increment);

  if (!isAuthenticated || !isManager || !myTeam) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center border border-pitch-700/80">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h4 className="font-bold text-slate-200">Spectator Mode</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          You are viewing as a spectator. Sign in with a Club Manager account to bid with your team's budget!
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green"
        >
          Select Team Manager
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-pitch-700/80 space-y-4">
      
      {/* Team Budget Header */}
      <div className="flex items-center justify-between bg-pitch-900/90 rounded-xl p-3.5 border border-pitch-800">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base border"
            style={{ borderColor: myTeam.color || '#10B981', backgroundColor: `${myTeam.color}20` }}
          >
            {myTeam.logo || '⚽'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-none">{myTeam.name}</h4>
            <span className="text-[11px] text-slate-400">
              Squad: {myTeam.players?.length || 0}/{myTeam.maxPlayers || 11}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Available Budget</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {formatMoney(remainingBudget)}
          </span>
        </div>
      </div>

      {/* Leadership Status */}
      {isCurrentLeader && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Your franchise holds the highest bid right now!</span>
        </div>
      )}

      {/* Quick Bid Buttons */}
      <div>
        <span className="text-xs font-semibold text-slate-300 block mb-2">
          Quick Bid Increments
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {increments.map(inc => {
            const nextVal = currentBid + inc.value;
            const canAfford = isBudgetSufficient(inc.value);
            const disabled = !isBiddingOpen || !canAfford;

            return (
              <button
                key={inc.value}
                onClick={() => handleIncrementBid(inc.value)}
                disabled={disabled}
                className={`py-3 px-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed bg-pitch-900 border-pitch-800 text-slate-500'
                    : 'bg-pitch-850 hover:bg-emerald-500/20 border-pitch-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 shadow-sm active:scale-95'
                }`}
              >
                <span className="text-sm font-black tracking-tight leading-none">{inc.label}</span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {formatMoney(nextVal)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Bid Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min={currentBid + 100000}
            step="100000"
            value={customBid}
            onChange={(e) => setCustomBid(e.target.value)}
            disabled={!isBiddingOpen}
            placeholder={`Custom bid (> ${formatMoney(currentBid)})`}
            className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={!isBiddingOpen || !customBid || Number(customBid) <= currentBid || Number(customBid) > remainingBudget}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-neon-green transition-all"
        >
          Submit
        </button>
      </form>

      {!isBiddingOpen && (
        <div className="text-center text-xs text-slate-400 pt-1">
          Bidding is paused or currently closed by the auctioneer.
        </div>
      )}
    </div>
  );
}
