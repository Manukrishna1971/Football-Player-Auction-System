import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import LiveArenaView from './components/LiveArena/LiveArenaView';
import PlayersView from './components/Players/PlayersView';
import TeamsView from './components/Teams/TeamsView';
import PointsTableView from './components/Leaderboard/PointsTableView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import AuthModal from './components/Auth/AuthModal';
import NotificationToast from './components/NotificationToast';

function MainApp() {
  const [activeTab, setActiveTab] = useState('arena');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectPlayerForView = (player) => {
    setActiveTab('arena');
  };

  return (
    <div className="min-h-screen flex flex-col bg-pitch-950 text-slate-100 selection:bg-neon-green selection:text-pitch-950">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'arena' && (
          <LiveArenaView
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectPlayerForView={handleSelectPlayerForView}
          />
        )}
        {activeTab === 'players' && (
          <PlayersView onViewPlayerInArena={handleSelectPlayerForView} />
        )}
        {activeTab === 'teams' && <TeamsView />}
        {activeTab === 'leaderboard' && <PointsTableView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-pitch-850 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">KICKOFF AUCTION</span>
            <span>•</span>
            <span>Next-Gen Football Player Auction System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Socket.io Engine Online
            </span>
            <span>•</span>
            <span>MongoDB ODMS</span>
          </div>
        </div>
      </footer>

      {/* Modals & Live Overlays */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <NotificationToast />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
