import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
import axios from 'axios';

const Signup = () =>{
    const [name, setName] = useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword] = useState('');
    const [password2,setPassword2] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const submitHandler = async(e) =>{
        e.preventDefault();
        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
            navigate('/login', { state: { signupSuccess: true } });
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = decodeJWT(credentialResponse.credential);
            const googleUser = {
                googleId: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            };
            const { data } = await axios.post('http://localhost:5000/api/auth/google', googleUser);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
        } catch (err) {
            setError('Google signup failed');
        }
    };

    return(
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl glass border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Confirm your password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-lg">
                        Sign Up
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                        </div>
                    </div>

                    <div className="mt-8 transform hover:scale-105 transition-transform duration-200">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                            setError('Google login failed');
                            }}
                        theme="filled_blue"
                        size="large"
                        shape="pill"
                        text="signin_with"
                        width="385"
                        />
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-gray-900 font-semibold hover:underline">Sign In</Link>
                </div>
            </div>
        </div>  
    );
}

export default Signup;