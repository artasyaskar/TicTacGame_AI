"use client"
import { motion } from 'framer-motion'
import React from 'react'
import type { Board, Mark } from '@/lib/game'

export type BoardProps = {
  board: Board
  onCellClick: (i: number) => void
  disabled?: boolean
}

const CellMark: React.FC<{ mark: Mark | null }> = ({ mark }) => {
  if (!mark) return null
  return (
    <motion.span
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`text-4xl md:text-5xl font-extrabold ${
        mark === 'X' ? 'text-neon-blue' : 'text-neon-pink'
      } drop-shadow-[0_0_16px_rgba(0,229,255,0.6)]`}
    >
      {mark}
    </motion.span>
  )
}

export const BoardGrid: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 container-frost w-full max-w-sm sm:max-w-md mx-auto">
      {board.map((cell, i) => (
        <motion.button
          whileTap={{ scale: 0.96 }}
          key={i}
          disabled={disabled || cell !== null}
          onClick={() => onCellClick(i)}
          className="cell aspect-square touch-manipulation min-h-[72px] sm:min-h-[88px]"
        >
          <div className="glow-ring" />
          <CellMark mark={cell} />
        </motion.button>
      ))}
    </div>
  )
}

export default BoardGrid
