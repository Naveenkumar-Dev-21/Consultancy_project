import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { getFullUrl } from '../../utils/urlUtils';

const ProductCard = ({ product, addToCartHandler }) => {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(product._id);

    // Use real originalPrice from DB, fallback to calculated
    const originalPrice = product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice
        : Math.round(product.price * 1.25);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCartHandler(product, e);
    };

    const handleWishlistToggle = (e) => {
        e.stopPropagation();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        toggleWishlist(product._id);
    };

    return (
        <div className="group relative bg-white overflow-hidden rounded-2xl shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer flex flex-col h-full border border-rose-100/60">
            {/* Image Container */}
            <div
                className="relative aspect-[3/4] bg-rose-50/30 overflow-hidden"
                onClick={() => navigate(`/category/product/${product._id}`, { state: { product } })}
            >
                <img
                    src={getFullUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* NEW Badge */}
                {product.stock > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-rose-500/20">
                            New
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm ${wishlisted ? 'bg-rose-50' : 'bg-white/80 hover:bg-white'}`}
                >
                    <Heart
                        size={16}
                        className={wishlisted ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}
                        strokeWidth={1.5}
                    />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
                {/* Product Name */}
                <h3
                    className="text-sm sm:text-base font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-rose-500 transition-colors"
                    onClick={() => navigate(`/category/product/${product._id}`, { state: { product } })}
                >
                    {product.name}
                </h3>

                {/* Category */}
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

                {/* Price Section */}
                <div className="mt-auto mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.price}</span>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">₹{originalPrice}</span>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300
                        ${product.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600 shadow-lg shadow-rose-500/20 active:scale-95'
                        }`}
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
