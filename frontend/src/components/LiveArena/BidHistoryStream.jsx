import React from 'react';
import { History, TrendingUp } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

export default function BidHistoryStream({ history = [] }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-pitch-700/80 flex flex-col h-full max-h-[380px]">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Bid Stream
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {history.length} {history.length === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No bids placed for this player yet.
          </div>
        ) : (
          history.map((bid, index) => {
            const isHighest = index === 0;
            return (
              <div
                key={bid._id || index}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isHighest
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-pitch-900/60 border-pitch-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: bid.teamColor || '#10B981' }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {bid.teamName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black font-mono block ${isHighest ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {formatMoney(bid.amount)}
                  </span>
                  {isHighest && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Current Highest
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
