import React from 'react'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import UrlForm from '../components/UrlForm'

const FEATURES = [
  {
    icon: '🔗',
    title: 'URL Shortener',
    desc: 'Create clean, branded short links for every campaign, with custom slugs that are yours to claim.',
  },
  {
    icon: '⬜',
    title: 'QR Codes',
    desc: 'Every link comes with a QR code you can style, download, and share anywhere — print, packaging, or screen.',
  },
  {
    icon: '📈',
    title: 'Analytics',
    desc: 'See total & unique clicks, browser, device, OS, and location breakdowns — daily, weekly, and monthly.',
  },
]

const TRUST = [
  { icon: '🔒', title: 'Password-protected links', desc: 'Lock any link behind a password only you share.' },
  { icon: '🛡️', title: 'SSRF-safe by design', desc: 'Every URL is validated before it can ever be shortened.' },
  { icon: '🕵️', title: 'Privacy-first analytics', desc: "We hash visitor IPs — we never store them in the clear." },
  { icon: '⚡', title: 'Rate-limited & abuse-resistant', desc: 'Built to stay fast and reliable under real traffic.' },
]

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#020817] dark:via-blue-950 dark:to-[#050b2e] transition-colors">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-400/20 dark:bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full mb-4">
              Free to start · No credit card required
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight max-w-2xl">
              Shorten. Share. <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">Track.</span>
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Turn long links into short, brandable, trackable URLs — with QR codes and real analytics built in.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/60 dark:border-white/10 w-full max-w-md mt-10"
          >
            <UrlForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/auth"
              className="inline-block mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in to unlock custom links, QR styling & analytics →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10"
        >
          Everything a link needs
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-xl text-white mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust / security section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-2">Built with security in mind</h2>
          <p className="text-indigo-100 mb-8 max-w-lg">
            This isn't just a link shortener — it's built to protect your links and your visitors, from day one.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map((t) => (
              <div key={t.title}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <h4 className="font-semibold mb-1">{t.title}</h4>
                <p className="text-sm text-indigo-100/90">{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Create a free account to claim custom links, style your QR codes, and see who's clicking.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage
