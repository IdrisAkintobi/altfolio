# Altfolio

A modern portfolio tracking tool for alternative investments built with React, TypeScript, Express, and MongoDB.

## Features

- 📊 **Portfolio Dashboard** - Real-time investment tracking with performance charts
- 💼 **Asset Management** - Track various asset types (Crypto, Real Estate, Commodities, etc.)
- 🔐 **Role-Based Access** - Admin and Viewer roles with granular permissions
- 📈 **Performance Tracking** - Automatic calculation of investment gains/losses
- 🎨 **Modern UI** - Responsive dark theme with Tailwind CSS
- 🔍 **Advanced Filtering** - Search, filter, and paginate through data
- 🔒 **Secure Authentication** - JWT-based auth with Argon2 password hashing
- 📝 **Audit Logging** - Comprehensive logging with Pino
- ⚡ **Optimized Performance** - TanStack Query for efficient data fetching

## Tech Stack

**Frontend:** React 19, TypeScript, TanStack Query, React Router, Tailwind CSS, Recharts  
**Backend:** Node.js, Express 5, TypeScript, MongoDB, Mongoose  
**Dev Tools:** Vite, ESLint, Prettier, Husky, lint-staged

## Quick Start

### Prerequisites

- Node.js >= 24
- npm >= 10
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Seed database with sample data
npm run seed

# Start development servers
npm run dev
```

**Access:**

- Client: http://localhost:3000
- Server: http://localhost:5000

The seed command creates an admin user and sample data. Check the console output for login credentials.

### Available Scripts

```bash
npm run dev          # Run client + server concurrently
npm run dev:client   # Run client only
npm run dev:server   # Run server only
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database (30 users, 100 assets, 500 investments)
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format code with Prettier
```

## Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# Seed the database
docker-compose exec app npm run seed
```

Access at http://localhost:5000

## API Documentation

Base URL: `/api/v1`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Assets (Admin only for write operations)

- `GET /assets` - List all assets (supports pagination, search, filtering)
- `POST /assets` - Create new asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### Investments

- `GET /investments` - List investments (users see own, admins see all)
- `POST /investments` - Create investment
- `DELETE /investments/:id` - Delete investment (admin only)

### Users (Admin only)

- `GET /users` - List all users

All endpoints support pagination: `?page=1&limit=10`

## Project Structure

```
altfolio/
├── client/              # React frontend
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   └── services/        # API services
├── server/              # Express backend
│   ├── config/          # Configuration
│   ├── db/              # Database models & repositories
│   ├── middleware/      # Express middleware
│   ├── modules/         # Feature modules (auth, assets, investments)
│   └── utils/           # Utilities (logger, error handling)
└── shared/              # Shared types and constants
```

## Development

### Code Quality

Pre-commit hooks automatically run:

- Lint-staged (ESLint + Prettier on staged files)

Pre-push hooks run:

- Full lint check
- Tests
- Build verification

### Environment Variables

See `.env.example` for required variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## License

MIT
