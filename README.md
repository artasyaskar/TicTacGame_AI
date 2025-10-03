# Tic Tac Game AI

Futuristic Tic Tac Toe with animated UI and a Gemini-powered AI opponent. Built with Next.js App Router, Tailwind CSS, and Framer Motion. Optionally supports Three.js (react-three-fiber) for future 3D effects.

## Features
- 3x3 board with standard rules (one cell per move)
- Animated pieces and modal using Framer Motion
- Win/draw detection
- Backend AI at `/api/move` that calls Google Gemini using `GEMINI_API_KEY`
- Tailwind styling with neon glow aesthetic
- Responsive and mobile-friendly

## Tech
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- @google/generative-ai
- Optional: three, @react-three/fiber

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Set up environment variable
Create `.env.local` in the project root:
```bash
GEMINI_API_KEY=your_api_key_here
```
Never commit your real key. In Vercel, set this as a project Environment Variable named `GEMINI_API_KEY`.

### 3) Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 4) Deploy to Vercel
- Push this repo to GitHub/GitLab
- Import the project into Vercel
- In Vercel Project Settings → Environment Variables, add `GEMINI_API_KEY`
- Deploy. The API will be available at `/api/move` and the app will run on Vercel edge/serverless automatically.

## Project Structure
- `app/page.tsx` – Main game page and UI
- `components/Board.tsx` – Board rendering & click handling
- `lib/game.ts` – Game logic (auto-cross, validation, win/draw)
- `app/api/move/route.ts` – Serverless route calling Gemini and validating the move
- `tailwind.config.ts`, `postcss.config.js`, `app/globals.css` – Tailwind setup

## Security Notes
- The Gemini API key is never exposed to the client; the frontend calls `/api/move` only
- Store your key as `GEMINI_API_KEY` locally in `.env.local` and in Vercel environment variables

## Game Rules
- Players alternate placing their mark (X or O) into a single empty cell on a 3x3 grid.
- First to get three in a row (row, column, or diagonal) wins.
- If all cells are filled without a winner, it’s a draw.

## Extending
- Add 3D board visuals using `three` and `@react-three/fiber`
- Enhance AI strategy in `app/api/move/route.ts` or create a more advanced heuristic in `lib/game.ts`
