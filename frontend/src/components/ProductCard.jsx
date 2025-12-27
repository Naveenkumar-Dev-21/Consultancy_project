import React, { useState } from 'react';
import { ShoppingCart, Star, CheckCircle2, Heart, Package, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, addToCartHandler, addedToCartId }) => {
    const navigate = useNavigate();
    const [ripple, setRipple] = useState(false);

    // Calculate discount percentage
    const originalPrice = Math.round(product.price * 1.2);
    const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        setRipple(true);
        setTimeout(() => setRipple(false), 600);
        addToCartHandler(product, e);
    };

    return (
        <div
            className="group relative bg-white rounded-[24px] overflow-hidden border-2 border-pink-100 hover:border-pink-200 shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            {/* Image Container with Soft Pink Background */}
            <div className="relative aspect-square bg-gradient-to-br from-pink-50/80 via-rose-50/50 to-pink-100/30 overflow-hidden">
                <img
                    src={product.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500"}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply p-4 group-hover:scale-[1.08] transition-all duration-700 ease-out"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top Section - Badges & Wishlist */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                    <div className="flex flex-col gap-1.5">
                        {product.stock <= 0 ? (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                <Package size={9} />
                                Sold Out
                            </span>
                        ) : product.stock <= 5 ? (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-100 to-peach-100 text-orange-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                <TrendingUp size={9} />
                                {product.stock} Left
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                <Sparkles size={9} />
                                Available
                            </span>
                        )}
                        {discountPercent > 0 && (
                            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                💝 {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-pink-50 hover:scale-105 transition-all duration-300 group/heart border border-pink-100"
                    >
                        <Heart size={13} className="text-pink-300 group-hover/heart:text-pink-500 group-hover/heart:fill-pink-500 transition-all" />
                    </button>
                </div>

                {/* Rating Badge - Floating */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-pink-100 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-700">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow relative bg-gradient-to-b from-white to-pink-50/20">
                {/* Category */}
                <div className="mb-1.5 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-pink-400"></div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.12em]">{product.category}</p>
                </div>

                {/* Product Name */}
                <h3 className="text-[13px] font-bold text-gray-800 leading-tight mb-2 line-clamp-2 min-h-[34px]">
                    {product.name}
                </h3>

                {/* Stock Progress Bar */}
                {product.stock > 0 && product.stock <= 10 && (
                    <div className="mb-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-pink-50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${product.stock <= 3 ? 'bg-gradient-to-r from-orange-300 to-orange-400' :
                                    product.stock <= 5 ? 'bg-gradient-to-r from-yellow-300 to-orange-300' :
                                        'bg-gradient-to-r from-green-300 to-emerald-400'
                                    }`}
                                style={{ width: `${(product.stock / 10) * 100}%` }}
                            />
                        </div>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{product.stock}/10</span>
                    </div>
                )}

                {/* Price Section */}
                <div className="mt-auto pt-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-gray-400 font-semibold line-through">₹{originalPrice}</span>
                        {discountPercent > 0 && (
                            <span className="text-[8px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                Save ₹{originalPrice - product.price}
                            </span>
                        )}
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-[22px] font-black text-gray-800 leading-none">
                            ₹{product.price}
                        </span>
                    </div>
                </div>

                {/* Always Visible Add to Cart Button - Compact */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`relative mt-3 w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden
                        ${product.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : addedToCartId === product._id
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-300/40 scale-[0.98]'
                                : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    {/* Ripple Effect */}
                    {ripple && (
                        <span className="absolute inset-0 bg-white/30 rounded-xl animate-ping" />
                    )}

                    {/* Button Content */}
                    <div className="relative z-10 flex items-center gap-2">
                        {addedToCartId === product._id ? (
                            <>
                                <CheckCircle2 size={15} className="animate-bounce" />
                                <span className="font-black tracking-wide">Added!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={15} strokeWidth={2.5} />
                                <span className="font-black tracking-wide">Add to Cart</span>
                            </>
                        )}
                    </div>

                    {/* Shine Effect */}
                    {!addedToCartId && product.stock > 0 && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
