import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Star, X, Check, Minus, Plus, ZoomIn, ChevronLeft, ChevronRight, Heart, Shield, Truck, RotateCcw, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import api from '../services/api';
import { getFullUrl } from '../utils/urlUtils';

// ─── Lightbox ───────────────────────────────────────────────────────────────
const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onNavigate(-1);
            if (e.key === 'ArrowRight') onNavigate(1);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, onNavigate]);

    if (!images || images.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10 backdrop-blur-sm"
            >
                <X size={28} />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                        className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                        className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                        <ChevronRight size={28} />
                    </button>
                </>
            )}

            <motion.div
                className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
            >
                <img
                    src={getFullUrl(images[currentIndex])}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                />
            </motion.div>

            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); onNavigate(i - currentIndex); }}
                            className={`rounded-full transition-all ${i === currentIndex ? 'bg-white w-6 h-2' : 'bg-white/40 w-2 h-2'}`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// ─── Trust badges ────────────────────────────────────────────────────────────
const trustItems = [
    { icon: Truck, label: 'Free Shipping', sub: 'On orders over ₹2000' },
    { icon: Star, label: 'Premium Quality', sub: 'Bio-washed & Durable' },
    { icon: Shield, label: 'Safe for Babies', sub: 'Hypoallergenic & tested' },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
const CategoryProductDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(location.state?.product || null);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [heartPop, setHeartPop] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [addedToCartId, setAddedToCartId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    const fetchProduct = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const { data } = await api.get(`/api/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProduct(); }, [fetchProduct]);

    const fetchReviews = useCallback(async () => {
        if (!id) return;
        try {
            setReviewsLoading(true);
            const { data } = await api.get(`/api/reviews/${id}`);
            setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        } catch (error) {
            console.error("Error fetching reviews", error);
        } finally {
            setReviewsLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    useEffect(() => {
        const fetchSimilar = async () => {
            if (!id) return;
            try {
                const { data } = await api.get(`/api/products/${id}/similar`);
                setSimilarProducts(data);
            } catch (error) {
                console.error('Error fetching similar products', error);
            }
        };
        fetchSimilar();
    }, [id]);

    const productImages = product ? [product.image, ...(product.descriptionImages || [])].filter(Boolean) : [];

    // ─── Loading screen ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-rose-400 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400 animate-pulse">Loading product…</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-600">Product not found</p>
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold">
                    <ChevronLeft size={20} /> Back to Home
                </button>
            </div>
        );
    }

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
    const availableAgeGroups = product.ageGroup && product.ageGroup.length > 0 ? product.ageGroup : [];
    const normalizedAgeGroups = availableAgeGroups.map(a => typeof a === 'object' ? a : { ageGroup: a, price: product.price });
    
    // Find current price based on age group
    const currentPrice = selectedAgeGroup 
        ? (normalizedAgeGroups.find(a => a.ageGroup === selectedAgeGroup)?.price || product.price)
        : product.price;

    const wishlisted = isInWishlist(product._id);

    const addToCartHandler = () => {
        if (quantity > product.stock) return;
        
        if (availableAgeGroups.length > 0 && !selectedAgeGroup) {
            Swal.fire({
                title: 'Please Select an Age Group',
                text: 'You need to choose an age group before adding to cart',
                icon: 'warning',
                confirmButtonColor: '#fb7185',
                confirmButtonText: 'OK',
            });
            return;
        }

        if (availableSizes.length > 0 && !selectedSize) {
            Swal.fire({
                title: 'Please Select a Size',
                text: 'You need to choose a size before adding to cart',
                icon: 'warning',
                confirmButtonColor: '#fb7185',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        addToCart({ ...product, price: currentPrice, selectedSize, selectedAgeGroup, quantity });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const addToCartHandlerCard = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const handleWishlistToggle = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) { navigate('/login'); return; }
        setHeartPop(true);
        toggleWishlist(product._id);
        setTimeout(() => setHeartPop(false), 400);
    };

    const handleQuantityChange = (newQty) => {
        if (newQty < 1 || newQty > product.stock) return;
        setQuantity(newQty);
    };

    const getSpecifications = () => {
        const base = [
            { label: 'Hypoallergenic Materials' },
            { label: 'Machine Washable' },
            { label: 'Easy Care Instructions' },
        ];
        const categorySpecs = {
            'Cotton': [{ label: 'GOTS Certified Organic' }, { label: '100% Pure Cotton' }, { label: 'Breathable Fabric' }],
            'Muslin': [{ label: 'Premium Muslin Weave' }, { label: 'Ultra-Soft Texture' }, { label: 'Lightweight & Airy' }],
            'Night Wear': [{ label: 'Sleep-Safe Design' }, { label: 'Extra Soft Finish' }, { label: 'Comfortable Fit' }],
            'Infant Clothings': [{ label: 'Extra Gentle Fabric' }, { label: 'Newborn Safe' }, { label: 'Soft Touch' }],
            'Casual': [{ label: 'Everyday Comfort' }, { label: 'Durable Fabric' }, { label: 'Easy Movement' }],
        };
        return [...(categorySpecs[product.category] || base), ...base];
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Back button — floating */}
            <motion.button
                onClick={() => navigate(-1)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-20 left-4 z-40 bg-white/90 backdrop-blur-lg p-2.5 hover:bg-rose-50 transition-all shadow-card rounded-full border border-rose-100/60 hover:border-rose-300 group"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
            >
                <ChevronLeft size={20} className="text-gray-600 group-hover:text-rose-500 transition-colors" />
            </motion.button>

            {/* ─── Hero Product Section ─────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-14 lg:gap-16">

                    {/* ── LEFT: Image Gallery ── */}
                    <motion.div
                        className="space-y-3 sm:space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Main Image */}
                        <div
                            className="relative bg-gradient-to-br from-rose-50 to-pink-50 aspect-[3/4] overflow-hidden rounded-3xl cursor-zoom-in group border border-rose-100/40 shadow-card"
                            onClick={() => setLightboxOpen(true)}
                        >
                            <motion.img
                                key={selectedImage}
                                src={getFullUrl(productImages[selectedImage])}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.03 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.45 }}
                            />

                            {/* Hover zoom hint */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4"
                            >
                                <div className="bg-white/90 backdrop-blur-sm text-rose-500 p-2.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold">
                                    <ZoomIn size={16} />
                                    View Full
                                </div>
                            </motion.div>

                            {/* Sold out badge */}
                            {product.stock <= 0 && (
                                <div className="absolute top-4 left-4 bg-gray-900/90 text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs backdrop-blur-sm">
                                    Sold Out
                                </div>
                            )}

                            {/* Discount badge on image */}
                            {hasDiscount && (
                                <div className="absolute top-4 right-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-lg">
                                    {discountPercent}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className={`grid gap-2.5 sm:gap-3 ${productImages.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
                                {productImages.map((img, idx) => (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.93 }}
                                        className={`bg-rose-50/50 aspect-square overflow-hidden border-2 transition-all rounded-2xl ${
                                            selectedImage === idx
                                                ? 'border-rose-400 ring-2 ring-rose-200 shadow-glow'
                                                : 'border-transparent hover:border-rose-200'
                                        }`}
                                    >
                                        <img src={getFullUrl(img)} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* ── RIGHT: Product Info ── */}
                    <motion.div
                        className="space-y-6 lg:py-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="bg-rose-50 text-rose-500 font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-rose-100">
                                {product.category || 'Collection'}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="bg-pink-50 text-pink-500 font-bold text-xs px-3 py-1.5 rounded-full border border-pink-100">New Arrival</span>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-3">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{product.numReviews || 0} reviews</span>
                                {product.numReviews > 10 && (
                                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Bestseller</span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-500 leading-relaxed text-base border-l-4 border-rose-100 pl-4">
                            {product.description || `Premium quality ${product.category?.toLowerCase() || 'baby'} wear crafted with care. Gentle on delicate skin, perfect for everyday comfort.`}
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-4 py-4 border-y border-rose-50">
                            <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">₹{currentPrice}</span>
                            {hasDiscount && (
                                <div className="flex flex-col">
                                    <span className="text-lg text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
                                    <span className="text-xs text-green-600 font-bold">You save ₹{product.originalPrice - currentPrice}</span>
                                </div>
                            )}
                        </div>

                        {/* Age Group Selector */}
                        {normalizedAgeGroups.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider">Select Age Group</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {normalizedAgeGroups.map((a) => (
                                        <motion.button
                                            key={a.ageGroup}
                                            onClick={() => setSelectedAgeGroup(a.ageGroup)}
                                            whileHover={{ scale: 1.06 }}
                                            whileTap={{ scale: 0.93 }}
                                            className={`min-w-[4rem] py-3 px-4 text-sm font-bold border-2 transition-all rounded-2xl ${
                                                selectedAgeGroup === a.ageGroup
                                                    ? 'bg-gradient-to-br from-violet-400 to-indigo-500 text-white border-violet-400 shadow-glow'
                                                    : 'bg-white text-gray-700 border-violet-100 hover:border-violet-300 hover:bg-violet-50'
                                            }`}
                                        >
                                            {a.ageGroup}
                                        </motion.button>
                                    ))}
                                </div>
                                {normalizedAgeGroups.length > 0 && !selectedAgeGroup && (
                                    <p className="text-xs text-violet-400 mt-2 font-medium">← Please select an age group to see the specific price</p>
                                )}
                            </div>
                        )}

                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-black text-gray-900 uppercase tracking-wider">Select Size</label>
                                    <button className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1">
                                        <Tag size={12} /> Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((size) => (
                                        <motion.button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            whileHover={{ scale: 1.06 }}
                                            whileTap={{ scale: 0.93 }}
                                            className={`min-w-[3.5rem] py-3 px-4 text-sm font-bold border-2 transition-all rounded-2xl ${
                                                selectedSize === size
                                                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white border-rose-400 shadow-glow'
                                                    : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300 hover:bg-rose-50'
                                            }`}
                                        >
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                                {availableSizes.length > 0 && !selectedSize && (
                                    <p className="text-xs text-rose-400 mt-2 font-medium">← Please select a size to continue</p>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-wider">Quantity</label>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                    product.stock > 10 ? 'bg-green-50 text-green-600 border border-green-100'
                                    : product.stock > 0 ? 'bg-orange-50 text-orange-500 border border-orange-100'
                                    : 'bg-red-50 text-red-500 border border-red-100'
                                }`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 bg-rose-50/40 rounded-2xl p-1 w-fit border border-rose-100">
                                <motion.button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                    whileTap={{ scale: 0.88 }}
                                    className="w-11 h-11 bg-white flex items-center justify-center rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Minus size={16} className="text-rose-500" />
                                </motion.button>
                                <span className="w-10 text-center font-black text-lg text-gray-900">{quantity}</span>
                                <motion.button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= product.stock}
                                    whileTap={{ scale: 0.88 }}
                                    className="w-11 h-11 bg-white flex items-center justify-center rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} className="text-rose-500" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Low stock warning */}
                        {product.stock > 0 && product.stock <= 5 && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 bg-orange-50 text-orange-600 text-sm font-bold px-4 py-3 rounded-2xl border border-orange-200"
                            >
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                                Only {product.stock} left — order soon!
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                onClick={addToCartHandler}
                                disabled={product.stock === 0}
                                whileHover={product.stock > 0 ? { scale: 1.02 } : {}}
                                whileTap={product.stock > 0 ? { scale: 0.96 } : {}}
                                className={`flex-1 py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-2xl shadow-xl ${
                                    product.stock === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        : addedToCart
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                            : 'bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 text-white shadow-rose-500/30 shimmer-btn'
                                }`}
                            >
                                <AnimatePresence mode="wait">
                                    {addedToCart ? (
                                        <motion.span key="added" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                            <Check size={20} /> Added to Cart!
                                        </motion.span>
                                    ) : (
                                        <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                            <ShoppingCart size={20} />
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Wishlist button */}
                            <motion.button
                                onClick={handleWishlistToggle}
                                whileTap={{ scale: 0.85 }}
                                className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${
                                    wishlisted
                                        ? 'bg-rose-50 border-rose-400 shadow-glow'
                                        : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                                }`}
                            >
                                <motion.div
                                    animate={heartPop ? { scale: [1, 1.6, 0.85, 1], rotate: [0, -15, 10, 0] } : { scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Heart size={22} className={wishlisted ? 'text-rose-500 fill-rose-500' : 'text-rose-400'} />
                                </motion.div>
                            </motion.button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            {trustItems.map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="flex flex-col items-center gap-1.5 bg-rose-50/50 rounded-2xl p-3 border border-rose-100/60 text-center">
                                    <Icon size={18} className="text-rose-400" />
                                    <p className="text-xs font-black text-gray-800 leading-tight">{label}</p>
                                    <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Specs highlights */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-50">
                            {getSpecifications().slice(0, 4).map((spec, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100 flex-shrink-0">
                                        <Check size={11} className="text-green-500" />
                                    </div>
                                    {spec.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <ImageLightbox
                        images={productImages}
                        currentIndex={selectedImage}
                        onClose={() => setLightboxOpen(false)}
                        onNavigate={(delta) => {
                            setSelectedImage((selectedImage + delta + productImages.length) % productImages.length);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ─── Details & Reviews Tabs ─────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 pb-12 border-t border-rose-100/60 mt-4">
                {/* Tab buttons */}
                <div className="flex gap-1 mb-10 bg-rose-50/50 p-1.5 rounded-2xl w-fit mt-10 border border-rose-100/60">
                    {['details', 'reviews'].map((tab) => (
                        <motion.button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            whileTap={{ scale: 0.95 }}
                            className={`relative px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                                activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-card'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab === 'reviews' ? (
                                <span className="flex items-center gap-2">
                                    Reviews
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'reviews' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-400'}`}>
                                        {reviews.length}
                                    </span>
                                </span>
                            ) : 'Description'}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'details' ? (
                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Specs */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">Product Specifications</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {getSpecifications().map((spec, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50/60 to-pink-50/40 rounded-2xl border border-rose-100/50 hover:border-rose-200 transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-green-100 flex-shrink-0">
                                                    <Check size={16} className="text-green-500" />
                                                </div>
                                                <span className="font-semibold text-gray-700">{spec.label}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Care Instructions */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">Care Instructions</h3>
                                    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 rounded-3xl border border-rose-100/60 p-6 space-y-4">
                                        <p className="text-gray-600 leading-relaxed font-medium">
                                            To maintain the quality and softness of this garment:
                                        </p>
                                        <ul className="space-y-3">
                                            {[
                                                'Machine wash cold on gentle cycle with like colors.',
                                                'Use mild detergent — no bleach.',
                                                'Tumble dry low or line dry in shade.',
                                                'Warm iron if needed; avoid ironing over prints.',
                                            ].map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-rose-200 text-rose-400 font-black text-[10px] flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-8">
                                    <ReviewList reviews={reviews} />
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24">
                                        <ReviewForm
                                            productId={id}
                                            onReviewAdded={(newReview) => {
                                                setReviews([newReview, ...reviews]);
                                                fetchProduct();
                                            }}
                                            existingReviews={reviews}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ─── Similar Products ──────────────────────────────────────── */}
            {similarProducts.length > 0 && (
                <div className="bg-gradient-to-b from-white to-rose-50/40 border-t border-rose-100">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <span className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-2 block">Curated for You</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">You May Also Like</h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.94 }}
                                className="bg-white text-rose-500 px-6 py-2.5 rounded-full text-sm font-bold border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                ↑ Back to Top
                            </motion.button>
                        </div>
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ staggerChildren: 0.06 }}
                        >
                            {Array.isArray(similarProducts) && similarProducts.map((p) => (
                                <ProductCard
                                    key={p._id}
                                    product={p}
                                    addToCartHandler={addToCartHandlerCard}
                                    addedToCartId={addedToCartId}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryProductDetailPage;
