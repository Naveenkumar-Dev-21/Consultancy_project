import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Instagram, Facebook, MessageCircle, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3500);
    };

    const linkHover = { x: 5 };
    const linkTrans = { type: 'spring', stiffness: 400, damping: 25 };

    const socialLinks = [
        { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500 hover:bg-pink-50', href: '#' },
        { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500 hover:bg-blue-50', href: '#' },
        { icon: MessageCircle, label: 'WhatsApp', color: 'hover:text-green-500 hover:bg-green-50', href: '#' },
    ];

    const exploreLinks = [
        { to: '/', label: 'New Arrivals' },
        { to: '/', label: 'Best Sellers' },
        { to: '/', label: 'Safety Essentials' },
        { to: '/about', label: 'About Us' },
        { to: '/', label: 'Gift Cards' },
    ];

    const supportLinks = [
        { to: '/shipping-policy', label: 'Shipping Policy' },
        { to: '/returns', label: 'Returns & Exchanges' },
        { to: '/contact', label: 'Contact Us' },
    ];

    return (
        <footer className="relative bg-gradient-to-b from-white to-rose-50/50 border-t border-rose-100 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden">
            {/* Animated decorative blobs */}
            <div className="blob-1 -top-20 -right-20 opacity-40 blob-animated" />
            <div className="blob-2 -bottom-10 -left-10 opacity-30 blob-animated-reverse" />

            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">

                    {/* Brand */}
                    <div className="space-y-5 sm:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.img
                                src="/logo-removebg-preview.png"
                                alt="Aadhiran Logo"
                                className="h-16 w-auto object-contain"
                                whileHover={{ scale: 1.06 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            />
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                Aadhiran <span className="gradient-text-pink">Kids Collections</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-base leading-relaxed max-w-xs">
                            Curating the finest essentials for your little ones. Premium comfort meets timeless design.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {socialLinks.map(({ icon: Icon, label, color, href }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-9 h-9 bg-rose-50 rounded-full flex items-center justify-center text-gray-400 transition-colors border border-rose-100 ${color}`}
                                >
                                    <Icon size={17} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Explore</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            {exploreLinks.map(({ to, label }) => (
                                <li key={label}>
                                    <motion.div whileHover={linkHover} transition={linkTrans}>
                                        <Link to={to} className="hover:text-rose-500 transition-colors inline-flex items-center gap-1 group">
                                            {label}
                                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </motion.div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Support</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            {supportLinks.map(({ to, label }) => (
                                <li key={label}>
                                    <motion.div whileHover={linkHover} transition={linkTrans}>
                                        <Link to={to} className="hover:text-rose-500 transition-colors inline-flex items-center gap-1 group">
                                            {label}
                                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </motion.div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Stay in the Loop 💌</h4>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                            Get new arrivals, exclusive deals & parenting tips delivered to your inbox.
                        </p>
                        {subscribed ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center"
                            >
                                <p className="text-green-600 font-bold text-sm">🎉 You're in! Thank you!</p>
                                <p className="text-green-500 text-xs mt-1">Welcome to the Aadhiran family.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-gray-300"
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2.5 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-xl shadow-md shadow-rose-500/20 flex-shrink-0"
                                >
                                    <Send size={16} />
                                </motion.button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-rose-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1.5">
                        © 2025 Aadhiran Kids Collections. Made with{' '}
                        <motion.span
                            animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="inline-block"
                        >
                            <Heart size={12} className="text-rose-400 fill-rose-400" />
                        </motion.span>
                        {' '}for little ones.
                    </p>
                    <p className="text-xs text-gray-300">Privacy Policy · Terms of Service</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
