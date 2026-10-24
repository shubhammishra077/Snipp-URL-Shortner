import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginUser } from '../api/user.api';
import { useDispatch } from 'react-redux';
import { login } from '../store/slice/authSlice.js';
import { useNavigate, Link } from '@tanstack/react-router';
import GoogleSignInButton from './GoogleSignInButton';
import FacebookSignInButton from './FacebookSignInButton';

const LoginForm = ({ state }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(password, email);
            dispatch(login(data.user))
            navigate({ to: "/dashboard" })
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl px-8 pt-8 pb-8 border border-slate-200/60 dark:border-white/10">
            <div className="text-center mb-6">
                <span className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 items-center justify-center text-white text-xl mb-3">🔗</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to manage your links</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4 space-y-2">
                <GoogleSignInButton onError={setError} />
                <FacebookSignInButton onError={setError} />
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="email">
                    Email
                </label>
                <input
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="password">
                        Password
                    </label>
                    <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <input
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                type="submit"
                disabled={loading}
            >
                {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>

            <div className="text-center mt-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <span onClick={() => state(false)} className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Register
                    </span>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
