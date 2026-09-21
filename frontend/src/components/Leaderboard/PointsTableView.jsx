import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Info, CheckCircle2, Shield } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

export default function PointsTableView() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/teams/leaderboard/points');
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Official Championship Standings & Points Table
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic leaderboard ranking franchises by squad rating strength, tactical balance, and financial prudence.
          </p>
        </div>

        <button
          onClick={fetchPoints}
          className="px-3.5 py-1.5 rounded-xl bg-pitch-900 border border-pitch-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          Refresh Standings
        </button>
      </div>

      {/* Top 3 Podium (if at least 3 teams) */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
          
          {/* 2nd Place (Silver) */}
          {second && (
            <div className="glass-card rounded-2xl p-5 border border-slate-400/30 flex flex-col items-center text-center order-2 md:order-1 relative">
              <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-black text-xl mb-3 shadow-md">
                🥈 2
              </div>
              <span className="text-2xl mb-1">{second.logo || '⚽'}</span>
              <h3 className="font-extrabold text-base text-white">{second.name}</h3>
              <span className="text-xs font-mono font-bold text-slate-400">{second.shortName}</span>
              <div className="mt-3 py-1.5 px-4 bg-pitch-900 rounded-xl border border-pitch-800 w-full">
                <span className="text-xs text-slate-400 block font-semibold">Total Score</span>
                <span className="text-2xl font-black font-mono text-slate-200">{second.points} PTS</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                {second.playersCount} Players • Avg OVR {second.avgRating}
              </span>
            </div>
          )}

          {/* 1st Place (Gold) - Elevated Center */}
          {first && (
            <div className="glass-card rounded-2xl p-6 border-2 border-amber-500/50 shadow-neon-gold flex flex-col items-center text-center order-1 md:order-2 md:-translate-y-4 relative bg-gradient-to-b from-amber-500/10 via-pitch-850 to-pitch-900">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-500 text-pitch-950 font-black text-[10px] tracking-wider uppercase shadow-md">
                Current Leader
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500/60 flex items-center justify-center font-black text-2xl mb-3 shadow-lg">
                👑 1
              </div>
              <span className="text-3xl mb-1">{first.logo || '⚽'}</span>
              <h3 className="font-black text-lg text-white">{first.name}</h3>
              <span className="text-xs font-mono font-bold text-amber-400">{first.shortName}</span>
              <div className="mt-3 py-2 px-5 bg-pitch-950/80 rounded-xl border border-amber-500/30 w-full">
                <span className="text-[10px] uppercase text-amber-400/80 block font-bold tracking-wider">Total Score</span>
                <span className="text-3xl font-black font-mono text-amber-400">{first.points} PTS</span>
              </div>
              <span className="text-xs text-slate-300 mt-2 font-medium">
                {first.playersCount} Players • Avg OVR {first.avgRating}
              </span>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {third && (
            <div className="glass-card rounded-2xl p-5 border border-amber-700/30 flex flex-col items-center text-center order-3 md:order-3 relative">
              <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-black text-xl mb-3 shadow-md">
                🥉 3
              </div>
              <span className="text-2xl mb-1">{third.logo || '⚽'}</span>
              <h3 className="font-extrabold text-base text-white">{third.name}</h3>
              <span className="text-xs font-mono font-bold text-slate-400">{third.shortName}</span>
              <div className="mt-3 py-1.5 px-4 bg-pitch-900 rounded-xl border border-pitch-800 w-full">
                <span className="text-xs text-slate-400 block font-semibold">Total Score</span>
                <span className="text-2xl font-black font-mono text-amber-600">{third.points} PTS</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                {third.playersCount} Players • Avg OVR {third.avgRating}
              </span>
            </div>
          )}

        </div>
      )}

      {/* Points Table Full View */}
      <div className="glass-panel rounded-2xl border border-pitch-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-pitch-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-pitch-800 font-bold">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Club Franchise</th>
                <th className="py-3.5 px-3 text-center">Squad</th>
                <th className="py-3.5 px-3 text-center">Avg OVR</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Positional Mix (G/D/M/F)</th>
                <th className="py-3.5 px-3 text-right">Spent / Cap</th>
                <th className="py-3.5 px-3 text-right hidden sm:table-cell">Rem. Budget</th>
                <th className="py-3.5 px-4 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-850">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 text-xs">
                    Calculating franchise point metrics...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 text-xs">
                    No teams registered yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map(team => {
                  const isTop = team.rank === 1;
                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-pitch-850/60 transition-colors ${
                        isTop ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-bold">
                        {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : (
                          <span className="text-slate-400 font-mono">{team.rank}</span>
                        )}
                      </td>

                      {/* Club info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{team.logo || '⚽'}</span>
                          <div>
                            <span className="font-bold text-white block leading-tight">
                              {team.name}
                            </span>
                            <span className="text-[11px] font-mono font-semibold" style={{ color: team.color || '#10B981' }}>
                              {team.shortName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Squad count */}
                      <td className="py-4 px-3 text-center font-mono font-bold text-slate-200">
                        {team.playersCount} / {team.maxPlayers}
                      </td>

                      {/* Avg OVR */}
                      <td className="py-4 px-3 text-center">
                        <span className="font-mono font-extrabold text-amber-400">
                          {team.avgRating || '—'}
                        </span>
                      </td>

                      {/* Positional Mix */}
                      <td className="py-4 px-3 text-center hidden md:table-cell">
                        <div className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{team.positions.GK}G</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{team.positions.DEF}D</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{team.positions.MID}M</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">{team.positions.FWD}F</span>
                        </div>
                      </td>

                      {/* Spent */}
                      <td className="py-4 px-3 text-right font-mono text-slate-300">
                        {formatMoney(team.totalSpent)}
                      </td>

                      {/* Remaining */}
                      <td className="py-4 px-3 text-right font-mono text-emerald-400 hidden sm:table-cell">
                        {formatMoney(team.remainingBudget)}
                      </td>

                      {/* Total Points */}
                      <td className="py-4 px-4 text-right">
                        <span className="text-base font-black font-mono text-emerald-400 block">
                          {team.points}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          +{team.balanceBonus} bal
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules / Logic Card */}
      <div className="glass-card rounded-2xl p-4 border border-pitch-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-300 font-bold">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Leaderboard Ranking Formula</span>
        </div>
        <p className="leading-relaxed">
          <strong>Total Points</strong> = <strong>Squad Power</strong> (Sum of overall FIFA ratings) + 
          <strong> Tactical Diversity Bonus</strong> (+15 pts for each field position covered: GK, DEF, MID, FWD) + 
          <strong> Financial Efficiency</strong> (Up to +20 pts based on unspent kitty preservation).
        </p>
      </div>

    </div>
  );
}
