import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (localStorage.getItem('userInfo')) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (from !== '/') {
                navigate(from, { replace: true });
            } else {
                navigate(userInfo.role === 'admin' ? '/admin' : '/');
            }
        }
    }, [navigate, from]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (from !== '/') {
                navigate(from, { replace: true });
            } else if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await api.post('/api/auth/google', {
                credential: credentialResponse.credential,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (from !== '/') {
                navigate(from, { replace: true });
            } else if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Google Sign-In Error:', err);
            setError(err.response?.data?.error || 'Failed to sign in with Google');
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Animated mesh background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh dark:bg-gradient-mesh-dark" />
                <div className="blob-1 -top-32 -left-32 blob-animated opacity-60" />
                <div className="blob-2 -bottom-32 -right-32 blob-animated-reverse opacity-40" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-200/15 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="glass-card p-6 sm:p-10 md:p-12">
                    <div className="text-center mb-8 sm:mb-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                            className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-rose-500/25"
                        >
                            <Sparkles className="text-white" size={28} />
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome back.</h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base mt-2">Sign in to manage your orders and favorites.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2 border border-red-100 dark:border-red-500/20"
                        >
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-5 sm:space-y-6">
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="premium-input !pl-12"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="premium-input !pl-12"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            className="w-full premium-btn btn-primary py-3.5 sm:py-4 text-base flex items-center justify-center gap-2 group shimmer-btn disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </motion.button>

                        <div className="relative py-3 sm:py-4 flex items-center">
                            <div className="flex-grow border-t border-rose-100/60 dark:border-white/10" />
                            <span className="flex-shrink mx-4 text-xs font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-rose-100/60 dark:border-white/10" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="pill"
                                width="350"
                            />
                        </div>
                    </form>

                    <div className="mt-8 sm:mt-10 text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">
                            Don't have an ID?{' '}
                            <Link to="/register" className="text-rose-500 font-bold hover:underline hover:text-rose-600">
                                Create one now.
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 dark:text-gray-600 px-6 leading-relaxed">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
