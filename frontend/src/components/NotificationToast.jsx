import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Flame, Gavel, AlertCircle, X } from 'lucide-react';

export default function NotificationToast() {
  const { notifications } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  // Show only the latest 3 notifications
  const recent = notifications.slice(0, 3);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {recent.map((n) => {
        let border = 'border-pitch-700';
        let bg = 'bg-pitch-900/95';
        let icon = <Bell className="w-4 h-4 text-slate-300" />;

        if (n.type === 'sold') {
          border = 'border-amber-500/50 shadow-neon-gold';
          bg = 'bg-pitch-900/95';
          icon = <Gavel className="w-4 h-4 text-amber-400" />;
        } else if (n.type === 'bid') {
          border = 'border-emerald-500/50 shadow-neon-green';
          bg = 'bg-pitch-900/95';
          icon = <Flame className="w-4 h-4 text-emerald-400" />;
        } else if (n.type === 'unsold') {
          border = 'border-rose-500/50';
          bg = 'bg-pitch-900/95';
          icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-3.5 rounded-xl border ${border} ${bg} backdrop-blur-md shadow-2xl flex items-start space-x-3 transition-all animate-slideUp`}
          >
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1">
              <h5 className="text-xs font-bold text-white tracking-wide">{n.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
