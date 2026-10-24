import React from 'react'
import { motion } from 'framer-motion'

const gradients = {
  indigo: 'from-indigo-500 to-blue-500',
  fuchsia: 'from-fuchsia-500 to-pink-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
}

const StatCard = ({ label, value, icon, color = 'indigo', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30"
    >
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradients[color]} opacity-20 blur-2xl transition-opacity duration-300`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-lg text-white shadow-lg transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
