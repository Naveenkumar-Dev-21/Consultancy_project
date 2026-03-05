import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
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
        <div className="min-h-screen py-12 sm:py-20 font-sans">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8 sm:mb-12">
                        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center">
                            <Heart className="text-rose-400 fill-rose-400" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                My Wishlist
                            </h1>
                            <p className="text-gray-400 text-sm sm:text-base mt-1">
                                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 sm:h-80 bg-rose-100/50 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : wishlistProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {wishlistProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    addToCartHandler={addToCartHandler}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 sm:py-32 bg-white rounded-3xl border border-dashed border-rose-200">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="text-rose-300" size={32} />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-400 mb-8 text-base">
                                Save items you love by tapping the heart icon
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-base font-bold shadow-lg shadow-rose-500/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 inline-flex items-center gap-2"
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
