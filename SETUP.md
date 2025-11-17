# Numble - Real-Time Multiplayer Number Guessing Game

A production-ready MERN stack game where players compete to guess each other's secret numbers in real-time.

## Architecture

**Full MERN Stack with Socket.IO**

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Zustand
- **Backend**: Node.js + Express + Socket.IO + TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: Three-tier system (Guest, Persistent Account, Upgrade Path)

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (for database)
- MongoDB URI connection string

## Setup Instructions

### 1. Database Setup

1. Create a MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and get your connection string
3. Format: `mongodb+srv://username:password@cluster.mongodb.net/numble?retryWrites=true&w=majority`

### 2. Backend Configuration

Create `/server/.env` file:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/numble?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Configuration

File `.env` is already configured for local development:

```
VITE_API_URL=http://localhost:5000
```

For production, update to your backend URL.

### 4. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 5. Run Development Servers

```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:5000) concurrently.

## Features

### Authentication System

**Three Login Options:**

1. **Guest Login** - Play anonymously with just a username
2. **Create Account** - Persistent account with email/password
3. **Upgrade Path** - Convert guest account to persistent account

### Game Modes

1. **Classic Mode** - 4-digit number, unlimited guesses
2. **Speed Mode** - 4-digit number, 30 seconds per turn
3. **Deception Mode** - Players allocate false hints to confuse opponent
4. **Ultimate Numble** - 6-digit number, instant loss on wrong guess

### Real-Time Features

- Live multiplayer gameplay via Socket.IO
- Real-time guess feedback with colored tiles
- Turn-based alternating gameplay
- Automatic score tracking
- Player statistics and leaderboards

### UI/UX Design

- Black and white color scheme with green/yellow/gray feedback colors
- Responsive design (mobile, tablet, desktop)
- Numeric keypad for digit input
- Guess history with visual feedback
- Game status indicators
- Room code sharing with copy-to-clipboard

## API Routes

### Authentication Routes

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/guest-login` - Guest login
- `POST /api/auth/upgrade-guest` - Upgrade guest to account
- `POST /api/auth/verify-token` - Verify authentication

### Stats Routes

- `GET /api/stats/player/:userId` - Get player stats
- `GET /api/stats/leaderboard` - Get global leaderboard
- `GET /api/stats/history/:userId` - Get game history
- `GET /api/stats/me` - Get authenticated user stats

## Socket.IO Events

### Client → Server

- `authenticate` - Authenticate socket connection
- `create-room` - Create new game room
- `join-room` - Join existing game room
- `submit-secret` - Submit secret number
- `submit-guess` - Submit guess and get feedback

### Server → Client

- `room-updated` - Room state updated
- `game-started` - Game began (all players ready)
- `guess-received` - Feedback on guess attempt

## File Structure

```
project/
├── src/                          # Frontend
│   ├── components/
│   │   └── Game/
│   │       ├── NumericKeypad.tsx
│   │       ├── FeedbackTiles.tsx
│   │       └── GuessHistory.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── GuestLoginPage.tsx
│   │   ├── GameMenuPage.tsx
│   │   ├── GamePage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── JoinRoomPage.tsx
│   │   └── UpgradeGuestPage.tsx
│   ├── services/
│   │   ├── api.ts                # REST API client
│   │   └── socket.ts             # Socket.IO client
│   ├── store/
│   │   ├── authStore.ts          # Auth state management
│   │   └── gameStore.ts          # Game state management
│   └── App.tsx                   # Main app with routing
└── server/                       # Backend
    ├── src/
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Game.ts
    │   │   └── Session.ts
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   └── stats.ts
    │   ├── middleware/
    │   │   └── auth.ts
    │   ├── socket/
    │   │   └── gameEvents.ts
    │   ├── utils/
    │   │   ├── gameLogic.ts
    │   │   └── auth.ts
    │   ├── types/
    │   │   └── index.ts
    │   └── server.ts
    └── package.json
```

## Development Workflow

### Frontend Development

1. Modify files in `src/`
2. Vite hot-reloads automatically
3. Check browser at http://localhost:5173

### Backend Development

1. Modify files in `server/src/`
2. tsx watch automatically restarts server
3. Socket connections reconnect automatically

### Database Queries

Use MongoDB Compass or Atlas web UI to inspect documents in the `numble` database.

## Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `MONGODB_URI`
   - `PORT`
   - `NODE_ENV=production`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL` (your backend URL)
4. Deploy

## Testing

### Local Testing

1. Start both servers: `npm run dev`
2. Open two browser windows to http://localhost:5173
3. Create room in one, join in the other
4. Play a test game

### Production URLs

Update after deployment:
- Frontend: Your Vercel URL
- Backend: Your Railway/Render URL
- `.env` files in both services

## Security Considerations

- JWT tokens expire in 30 days
- Guest sessions expire in 7 days
- Secret numbers encrypted with base64
- Rate limiting on API endpoints
- CORS configured for frontend domain
- Password hashing with bcryptjs

## Performance Optimizations

- Zustand for efficient state management
- Socket.IO reconnection handling
- Optimistic UI updates
- Code splitting with React Router
- MongoDB indexes on frequently queried fields
- Connection pooling for database

## Troubleshooting

### Socket Connection Failed

- Check backend is running on port 5000
- Verify `FRONTEND_URL` in server/.env
- Check browser console for CORS errors

### Authentication Errors

- Clear browser localStorage
- Verify JWT_SECRET is set
- Check token expiration

### Database Connection Failed

- Verify MongoDB URI is correct
- Check database user permissions
- Ensure IP is whitelisted in MongoDB Atlas

## Next Steps

1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development
5. Visit http://localhost:5173 in your browser
6. Create account and start playing!

## License

MIT
