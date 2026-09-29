import React, { useState, useEffect } from 'react';
import ActivePlayerCard from './ActivePlayerCard';
import CountdownTimer from './CountdownTimer';
import BiddingControls from './BiddingControls';
import BidHistoryStream from './BidHistoryStream';
import AdminAuctionPanel from './AdminAuctionPanel';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Flame, ChevronRight, Eye } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

export default function LiveArenaView({ onOpenAuth, onSelectPlayerForView }) {
  const { auctionState, timerSeconds, setAuctionPlayer } = useSocket();
  const { isAdmin } = useAuth();
  const [upcomingPlayers, setUpcomingPlayers] = useState([]);

  const fetchUpcoming = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/players?status=upcoming');
      const data = await res.json();
      if (data.success) {
        setUpcomingPlayers(data.players);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUpcoming();
  }, [auctionState?.status]);

  const currentPlayer = auctionState?.currentPlayer;
  const currentBidder = auctionState?.currentBidder;
  const isRunning = auctionState?.isTimerRunning;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Transfer Deadline Day Live Ticker */}
      <div className="bg-gradient-to-r from-emerald-950 via-pitch-900 to-pitch-950 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs overflow-hidden shadow-lg">
        <div className="flex items-center space-x-2 flex-shrink-0 text-amber-400 font-black uppercase tracking-wider text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>⚽ TRANSFER DEADLINE DAY</span>
          <span className="text-slate-600">|</span>
        </div>
        <div className="text-slate-300 font-medium truncate ml-3 text-[11px] sm:text-xs">
          🚨 <strong className="text-amber-300">MATCHDAY SCOUTING:</strong> Bidding war intensifying! Clubs calculating valuations against Financial Fair Play limits.
        </div>
        <span className="hidden md:inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ml-2 animate-pulse">
          WINDOW CLOSING ⏳
        </span>
      </div>

      {/* Live Announcement Banner */}
      {auctionState?.message && (
        <div className="bg-gradient-to-r from-pitch-900 via-pitch-850 to-pitch-900 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              {auctionState.message}
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider hidden sm:inline-block">
            LIVE BROADCAST
          </span>
        </div>
      )}

      {/* Admin Auctioneer Deck */}
      {isAdmin && <AdminAuctionPanel onRefreshData={fetchUpcoming} />}

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Center Column: Active FIFA Player Card */}
        <div className="lg:col-span-7 space-y-6">
          <ActivePlayerCard
            player={currentPlayer}
            currentBid={auctionState?.currentBid}
            currentBidder={currentBidder}
            status={auctionState?.status}
          />
        </div>

        {/* Right Column: Timer, Bidding Controls, and Bid Stream */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <CountdownTimer
              seconds={timerSeconds}
              maxSeconds={auctionState?.initialTimer || 25}
              isRunning={isRunning}
            />

            <BiddingControls onOpenAuth={onOpenAuth} />
          </div>

          <div className="flex-1">
            <BidHistoryStream history={auctionState?.bidHistory || []} />
          </div>

        </div>

      </div>

      {/* Upcoming Draft Queue Carousel */}
      <div className="glass-panel rounded-2xl p-5 border border-pitch-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Upcoming in Draft ({upcomingPlayers.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isAdmin ? 'Click player to cue for bidding' : 'Next players to enter auction'}
          </span>
        </div>

        {upcomingPlayers.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            All players have concluded their bidding rounds.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {upcomingPlayers.slice(0, 6).map(player => (
              <div
                key={player._id}
                onClick={() => {
                  if (isAdmin) setAuctionPlayer(player._id);
                  if (onSelectPlayerForView) onSelectPlayerForView(player);
                }}
                className="group glass-card rounded-xl p-3 border border-pitch-700/60 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {player.stats?.overall}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-pitch-900 text-slate-300">
                    {player.position}
                  </span>
                </div>

                <div className="my-2 flex justify-center">
                  <img
                    src={player.photoUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80'}
                    alt={player.name}
                    className="w-12 h-12 rounded-full object-cover border border-pitch-700 group-hover:border-emerald-400"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <div className="text-center">
                  <h5 className="text-xs font-bold text-white truncate">{player.name}</h5>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                    {formatMoney(player.basePrice)}
                  </span>
                </div>

                {isAdmin && (
                  <span className="mt-2 text-[9px] uppercase font-bold text-center py-1 rounded bg-pitch-900 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 block transition-colors">
                    Queue Player
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
