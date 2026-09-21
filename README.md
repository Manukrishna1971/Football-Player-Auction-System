# ⚽ Kickoff Auction | Real-Time Football Player Auction & Draft System

A full-stack, production-ready web application for a **Football Player Auction & Draft System** built with **React (Tailwind CSS)**, **Node.js (Express)**, **Socket.io**, and **MongoDB / Mongoose**.

Features a dark sports-themed UI with neon accents, EA Sports FC / FIFA-style dynamic player cards with radar stat charts, a real-time synchronized bidding engine, club budget management, and an automated points leaderboard.

---

## 🎯 Features

### 1. Player Management (Players Hub)
- **Attribute Visualizer**: FIFA Ultimate Team-style holographic cards with a 6-attribute radar polygon (Pace, Shooting, Passing, Dribbling, Defending, Physical) and overall (OVR) rating.
- **CRUD Operations**: Register new players with attribute sliders, edit existing profiles, or remove players.
- **Search & Filters**: Search by player name, nationality, or club; filter by position (`GK`, `DEF`, `MID`, `FWD`) and status (`Upcoming`, `In Auction`, `Sold`, `Unsold`); sort by rating or valuation.

### 2. Live Auction Arena & Real-Time Engine
- **Synchronized WebSocket Countdown**: 20s–25s countdown broadcasted to all connected tabs with urgency transitions (Green ➔ Amber ➔ Flashing Red).
- **Smart Increments**: Quick bid buttons (`+$500K`, `+$1.0M`, `+$2.0M`, `+$5.0M`) and custom bid inputs.
- **Rules & Validation**: Prevents overbidding beyond available budget and enforces team squad limits (e.g. max 11 players).
- **Auctioneer Gavel Deck (Admin)**: Open bidding, pause timer, resume timer, hammer gavel ("SOLD!"), mark unsold, and cycle next player in queue.
- **Web Audio FX & Confetti**: Native Web Audio API sound effects (tick countdown, bid chime, double-strike gavel hammer) and confetti on sales.

### 3. Team & Budget Management
- **Budget Tracking**: Visual progress meters tracking spent budget vs. remaining treasury kitty.
- **Squad Rosters**: Real-time list of purchased signings, squad slots filled, and calculated squad average rating.
- **Admin Franchise Setup**: Create new franchises with custom team colors, short codes, and starting budgets.

### 4. Championship Scoreboard & Points Table
- **Dynamic Leaderboard**: Ranks clubs using a custom football points formula:
  $$\text{Total Points} = \text{Squad Power (Sum of OVRs)} + \text{Tactical Balance Bonus} + \text{Financial Efficiency}$$
- **Podium Display**: 1st (Gold 👑), 2nd (Silver 🥈), and 3rd (Bronze 🥉) place podium cards.
- **Tactical Breakdown**: Live count of positional slots filled (`GK`, `DEF`, `MID`, `FWD`).

### 5. Transfer Market Analytics & History
- Aggregate KPIs: Total volume traded, average transfer fee, liquid reserves, and draft clearance rate.
- Top 5 Marquee Blockbuster Signings with inflation percentage over valuation.
- Positional expenditure breakdown (FWD / MID / DEF / GK).
- Audit trail logging every bid with timestamps and bidder details.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.io-client, Canvas-Confetti, Web Audio API
- **Backend**: Node.js, Express, Socket.io, Mongoose, JWT, bcryptjs, Multer
- **Database**: MongoDB with automated embedded in-memory fallback (`mongodb-memory-server`) for zero-friction local execution.

---

## 📂 Project Structure

