import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { getFullUrl } from '../utils/urlUtils';

const FALLBACK_CATEGORIES = {
    'regular-wear': { name: 'Regular wear', subtitle: 'Everyday styles your little one will love', gradient: 'from-sky-400 via-blue-500 to-indigo-500' },
    'infant-clothings': { name: 'Infant Clothings', subtitle: 'Gentle on delicate newborn skin', gradient: 'from-rose-400 via-pink-500 to-fuchsia-500' },
    'new-born-essentials': { name: 'New born Essentials', subtitle: 'Everything you need from day one', gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
    'towels': { name: 'Towels', subtitle: 'Soft, absorbent & baby-safe', gradient: 'from-amber-400 via-orange-500 to-yellow-500' },
    'nightwear': { name: 'Night Wear', subtitle: 'Cozy sleepwear for peaceful nights', gradient: 'from-violet-400 via-purple-500 to-pink-500' },
};

const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [addedToCartId, setAddedToCartId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            setCategoryLoading(true);
            try {
                const { data: categories } = await api.get('/api/categories');
                const matchedCategory = Array.isArray(categories) ? categories.find(c => c.slug === slug) : null;

                if (matchedCategory) {
                    setCategory(matchedCategory);
                } else if (FALLBACK_CATEGORIES[slug]) {
                    setCategory(FALLBACK_CATEGORIES[slug]);
                } else {
                    setCategory({ name: slug.replace(/-/g, ' '), subtitle: 'Browse our collection', gradient: 'from-rose-400 via-pink-500 to-fuchsia-500' });
                }

                setLoading(true);
                const { data: productsData } = await api.get('/api/products');
                const categoryName = matchedCategory ? matchedCategory.name : (FALLBACK_CATEGORIES[slug]?.name || slug.replace(/-/g, ' '));
                const filtered = Array.isArray(productsData) ? productsData.filter(p =>
                    p.category === categoryName ||
                    (slug === 'nightwear' && ['Night Wear', 'Night Dress'].includes(p.category))
                ) : [];
                setProducts(filtered);
                setSelectedSubCategory('');
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
                setCategoryLoading(false);
            }
        };
        fetchCategoryAndProducts();
    }, [slug]);

    if (categoryLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-rose-400 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-gray-400 animate-pulse">Loading collection…</p>
                </div>
            </div>
        );
    }

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const subCategories = category?.subCategories || [];
    const displayedProducts = selectedSubCategory
        ? products.filter(p => p.subCategory === selectedSubCategory)
        : products;

    const gradient = category?.gradient || 'from-rose-400 via-pink-500 to-fuchsia-500';

    const cardVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute top-0 inset-x-0 h-[520px] overflow-hidden -z-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.08]`} />
                <div className="blob-1 -top-20 -right-20 opacity-30 blob-animated" />
                <div className="blob-2 top-40 -left-20 opacity-20 blob-animated-reverse" />
            </div>

            {/* ─── Hero / Category Header ─── */}
            <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
                {/* Category image background (if exists) */}
                {(category?.image || category?.Image) && (
                    <motion.div
                        className="absolute inset-0 opacity-20"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 8, ease: 'easeOut' }}
                    >
                        <img
                            src={getFullUrl(category.image || category.Image)}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}

                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-black/10 blur-2xl" />

                <div className="relative z-10 section-container pt-8 pb-14 sm:pt-12 sm:pb-20">
                    {/* Back button */}
                    <motion.button
                        onClick={() => navigate('/')}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-8 md:mb-10 transition-colors font-semibold text-sm group"
                    >
                        <span className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                            <ArrowLeft size={16} />
                        </span>
                        Back to Home
                    </motion.button>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-white/70" />
                            <span className="text-white/70 text-xs font-bold uppercase tracking-[0.25em]">Collection</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-none drop-shadow-lg">
                            {(category.name || '').split(' ').slice(0, 1).join(' ')}
                            <br />
                            <span className="text-white/80">{(category.name || '').split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-white/75 text-lg sm:text-xl font-medium max-w-lg">{category.subtitle}</p>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-center gap-4 mt-6 flex-wrap"
                    >
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                            <span className="text-white text-sm font-bold">{products.length} Products</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                            <span className="text-white text-sm font-bold">✨ Free Shipping</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                            <span className="text-white text-sm font-bold">💯 Pure Cotton</span>
                        </div>
                    </motion.div>

                    {/* Subcategory chips */}
                    {subCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            className="flex flex-wrap items-center gap-2 mt-7"
                        >
                            <div className="flex items-center gap-1.5 text-white/60 mr-2">
                                <SlidersHorizontal size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
                            </div>
                            {['', ...subCategories].map((sub) => (
                                <motion.button
                                    key={sub || '__all__'}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => setSelectedSubCategory(sub)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                                        selectedSubCategory === sub
                                            ? 'bg-white text-gray-900 border-white shadow-lg shadow-black/10'
                                            : 'bg-white/15 text-white border-white/30 hover:bg-white/25 backdrop-blur-sm'
                                    }`}
                                >
                                    {sub === '' ? 'All' : sub}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Bottom wave shape */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
                    <svg viewBox="0 0 1440 48" className="w-full" preserveAspectRatio="none" style={{ height: '48px' }}>
                        <path d="M0,48 L0,24 Q360,0 720,24 Q1080,48 1440,24 L1440,48 Z" fill="white" />
                    </svg>
                </div>
            </div>

            {/* ─── Product Grid ─── */}
            <div className="section-container py-12 sm:py-16 md:py-20 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-white border border-rose-100/60 shadow-card">
                                <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-pink-50 animate-pulse" />
                                <div className="p-4 space-y-2.5">
                                    <div className="h-4 bg-rose-50 rounded-lg animate-pulse w-3/4" />
                                    <div className="h-3 bg-rose-50 rounded-lg animate-pulse w-1/3" />
                                    <div className="h-10 bg-rose-50 rounded-xl animate-pulse mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-rose-50/40 rounded-3xl border border-dashed border-rose-200"
                    >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow border border-rose-100">
                            <Sparkles className="text-rose-300" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No products yet</h3>
                        <p className="text-gray-400 mb-6 text-base">
                            {selectedSubCategory
                                ? `No products in "${selectedSubCategory}" sub-category.`
                                : 'This collection is coming soon.'}
                        </p>
                        <div className="flex justify-center gap-3">
                            {selectedSubCategory && (
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => setSelectedSubCategory('')}
                                    className="px-6 py-2.5 border-2 border-rose-200 text-rose-500 rounded-full font-bold text-sm hover:bg-rose-50 transition-all"
                                >
                                    Show all
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => navigate('/')}
                                className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full font-bold text-sm shadow-lg shadow-rose-500/20"
                            >
                                Browse All
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`${slug}-${selectedSubCategory}`}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {displayedProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    addToCartHandler={addToCartHandler}
                                    addedToCartId={addedToCartId}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
