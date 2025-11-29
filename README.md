# ALTFOLIO

A portfolio tracking tool for alternative investments.

## Run Locally

**Prerequisites:**

- Node.js >= 24.0.0
- npm >= 10.0.0
- MongoDB (optional, for database features)

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   - `PORT` - Server port (default: 5000)
   - `MONGO_URI` - MongoDB connection string
   - `VITE_API_URL` - API URL for client (default: http://localhost:5000)

3. **Run the app:**
   ```bash
   npm run dev
   ```
   This starts both the client (http://localhost:3000) and server (http://localhost:5000)

### Available Scripts

- `npm run dev` - Run both client and server in development mode
- `npm run dev:client` - Run only the client (Vite dev server)
- `npm run dev:server` - Run only the server (Express with tsx)
- `npm run build` - Build both client and server for production
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only
- `npm start` - Start production server

### Project Structure

```
altfolio/
├── client/          # Frontend React application
│   ├── components/  # React components
│   ├── lib/         # Utility functions
│   ├── index.tsx    # Entry point
│   └── vite.config.ts
├── server/          # Backend Express application
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes (prefixed with /api/v1)
│   └── server.ts    # Express server
├── shared/          # Shared code between client and server
│   ├── types.ts     # TypeScript types
│   └── constants.ts # Shared constants
└── .env             # Environment variables
```
