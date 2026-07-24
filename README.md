# CareerCoach
Real time interview application to allow users to practice interview skills in a real-time environment.

## Project structure

- `Back-End/` - Express backend, Postgres database connection, authentication, WebSocket interview flow, Ollama/Gemma4/Deepgram integration.
- `Front-End/` - React + TypeScript + Vite frontend.

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Ollama installed and running if using the local model setup
- Required API keys set in `Back-End/.env` and `Front-End/.env`

## Backend setup

1. Open a terminal and install backend dependencies:
   ```bash
   cd Back-End
   npm install
   ```

2. Create the PostgreSQL database used by the backend:
   ```bash
   createdb <database name based on your setup>
   ```
   if you have issues with this step, make sure to add PostGreSQL/<version>/bin to your PATH environment variable. Additionally, make sure to update your env file with your postgres password (PASSWORD=)

3. Run the database schema SQL to create tables:
   ```bash
   psql -d <database name> -f queries.sql
   ```

4. Review and update `Back-End/.env` with your values. Example values are:
   ```env
   PORT=3000
   WEBSOCKET_PORT=8080
   PASSWORD=postgres
   ACCESS_TOKEN_SECRET=dev-access-token-secret-change-me
   REFRESH_TOKEN_SECRET=dev-refresh-token-secret-change-me
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=gemma4:12b
   DEEPGRAM_APIKEY=
   NODE_ENV=development
   ```

5. Start the backend:
   - If you want the app to start Ollama locally and run the backend together:
     ```bash
     npm run dev
     ```
   - If Ollama is already running separately, start only the backend:
     ```bash
     npm start
     ```
   Make sure to run ```ollama pull gemma4:12b``` in cmd prompt prior to running so that it can use Gemma.

## Frontend setup

1. Open a terminal and install frontend dependencies:
   ```bash
   cd Front-End
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser at the Vite URL, typically:
   ```
   http://localhost:3000
   ```

## Notes

- The backend listens on `PORT` (default `3000`) and WebSocket traffic on `WEBSOCKET_PORT` (default `8080`).
- The frontend uses `VITE_REACT_APP_API_URL=http://localhost:3000` from `Front-End/.env`.
- If using the local Ollama host, make sure `OLLAMA_HOST` points to the correct Ollama server address.
- If you need to reset the database, drop and recreate `database name` before rerunning `queries.sql`.
