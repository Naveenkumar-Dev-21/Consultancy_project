import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { getFullUrl } from '../../utils/urlUtils';

const ProductCard = ({ product, addToCartHandler, addedToCartId }) => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();

    if (!product) return null;

    const wishlisted = isInWishlist(product._id);
    const isAdded = addedToCartId === product._id;
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    const handleWishlist = (e) => {
        e.stopPropagation();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) { navigate('/login'); return; }
        toggleWishlist(product._id);
    };

    const cardVariant = {
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <motion.div
            variants={cardVariant}
            layout
            className="group cursor-pointer"
            onClick={() => navigate(`/category/product/${product._id}`, { state: { product } })}
        >
            <div className="relative clay-card overflow-hidden">
                {/* ── Image Section ── */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-rose-50/50 to-pink-50/20 dark:from-charcoal-800 dark:to-charcoal-900 overflow-hidden m-2 rounded-[24px]">
                    <img
                        src={getFullUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {hasDiscount && (
                            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.2)] uppercase tracking-wide">
                                {discountPercent}% Off
                            </span>
                        )}
                        {product.stock <= 0 && (
                            <span className="px-2.5 py-1 bg-charcoal-800/90 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                                Sold Out
                            </span>
                        )}
                        {product.stock > 0 && product.stock <= 5 && (
                            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                                Only {product.stock} left
                            </span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <motion.button
                        onClick={handleWishlist}
                        whileTap={{ scale: 0.8 }}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                            wishlisted
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                : 'bg-white dark:bg-charcoal-700 text-gray-400 hover:text-rose-500 border border-white/40 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)]'
                        }`}
                    >
                        <Heart size={15} className={wishlisted ? 'fill-white' : ''} />
                    </motion.button>

                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (product.stock > 0 && addToCartHandler) {
                                    addToCartHandler(product, e);
                                }
                            }}
                            whileTap={{ scale: 0.94 }}
                            disabled={product.stock <= 0}
                            className={`w-full py-2.5 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all ${
                                product.stock <= 0
                                    ? 'bg-gray-500/80 text-white/70 cursor-not-allowed'
                                    : isAdded
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 border border-green-400/25'
                                        : 'bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white hover:bg-rose-500 hover:text-white shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/40 dark:border-white/5'
                            }`}
                        >
                            {isAdded ? (
                                <><Check size={14} /> Added!</>
                            ) : product.stock <= 0 ? (
                                'Sold Out'
                            ) : (
                                <><ShoppingCart size={14} /> Quick Add</>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* ── Product Info ── */}
                <div className="p-3.5 sm:p-4">
                    {/* Category Tag */}
                    {product.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 dark:text-rose-400/80 mb-1 block">
                            {product.category}
                        </span>
                    )}

                    {/* Name */}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug truncate group-hover:text-rose-500 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={11}
                                        className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-charcoal-600 dark:text-charcoal-600'}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">({product.numReviews || 0})</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            ₹{product.price}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                                ₹{product.originalPrice}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
