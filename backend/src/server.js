require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { setupAuctionSocket } = require('./socket/auctionSocket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

// Auto-seed helper
const User = require('./models/User');
const Player = require('./models/Player');
const seedData = require('./data/seedData');
const Team = require('./models/Team');
const AuctionState = require('./models/AuctionState');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auction', auctionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupAuctionSocket(io);

// Auto-seed on fresh start if database is empty
async function autoSeedIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    const playerCount = await Player.countDocuments();
    if (userCount === 0 || playerCount === 0) {
      console.log('[Auto-Seed] Database is clean. Seeding default teams, players & accounts...');
      await User.deleteMany({});
      await Team.deleteMany({});
      await Player.deleteMany({});
      await AuctionState.deleteMany({});

      await User.create(seedData.admin);

      for (const t of seedData.teams) {
        const mgr = await User.create(t.managerUser);
        const tm = await Team.create({
          name: t.name,
          shortName: t.shortName,
          logo: t.logo,
          color: t.color,
          budget: t.budget,
          maxPlayers: t.maxPlayers,
          manager: mgr._id
        });
        mgr.team = tm._id;
        await mgr.save();
      }

      const createdPlayers = [];
      for (const p of seedData.players) {
        const plyr = await Player.create({
          ...p,
          currentPrice: p.basePrice,
          status: 'upcoming'
        });
        createdPlayers.push(plyr);
      }

      const firstPlayer = createdPlayers[0];
      await AuctionState.create({
        status: 'idle',
        currentPlayer: firstPlayer._id,
        currentBid: firstPlayer.basePrice,
        currentBidder: null,
        timerSeconds: 20,
        initialTimer: 20,
        isTimerRunning: false,
        bidHistory: [],
        message: `Next in queue: ${firstPlayer.name} ($${(firstPlayer.basePrice / 1000000).toFixed(1)}M base)`
      });

      console.log('[Auto-Seed] Done! Demo system is fully primed and ready.');
    }
  } catch (err) {
    console.error('[Auto-Seed] Seeding error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await autoSeedIfEmpty();
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`⚽ Football Auction Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket server listening for bidding clients`);
    console.log(`===================================================`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
