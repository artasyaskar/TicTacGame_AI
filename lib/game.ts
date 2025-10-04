export type Mark = 'X' | 'O' | '✓'
export type Cell = Mark | null
export type Board = Cell[] // length 9
export type Difficulty = 'easy' | 'medium' | 'hard'

export const EMPTY_BOARD: Board = Array(9).fill(null)

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function isValidMove(board: Board, i: number): boolean {
  if (i < 0 || i > 8) return false
  return board[i] === null
}

export function applyMove(board: Board, i: number, mark: Mark): Board {
  if (!isValidMove(board, i)) throw new Error('Illegal move')
  const next = board.slice()
  next[i] = mark
  return next
}

export function getWinner(board: Board): Mark | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}

export function isDraw(board: Board): boolean {
  return !getWinner(board) && board.every((c) => c !== null)
}

export function availableMoves(board: Board): number[] {
  const moves: number[] = []
  for (let i = 0; i < 9; i++) if (board[i] === null) moves.push(i)
  return moves
}

export function formatBoard(board: Board): string {
  const s = board.map((c) => c ?? '.').join('')
  return `${s.slice(0,3)}\n${s.slice(3,6)}\n${s.slice(6,9)}`
}

export function tryWinOrBlock(board: Board, me: Mark, opp: Mark): number | null {
  // Heuristic: if any move lets me win, take it. Else if any move prevents opp win, take it. Else null.
  for (const i of availableMoves(board)) {
    const nb = applyMove(board, i, me)
    if (getWinner(nb) === me) return i
  }
  for (const i of availableMoves(board)) {
    const nb = applyMove(board, i, opp)
    if (getWinner(nb) === opp) return i
  }
  return null
}

function evaluateTerminal(board: Board, me: Mark, opp: Mark, depth: number): number | null {
  const w = getWinner(board)
  if (w === me) return 10 - depth // prefer quicker wins
  if (w === opp) return depth - 10 // prefer delaying losses
  if (isDraw(board)) return 0
  return null
}

function minimax(board: Board, me: Mark, opp: Mark, turn: Mark, depth: number, alpha: number, beta: number): { score: number; move: number | null } {
  const terminal = evaluateTerminal(board, me, opp, depth)
  if (terminal !== null) return { score: terminal, move: null }

  let bestMove: number | null = null
  if (turn === me) {
    // Maximizing player
    let bestScore = -Infinity
    for (const i of availableMoves(board)) {
      const nb = applyMove(board, i, turn)
      const { score } = minimax(nb, me, opp, opp, depth + 1, alpha, beta)
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return { score: bestScore, move: bestMove }
  } else {
    // Minimizing opponent
    let bestScore = Infinity
    for (const i of availableMoves(board)) {
      const nb = applyMove(board, i, turn)
      const { score } = minimax(nb, me, opp, me, depth + 1, alpha, beta)
      if (score < bestScore) {
        bestScore = score
        bestMove = i
      }
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return { score: bestScore, move: bestMove }
  }
}

export function bestAIMove(board: Board, me: Mark, opp: Mark): number {
  // First, try quick tactical win/block using provided opponent mark
  const tactical = tryWinOrBlock(board, me, opp)
  if (tactical !== null) return tactical
  const { move } = minimax(board, me, opp, me, 0, -Infinity, Infinity)
  // Fallback: pick first available (shouldn't happen)
  return move ?? availableMoves(board)[0]
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDumbMove(moves: number[]): number {
  // Prefer edges (1,3,5,7) which are usually weaker than center/corners
  const edges = moves.filter((m) => m === 1 || m === 3 || m === 5 || m === 7)
  if (edges.length) return randomFrom(edges)
  return randomFrom(moves)
}

export function chooseAIMove(board: Board, me: Mark, opp: Mark, difficulty: Difficulty): number {
  const moves = availableMoves(board)
  if (moves.length === 0) return 0

  if (difficulty === 'hard') {
    // Always optimal
    return bestAIMove(board, me, opp)
  }

  if (difficulty === 'medium') {
    // Take immediate win if available
    const winNow = tryWinOrBlock(board, me, opp)
    if (winNow !== null) return winNow
    // Mostly strong, sometimes random
    if (Math.random() < 0.75) return bestAIMove(board, me, opp)
    return randomFrom(moves)
  }

  // EASY: often blunders; only sometimes takes optimal or immediate win
  // 20%: take immediate win if available
  const winChance = 0.2
  const bestChance = 0.2 // chance to fall back to full optimal
  const winNow = tryWinOrBlock(board, me, opp)
  if (winNow !== null && Math.random() < winChance) return winNow
  if (Math.random() < bestChance) return bestAIMove(board, me, opp)
  return pickDumbMove(moves)
}
