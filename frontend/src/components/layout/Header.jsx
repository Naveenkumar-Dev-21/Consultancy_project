import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Heart, Sun, Moon, Search, Home, Info, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDarkMode } from '../../hooks/useDarkMode';

const Header = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
        setSearchQuery('');
        setShowSearch(false);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navLinkClass = ({ isActive }) =>
        `relative text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:text-rose-500 pb-1 ${isActive ? 'text-rose-500 font-bold nav-link-active' : 'text-gray-600 dark:text-gray-300'}`;

    const mobileLinks = [
        { to: '/', label: 'Home' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/myorders', label: 'My Orders' },
        { to: '/about', label: 'About' },
        ...(userInfo ? [{ to: '/profile', label: 'Profile' }] : []),
        ...(userInfo?.role === 'admin' ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
    ];

    const mobileItemVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] } })
    };

    // Badge component for DRY
    const Badge = ({ count }) => (
        <AnimatePresence>
            {count > 0 && (
                <motion.span
                    key={count}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-[9px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 ring-2 ring-white dark:ring-charcoal-800"
                >
                    {count}
                </motion.span>
            )}
        </AnimatePresence>
    );

    const getIcon = (label) => {
        switch (label) {
            case 'Home':
                return <Home size={18} />;
            case 'Wishlist':
                return <Heart size={18} />;
            case 'My Orders':
                return <Package size={18} />;
            case 'About':
                return <Info size={18} />;
            case 'Profile':
                return <User size={18} />;
            case 'Admin Dashboard':
                return <LayoutDashboard size={18} />;
            default:
                return <Package size={18} />;
        }
    };

    return (
        <>
            <header
                className={`sticky top-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-2xl border-b border-rose-100/40 dark:border-rose-100/10 shadow-lg shadow-black/[0.03] dark:shadow-black/20'
                        : 'bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-xl border-b border-transparent'
                }`}
            >
                <div className="section-container h-16 sm:h-[72px] flex justify-between items-center">
                    {/* Left: Menu + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <motion.button
                            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors"
                            onClick={toggleMobileMenu}
                            whileTap={{ scale: 0.88 }}
                            aria-label="Toggle menu"
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen
                                    ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={24} /></motion.div>
                                    : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={24} /></motion.div>
                                }
                            </AnimatePresence>
                        </motion.button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setIsMobileMenuOpen(false)}>
                            <motion.img
                                src="/logo-removebg-preview.png"
                                alt="Aadhiran Logo"
                                className="h-10 sm:h-14 w-auto object-contain drop-shadow-sm"
                                whileHover={{ scale: 1.06, rotate: 2 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            />
                            <div className="hidden sm:block">
                                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                    Aadhiran
                                </span>
                                <span className="block text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase gradient-text-pink leading-none">
                                    Kids Collections
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/" end className={navLinkClass}>Home</NavLink>
                        <NavLink to="/myorders" className={navLinkClass}>Orders</NavLink>
                        <NavLink to="/about" className={navLinkClass}>About</NavLink>
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop Search */}
                        <form onSubmit={submitSearch} className="hidden lg:block relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400/60 pointer-events-none" size={16} />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                aria-label="Search products"
                                className="w-40 xl:w-56 focus:w-64 xl:focus:w-72 transition-all duration-300 pl-9 pr-3 py-2 rounded-full text-xs font-bold bg-white/70 dark:bg-charcoal-800/70 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-rose-100/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                            />
                        </form>

                        {/* Mobile/Tablet Search Toggle */}
                        <motion.button
                            onClick={() => setShowSearch((s) => !s)}
                            whileTap={{ scale: 0.85 }}
                            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors"
                            aria-label="Toggle search"
                            aria-expanded={showSearch}
                        >
                            <Search size={20} />
                        </motion.button>
                        {/* Dark Mode Toggle */}
                        <motion.button
                            onClick={toggleDarkMode}
                            whileTap={{ scale: 0.85, rotate: 180 }}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-500/10 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            <AnimatePresence mode="wait">
                                {darkMode ? (
                                    <motion.div key="sun" initial={{ scale: 0.5, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                                        <Sun size={20} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ scale: 0.5, rotate: 90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }}>
                                        <Moon size={20} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative group p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors">
                            <Heart size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                            <Badge count={wishlistCount} />
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative group p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors">
                            <ShoppingCart size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                            <Badge count={cartCount} />
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-6 bg-rose-100/60 dark:bg-rose-100/10 hidden sm:block mx-1" />

                        {/* Auth Section */}
                        {userInfo ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                                {userInfo.role === 'admin' && (
                                    <Link to="/admin" className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hidden sm:flex" title="Dashboard">
                                        <LayoutDashboard size={19} />
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 group cursor-pointer p-1.5 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-500/20 ring-2 ring-white dark:ring-charcoal-800">
                                        <span className="text-white text-xs font-bold">{userInfo.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:block">{userInfo.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={logoutHandler} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-colors hidden sm:flex" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold rounded-full hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>

                {/* Collapsible search bar (mobile / tablet) */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:hidden overflow-hidden border-t border-rose-100/40 dark:border-white/10"
                        >
                            <form onSubmit={submitSearch} className="section-container py-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400/60 pointer-events-none" size={18} />
                                    <input
                                        type="search"
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        aria-label="Search products"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm font-bold bg-white/80 dark:bg-charcoal-800/80 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-rose-100/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                                    />
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ─── Mobile Menu Overlay ─── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/35 dark:bg-black/55 backdrop-blur-md z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Slide-in Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-50 md:hidden flex flex-col shadow-2xl border-l border-rose-100/20 dark:border-white/5"
                            style={{ background: 'var(--bg-primary)' }}
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between p-5 border-b border-rose-100/40 dark:border-white/10">
                                <span className="text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: '"Migra", "Cormorant Garamond", serif' }}>Menu</span>
                                <motion.button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    whileTap={{ scale: 0.85 }}
                                    className="p-2 rounded-full bg-white dark:bg-charcoal-700 text-gray-500 dark:text-gray-400 border border-white/50 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] transition-all"
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>

                            {/* Nav Links */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {mobileLinks.map(({ to, label }, i) => (
                                    <motion.div key={to} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                                        <NavLink
                                            to={to}
                                            end={to === '/'}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-4 py-3.5 px-4 rounded-[20px] text-base font-black transition-all ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.25)]'
                                                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-charcoal-800 hover:bg-rose-50/50 dark:hover:bg-charcoal-700/50 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.08)] border border-white/50 dark:border-white/5'
                                                }`
                                            }
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                                                {getIcon(label)}
                                            </div>
                                            {label}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-5 border-t border-rose-100/40 dark:border-white/10 space-y-3">
                                {userInfo ? (
                                    <button
                                        onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-red-500 text-white font-black text-base shadow-lg transition-all hover:bg-red-600"
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full text-center py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-base shadow-lg shadow-rose-500/25"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
