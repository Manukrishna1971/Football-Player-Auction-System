import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Save, Sparkles, Upload, Image as ImageIcon, Sliders, Hash, Phone, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PlayerModal({ isOpen, onClose, playerToEdit, onSaved }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('quick'); // 'quick' (simple overall rating) or 'detailed' (6 FIFA sliders)

  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: '',
    age: 24,
    position: 'FWD',
    nationality: 'Local District',
    club: 'Local Free Agent',
    category: 'Local Star',
    phone: '',
    notes: '',
    basePrice: 2000,
    photoUrl: '',
    stats: {
      pace: 75,
      shooting: 75,
      passing: 75,
      dribbling: 75,
      defending: 65,
      physical: 75,
      overall: 75
    }
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (playerToEdit) {
      setFormData({
        name: playerToEdit.name || '',
        jerseyNumber: playerToEdit.jerseyNumber || '',
        age: playerToEdit.age || 24,
        position: playerToEdit.position || 'FWD',
        nationality: playerToEdit.nationality || 'Local District',
        club: playerToEdit.club || 'Local Free Agent',
        category: playerToEdit.category || 'Local Star',
        phone: playerToEdit.phone || '',
        notes: playerToEdit.notes || '',
        basePrice: playerToEdit.basePrice || 2000,
        photoUrl: playerToEdit.photoUrl || '',
        stats: {
          pace: playerToEdit.stats?.pace || 75,
          shooting: playerToEdit.stats?.shooting || 75,
          passing: playerToEdit.stats?.passing || 75,
          dribbling: playerToEdit.stats?.dribbling || 75,
          defending: playerToEdit.stats?.defending || 65,
          physical: playerToEdit.stats?.physical || 75,
          overall: playerToEdit.stats?.overall || 75
        }
      });
      setPhotoPreview(playerToEdit.photoUrl || '');
    } else {
      setFormData({
        name: '',
        jerseyNumber: '',
        age: 23,
        position: 'FWD',
        nationality: 'Local District',
        club: 'Local Free Agent',
        category: 'Local Star',
        phone: '',
        notes: '',
        basePrice: 2000,
        photoUrl: '',
        stats: {
          pace: 75,
          shooting: 75,
          passing: 75,
          dribbling: 75,
          defending: 65,
          physical: 75,
          overall: 75
        }
      });
      setPhotoPreview('');
    }
  }, [playerToEdit, isOpen]);

  // Handle local file selection from computer / phone
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick overall score change
  const handleQuickOverallChange = (val) => {
    const ovr = Math.min(99, Math.max(40, Number(val) || 75));
    setFormData(prev => ({
      ...prev,
      stats: {
        pace: ovr,
        shooting: ovr,
        passing: ovr,
        dribbling: ovr,
        defending: Math.max(30, ovr - 10),
        physical: ovr,
        overall: ovr
      }
    }));
  };

  // Detailed slider stat change
  const handleStatChange = (key, val) => {
    const num = Number(val);
    const updatedStats = { ...formData.stats, [key]: num };
    const sum = updatedStats.pace + updatedStats.shooting + updatedStats.passing + 
                updatedStats.dribbling + updatedStats.defending + updatedStats.physical;
    updatedStats.overall = Math.round(sum / 6);

    setFormData(prev => ({
      ...prev,
      stats: updatedStats
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = playerToEdit
        ? `http://localhost:5000/api/players/${playerToEdit._id}`
        : 'http://localhost:5000/api/players';
      const method = playerToEdit ? 'PUT' : 'POST';

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        alert(data.message || 'Error saving player');
      }
    } catch (err) {
      alert('Failed to save player: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl w-full max-w-2xl border border-pitch-700 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-pitch-800 flex items-center justify-between bg-pitch-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {playerToEdit ? `Edit: ${playerToEdit.name}` : 'Register Local Tournament Player'}
              </h3>
              <span className="text-[11px] text-slate-400">
                Community & Local League Roster
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-pitch-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Photo & Basic Details Row */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-pitch-900/50 p-4 rounded-2xl border border-pitch-800">
            {/* Photo Preview & File Picker */}
            <div className="flex flex-col items-center space-y-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl overflow-hidden bg-pitch-800 border-2 border-dashed border-pitch-600 hover:border-emerald-400 cursor-pointer flex items-center justify-center relative group transition-all"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-400 text-xs">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span>Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                  Change
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> Select Local Photo
              </button>
            </div>

            {/* Core Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Player Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe, Alex Smith"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-emerald-400" /> Jersey Number
                </label>
                <input
                  type="text"
                  value={formData.jerseyNumber}
                  onChange={e => setFormData({ ...formData, jerseyNumber: e.target.value })}
                  placeholder="e.g. 7, 10, 99"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Position *</label>
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="GK">Goalkeeper (GK)</option>
                  <option value="DEF">Defender (DEF)</option>
                  <option value="MID">Midfielder (MID)</option>
                  <option value="FWD">Forward / Striker (FWD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Base Price / Points *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={formData.basePrice}
                  onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="e.g. 1000, 2500, 5000"
                  className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Local Tournament Specific Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Local Club / Ward / Area</label>
              <input
                type="text"
                value={formData.club}
                onChange={e => setFormData({ ...formData, club: e.target.value })}
                placeholder="e.g. Eastside, Red Dragons"
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category / Tier</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Local Star">Local Star</option>
                <option value="Emerging Youth">Emerging Youth</option>
                <option value="Veteran">Veteran Leader</option>
                <option value="Marquee Playmaker">Marquee Playmaker</option>
                <option value="Amateur Talent">Amateur Talent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                min="12"
                max="60"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Contact Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> Phone / Contact (Private)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 555-0199"
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-400" /> Scout / Tournament Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Top scorer in college league"
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Ratings Mode Selector (Quick vs Detailed) */}
          <div className="bg-pitch-900/80 rounded-xl p-4 border border-pitch-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Player Rating ({formData.stats.overall} OVR)
                </h4>
              </div>

              <div className="flex items-center space-x-1 bg-pitch-950 p-1 rounded-lg border border-pitch-800">
                <button
                  type="button"
                  onClick={() => setMode('quick')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    mode === 'quick' ? 'bg-emerald-500 text-pitch-950' : 'text-slate-400'
                  }`}
                >
                  Quick Rating
                </button>
                <button
                  type="button"
                  onClick={() => setMode('detailed')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    mode === 'detailed' ? 'bg-emerald-500 text-pitch-950' : 'text-slate-400'
                  }`}
                >
                  Detailed Sliders
                </button>
              </div>
            </div>

            {mode === 'quick' ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Single Overall Rating (1-99):</span>
                  <span className="text-lg font-black font-mono text-amber-400">{formData.stats.overall}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="99"
                  value={formData.stats.overall}
                  onChange={e => handleQuickOverallChange(e.target.value)}
                  className="w-full h-2 bg-pitch-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { key: 'pace', label: 'Pace' },
                  { key: 'shooting', label: 'Shooting' },
                  { key: 'passing', label: 'Passing' },
                  { key: 'dribbling', label: 'Dribbling' },
                  { key: 'defending', label: 'Defending' },
                  { key: 'physical', label: 'Physical' }
                ].map(item => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-mono font-bold text-white">{formData.stats[item.key]}</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="99"
                      value={formData.stats[item.key]}
                      onChange={e => handleStatChange(item.key, e.target.value)}
                      className="w-full h-1.5 bg-pitch-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-pitch-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-pitch-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-neon-green"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : playerToEdit ? 'Update Player' : 'Save Local Player'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
