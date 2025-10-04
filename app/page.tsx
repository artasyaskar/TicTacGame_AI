"use client"
import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Board from '@/components/Board'
import { Board as TBoard, EMPTY_BOARD, Mark, applyMove, getWinner, isDraw } from '@/lib/game'

export default function HomePage() {
  const [board, setBoard] = useState<TBoard>(EMPTY_BOARD)
  // Allow user to select symbols
  const [playerMark, setPlayerMark] = useState<Mark>('X')
  const [aiMark, setAiMark] = useState<Mark>('O')
  const [turn, setTurn] = useState<Mark>('X') // current turn mark
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<null | { winner: Mark | null; draw: boolean }>(null)
  const [showSignature, setShowSignature] = useState(false)

  const statusText = useMemo(() => {
    if (result?.draw) return 'Draw!'
    if (result?.winner) return `${result.winner} wins!`
    return turn === playerMark ? 'Your turn' : 'AI is thinking...'
  }, [turn, result, playerMark])

  const checkEnd = useCallback((b: TBoard) => {
    const w = getWinner(b)
    if (w) return { winner: w, draw: false }
    if (isDraw(b)) return { winner: null, draw: true }
    return null
  }, [])

  const reset = useCallback(() => {
    setBoard(EMPTY_BOARD)
    setTurn(playerMark)
    setBusy(false)
    setResult(null)
  }, [playerMark])

  const onChangePlayerMark = useCallback((m: Mark) => {
    // Prevent same marks; if conflict, swap the AI's mark to a different one
    const all: Mark[] = ['X', 'O', '✓']
    if (m === aiMark) {
      const newAi = all.find((x) => x !== m) || 'O'
      setAiMark(newAi)
    }
    setPlayerMark(m)
    // reset game when changing marks
    setBoard(EMPTY_BOARD)
    setTurn(m)
    setResult(null)
  }, [aiMark])

  const onChangeAiMark = useCallback((m: Mark) => {
    const all: Mark[] = ['X', 'O', '✓']
    if (m === playerMark) {
      const newPlayer = all.find((x) => x !== m) || 'X'
      setPlayerMark(newPlayer)
      setTurn(newPlayer)
    }
    setAiMark(m)
    setBoard(EMPTY_BOARD)
    setResult(null)
  }, [playerMark])

  const handlePlayerMove = useCallback(async (i: number) => {
    if (turn !== playerMark || busy || result) return
    try {
      const nb = applyMove(board, i, playerMark)
      setBoard(nb)
      const r = checkEnd(nb)
      if (r) {
        setResult(r)
        return
      }
      setTurn(aiMark)
      setBusy(true)
      // Ask server for AI move
      const res = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: nb, aiMark, playerMark }),
      })
      if (!res.ok) throw new Error('AI request failed')
      const data = await res.json()
      if (typeof data.move !== 'number') throw new Error('Invalid AI response')
      const nb2 = applyMove(nb, data.move, aiMark)
      setBoard(nb2)
      const r2 = checkEnd(nb2)
      if (r2) {
        setResult(r2)
      } else {
        setTurn(playerMark)
      }
    } catch (e) {
      console.error(e)
      // In case of any failure, return turn to player
      setTurn(playerMark)
    } finally {
      setBusy(false)
    }
  }, [board, turn, busy, result, checkEnd, playerMark, aiMark])

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {/* Fixed AY badge at top-right */}
      <div className="fixed right-4 top-4 z-50">
        <div className="relative">
          <button
            type="button"
            aria-label="About"
            onMouseEnter={() => setShowSignature(true)}
            onMouseLeave={() => setShowSignature(false)}
            onClick={() => setShowSignature((v) => !v)}
            className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-neon hover:opacity-90 transition"
          >
            AY
          </button>
          <AnimatePresence>
            {showSignature && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 whitespace-nowrap container-frost px-3 py-2 text-xs"
              >
                Built By <span className="font-semibold">ARTAS YASKAR</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tic Tac Game</h1>
          <p className="text-white/70">A futuristic take on Tic Tac Toe with auto-cross moves and a smart AI opponent.</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-white/80">{statusText}</span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex text-xs text-white/60 mr-1">You:</div>
            <select
              aria-label="Player mark"
              className="px-2 py-1 rounded-lg bg-panel/80 border border-white/10 outline-none min-w-[56px]"
              value={playerMark}
              onChange={(e) => onChangePlayerMark(e.target.value as Mark)}
            >
              <option value="X">X</option>
              <option value="O">O</option>
              <option value="✓">✓</option>
            </select>
            <div className="flex text-xs text-white/60 ml-2 mr-1">AI:</div>
            <select
              aria-label="AI mark"
              className="px-2 py-1 rounded-lg bg-panel/80 border border-white/10 outline-none min-w-[56px]"
              value={aiMark}
              onChange={(e) => onChangeAiMark(e.target.value as Mark)}
            >
              <option value="X">X</option>
              <option value="O">O</option>
              <option value="✓">✓</option>
            </select>
            <button className="btn-primary" onClick={reset}>Restart</button>
          </div>
        </div>

        <Board board={board} onCellClick={handlePlayerMove} disabled={busy || !!result} />

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="container-frost p-6 w-full max-w-sm text-center space-y-4"
              >
                <h2 className="text-2xl font-bold">
                  {result.draw
                    ? "It's a draw... for now 😏"
                    : result.winner === playerMark
                      ? 'You win! 🎉'
                      : 'AI wins 😈'}
                </h2>
                <p className="text-white/70">
                  {result.draw
                    ? 'Balance restored. Rematch and break the tie?'
                    : result.winner === playerMark
                      ? 'Enjoy it while it lasts — next round the AI will try to ruin your brain 🤖🧠'
                      : 'Prove you are not a loser. One more round to redeem yourself? 💥'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="btn-primary" onClick={reset}>Play Again</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center text-xs text-white/50 pt-2">
          Rules: Players alternate placing a mark in one empty cell. First to 3 in a row wins.
        </footer>
      </div>
    </main>
  )
}
