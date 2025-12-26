import React from 'react';
import { ShoppingCart, Star, CheckCircle2, Heart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, addToCartHandler, addedToCartId }) => {
    const navigate = useNavigate();

    // Calculate discount percentage
    const originalPrice = Math.round(product.price * 1.2);
    const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    return (
        <div
            className="group relative bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-gradient-to-br from-zinc-50 to-pink-50/30 overflow-hidden">
                <img
                    src={product.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500"}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply p-8 group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out"
                />

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        {product.stock <= 0 ? (
                            <span className="bg-gradient-to-r from-zinc-800 to-zinc-900 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                Sold Out
                            </span>
                        ) : product.stock <= 5 ? (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                                Only {product.stock} Left
                            </span>
                        ) : (
                            <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                In Stock
                            </span>
                        )}
                        {discountPercent > 0 && (
                            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                {discountPercent}% Off
                            </span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Add wishlist functionality here
                        }}
                        className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-pink-50 hover:scale-110 transition-all duration-300 group/heart"
                    >
                        <Heart size={16} className="text-zinc-400 group-hover/heart:text-pink-500 group-hover/heart:fill-pink-500 transition-all" />
                    </button>
                </div>

                {/* Desktop Add to Cart Button - Always Visible on Hover */}
                <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100 hidden md:block">
                    <button
                        onClick={(e) => addToCartHandler(product, e)}
                        disabled={product.stock === 0}
                        className={`w-full py-4 rounded-2xl font-bold text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                            ${product.stock === 0
                                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                                : addedToCartId === product._id
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/50'
                                    : 'bg-gradient-to-r from-zinc-900 to-zinc-800 text-white hover:from-zinc-800 hover:to-zinc-700 shadow-zinc-900/50'
                            }`}
                    >
                        {addedToCartId === product._id ? (
                            <>
                                <CheckCircle2 size={18} className="animate-bounce" />
                                <span>Added to Cart!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={18} />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-white to-zinc-50/30">
                {/* Category & Rating */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package size={12} className="text-zinc-400" />
                        <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-700">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                    </div>
                </div>

                {/* Product Name */}
                <h3 className="text-base font-bold text-zinc-900 leading-snug mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-rose-500 transition-all duration-300">
                    {product.name}
                </h3>

                {/* Stock Indicator */}
                {product.stock > 0 && product.stock <= 10 && (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${product.stock <= 3 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                        product.stock <= 5 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                                            'bg-gradient-to-r from-green-500 to-emerald-500'
                                    }`}
                                style={{ width: `${(product.stock / 10) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400">{product.stock}/10</span>
                    </div>
                )}

                {/* Price & Mobile Add Button */}
                <div className="mt-auto flex items-end justify-between pt-4 border-t-2 border-zinc-100">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400 font-semibold line-through">₹{originalPrice}</span>
                            {discountPercent > 0 && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    Save {discountPercent}%
                                </span>
                            )}
                        </div>
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                            ₹{product.price}
                        </span>
                    </div>

                    {/* Mobile Only Add Button - Enhanced */}
                    <button
                        onClick={(e) => addToCartHandler(product, e)}
                        disabled={product.stock === 0}
                        className={`md:hidden w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 transform hover:scale-110
                             ${product.stock === 0
                                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                : addedToCartId === product._id
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/50 animate-pulse'
                                    : 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-pink-500/50 hover:shadow-pink-500/70'
                            }`}
                    >
                        {addedToCartId === product._id ? (
                            <CheckCircle2 size={20} className="animate-bounce" />
                        ) : (
                            <ShoppingCart size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