```
football-auction-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Auto-detects local/Atlas MongoDB or boots embedded DB
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth, demo accounts helper
│   │   │   ├── playerController.js  # Player CRUD, filters, stats calc
│   │   │   ├── teamController.js    # Teams, squad rosters, points table
│   │   │   └── auctionController.js # Live state, seed data, reset, analytics
│   │   ├── data/
│   │   │   └── seedData.js          # Star footballers & premier football clubs
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & role protection
│   │   │   └── upload.js            # Multer image storage
│   │   ├── models/
│   │   │   ├── User.js              # Admin & Manager accounts
│   │   │   ├── Team.js              # Franchise budgets & squad refs
│   │   │   ├── Player.js            # FIFA attributes & auction states
│   │   │   ├── AuctionState.js      # Session ticker & current bidder
│   │   │   └── Bid.js               # Audit transaction logs
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── playerRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   └── auctionRoutes.js
│   │   ├── socket/
│   │   │   └── auctionSocket.js     # Real-time bidding state machine
│   │   └── server.js                # Express & Socket.io server boot
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Live badge, tabs, sound toggle, session
│   │   │   ├── NotificationToast.jsx # Real-time floating alerts
│   │   │   ├── LiveArena/
│   │   │   │   ├── LiveArenaView.jsx
│   │   │   │   ├── ActivePlayerCard.jsx   # EA Sports FC card & SVG radar
│   │   │   │   ├── CountdownTimer.jsx     # Animated circular countdown ring
│   │   │   │   ├── BiddingControls.jsx    # Quick chips & budget verification
│   │   │   │   ├── BidHistoryStream.jsx   # Live event ticker
│   │   │   │   └── AdminAuctionPanel.jsx  # Auctioneer gavel controls
│   │   │   ├── Players/
│   │   │   │   ├── PlayersView.jsx
│   │   │   │   ├── PlayerCard.jsx
│   │   │   │   ├── PlayerFilters.jsx
│   │   │   │   └── PlayerModal.jsx        # Stats sliders & preview
│   │   │   ├── Teams/
│   │   │   │   ├── TeamsView.jsx
│   │   │   │   ├── TeamCard.jsx
│   │   │   │   └── TeamModal.jsx
│   │   │   ├── Leaderboard/
│   │   │   │   └── PointsTableView.jsx    # Podium & points formula table
│   │   │   ├── Analytics/
│   │   │   │   └── AnalyticsView.jsx      # Top transfers & audit logs
│   │   │   └── Auth/
│   │   │       └── AuthModal.jsx          # 1-Click Fast Demo Login Switcher
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── utils/
│   │   │   ├── formatters.js              # Currency, badges, rating styles
│   │   │   └── soundEffects.js            # Web Audio API synthesizer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                      # Neon sports styling & glassmorphism
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm** (v9 or newer)

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
```
*The backend connects to your local MongoDB or Atlas URI if configured in `.env`. If none is available, it automatically launches an embedded in-memory MongoDB runner and seeds default star players and clubs!*

### 3. Start Frontend App
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Accounts (1-Click Fast Login)

The app comes pre-seeded with accounts accessible via the **"Sign In / Demo"** button:

| Role | Name / Franchise | Email | Default Password | Budget |
|---|---|---|---|---|
| **Admin Auctioneer** | Chief Auctioneer | `admin@auction.com` | `admin123` | Full Controls |
| **Team Manager** | Real Madrid CF (Carlo Ancelotti) | `manager@madrid.com` | `madrid123` | $150,000,000 |
| **Team Manager** | Manchester City (Pep Guardiola) | `manager@city.com` | `city123` | $150,000,000 |
| **Team Manager** | Arsenal FC (Mikel Arteta) | `manager@arsenal.com` | `arsenal123` | $130,000,000 |
| **Team Manager** | Bayern Munich (Vincent Kompany) | `manager@bayern.com` | `bayern123` | $140,000,000 |
| **Team Manager** | Paris Saint-Germain (Luis Enrique) | `manager@psg.com` | `psg123` | $160,000,000 |
| **Team Manager** | FC Barcelona (Hansi Flick) | `manager@barca.com` | `barca123` | $120,000,000 |

*Tip: Open two browser windows (one as Admin and one as Team Manager) to watch live bids, timer synchronization, and gavel sales in real time!*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register manager & team
- `GET /api/auth/me` - Get profile & squad
- `GET /api/auth/demo-accounts` - List demo accounts for UI

### Players
- `GET /api/players` - Query players (search, position, status, sort)
- `GET /api/players/:id` - Get player details
- `POST /api/players` - Create player (Admin)
- `PUT /api/players/:id` - Update player (Admin)
- `DELETE /api/players/:id` - Delete player (Admin)

### Teams & Standings
- `GET /api/teams` - Get all teams with squad details
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team (Admin)
- `PUT /api/teams/:id` - Update team (Admin)
- `GET /api/teams/leaderboard/points` - Calculated dynamic leaderboard

### Auction & Bids
- `GET /api/auction/state` - Fetch current live state
- `POST /api/auction/seed` - Re-seed default database
- `POST /api/auction/reset` - Reset auction & refund budgets
- `GET /api/auction/bids` - Transaction history
- `GET /api/auction/analytics` - Market volume, top buys, and position spend

---

## 🔄 WebSocket Events (Socket.io)

### Client ➔ Server
- `bid:place` - `{ teamId, amount, userId }`
- `auction:start` - `{ playerId? }`
- `auction:pause` - Pause live timer
- `auction:resume` - Resume live timer
- `auction:hammer_sell` - Auctioneer manual hammer ("SOLD!")
- `auction:pass` - Auctioneer marks player "UNSOLD"
- `auction:set_player` - `{ playerId }` Queue specific player
- `auction:next_player` - Advance to next upcoming player

### Server ➔ Client
- `auction:state_update` - Full synchronized auction session object
- `timer:tick` - `{ seconds, initialTimer }`
- `bid:success` - `{ bid, team, amount, state }`
- `auction:sold` - `{ player, team, amount, state }` (triggers confetti)
- `auction:unsold` - `{ player, state }`
- `auction:notification` - Live toast message
- `bid:error` / `auction:error` - Error toast
