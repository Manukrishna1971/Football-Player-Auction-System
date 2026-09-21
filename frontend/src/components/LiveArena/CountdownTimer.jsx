import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ seconds, maxSeconds = 20, isRunning }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, seconds / (maxSeconds || 20)));
  const strokeDashoffset = circumference - (progress * circumference);

  // Status message based on seconds left
  let urgencyText = 'Accepting Bids';
  let colorClass = 'text-emerald-400 stroke-emerald-400';
  let glowClass = 'shadow-neon-green';

  if (!isRunning && seconds > 0) {
    urgencyText = 'Auction Paused';
    colorClass = 'text-slate-400 stroke-slate-500';
    glowClass = '';
  } else if (seconds === 0) {
    urgencyText = 'HAMMER DOWN!';
    colorClass = 'text-rose-500 stroke-rose-500';
    glowClass = 'shadow-neon-red';
  } else if (seconds <= 5) {
    urgencyText = 'GOING THRICE! 🚨';
    colorClass = 'text-rose-400 stroke-rose-500';
    glowClass = 'shadow-neon-red animate-pulse';
  } else if (seconds <= 10) {
    urgencyText = 'Going Twice... ⏳';
    colorClass = 'text-amber-400 stroke-amber-400';
    glowClass = 'shadow-neon-gold';
  } else if (seconds <= 15) {
    urgencyText = 'Going Once...';
    colorClass = 'text-teal-400 stroke-teal-400';
  }

  return (
    <div className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${glowClass} transition-all duration-300`}>
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-pitch-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated Countdown Circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-linear`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Central Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-black font-mono tracking-tighter ${colorClass}`}>
            {seconds}s
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {isRunning ? 'Timer' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Urgency Caption */}
      <div className="mt-3 text-center">
        <span className={`text-xs font-bold uppercase tracking-wider block ${colorClass}`}>
          {urgencyText}
        </span>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isRunning ? 'Resets on counter-bid' : 'Waiting on auctioneer'}
        </p>
      </div>
    </div>
  );
}
