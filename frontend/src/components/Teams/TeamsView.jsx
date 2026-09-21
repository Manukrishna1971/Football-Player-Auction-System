import React, { useState, useEffect, useCallback } from 'react';
import TeamCard from './TeamCard';
import TeamModal from './TeamModal';
import { useAuth } from '../../context/AuthContext';
import { Shield, Plus, DollarSign, Users, Award } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

export default function TeamsView() {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/teams');
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
      }
    } catch (e) {
      console.error('Error fetching teams:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Total metrics
  const totalBudget = teams.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalSpent = teams.reduce((sum, t) => sum + (t.spent || 0), 0);
  const totalPlayersBought = teams.reduce((sum, t) => sum + (t.players?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Franchises & Squad Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor club payrolls, remaining transfer kitties, and squad assembly progress.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-pitch-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-cyan active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Franchise</span>
          </button>
        )}
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3.5 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Franchises</span>
          <span className="text-xl font-black text-white font-mono">{teams.length}</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-cyan-400 block">Total Kitty Cap</span>
          <span className="text-xl font-black text-cyan-400 font-mono">{formatMoney(totalBudget)}</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Capital Spent</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{formatMoney(totalSpent)}</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 border border-pitch-800">
          <span className="text-[10px] uppercase font-semibold text-amber-400 block">Signings Completed</span>
          <span className="text-xl font-black text-amber-400 font-mono">{totalPlayersBought} Players</span>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Loading franchise squads...
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-pitch-800">
          <p className="text-sm text-slate-400">No teams registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTeams}
      />

    </div>
  );
}
