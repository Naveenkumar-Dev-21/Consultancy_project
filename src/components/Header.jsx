import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    // Reactively update userInfo and cartCount on localStorage changes
    useEffect(() => {
        const updateUserInfo = () => {
            const storedUser = localStorage.getItem('userInfo');
            setUserInfo(storedUser ? JSON.parse(storedUser) : null);
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
            setCartCount(count);
        };
        updateUserInfo(); // Initial load
        window.addEventListener('storage', updateUserInfo);
        return () => {
            window.removeEventListener('storage', updateUserInfo);
        };
    }, []);

    /* ================= LOGOUT ================= */
    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cartItems');
        setUserInfo(null);
        navigate('/login');
    };

    return (
        <header
            className="sticky top-0 z-50 shadow-sm"
            style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                {/* LOGO */}
                <Link
                    to="/"
                    className="text-3xl font-black flex items-center gap-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    <span className="text-[#fca5a5]">Aadhiran</span>
                    <span className="text-gray-800">Baby Products</span>
                </Link>

                {/* NAV */}
                <nav className="flex items-center gap-6">

                    <Link
                        to="/"
                        className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors"
                    >
                        Home
                    </Link>

                    {/* CART */}
                    <Link
                        to="/cart"
                        className="relative text-gray-600 hover:text-[#fca5a5] transition-colors"
                    >
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* AUTH SECTION */}
                    {userInfo ? (
                        <div className="flex items-center gap-4">

                            <Link
                                to="/myorders"
                                className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors"
                            >
                                My Orders
                            </Link>

                            {/* ADMIN */}
                            {userInfo.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="text-gray-600 hover:text-[#fca5a5] font-medium transition-colors"
                                >
                                    Admin
                                </Link>
                            )}

                            {/* USER NAME */}
                            <div className="flex items-center gap-2 bg-[#fca5a5]/10 px-3 py-1.5 rounded-full">
                                <User size={16} className="text-[#fca5a5]" />
                                <span className="text-sm font-bold text-gray-700">
                                    {userInfo.name}
                                </span>
                            </div>

                            {/* LOGOUT */}
                            <button
                                onClick={logoutHandler}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-[#fca5a5] text-white rounded-full font-bold shadow-md hover:bg-[#f87171] transition-all"
                        >
                            <User size={18} /> Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
