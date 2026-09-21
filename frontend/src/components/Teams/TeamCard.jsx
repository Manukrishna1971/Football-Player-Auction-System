import React from 'react';
import { formatMoney, getPositionBadge } from '../../utils/formatters';
import { Users, DollarSign, Award } from 'lucide-react';

export default function TeamCard({ team, onEdit }) {
  const squad = team.players || [];
  const spent = team.spent || 0;
  const budget = team.budget || 100000000;
  const remaining = Math.max(0, budget - spent);
  const spentPct = Math.min(100, Math.round((spent / budget) * 100));

  const totalRating = squad.reduce((sum, p) => sum + (p.stats?.overall || 0), 0);
  const avgRating = squad.length > 0 ? Math.round(totalRating / squad.length) : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-pitch-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
      
      {/* Top Banner */}
      <div 
        className="p-4 border-b border-pitch-800 flex items-center justify-between"
        style={{ borderTop: `4px solid ${team.color || '#10B981'}` }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
            style={{ 
              backgroundColor: `${team.color || '#10B981'}20`,
              borderColor: `${team.color || '#10B981'}40`
            }}
          >
            {team.logo || '⚽'}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base leading-tight">
              {team.name}
            </h3>
            <span className="text-xs font-mono font-bold" style={{ color: team.color || '#10B981' }}>
              {team.shortName}
            </span>
          </div>
        </div>

        {/* Squad Average Rating */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avg OVR</span>
          <span className="text-lg font-black text-amber-400 font-mono">
            {avgRating || '—'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1">
        
        {/* Budget Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Budget Spent ({spentPct}%)
            </span>
            <span className="font-mono font-bold text-slate-200">
              {formatMoney(spent)} / {formatMoney(budget)}
            </span>
          </div>
          <div className="w-full bg-pitch-900 rounded-full h-2.5 overflow-hidden border border-pitch-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${spentPct}%`,
                backgroundColor: team.color || '#10B981'
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Remaining:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatMoney(remaining)}
            </span>
          </div>
        </div>

        {/* Squad Capacity */}
        <div className="flex items-center justify-between py-2 px-3 bg-pitch-900/70 rounded-xl border border-pitch-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-400" />
            Squad Roster
          </span>
          <span className="font-mono font-bold text-white">
            {squad.length} / {team.maxPlayers || 11} Slots
          </span>
        </div>

        {/* Players List */}
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Acquired Signings ({squad.length})
          </span>

          {squad.length === 0 ? (
            <div className="text-center py-4 bg-pitch-900/40 rounded-xl border border-pitch-800/50 text-xs text-slate-500 italic">
              No players signed yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {squad.map(player => {
                const pos = getPositionBadge(player.position);
                return (
                  <div
                    key={player._id}
                    className="p-2 rounded-lg bg-pitch-900/80 border border-pitch-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${pos.bg} ${pos.text}`}>
                        {player.position}
                      </span>
                      <span className="font-bold text-slate-200 truncate max-w-[130px]">
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-amber-400 text-xs">
                        {player.stats?.overall}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatMoney(player.currentPrice || player.basePrice)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
