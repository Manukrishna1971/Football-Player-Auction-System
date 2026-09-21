import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_SERVER = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [auctionState, setAuctionState] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [notifications, setNotifications] = useState([]);
  const [lastBidTeam, setLastBidTeam] = useState(null);
  const { user, refreshProfile } = useAuth();

  // Helper to trigger confetti celebration
  const fireConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#F59E0B', '#EF4444', '#FFFFFF']
      });
    } catch (e) {}
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const s = io(SOCKET_SERVER, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to server:', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    // Receive full auction state updates
    s.on('auction:state_update', (state) => {
      setAuctionState(state);
      if (state.timerSeconds !== undefined) {
        setTimerSeconds(state.timerSeconds);
      }
    });

    // Synchronized timer ticks
    s.on('timer:tick', ({ seconds }) => {
      setTimerSeconds(seconds);
      if (seconds <= 5 && seconds > 0) {
        soundManager.playTickSound(true); // Urgent tick
      } else if (seconds > 5) {
        soundManager.playTickSound(false);
      }
    });

    // Bid placed
    s.on('bid:success', (data) => {
      setAuctionState(data.state);
      setLastBidTeam(data.team);
      soundManager.playBidSound();
    });

    // Auction sold
    s.on('auction:sold', (data) => {
      setAuctionState(data.state);
      soundManager.playGavelSound();
      setTimeout(() => soundManager.playSoldCelebration(), 300);
      fireConfetti();
      refreshProfile();
    });

    // Auction unsold
    s.on('auction:unsold', (data) => {
      setAuctionState(data.state);
      soundManager.playGavelSound();
    });

    // Real-time notifications
    s.on('auction:notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    });

    // Bid error
    s.on('bid:error', (err) => {
      alert(`⚠️ Bid Rejected: ${err.message}`);
    });

    // General auction error
    s.on('auction:error', (err) => {
      alert(`⚠️ Notice: ${err.message}`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [fireConfetti, refreshProfile]);

  // Action methods
  const placeBid = useCallback((amount) => {
    if (!socket) return;
    if (!user?.team) {
      alert('You must be assigned to a Team to place bids in the auction arena!');
      return;
    }
    const teamId = user.team._id || user.team.id;
    socket.emit('bid:place', {
      teamId,
      amount,
      userId: user.id || user._id
    });
  }, [socket, user]);

  const startAuction = useCallback((playerId) => {
    if (!socket) return;
    socket.emit('auction:start', { playerId });
  }, [socket]);

  const pauseAuction = useCallback(() => {
    if (!socket) return;
    socket.emit('auction:pause');
  }, [socket]);

  const resumeAuction = useCallback(() => {
    if (!socket) return;
    socket.emit('auction:resume');
  }, [socket]);

  const hammerSell = useCallback(() => {
    if (!socket) return;
    socket.emit('auction:hammer_sell');
  }, [socket]);

  const passPlayer = useCallback(() => {
    if (!socket) return;
    socket.emit('auction:pass');
  }, [socket]);

  const nextPlayer = useCallback(() => {
    if (!socket) return;
    socket.emit('auction:next_player');
  }, [socket]);

  const setAuctionPlayer = useCallback((playerId) => {
    if (!socket) return;
    socket.emit('auction:set_player', { playerId });
  }, [socket]);

  const value = {
    socket,
    connected,
    auctionState,
    timerSeconds,
    notifications,
    lastBidTeam,
    placeBid,
    startAuction,
    pauseAuction,
    resumeAuction,
    hammerSell,
    passPlayer,
    nextPlayer,
    setAuctionPlayer
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
