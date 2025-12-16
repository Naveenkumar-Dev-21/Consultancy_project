import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl glass border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Join Us</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-lg">
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-gray-900 font-semibold hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
