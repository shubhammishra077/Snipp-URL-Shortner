import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#a855f7']

const BreakdownChart = ({ title, data = [] }) => {
  const hasData = data.some((d) => d.count > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      {hasData ? (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-14 text-center">No data yet</p>
      )}
    </motion.div>
  )
}

export default BreakdownChart
