import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleAuthParam = params.get('googleAuth');

        if (googleAuthParam) {
            try {
                const userInfo = JSON.parse(decodeURIComponent(googleAuthParam));
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                navigate(userInfo.role === 'admin' ? '/admin' : '/');
            } catch (error) {
                console.error('Failed to parse Google Auth data', error);
            }
        } else if (localStorage.getItem('userInfo')) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            navigate(userInfo.role === 'admin' ? '/admin' : '/');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[#f5f5f7]">
            <div className="w-full max-w-[440px]">
                <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-10 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <User className="text-apple-text/20" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-apple-text">Sign in for checkout.</h1>
                        <p className="text-apple-text/40 text-sm mt-2">Manage your orders and favorites.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-xs font-semibold flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text/20" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text/20" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full premium-btn btn-primary py-4 text-base flex items-center justify-center gap-2 group">
                            Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="relative py-4 flex items-center">
                            <div className="flex-grow border-t border-zinc-100"></div>
                            <span className="flex-shrink mx-4 text-[10px] font-bold text-apple-text/20 uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-zinc-100"></div>
                        </div>

                        <a href="http://localhost:5000/api/auth/google" className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-zinc-200 rounded-full text-sm font-semibold hover:bg-zinc-50 transition-all active:scale-[0.98]">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Sign in with Google
                        </a>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-apple-text/40 text-sm">
                            Don't have an ID? <Link to="/register" className="text-beelittle-coral font-bold hover:underline">Create one now.</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[11px] text-apple-text/30 px-6 leading-relaxed">
                    By signing in, you agree to our Terms of Service and Privacy Policy. Your data is handled with the utmost care for your little one's safety.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
