import React from 'react';
import { Mail, Phone, Instagram, Facebook, Twitter, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-black/5 pt-20 pb-10">
            <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-beelittle-coral rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Package className="text-white" size={18} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-apple-text">
                                Aadhiran<span className="text-beelittle-coral">Baby</span>
                            </span>
                        </Link>
                        <p className="text-apple-text/40 text-sm leading-relaxed max-w-xs">
                            Curating the finest essentials for your little ones. We blend premium comfort with timeless design to celebrate the joy of childhood.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-sm font-bold text-apple-text uppercase tracking-widest mb-6">Explore</h4>
                        <ul className="space-y-4 text-sm font-medium text-apple-text/40">
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">New Arrivals</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Best Sellers</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Safety Essentials</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Gift Cards</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-apple-text uppercase tracking-widest mb-6">Support</h4>
                        <ul className="space-y-4 text-sm font-medium text-apple-text/40">
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Track Order</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="/" className="hover:text-beelittle-coral transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-apple-text uppercase tracking-widest mb-6">Newsletter</h4>
                        <p className="text-apple-text/40 text-sm">Join our family of parents and get 10% off your first order.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-zinc-50 border border-transparent rounded-full px-5 py-3 text-sm focus:bg-white focus:border-beelittle-coral outline-none transition-all"
                            />
                            <button className="absolute right-1 top-1 bottom-1 px-4 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] font-bold text-apple-text/20 uppercase tracking-widest">
                        © 2025 Aadhiran Kids Collection. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-apple-text/20">
                        <a href="#" className="hover:text-beelittle-coral transition-colors"><Instagram size={18} /></a>
                        <a href="#" className="hover:text-beelittle-coral transition-colors"><Facebook size={18} /></a>
                        <a href="#" className="hover:text-beelittle-coral transition-colors"><Twitter size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
