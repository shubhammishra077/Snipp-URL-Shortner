import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

const AuthPage = () => {
  const [login, setLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#020817] dark:via-blue-950 dark:to-[#050b2e] flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-400/20 dark:bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={login ? 'login' : 'register'}
          initial={{ opacity: 0, x: login ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: login ? 20 : -20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md"
        >
          {login ? <LoginForm state={setLogin} /> : <RegisterForm state={setLogin} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AuthPage
