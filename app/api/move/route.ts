import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { availableMoves, applyMove, formatBoard, bestAIMove, chooseAIMove, type Board, type Mark, type Difficulty } from '@/lib/game'

export async function POST(req: Request) {
  try {
    const { board, aiMark, playerMark, difficulty }: { board: Board; aiMark: Mark; playerMark: Mark; difficulty?: Difficulty } = await req.json()
    if (!Array.isArray(board) || board.length !== 9) {
      return NextResponse.json({ error: 'Invalid board' }, { status: 400 })
    }

    const validMoves = availableMoves(board)
    if (validMoves.length === 0) {
      return NextResponse.json({ move: null })
    }

    // Prefer strong local Minimax by default for best play
    // If AI_BACKEND=llm, use OpenRouter/Google LLM instead
    const backend = process.env.AI_BACKEND || 'local'
    // Prefer GEMINI_API_KEY for Google SDK
    // Support OpenRouter if key starts with 'sk-or-' or OPENROUTER_API_KEY is present
    const geminiKey = process.env.GEMINI_API_KEY || ''
    const orKey = process.env.OPENROUTER_API_KEY || (geminiKey.startsWith('sk-or-') ? geminiKey : '')
    let move: number | null = null

    if (backend !== 'llm') {
      // Use local AI with difficulty control (defaults to hard)
      const diff: Difficulty = difficulty ?? 'hard'
      move = chooseAIMove(board, aiMark, playerMark, diff)
    } else if (orKey) {
      // Use OpenRouter
      try {
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-1.5-flash-latest'
        const prompt = `You are the AI for standard Tic Tac Toe.\n\nRules: The board is 3x3. Players alternate placing their mark into ONE empty cell per turn. No additional cells are affected. The winner is three in a row (row/column/diagonal).\n\nBoard encoding: indices 0..8 left-to-right, top-to-bottom. Player symbols may be X, O, or ✓. Empty cells are '.'.\n\nCurrent board:\n${formatBoard(board)}\n\nYou play as '${aiMark}'. Opponent is '${playerMark}'.\nReturn ONLY a single integer 0-8 for your chosen empty cell. No explanation.`
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${orKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a concise Tic Tac Toe assistant. Respond with a single integer.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
          }),
        })
        if (res.ok) {
          const data = await res.json() as any
          const text: string | undefined = data?.choices?.[0]?.message?.content
          if (typeof text === 'string') {
            const m = text.match(/\b([0-8])\b/)
            if (m) {
              const parsed = parseInt(m[1], 10)
              if (validMoves.includes(parsed)) move = parsed
            }
          }
        } else {
          console.error('OpenRouter error:', await res.text())
        }
      } catch (e) {
        console.error('OpenRouter exception:', e)
      }
    } else if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        const prompt = `You are the AI for standard Tic Tac Toe.\n\nRules: The board is 3x3. Players alternate placing their mark (X or O) into ONE empty cell per turn. No additional cells are affected. The winner is three in a row (row/column/diagonal).\n\nBoard encoding: indices 0..8 left-to-right, top-to-bottom. 'X', 'O', '.' for empty.\n\nCurrent board:\n${formatBoard(board)}\n\nYou play as '${aiMark}'. Opponent is '${playerMark}'.\nReturn ONLY a single integer 0-8 for your chosen empty cell. No explanation.`
        const resp = await model.generateContent(prompt)
        const text = resp.response.text()
        const match = text.match(/\b([0-8])\b/)
        if (match) {
          const parsed = parseInt(match[1], 10)
          if (validMoves.includes(parsed)) move = parsed
        }
      } catch (e) {
        // Fall back below
        console.error('Gemini error:', e)
      }
    }

    if (move === null) {
      // Fallback: pick first valid move (simple, safe)
      move = validMoves[0]
    }

    // Final validation before returning
    try {
      applyMove(board, move, aiMark)
    } catch {
      // if somehow invalid, choose another valid move
      move = validMoves[0]
    }

    return NextResponse.json({ move })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
