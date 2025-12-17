import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () =>{
    const [email,setEmail]=useState('');
    const [password,setPassword] = useState('');
    const [password2,setPassword2] = useState('');

    const submitHandler = async(e) =>{
        e.preventDefault();
        // Signup logic here
    }

    return(
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl glass border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
                <form onSubmit={submitHandler} className="space-y-4">
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

                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            console.log(credentialResponse);
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                    />
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-gray-900 font-semibold hover:underline">Sign In</Link>
                </div>
            </div>
        </div>  
    );
}

export default Signup;