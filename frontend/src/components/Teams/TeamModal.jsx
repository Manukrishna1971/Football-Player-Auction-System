import React, { useState } from 'react';
import { X, ShieldPlus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TeamModal({ isOpen, onClose, onSaved }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logo: '⚽',
    color: '#10B981',
    budget: 120000000,
    maxPlayers: 11
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        alert(data.message || 'Error creating team');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-md border border-pitch-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-pitch-800 flex items-center justify-between bg-pitch-900/60">
          <div className="flex items-center space-x-2">
            <ShieldPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Register Franchise Club</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Club Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Juventus FC"
              className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Short Code</label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.shortName}
                onChange={e => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                placeholder="e.g. JUV"
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Emoji</label>
              <input
                type="text"
                value={formData.logo}
                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Theme Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-9 bg-transparent cursor-pointer rounded border border-pitch-700"
                />
                <span className="text-xs font-mono text-slate-400">{formData.color}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Squad Limit</label>
              <input
                type="number"
                min="5"
                max="25"
                value={formData.maxPlayers}
                onChange={e => setFormData({ ...formData, maxPlayers: e.target.value })}
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Starting Budget ($)</label>
            <input
              type="number"
              step="5000000"
              min="10000000"
              required
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
              className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-pitch-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Creating...' : 'Register Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
