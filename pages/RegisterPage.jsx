import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
            const { data } = await axios.post('/api/auth/register', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[#f5f5f7]">
            <div className="w-full max-w-[440px]">
                <div className="bg-white rounded-[32px] shadow-sm border border-black/5 p-10 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <UserPlus className="text-apple-text/20" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-apple-text">Create your ID.</h1>
                        <p className="text-apple-text/40 text-sm mt-2">One account for all your baby's needs.</p>
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
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text/20" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-transparent rounded-2xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
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
                            Sign Up <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-apple-text/40 text-sm">
                            Already have an account? <Link to="/login" className="text-beelittle-coral font-bold hover:underline">Sign in.</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-[11px] text-apple-text/30 px-6 leading-relaxed">
                    By joining, you agree to our Terms of Use and Privacy Policy. We ensure your personal data is kept secure and used only for a better shopping experience.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
