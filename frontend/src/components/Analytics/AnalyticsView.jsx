import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, History, Flame, Award } from 'lucide-react';
import { formatMoney, getPositionBadge } from '../../utils/formatters';

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [bidsHistory, setBidsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [anRes, bidsRes] = await Promise.all([
        fetch('http://localhost:5000/api/auction/analytics'),
        fetch('http://localhost:5000/api/auction/bids')
      ]);

      const anData = await anRes.json();
      const bidsData = await bidsRes.json();

      if (anData.success) setAnalytics(anData.analytics);
      if (bidsData.success) setBidsHistory(bidsData.bids);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 text-sm">
        Compiling auction analytics and transfer market ledger...
      </div>
    );
  }

  const posSpend = analytics?.positionSpend || {
    GK: { count: 0, spent: 0 },
    DEF: { count: 0, spent: 0 },
    MID: { count: 0, spent: 0 },
    FWD: { count: 0, spent: 0 }
  };

  const maxSpend = Math.max(
    posSpend.GK.spent,
    posSpend.DEF.spent,
    posSpend.MID.spent,
    posSpend.FWD.spent,
    1
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Transfer Market Analytics & Audit Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dive into auction expenditures, inflation premiums, and comprehensive transaction logs.
          </p>
        </div>

        <button
          onClick={fetchAnalyticsData}
          className="px-3.5 py-1.5 rounded-xl bg-pitch-900 border border-pitch-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          Refresh Data
        </button>
      </div>

      {/* Aggregate Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Volume Traded</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {formatMoney(analytics?.totalSpent || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across {analytics?.soldCount || 0} completed transfers
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Average Transfer Fee</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
            {formatMoney(analytics?.averagePlayerPrice || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Per signed athlete</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Unspent Franchise Reserves</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {formatMoney(analytics?.remainingBudget || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Liquid cash available</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Draft Clearance Rate</span>
          <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
            {analytics?.totalPlayers ? Math.round(((analytics.soldCount) / analytics.totalPlayers) * 100) : 0}%
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {analytics?.soldCount || 0} sold / {analytics?.unsoldCount || 0} passed
          </span>
        </div>
      </div>

      {/* Two Column Layout: Top Buys & Positional Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Blockbuster Signings */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-pitch-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-pitch-800">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Marquee Blockbuster Signings (Top Transfers)
            </h3>
          </div>

          {!analytics?.topBuys || analytics.topBuys.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No players have been hammered down yet. Run live bidding to see top transfers!
            </div>
          ) : (
            <div className="space-y-2.5">
              {analytics.topBuys.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="p-3 rounded-xl bg-pitch-900/80 border border-pitch-800/90 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-pitch-800 text-slate-300 font-bold font-mono text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.name}</h4>
                      <span className="text-xs text-slate-400">
                        {p.position} • {p.team ? p.team.name : 'Unknown Club'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-amber-400 block leading-tight">
                      {formatMoney(p.soldPrice)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      +{p.inflation}% over base
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positional Expenditure Breakdown */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-pitch-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-pitch-800">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Position Expenditure Distribution
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { pos: 'FWD', label: 'Forwards (FWD)', data: posSpend.FWD, color: '#F43F5E' },
              { pos: 'MID', label: 'Midfielders (MID)', data: posSpend.MID, color: '#10B981' },
              { pos: 'DEF', label: 'Defenders (DEF)', data: posSpend.DEF, color: '#3B82F6' },
              { pos: 'GK', label: 'Goalkeepers (GK)', data: posSpend.GK, color: '#F59E0B' }
            ].map(item => {
              const pct = maxSpend > 0 ? Math.round((item.data.spent / maxSpend) * 100) : 0;
              return (
                <div key={item.pos} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">
                      {formatMoney(item.data.spent)} ({item.data.count} signed)
                    </span>
                  </div>
                  <div className="w-full bg-pitch-900 rounded-full h-2.5 overflow-hidden border border-pitch-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Full Audit Bids History Ledger */}
      <div className="glass-panel rounded-2xl border border-pitch-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-pitch-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Transaction Audit Trail ({bidsHistory.length} Recorded Bids)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-pitch-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-pitch-800 font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Bidding Franchise</th>
                <th className="py-3 px-4 text-right">Offer Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-850">
              {bidsHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-500 text-xs">
                    No bids logged in this session yet.
                  </td>
                </tr>
              ) : (
                bidsHistory.map(bid => (
                  <tr key={bid._id} className="hover:bg-pitch-850/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                      {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{bid.player?.name || 'Player'}</span>
                      <span className="text-[10px] text-slate-400">{bid.player?.position}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bid.team?.color || '#10B981' }} />
                        <span className="font-semibold text-slate-200">{bid.team?.name || 'Club'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-emerald-400">
                      {formatMoney(bid.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
