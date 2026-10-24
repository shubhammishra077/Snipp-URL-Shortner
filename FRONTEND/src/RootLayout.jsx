import React from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/NavBar'

const RootLayout = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default RootLayout
