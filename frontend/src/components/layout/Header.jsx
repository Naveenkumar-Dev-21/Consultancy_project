import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Header = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navLinkClass = ({ isActive }) =>
        `relative text-base font-medium transition-colors hover:text-rose-500 pb-1 ${isActive ? 'text-rose-500 font-bold nav-link-active' : 'text-gray-700'}`;

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -16, scaleY: 0.95 },
        visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -10, scaleY: 0.97, transition: { duration: 0.18 } }
    };

    const mobileItemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.25 } })
    };

    const mobileLinks = [
        { to: '/', label: 'Home' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/myorders', label: 'My Orders' },
        { to: '/about', label: 'About' },
        ...(userInfo ? [{ to: '/profile', label: 'Profile' }] : []),
        ...(userInfo?.role === 'admin' ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
    ];

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-xl border-rose-100/60 shadow-md shadow-rose-100/30'
                    : 'bg-white/80 backdrop-blur-xl border-rose-100/40 shadow-sm'
            }`}
        >
            <div className="section-container h-16 sm:h-18 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <motion.button
                        className="md:hidden text-gray-600 hover:text-rose-500 transition-colors p-1"
                        onClick={toggleMobileMenu}
                        whileTap={{ scale: 0.88 }}
                    >
                        <AnimatePresence mode="wait">
                            {isMobileMenuOpen
                                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={26} /></motion.div>
                                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={26} /></motion.div>
                            }
                        </AnimatePresence>
                    </motion.button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.img
                            src="/logo-removebg-preview.png"
                            alt="Aadhiran Logo"
                            className="h-12 sm:h-16 w-auto object-contain"
                            whileHover={{ scale: 1.06 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 hidden xs:block">
                            Aadhiran <span className="gradient-text-pink">Kids Collections</span>
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <NavLink to="/" end className={navLinkClass}>Home</NavLink>
                    <NavLink to="/myorders" className={navLinkClass}>Orders</NavLink>
                    <NavLink to="/about" className={navLinkClass}>About</NavLink>
                </nav>

                <div className="flex items-center gap-3 md:gap-5">
                    {/* Wishlist icon with badge pulse */}
                    <Link to="/wishlist" className="relative group text-gray-600 hover:text-rose-500 transition-all p-1">
                        <Heart size={22} strokeWidth={2} />
                        <AnimatePresence>
                            {wishlistCount > 0 && (
                                <motion.span
                                    key={wishlistCount}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.4, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Cart icon with badge pulse */}
                    <Link to="/cart" className="relative group text-gray-600 hover:text-rose-500 transition-all p-1">
                        <ShoppingCart size={22} strokeWidth={2} />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    key={cartCount}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.4, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
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

            {/* Mobile Menu with framer-motion */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ transformOrigin: 'top' }}
                        className="absolute top-full left-0 w-full bg-white/97 backdrop-blur-xl border-t border-rose-100 shadow-2xl p-5 md:hidden flex flex-col gap-1 z-50"
                    >
                        {mobileLinks.map(({ to, label }, i) => (
                            <motion.div key={to} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                                <NavLink
                                    to={to}
                                    end={to === '/'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block py-3.5 text-lg font-medium border-b border-rose-100 ${isActive ? 'text-rose-500' : 'text-gray-600'}`
                                    }
                                >
                                    {label}
                                </NavLink>
                            </motion.div>
                        ))}
                        {userInfo && (
                            <motion.div custom={mobileLinks.length} variants={mobileItemVariants} initial="hidden" animate="visible">
                                <button
                                    onClick={logoutHandler}
                                    className="text-left py-3.5 text-lg font-medium text-red-500 border-b border-rose-100 w-full hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
