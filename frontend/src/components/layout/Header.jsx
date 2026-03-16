import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Header = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navLinkClass = ({ isActive }) =>
        `text-base font-medium transition-colors hover:text-rose-500 ${isActive ? 'text-rose-500 font-bold' : 'text-gray-700'}`;

    const MobileNavLink = ({ to, children }) => (
        <NavLink 
            to={to} 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
                `block py-3.5 text-lg font-medium border-b border-rose-100 ${isActive ? 'text-rose-500' : 'text-gray-600'}`
            }
        >
            {children}
        </NavLink>
    );

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100/50 shadow-sm">
            <div className="section-container h-16 sm:h-18 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden text-gray-600 hover:text-rose-500 transition-colors p-1"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <img 
                            src="/logo-removebg-preview.png" 
                            alt="Aadhiran Logo" 
                            className="h-12 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 hidden xs:block">
                            Aadhiran <span className="gradient-text-pink">Kids Collections</span>
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <NavLink to="/" className={navLinkClass}>Home</NavLink>
                    <NavLink to="/myorders" className={navLinkClass}>Orders</NavLink>
                    <NavLink to="/about" className={navLinkClass}>About</NavLink>
                </nav>

                <div className="flex items-center gap-3 md:gap-5">
                    <Link to="/wishlist" className="relative group text-gray-600 hover:text-rose-500 transition-all p-1">
                        <Heart size={22} strokeWidth={2} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/cart" className="relative group text-gray-600 hover:text-rose-500 transition-all p-1">
                        <ShoppingCart size={22} strokeWidth={2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {userInfo ? (
                        <div className="flex items-center gap-2 md:gap-4 border-l border-rose-100 pl-3 md:pl-4 ml-2">
                            {userInfo.role === 'admin' && (
                                <Link to="/admin" className="p-2 hover:bg-rose-50 rounded-full transition-colors text-gray-500 hidden sm:block" title="Dashboard">
                                    <LayoutDashboard size={20} />
                                </Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors border border-rose-200">
                                    <User size={15} className="text-rose-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{userInfo.name.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logoutHandler} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors hidden sm:block" title="Logout">
                                <LogOut size={19} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold rounded-full hover:from-rose-500 hover:to-pink-600 active:scale-95 transition-all shadow-lg shadow-rose-500/20">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-rose-100 shadow-2xl p-5 md:hidden flex flex-col gap-1 z-50">
                    <MobileNavLink to="/">Home</MobileNavLink>
                    <MobileNavLink to="/wishlist">Wishlist</MobileNavLink>
                    <MobileNavLink to="/myorders">My Orders</MobileNavLink>
                    <MobileNavLink to="/about">About</MobileNavLink>
                    {userInfo && (
                        <>
                            <MobileNavLink to="/profile">Profile</MobileNavLink>
                            {userInfo.role === 'admin' && (
                                <MobileNavLink to="/admin">Admin Dashboard</MobileNavLink>
                            )}
                            <button 
                                onClick={logoutHandler}
                                className="text-left py-3.5 text-lg font-medium text-red-500 border-b border-rose-100 w-full hover:bg-red-50 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
