import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    const navLinkClass = ({ isActive }) =>
        `transition-colors hover:text-beelittle-coral ${isActive ? 'text-beelittle-coral font-bold' : 'text-apple-text/80'}`;

    return (
        <header className="sticky top-0 z-50 glass">
            <div className="section-container h-14 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-beelittle-coral rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Package className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-apple-text">
                        Aadhiran <span className="text-beelittle-coral">Kids Collection</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
                    <NavLink to="/" className={navLinkClass}>Home</NavLink>
                    <NavLink to="/myorders" className={navLinkClass}>Orders</NavLink>
                </nav>

                <div className="flex items-center gap-5">
                    <Link to="/cart" className="relative group text-apple-text/80 hover:text-beelittle-coral transition-all">
                        <ShoppingCart size={19} strokeWidth={2.2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-beelittle-coral text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {userInfo ? (
                        <div className="flex items-center gap-4 border-l border-gray-200 pl-4 ml-2">
                            {userInfo.role === 'admin' && (
                                <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-apple-text/70" title="Dashboard">
                                    <LayoutDashboard size={19} />
                                </Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                                    <User size={14} className="text-apple-text/60" />
                                </div>
                                <span className="text-xs font-semibold text-apple-text/80">{userInfo.name.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logoutHandler} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-1.5 bg-zinc-900 text-white text-[13px] font-semibold rounded-full hover:bg-zinc-800 active:scale-95 transition-all">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
