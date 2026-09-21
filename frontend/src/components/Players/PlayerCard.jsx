import React from 'react';
import { getPositionBadge, getRatingColor, formatMoney } from '../../utils/formatters';
import { Edit2, Trash2, Play, Hash, Award, Shield } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function PlayerCard({ player, onEdit, onDelete, onViewDetails }) {
  const { setAuctionPlayer } = useSocket();

  const pos = getPositionBadge(player.position);
  const ratingStyle = getRatingColor(player.stats?.overall);
  const stats = player.stats || { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70, overall: 75 };

  const handleQueueInArena = (e) => {
    e.stopPropagation();
    setAuctionPlayer(player._id);
    if (onViewDetails) onViewDetails(player);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-pitch-800 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-xl flex flex-col justify-between group relative">
      
      {/* Card Header & Status */}
      <div className="p-3.5 pb-0 flex items-start justify-between">
        <div className="flex items-center space-x-1.5">
          <span className={`text-xl font-black font-mono px-2 py-0.5 rounded-lg border ${ratingStyle}`}>
            {stats.overall}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${pos.bg} ${pos.text} border ${pos.border}`}>
            {player.position}
          </span>
          {player.jerseyNumber && (
            <span className="text-xs font-mono font-black px-1.5 py-0.5 rounded bg-pitch-900 text-amber-400 border border-pitch-700">
              #{player.jerseyNumber}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
          player.status === 'sold' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
          player.status === 'in_auction' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' :
          player.status === 'unsold' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
          'bg-slate-800/80 text-slate-300 border-slate-700'
        }`}>
          {player.status === 'sold' && player.soldTo ? `Sold to ${player.soldTo.shortName || player.soldTo.name}` : player.status}
        </span>
      </div>

      {/* Card Body: Photo & Name */}
      <div className="p-4 text-center">
        <div className="relative inline-block mb-2.5">
          <img
            src={player.photoUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80'}
            alt={player.name}
            className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-pitch-700 group-hover:border-emerald-500/50 shadow-md transition-colors"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80';
            }}
          />
          {player.category && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-pitch-950 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              {player.category}
            </span>
          )}
        </div>

        <h4 className="text-base font-black text-white truncate mt-1">{player.name}</h4>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{player.club || 'Local Club'}</p>
        <span className="text-[11px] text-slate-500">Age {player.age} • {player.nationality || 'Local'}</span>

        {/* 6 Stats Mini Grid */}
        <div className="grid grid-cols-6 gap-1 mt-3 py-1.5 px-1 bg-pitch-900/90 rounded-xl border border-pitch-800 text-[10px]">
          <div>
            <span className="text-slate-500 block font-semibold">PAC</span>
            <span className="text-white font-mono font-bold">{stats.pace}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">SHO</span>
            <span className="text-white font-mono font-bold">{stats.shooting}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">PAS</span>
            <span className="text-white font-mono font-bold">{stats.passing}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">DRI</span>
            <span className="text-white font-mono font-bold">{stats.dribbling}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">DEF</span>
            <span className="text-white font-mono font-bold">{stats.defending}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">PHY</span>
            <span className="text-white font-mono font-bold">{stats.physical}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-slate-400">Base Valuation:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatMoney(player.basePrice)}
          </span>
        </div>
      </div>

      {/* Card Footer Actions - Always accessible to Tournament Organizers */}
      <div className="p-3 bg-pitch-900/90 border-t border-pitch-800 flex items-center justify-between">
        <button
          onClick={() => onEdit(player)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Player</span>
        </button>

        <div className="flex items-center space-x-1.5">
          {player.status === 'upcoming' && (
            <button
              onClick={handleQueueInArena}
              title="Queue in Live Auction Arena"
              className="p-1.5 rounded-lg bg-pitch-800 text-teal-400 hover:bg-pitch-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-teal-400" />
            </button>
          )}

          <button
            onClick={() => onDelete(player._id)}
            title="Delete Player"
            className="p-1.5 rounded-lg bg-pitch-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
