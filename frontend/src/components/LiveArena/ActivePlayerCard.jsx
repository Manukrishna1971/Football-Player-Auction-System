import React from 'react';
import { getPositionBadge, getRatingColor, formatMoney } from '../../utils/formatters';
import { Sparkles, Award, Edit2, Hash } from 'lucide-react';

export default function ActivePlayerCard({ player, currentBid, currentBidder, status, onEditPlayer }) {
  if (!player) {
    return (
      <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[420px] border border-dashed border-pitch-700">
        <Award className="w-16 h-16 text-slate-600 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-300">No Player Under the Hammer</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Queue a local tournament player to start bidding!
        </p>
      </div>
    );
  }

  const posBadge = getPositionBadge(player.position);
  const ratingStyle = getRatingColor(player.stats?.overall);
  const stats = player.stats || { pace: 75, shooting: 75, passing: 75, dribbling: 75, defending: 75, physical: 75, overall: 80 };

  // Calculate radar polygon points
  const statLabels = [
    { key: 'pace', label: 'PAC' },
    { key: 'shooting', label: 'SHO' },
    { key: 'passing', label: 'PAS' },
    { key: 'dribbling', label: 'DRI' },
    { key: 'defending', label: 'DEF' },
    { key: 'physical', label: 'PHY' }
  ];

  const size = 180;
  const center = size / 2;
  const radius = 68;

  const points = statLabels.map((item, i) => {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const value = Math.min(Math.max((stats[item.key] || 50) / 100, 0.2), 1);
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.33, 0.66, 1.0];

  return (
    <div className="relative rounded-2xl overflow-hidden glass-card border border-pitch-700/80 shadow-2xl">
      {/* Top Banner / Status / Quick Edit Button */}
      <div className="bg-gradient-to-r from-pitch-900 via-pitch-850 to-pitch-900 px-6 py-3 border-b border-pitch-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tournament Draft Spotlight
          </span>
          {player.category && (
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-pitch-950 text-emerald-400 border border-emerald-500/30 font-semibold">
              {player.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onEditPlayer && (
            <button
              onClick={() => onEditPlayer(player)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Player</span>
            </button>
          )}

          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
            status === 'bidding' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' :
            status === 'sold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
            status === 'unsold' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
            'bg-slate-800 text-slate-300'
          }`}>
            {status === 'bidding' ? 'Under The Hammer' : status}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: FIFA Ultimate Card Portrait */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-56 h-80 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-amber-500/40 via-pitch-850 to-emerald-500/40 shadow-neon-gold group">
            <div className="w-full h-full bg-gradient-to-b from-pitch-900 to-pitch-950 rounded-[14px] p-4 flex flex-col justify-between relative overflow-hidden">
              
              {/* Background watermark badge */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

              {/* Card Top: Overall & Position */}
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold tracking-tighter text-amber-400 leading-none">
                    {stats.overall}
                  </span>
                  <span className={`mt-1 text-xs font-black px-2 py-0.5 rounded ${posBadge.bg} ${posBadge.text} border ${posBadge.border}`}>
                    {player.position}
                  </span>
                </div>
                <div className="text-right">
                  {player.jerseyNumber && (
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-pitch-950 text-amber-400 border border-amber-500/40 inline-block mb-1">
                      #{player.jerseyNumber}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 truncate max-w-[100px] block font-medium">
                    {player.club || player.nationality}
                  </span>
                </div>
              </div>

              {/* Player Image */}
              <div className="my-auto flex justify-center items-center z-10">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-amber-500/30 shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-pitch-800 border-2 border-pitch-700 flex items-center justify-center text-4xl">
                    ⚽
                  </div>
                )}
              </div>

              {/* Player Name Tag */}
              <div className="text-center z-10 border-t border-pitch-800/80 pt-2">
                <h2 className="text-lg font-black text-white uppercase tracking-tight truncate">
                  {player.name}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Age {player.age} • {posBadge.label}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Attribute Radar & Price Comparison */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          
          {/* Radar & Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Radar */}
            <div className="flex justify-center">
              <svg width={size} height={size} className="overflow-visible">
                {gridLevels.map((lvl, idx) => {
                  const gridPoints = statLabels.map((_, i) => {
                    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                    const x = center + radius * lvl * Math.cos(angle);
                    const y = center + radius * lvl * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={idx}
                      points={gridPoints}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  );
                })}

                {statLabels.map((_, i) => {
                  const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  );
                })}

                <polygon
                  points={points}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {statLabels.map((item, i) => {
                  const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                  const lx = center + (radius + 16) * Math.cos(angle);
                  const ly = center + (radius + 16) * Math.sin(angle);
                  return (
                    <text
                      key={item.key}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] fill-slate-400 font-bold"
                    >
                      {item.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Quick Stat Bars */}
            <div className="space-y-2 text-xs">
              {statLabels.map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold w-10">{item.label}</span>
                  <div className="flex-1 mx-2 bg-pitch-900 rounded-full h-2 overflow-hidden border border-pitch-800">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${stats[item.key] || 60}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-200 w-6 text-right">
                    {stats[item.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Board */}
          <div className="grid grid-cols-2 gap-4 bg-pitch-900/90 rounded-xl p-4 border border-pitch-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Base Valuation
              </span>
              <span className="text-xl font-black text-slate-300 font-mono">
                {formatMoney(player.basePrice)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Current Highest Bid
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {formatMoney(currentBid || player.basePrice)}
              </span>
            </div>
          </div>

          {/* Current Leader Tag */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">Leading Bidder:</span>
            {currentBidder ? (
              <span className="font-bold flex items-center gap-2 text-white bg-pitch-850 px-3 py-1 rounded-lg border border-pitch-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentBidder.color || '#10B981' }} />
                <span>{currentBidder.logo || '⚽'} {currentBidder.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono">({currentBidder.shortName})</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">No bids placed yet</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
