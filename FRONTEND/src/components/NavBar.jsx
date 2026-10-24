import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { logoutUser } from '../api/user.api';
import { logout } from '../store/slice/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore - we still clear local auth state below
    }
    dispatch(logout());
    navigate({ to: '/' });
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-blue-950/70 border-b border-slate-200/60 dark:border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">
              🔗
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400">
              Snipp
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Pricing
            </Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400">
                  {user?.name}
                </span>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to="/auth"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
