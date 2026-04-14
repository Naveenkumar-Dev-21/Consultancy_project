import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { getFullUrl } from '../../utils/urlUtils';

const ProductCard = ({ product, addToCartHandler }) => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(product._id);
    const [heartPop, setHeartPop] = useState(false);
    const [cartState, setCartState] = useState('idle'); // 'idle' | 'added'
    const [imageHovered, setImageHovered] = useState(false);

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();
        if (cartState !== 'idle') return;
        addToCartHandler(product, e);
        setCartState('added');
        setTimeout(() => setCartState('idle'), 1800);
    }, [cartState, addToCartHandler, product]);

    const handleWishlistToggle = useCallback((e) => {
        e.stopPropagation();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        setHeartPop(true);
        toggleWishlist(product._id);
        setTimeout(() => setHeartPop(false), 450);
    }, [navigate, toggleWishlist, product._id]);

    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <motion.div
            variants={cardVariants}
            className="group relative bg-white overflow-hidden rounded-2xl shadow-card hover:shadow-glow transition-shadow duration-300 cursor-pointer flex flex-col h-full border border-rose-100/60"
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Image Container */}
            <div
                className="relative aspect-[3/4] bg-rose-50/30 overflow-hidden"
                onClick={() => navigate(`/category/product/${product._id}`, { state: { product } })}
                onMouseEnter={() => setImageHovered(true)}
                onMouseLeave={() => setImageHovered(false)}
            >
                <motion.img
                    src={getFullUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: imageHovered ? 1.07 : 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Quick View Overlay */}
                <AnimatePresence>
                    {imageHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-rose-500/20 backdrop-blur-[2px] flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/90 backdrop-blur-sm text-rose-500 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg"
                            >
                                <Eye size={14} />
                                Quick View
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* NEW Badge */}
                {product.stock > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-rose-500/20">
                            New
                        </span>
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 mt-7">
                        <span className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            {discountPercent}% OFF
                        </span>
                    </div>
                )}

                {/* Out of Stock Ribbon */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <span className="bg-gray-800/80 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Wishlist Button with heart pop */}
                <motion.button
                    onClick={handleWishlistToggle}
                    className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm ${wishlisted ? 'bg-rose-50' : 'bg-white/80 hover:bg-white'}`}
                    whileTap={{ scale: 0.85 }}
                >
                    <motion.div
                        animate={heartPop ? { scale: [1, 1.6, 0.85, 1], rotate: [0, -15, 10, 0] } : { scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <Heart
                            size={16}
                            className={wishlisted ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}
                            strokeWidth={1.5}
                        />
                    </motion.div>
                </motion.button>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
                <h3
                    className="text-sm sm:text-base font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-rose-500 transition-colors"
                    onClick={() => navigate(`/category/product/${product._id}`, { state: { product } })}
                >
                    {product.name}
                </h3>

                <p className="text-[10px] sm:text-xs text-rose-400 uppercase tracking-widest mb-3 font-medium">
                    {product.category || 'Collection'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400">({product.numReviews || 0})</span>
                </div>

                {/* Price */}
                <div className="mt-auto mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.price}</span>
                        {hasDiscount && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button with state feedback */}
                <motion.button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    whileTap={product.stock > 0 ? { scale: 0.94 } : {}}
                    className={`w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-colors duration-200
                        ${product.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : cartState === 'added'
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600 shadow-lg shadow-rose-500/20'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {cartState === 'added' ? (
                            <motion.span
                                key="added"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                className="flex items-center justify-center gap-1.5"
                            >
                                ✓ Added!
                            </motion.span>
                        ) : (
                            <motion.span
                                key="add"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProductCard;
