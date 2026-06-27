import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
    const { wishlistProducts, loading } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div className="min-h-screen py-12 sm:py-20 font-sans" style={{ background: 'var(--bg-primary)' }}>
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8 sm:mb-12">
                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50">
                            <Heart className="text-rose-400 fill-rose-400" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                                My Wishlist
                            </h1>
                            <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base mt-1">
                                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 sm:h-80 bg-rose-100/30 animate-pulse rounded-[32px] clay-card"></div>
                            ))}
                        </div>
                    ) : wishlistProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            <AnimatePresence>
                                {Array.isArray(wishlistProducts) && wishlistProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        addToCartHandler={addToCartHandler}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 sm:py-32 glass-card border border-dashed border-rose-200">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50">
                                <Heart className="text-rose-300 dark:text-rose-400 animate-bounce-soft" size={32} />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-400 dark:text-gray-500 mb-8 text-base">
                                Save items you love by tapping the heart icon
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn-primary py-3.5 px-8 rounded-full inline-flex items-center gap-2"
                            >
                                <ShoppingBag size={18} /> Start Shopping
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default WishlistPage;
