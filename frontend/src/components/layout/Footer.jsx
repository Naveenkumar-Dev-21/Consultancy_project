import React from 'react';
import { Heart } from 'lucide-react';
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
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Explore</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Best Sellers</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Safety Essentials</Link></li>
                            <li><Link to="/about" className="hover:text-rose-500 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-rose-500 transition-colors">Gift Cards</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5 sm:mb-6">Support</h4>
                        <ul className="space-y-3.5 text-base font-medium text-gray-500">
                            <li><Link to="/shipping-policy" className="hover:text-rose-500 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="hover:text-rose-500 transition-colors">Returns & Exchanges</Link></li>
                            <li><Link to="/contact" className="hover:text-rose-500 transition-colors">Contact Us</Link></li>
                        </ul>
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
