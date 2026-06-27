import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, User, Lock, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { success } = useToast();

    // OTP verification state
    const [step, setStep] = useState('register'); // 'register' | 'verify'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('userInfo')) {
            navigate('/');
        }
    }, [navigate]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Step 1: Submit registration form → sends OTP
    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/api/auth/signup', { name, email, password });
            setStep('verify');
            setResendCooldown(30);
            success('Verification code sent to your email!');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP → creates user
    const verifyHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.post('/api/auth/verify-otp', { email, otp: otpString });
            localStorage.setItem('userInfo', JSON.stringify(data));
            success('Account created successfully!');
            navigate('/');
        } catch (err) {
            if (err.response?.data?.expired) {
                // OTP expired or too many attempts — go back to register
                setStep('register');
                setOtp(['', '', '', '', '', '']);
            }
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const resendHandler = async () => {
        if (resendCooldown > 0) return;
        setError(null);
        setLoading(true);
        try {
            await api.post('/api/auth/resend-otp', { email });
            setOtp(['', '', '', '', '', '']);
            setResendCooldown(30);
            success('New verification code sent!');
        } catch (err) {
            if (err.response?.data?.expired) {
                setStep('register');
                setOtp(['', '', '', '', '', '']);
            }
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input — auto-focus next box
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace — go to previous box
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste — fill all boxes
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            setOtp(pastedData.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Animated mesh background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh dark:bg-gradient-mesh-dark" />
                <div className="blob-1 -top-32 -right-32 blob-animated opacity-60" />
                <div className="blob-2 -bottom-32 -left-32 blob-animated-reverse opacity-40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="glass-card p-6 sm:p-10 md:p-12">

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={`flex items-center gap-2 ${step === 'register' ? 'text-rose-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === 'register' ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'}`}>
                                {step === 'verify' ? '✓' : '1'}
                            </span>
                            <span className="text-xs font-bold hidden sm:inline">Details</span>
                        </div>
                        <div className={`w-8 h-0.5 rounded ${step === 'verify' ? 'bg-rose-400' : 'bg-gray-200 dark:bg-charcoal-600'}`} />
                        <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-rose-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step === 'verify' ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-charcoal-600 text-gray-400 dark:text-gray-500'}`}>2</span>
                            <span className="text-xs font-bold hidden sm:inline">Verify</span>
                        </div>
                    </div>
                    
                    {step === 'register' ? (
                        /* ==================== STEP 1: Registration Form ==================== */
                        <>
                            <div className="text-center mb-8 sm:mb-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                                    className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-rose-500/25"
                                >
                                    <UserPlus className="text-white" size={28} />
                                </motion.div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create your ID.</h1>
                                <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base mt-2">One account for all your baby's needs.</p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2 border border-red-100 dark:border-red-500/20"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={submitHandler} className="space-y-5 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="premium-input !pl-12"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
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
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
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
                                    className="w-full premium-btn btn-primary py-3.5 sm:py-4 text-base flex items-center justify-center gap-2 group disabled:opacity-60 shimmer-btn"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-8 sm:mt-10 text-center">
                                <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">
                                    Already have an account? <Link to="/login" className="text-rose-500 font-bold hover:underline hover:text-rose-600">Sign in.</Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        /* ==================== STEP 2: OTP Verification ==================== */
                        <>
                            <div className="text-center mb-8 sm:mb-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg shadow-emerald-500/25"
                                >
                                    <ShieldCheck className="text-white" size={28} />
                                </motion.div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Verify your email</h1>
                                <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base mt-2">
                                    We sent a 6-digit code to<br />
                                    <span className="font-semibold text-gray-600 dark:text-gray-300">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2 border border-red-100 dark:border-red-500/20"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={verifyHandler} className="space-y-6">
                                {/* 6-digit OTP input boxes */}
                                <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-2xl outline-none transition-all bg-white/80 dark:bg-charcoal-700 border-2 border-rose-100 dark:border-charcoal-600 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 dark:focus:ring-rose-500/10 text-gray-900 dark:text-white"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <motion.button 
                                    type="submit" 
                                    disabled={loading || otp.join('').length !== 6}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full premium-btn btn-primary py-3.5 sm:py-4 text-base flex items-center justify-center gap-2 group disabled:opacity-60 shimmer-btn"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Verify & Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-6 text-center space-y-3">
                                <button
                                    onClick={resendHandler}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-sm text-rose-500 font-semibold hover:text-rose-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto transition-colors"
                                >
                                    <RefreshCw size={14} className={resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'} />
                                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                                </button>
                                <button
                                    onClick={() => { setStep('register'); setError(null); setOtp(['', '', '', '', '', '']); }}
                                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    ← Back to registration
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 dark:text-gray-600 px-6 leading-relaxed">
                    By joining, you agree to our Terms of Use and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
