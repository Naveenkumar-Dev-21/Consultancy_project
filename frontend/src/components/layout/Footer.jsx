import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Instagram, Facebook, MessageCircle, ArrowRight, Send, Sparkles, Shield, Truck, Star } from 'lucide-react';
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

    const socialLinks = [
        { icon: Instagram, label: 'Instagram', hoverBg: 'hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500', href: '#' },
        { icon: Facebook, label: 'Facebook', hoverBg: 'hover:bg-blue-600', href: '#' },
        { icon: MessageCircle, label: 'WhatsApp', hoverBg: 'hover:bg-green-500', href: '#' },
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
        { to: '/contact', label: 'Contact Us' },
    ];

    const trustBadges = [
        { icon: Truck, label: 'Free Shipping', sub: 'On all orders' },
        { icon: Shield, label: 'Secure Payment', sub: '100% protected' },
        { icon: Star, label: 'Premium Quality', sub: 'Bio-washed cotton' },
        { icon: Sparkles, label: 'Baby Safe', sub: 'Hypoallergenic' },
    ];

    return (
        <footer className="relative overflow-hidden">
            {/* ─── Trust Badges Strip ─── */}
            <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 dark:from-charcoal-800 dark:via-charcoal-800 dark:to-charcoal-800 border-t border-b border-rose-100/40 dark:border-rose-100/10">
                <div className="section-container py-8 sm:py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {trustBadges.map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                    <Icon size={18} className="text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Main Footer ─── */}
            <div className="bg-charcoal-800 dark:bg-charcoal-900 text-white relative">
                {/* Wave Divider */}
                <div className="absolute -top-[1px] left-0 right-0 overflow-hidden leading-none">
                    <svg viewBox="0 0 1440 48" className="w-full" preserveAspectRatio="none" style={{ height: '48px' }}>
                        <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" className="fill-charcoal-800 dark:fill-charcoal-900" />
                    </svg>
                </div>

                {/* Decorative gradient orbs */}
                <div className="absolute top-20 -right-40 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 -left-40 w-60 h-60 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

                <div className="section-container relative z-10 pt-20 sm:pt-24 pb-8 sm:pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-14 sm:mb-16">

                        {/* Brand Column */}
                        <div className="space-y-5 sm:col-span-2 lg:col-span-1">
                            <Link to="/" className="flex items-center gap-3 group">
                                <motion.img
                                    src="/logo-removebg-preview.png"
                                    alt="Aadhiran Logo"
                                    className="h-14 w-auto object-contain brightness-0 invert opacity-90"
                                    whileHover={{ scale: 1.06 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                />
                                <div>
                                    <span className="text-lg font-extrabold tracking-tight text-white leading-tight block">
                                        Aadhiran
                                    </span>
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-400 leading-none">
                                        Kids Collections
                                    </span>
                                </div>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                Curating the finest essentials for your little ones. Premium comfort meets timeless design.
                            </p>

                            {/* Social Icons */}
                            <div className="flex items-center gap-3 pt-2">
                                {socialLinks.map(({ icon: Icon, label, hoverBg, href }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        whileHover={{ scale: 1.1, y: -3 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 ${hoverBg}`}
                                    >
                                        <Icon size={18} />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em] mb-6">Explore</h4>
                            <ul className="space-y-3 text-sm">
                                {exploreLinks.map(({ to, label }) => (
                                    <li key={label}>
                                        <Link to={to} className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                                            <span className="w-1 h-1 bg-rose-500/50 rounded-full group-hover:bg-rose-400 transition-colors" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em] mb-6">Support</h4>
                            <ul className="space-y-3 text-sm">
                                {supportLinks.map(({ to, label }) => (
                                    <li key={label}>
                                        <Link to={to} className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                                            <span className="w-1 h-1 bg-rose-500/50 rounded-full group-hover:bg-rose-400 transition-colors" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em] mb-6">Stay in the Loop 💌</h4>
                            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                                Get new arrivals, exclusive deals & parenting tips delivered to your inbox.
                            </p>
                            {subscribed ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center"
                                >
                                    <p className="text-green-400 font-bold text-sm">🎉 You're in! Thank you!</p>
                                    <p className="text-green-500/70 text-xs mt-1">Welcome to the Aadhiran family.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 pr-12 py-3 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-rose-400/50 focus:bg-white/10 transition-all"
                                    />
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center"
                                    >
                                        <Send size={14} />
                                    </motion.button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            © {new Date().getFullYear()} Aadhiran Kids Collections. Made with{' '}
                            <motion.span
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="inline-block"
                            >
                                <Heart size={11} className="text-rose-500 fill-rose-500" />
                            </motion.span>
                            {' '}for little ones.
                        </p>
                        <p className="text-xs text-gray-600">Privacy Policy · Terms of Service</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
