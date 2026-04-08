import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Star, X, Check, Minus, Plus, ZoomIn, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import api from '../services/api';
import { getFullUrl } from '../utils/urlUtils';

// Image Lightbox Component
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
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
                <X size={28} />
            </button>

            {images.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                        className="absolute left-2 sm:left-4 md:left-8 text-white/80 hover:text-white p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                        className="absolute right-2 sm:right-4 md:right-8 text-white/80 hover:text-white p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ChevronRight size={28} />
                    </button>
                </>
            )}

            <div 
                className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={getFullUrl(images[currentIndex])} 
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
            </div>

            {images.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

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
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
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

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Fetch product reviews
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

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Fetch similar products
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

    const productImages = product ? [
        product.image,
        ...(product.descriptionImages || [])
    ].filter(Boolean) : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-xl text-gray-600 mb-4">Product not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold text-base"
                >
                    <ChevronLeft size={20} />
                    Back to Home
                </button>
            </div>
        );
    }

    // Only use admin-set originalPrice, never fabricate one
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Use sizes from the product, fallback to empty
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];

    const addToCartHandler = () => {
        if (quantity > product.stock) return;
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
        addToCart({ ...product, selectedSize, quantity });
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
        if (!userInfo) {
            navigate('/login');
            return;
        }
        toggleWishlist(product._id);
    };

    const handleQuantityChange = (newQty) => {
        if (newQty < 1 || newQty > product.stock) return;
        setQuantity(newQty);
    };

    const getSpecifications = () => {
        const baseSpecs = [
            { label: 'Hypoallergenic Materials', value: true },
            { label: 'Machine Washable', value: true },
            { label: 'Easy Care Instructions', value: true },
        ];

        const categorySpecs = {
            'Cotton': [
                { label: 'GOTS Certified Organic', value: true },
                { label: '100% Pure Cotton', value: true },
                { label: 'Breathable Fabric', value: true },
            ],
            'Muslin': [
                { label: 'Premium Muslin Weave', value: true },
                { label: 'Ultra-Soft Texture', value: true },
                { label: 'Lightweight & Airy', value: true },
            ],
            'Winter': [
                { label: 'Thermal Insulation', value: true },
                { label: 'Windproof Layer', value: true },
                { label: 'Warm & Cozy', value: true },
            ],
            'Night Wear': [
                { label: 'Sleep-Safe Design', value: true },
                { label: 'Extra Soft Finish', value: true },
                { label: 'Comfortable Fit', value: true },
            ],
            'Formal': [
                { label: 'Premium Quality', value: true },
                { label: 'Elegant Design', value: true },
                { label: 'Perfect for Events', value: true },
            ],
            'Beach Wear': [
                { label: 'UV Protection', value: true },
                { label: 'Quick-Dry Fabric', value: true },
                { label: 'Chlorine Resistant', value: true },
            ],
            'Casual': [
                { label: 'Everyday Comfort', value: true },
                { label: 'Durable Fabric', value: true },
                { label: 'Easy Movement', value: true },
            ],
            'Frock': [
                { label: 'Beautiful Design', value: true },
                { label: 'Comfortable Fit', value: true },
                { label: 'Party Ready', value: true },
            ],
            'Mixed': [
                { label: 'Versatile Wear', value: true },
                { label: 'Quality Blend', value: true },
                { label: 'All-Season Comfort', value: true },
            ],
            'Infant Clothings': [
                { label: 'Extra Gentle Fabric', value: true },
                { label: 'Newborn Safe', value: true },
                { label: 'Soft Touch', value: true },
            ],
        };

        return [...(categorySpecs[product.category] || baseSpecs), ...baseSpecs];
    };

    return (
        <div className="min-h-screen">
            {/* Close Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-lg p-2.5 hover:bg-rose-50 transition-colors shadow-soft rounded-full border border-rose-100/60"
            >
                <X size={20} className="text-gray-600" />
            </button>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
                    {/* Left: Image Gallery */}
                    <div className="space-y-3 sm:space-y-4">
                        <div 
                            className="bg-rose-50/50 aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl relative cursor-zoom-in group border border-rose-100/60"
                            onClick={() => setLightboxOpen(true)}
                        >
                            <img
                                src={getFullUrl(productImages[selectedImage])}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.stock <= 0 && (
                                <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm">
                                    Sold Out
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 bg-white/90 text-rose-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <ZoomIn size={20} />
                            </div>
                        </div>

                        {productImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`bg-rose-50/50 aspect-square overflow-hidden border-2 transition-all rounded-xl ${selectedImage === idx ? 'border-rose-400 ring-2 ring-rose-200' : 'border-transparent hover:border-rose-200'}`}
                                    >
                                        <img src={getFullUrl(img)} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-5 sm:space-y-6">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-rose-400 font-bold uppercase tracking-wider text-xs">
                                {product.category || 'LITTLE ONES'} COLLECTION
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-pink-500 font-bold text-xs">New Arrival</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {product.ageGroup && (Array.isArray(product.ageGroup) ? product.ageGroup.length > 0 : true) && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Age Group:</span>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(product.ageGroup) ? product.ageGroup : [product.ageGroup]).map((ag, i) => (
                                        <span key={i} className="bg-rose-50 text-rose-500 px-3 py-1 text-sm font-bold rounded-full border border-rose-200">
                                            {ag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                                    />
                                ))}
                            </div>
                            <span className="text-sm sm:text-base text-gray-500">{product.numReviews || 0} reviews</span>
                        </div>

                        <p className="text-gray-500 leading-relaxed text-base">
                            {product.description || `Premium quality ${product.category?.toLowerCase() || 'baby'} wear crafted with care. Gentle on delicate skin, perfect for everyday comfort and special occasions.`}
                        </p>

                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹{product.price}</span>
                            {hasDiscount && (
                                <>
                                    <span className="text-lg sm:text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                                    <span className="bg-green-50 text-green-600 px-3 py-1 text-sm font-bold rounded-full border border-green-200">
                                        {discountPercent}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm sm:text-base font-bold text-gray-900">Select Size</label>
                                <button className="text-sm text-rose-500 hover:underline font-medium">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 text-sm font-bold border-2 transition-all rounded-xl ${selectedSize === size
                                            ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                                            : 'bg-white text-gray-700 border-rose-200 hover:border-rose-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Quantity Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm sm:text-base font-bold text-gray-900">Quantity</label>
                                <span className={`text-sm font-bold ${product.stock > 10 ? 'text-green-500' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                    className="w-11 h-11 border-2 border-rose-200 flex items-center justify-center hover:border-rose-400 hover:bg-rose-50 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Minus size={16} className="text-rose-500" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= product.stock}
                                    className="w-11 h-11 border-2 border-rose-200 flex items-center justify-center hover:border-rose-400 hover:bg-rose-50 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} className="text-rose-500" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={addToCartHandler}
                                disabled={product.stock === 0}
                                className={`flex-1 py-4 font-bold text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all rounded-xl ${product.stock === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : addedToCart
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                        : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600 shadow-lg shadow-rose-500/20 active:scale-[0.98]'
                                    }`}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check size={20} />
                                        ADDED TO CART
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleWishlistToggle}
                                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all ${isInWishlist(product._id) ? 'bg-rose-50 border-rose-400' : 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'}`}
                            >
                                <Heart
                                    size={22}
                                    className={isInWishlist(product._id) ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}
                                />
                            </button>
                        </div>

                        {/* Stock Warning */}
                        {product.stock > 0 && product.stock <= 5 && (
                            <p className="text-orange-600 text-sm font-bold bg-orange-50 px-4 py-3 rounded-xl border border-orange-200">
                                ⚠️ Only {product.stock} left in stock - order soon!
                            </p>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-6 border-t border-rose-100">
                            {getSpecifications().map((spec, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">{spec.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Shipping & Returns */}
                        <div className="space-y-2.5 pt-4 border-t border-rose-100 text-sm sm:text-base text-gray-500">
                            <p>✨ Free shipping on orders over ₹2000</p>
                            <p>🔄 Easy returns within 30 days</p>
                            <p className="text-green-600 font-semibold">🌿 Ethically made with care</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <ImageLightbox 
                    images={productImages}
                    currentIndex={selectedImage}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={(delta) => {
                        const newIndex = (selectedImage + delta + productImages.length) % productImages.length;
                        setSelectedImage(newIndex);
                    }}
                />
            )}

            {/* Product Details & Reviews Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-12 border-t border-rose-100">
                <div className="flex gap-8 mb-10 border-b border-rose-100 pb-px">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`pb-4 text-base font-bold uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-gray-900 border-b-2 border-rose-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Description
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 text-base font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'reviews' ? 'text-gray-900 border-b-2 border-rose-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Reviews
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'reviews' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-400'}`}>
                            {reviews.length}
                        </span>
                    </button>
                </div>

                <div className="animate-fade-in">
                    {activeTab === 'details' ? (
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Product Specifications</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {getSpecifications().map((spec, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-rose-50/30 rounded-2xl border border-rose-100/60">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Check size={16} className="text-green-500" />
                                            </div>
                                            <span className="font-medium text-gray-700">{spec.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-900">Care Instructions</h3>
                                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100/60 space-y-4">
                                    <p className="text-gray-600 leading-relaxed">
                                        To maintain the quality and softness of this garment, we recommend:
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                            Machine wash cold on gentle cycle with like colors.
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                            Use mild detergent, no bleach.
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                            Tumble dry low or line dry in shade.
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                            Warm iron if needed, avoid ironing over prints or embroidery.
                                        </li>
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
                                            fetchProduct(); // Refresh product rating/count
                                        }}
                                        existingReviews={reviews}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Products / You May Also Like */}
            {similarProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-20 border-t border-rose-100">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-2 block">Curation</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">You May Also Like</h2>
                        </div>
                        <button 
                            className="bg-rose-50 text-rose-500 px-6 py-2.5 rounded-full text-sm font-bold border border-rose-100/60 hover:bg-rose-100 transition-colors"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            Back to Top
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                        {Array.isArray(similarProducts) && similarProducts.map((p) => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                addToCartHandler={addToCartHandlerCard}
                                addedToCartId={addedToCartId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryProductDetailPage;
