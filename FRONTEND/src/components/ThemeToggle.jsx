import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toggleTheme } from '../store/slice/themeSlice'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.theme.mode)
  const isDark = mode === 'dark'

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle dark mode"
      className="relative w-14 h-8 rounded-full flex items-center px-1 bg-slate-200 dark:bg-blue-800/70 border border-slate-300/60 dark:border-blue-700 transition-colors duration-300"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full bg-white dark:bg-blue-950 shadow flex items-center justify-center text-sm"
        style={{ marginLeft: isDark ? '1.5rem' : '0rem' }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </button>
  )
}

export default ThemeToggle
