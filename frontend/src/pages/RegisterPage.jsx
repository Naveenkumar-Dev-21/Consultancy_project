import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, User, Lock, Mail, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('userInfo')) {
            navigate('/');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/auth/signup', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="blob-1 -top-32 -right-32" />
            <div className="blob-2 -bottom-32 -left-32" />

            <div className="w-full max-w-[460px] relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl sm:rounded-[32px] shadow-soft border border-rose-100/60 p-6 sm:p-10 md:p-12">
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
                            <UserPlus className="text-rose-400" size={32} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Create your ID.</h1>
                        <p className="text-gray-400 text-sm sm:text-base mt-2">One account for all your baby's needs.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 border border-red-100">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-5 sm:space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-rose-50/50 border border-rose-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-rose-50/50 border border-rose-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-rose-50/50 border border-rose-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full premium-btn btn-primary py-3.5 sm:py-4 text-base flex items-center justify-center gap-2 group">
                            Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 sm:mt-10 text-center">
                        <p className="text-gray-400 text-sm sm:text-base">
                            Already have an account? <Link to="/login" className="text-rose-500 font-bold hover:underline hover:text-rose-600">Sign in.</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 px-6 leading-relaxed">
                    By joining, you agree to our Terms of Use and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
