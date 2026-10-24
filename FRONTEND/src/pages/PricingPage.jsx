import React from 'react'
import { motion } from 'framer-motion'
import PricingSection from '../components/PricingSection'

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#020817] dark:via-blue-950 dark:to-[#050b2e] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Simple, tiered pricing</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Start free, upgrade whenever you need more links, deeper analytics, or priority support.
          </p>
        </motion.div>

        <PricingSection />
      </div>
    </div>
  )
}

export default PricingPage
