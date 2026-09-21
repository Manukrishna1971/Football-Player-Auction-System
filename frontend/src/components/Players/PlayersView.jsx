import React, { useState, useEffect, useCallback } from 'react';
import PlayerCard from './PlayerCard';
import PlayerFilters from './PlayerFilters';
import PlayerModal from './PlayerModal';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Users, Sparkles, Trash2, RotateCcw } from 'lucide-react';

export default function PlayersView({ onViewPlayerInArena }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (position !== 'ALL') params.append('position', position);
      if (status !== 'ALL') params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`http://localhost:5000/api/players?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlayers(data.players);
      }
    } catch (e) {
      console.error('Error loading players:', e);
    } finally {
      setLoading(false);
    }
  }, [search, position, status, sortBy]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleEdit = (player) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Delete this player from the tournament roster?')) return;
    try {
      const token = localStorage.getItem('auction_token');
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`http://localhost:5000/api/players/${playerId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        fetchPlayers();
      } else {
        alert(data.message || 'Error deleting player');
      }
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleCreateNew = () => {
    setPlayerToEdit(null);
    setIsModalOpen(true);
  };

  const handleSeedLocalSquad = async () => {
    if (!window.confirm('Populate with sample Local Tournament Players (Alex Mercer, Carlos Gomez, etc.)?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('auction_token');
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('http://localhost:5000/api/players/seed-local', {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        alert('Local tournament squad loaded successfully!');
        fetchPlayers();
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all players to start your tournament with a clean roster?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('auction_token');
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('http://localhost:5000/api/players/clear-all', {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        alert('Roster cleared! Click "Add Local Player" to register your tournament players.');
        fetchPlayers();
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Compute counts
  const totalCount = players.length;
  const upcomingCount = players.filter(p => p.status === 'upcoming').length;
  const soldCount = players.filter(p => p.status === 'sold').length;
  const unsoldCount = players.filter(p => p.status === 'unsold').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Local Tournament Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Local Tournament Player Roster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add, edit, or customize any local player's details, jersey numbers, and base prices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Local Player</span>
          </button>

          <button
            onClick={handleSeedLocalSquad}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 hover:border-emerald-400 text-emerald-400 text-xs font-bold transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Local Preset</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-pitch-900 border border-pitch-700 hover:border-rose-500 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Roster</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Registered</span>
          <span className="text-xl font-black text-white font-mono">{totalCount}</span>
        </div>
        <div className="glass-card rounded-xl p-3 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-teal-400 block">Upcoming in Draft</span>
          <span className="text-xl font-black text-teal-400 font-mono">{upcomingCount}</span>
        </div>
        <div className="glass-card rounded-xl p-3 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-amber-400 block">Signed to Teams</span>
          <span className="text-xl font-black text-amber-400 font-mono">{soldCount}</span>
        </div>
        <div className="glass-card rounded-xl p-3 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-rose-400 block">Passed / Unsold</span>
          <span className="text-xl font-black text-rose-400 font-mono">{unsoldCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <PlayerFilters
        search={search}
        setSearch={setSearch}
        position={position}
        setPosition={setPosition}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Players Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Loading player roster...
        </div>
      ) : players.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-pitch-800 space-y-3">
          <p className="text-base font-bold text-slate-300">Your local tournament roster is currently empty!</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You can register your local players individually, or load our local community preset to test.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-pitch-950 font-bold text-xs"
            >
              + Add First Player
            </button>
            <button
              onClick={handleSeedLocalSquad}
              className="px-4 py-2 rounded-xl bg-pitch-900 border border-pitch-700 text-emerald-400 font-bold text-xs"
            >
              Load Sample Local Squad
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map(player => (
            <PlayerCard
              key={player._id}
              player={player}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={onViewPlayerInArena}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerToEdit={playerToEdit}
        onSaved={fetchPlayers}
      />

    </div>
  );
}
