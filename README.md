# 10K Challenge - TikTok Follower Race

A clean, minimalist website to track your TikTok 10K follower challenge with friends. See who reaches 10,000 followers first!

![10K Challenge](https://img.shields.io/badge/Goal-10K%20Followers-ff2c55?style=for-the-badge)

## Features

- **Live Leaderboard** - See rankings based on follower count
- **Progress Tracking** - Visual progress bars showing distance to 10K
- **Stats Overview** - Total followers, likes, and videos across all participants
- **Admin Panel** - Easy interface to update stats manually
- **Responsive Design** - Works beautifully on desktop and mobile
- **Dark Theme** - Modern, TikTok-inspired aesthetic

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Viewing the Leaderboard

Visit the homepage (`/`) to see the current standings. The leaderboard shows:

- Participant rankings (sorted by followers)
- Follower count with progress to 10K
- Total likes received
- Number of videos posted

### Managing Participants

Visit `/admin` to:

- **Add new participants** - Click "Add Participant" and enter name, username, and pick a color
- **Update stats** - Edit followers, likes, and video counts directly
- **Remove participants** - Click "Remove" to delete someone from the challenge

### Customizing the Challenge

Edit `src/data/participants.json` to:

- Change the goal (default: 10,000 followers)
- Update the challenge start date
- Modify participant data directly

```json
{
  "goal": 10000,
  "challengeStartDate": "2026-01-24",
  "participants": [...]
}
```

## Project Structure

```
10k-challenge/
├── src/
│   ├── app/
│   │   ├── page.js          # Main leaderboard page
│   │   ├── layout.js        # Root layout
│   │   ├── globals.css      # Global styles
│   │   ├── admin/
│   │   │   └── page.js      # Admin panel
│   │   └── api/
│   │       └── participants/
│   │           └── route.js # API for CRUD operations
│   ├── components/
│   │   ├── Header.js        # Hero header with leader highlight
│   │   ├── Leaderboard.js   # Rankings table
│   │   └── StatsGrid.js     # Stats overview cards
│   └── data/
│       └── participants.json # Participant data
├── package.json
├── tailwind.config.js
└── README.md
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Deploy with one click

**Note:** For production, consider using a database instead of JSON file storage.

### Build for Production

```bash
npm run build
npm start
```

## API Reference

### GET `/api/participants`
Returns all participants and challenge settings.

### PUT `/api/participants`
Update a participant's stats.
```json
{
  "participantId": "1",
  "followers": 5000,
  "likes": 50000,
  "videos": 30
}
```

### POST `/api/participants`
Add a new participant.
```json
{
  "name": "NewUser",
  "username": "newuser_tiktok",
  "color": "#FF6B6B"
}
```

### DELETE `/api/participants?id=1`
Remove a participant by ID.

## Future Improvements

- [ ] Auto-fetch TikTok stats via unofficial API
- [ ] Historical data tracking with charts
- [ ] Notifications when someone takes the lead
- [ ] Authentication for admin panel
- [ ] Database integration (PostgreSQL/MongoDB)

## License

MIT

---

Good luck with your 10K challenge! May the best creator win! 🎉
