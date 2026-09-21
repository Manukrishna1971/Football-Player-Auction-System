import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function PlayerFilters({
  search,
  setSearch,
  position,
  setPosition,
  status,
  setStatus,
  sortBy,
  setSortBy
}) {
  const positions = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <div className="glass-panel rounded-2xl p-4 border border-pitch-800 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players, club, nationality..."
            className="w-full bg-pitch-900 border border-pitch-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Position Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {positions.map(p => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                position === p
                  ? 'bg-emerald-500 text-pitch-950 shadow-neon-green'
                  : 'bg-pitch-900 text-slate-400 hover:text-white border border-pitch-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status and Sort Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="in_auction">In Auction</option>
            <option value="sold">Sold</option>
            <option value="unsold">Unsold</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="rating">Sort: Overall Rating</option>
            <option value="price">Sort: Base Valuation</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
