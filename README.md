# Tic Tac Game AI

Futuristic Tic Tac Toe with animated UI and an unbeatable built-in AI opponent (Minimax). Built with Next.js App Router, Tailwind CSS, and Framer Motion. Optionally supports Three.js (react-three-fiber) for future 3D effects.

## Features
- 3x3 board with standard rules (one cell per move)
- Animated pieces and modal using Framer Motion
- Win/draw detection
- Unbeatable local AI at `/api/move` using Minimax (no external API keys required)
- Tailwind styling with neon glow aesthetic
- Responsive and mobile-friendly

## Tech
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Optional: three, @react-three/fiber

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 3) Deploy to Vercel
- Push this repo to GitHub/GitLab
- Import the project into Vercel
- Deploy. The API will be available at `/api/move` and the app will run on Vercel serverless automatically.

## Project Structure
- `app/page.tsx` – Main game page and UI
- `components/Board.tsx` – Board rendering & click handling
- `lib/game.ts` – Game logic (validation, win/draw, Minimax AI)
- `app/api/move/route.ts` – Serverless route returning the AI move
- `tailwind.config.ts`, `postcss.config.js`, `app/globals.css` – Tailwind setup

## Game Rules
- Players alternate placing their mark (X or O) into a single empty cell on a 3x3 grid.
- First to get three in a row (row, column, or diagonal) wins.
- If all cells are filled without a winner, it’s a draw.

## Extending
- Add 3D board visuals using `three` and `@react-three/fiber`
- Enhance AI strategy in `app/api/move/route.ts` or create a more advanced heuristic in `lib/game.ts`
