import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    // TODO: Get user from context
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    return (
        <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-3xl font-black flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <span className="text-[#fca5a5]">Baby</span><span className="text-gray-800">Shop</span>
                </Link>
                <nav className="flex items-center gap-6">
                    <Link to="/" className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors">Home</Link>
                    <Link to="/cart" className="relative text-gray-600 hover:text-[#fca5a5] transition-colors">
                        <ShoppingCart size={24} />
                    </Link>
                    {userInfo ? (
                        <div className="flex items-center gap-4">
                            <Link to="/myorders" className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors">My Orders</Link>
                            {userInfo.role === 'admin' && (
                                <Link to="/admin" className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors transition-colors">Admin</Link>
                            )}
                            <div className="flex items-center gap-2 bg-[#fca5a5]/10 px-3 py-1.5 rounded-full">
                                <User size={16} className="text-[#fca5a5]" />
                                <span className="text-sm font-bold text-gray-700">{userInfo.name}</span>
                            </div>
                            <button onClick={logoutHandler} className="text-gray-400 hover:text-red-500 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-[#fca5a5] text-white rounded-full font-bold shadow-md hover:bg-[#f87171] transition-all">
                            <User size={18} /> Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
