import React from 'react';
import { Mail, Phone, Instagram, Facebook, Twitter, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="relative bg-gradient-to-b from-white to-rose-50/50 border-t border-rose-100 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden">
            {/* Decorative blob */}
            <div className="blob-1 -top-20 -right-20 opacity-40" />

            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
                    {/* Brand */}
                    <div className="space-y-5 sm:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img 
                                src="/logo-removebg-preview.png" 
                                alt="Aadhiran Logo" 
                                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                Aadhiran <span className="gradient-text-pink">Kids Collections</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-base leading-relaxed max-w-xs">
                            Curating the finest essentials for your little ones. Premium comfort meets timeless design.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-500 transition-all hover:scale-110">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-500 transition-all hover:scale-110">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-500 transition-all hover:scale-110">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Explore</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Best Sellers</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Safety Essentials</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Gift Cards</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Support</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Track Order</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Newsletter</h4>
                        <p className="text-gray-500 text-base">Join our family and get 10% off your first order.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-white border border-rose-200 rounded-full px-5 py-3.5 text-base focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all placeholder:text-gray-400"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-bold hover:from-rose-500 hover:to-pink-600 transition-all shadow-md shadow-rose-400/20">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-rose-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1.5">
                        © 2025 Aadhiran Kids Collections. Made with <Heart size={12} className="text-rose-400 fill-rose-400" /> for little ones.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
