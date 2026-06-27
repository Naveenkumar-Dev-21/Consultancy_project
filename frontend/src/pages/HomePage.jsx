import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroCarousel from '../components/common/HeroCarousel';
import MarqueeBanner from '../components/common/MarqueeBanner';
import ProductCard from '../components/common/ProductCard';
import { getFullUrl } from '../utils/urlUtils';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [addedToCartId, setAddedToCartId] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');

    // Sync state with URL
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory('All');
    }, [searchParams]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setSelectedSubCategory('');
        if (cat === 'All') searchParams.delete('category');
        else searchParams.set('category', cat);
        setSearchParams(searchParams);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/products');
                const productsData = Array.isArray(data) ? data : [];
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setAllCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        let result = Array.isArray(products) ? products : [];
        if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedCategory !== 'All') {
            result = result.filter(p => {
                if (selectedCategory === 'Night Wear') {
                    return p.category === 'Night Wear' || p.category === 'Night Dress' || p.category === 'NightWear';
                }
                return p.category === selectedCategory;
            });
        }
        result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
        if (selectedAgeGroup) {
            result = result.filter(p =>
                Array.isArray(p.ageGroup)
                    ? p.ageGroup.some(a => (typeof a === 'object' ? a.ageGroup : a) === selectedAgeGroup)
                    : p.ageGroup === selectedAgeGroup
            );
        }
        if (selectedGender) result = result.filter(p => p.gender === selectedGender);
        if (selectedSubCategory) result = result.filter(p => p.subCategory === selectedSubCategory);
        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, selectedAgeGroup, selectedGender, selectedSubCategory, products]);

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const currentCategorySubCategories = selectedCategory !== 'All'
        ? (allCategories.find(c => c.name === selectedCategory)?.subCategories || [])
        : [];

    const hasActiveFilters = searchTerm || selectedCategory !== 'All' || minPrice > 0 || maxPrice < 5000 || selectedAgeGroup || selectedGender || selectedSubCategory;

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setMinPrice(0);
        setMaxPrice(5000);
        setSelectedAgeGroup('');
        setSelectedGender('');
        setSelectedSubCategory('');
        searchParams.delete('category');
        setSearchParams(searchParams);
    };

    // Card stagger variants
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } }
    };

    // Skeleton cards for loading
    const SkeletonCard = () => (
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-charcoal-800 border border-rose-100/40 dark:border-charcoal-700 shadow-card">
            <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-pink-50 dark:from-charcoal-700 dark:to-charcoal-800 relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="p-4 space-y-2.5">
                <div className="h-3 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-1/4" />
                <div className="h-4 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-3/4" />
                <div className="h-3 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-1/2" />
                <div className="h-5 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-1/3 mt-2" />
            </div>
        </div>
    );

    const selectClass = "clay-input px-4 py-2.5 rounded-full text-xs font-black text-gray-700 dark:text-gray-300 cursor-pointer appearance-none";

    return (
        <div className="min-h-screen font-sans relative overflow-hidden">
            <Helmet>
                <title>Aadhiran Kids Collections | Premium Kids Wear</title>
                <meta name="description" content="Shop the finest and most comfortable kids clothing at Aadhiran Kids Collections. Explore our exclusive collections of Night Wear, Infant Clothing, and more." />
            </Helmet>

            <HeroCarousel />
            <MarqueeBanner />

            {/* ─── Filter Bar ─── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="section-container mt-8 sm:mt-10 mb-8 relative z-10"
            >
                <div className="glass-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-grow min-w-[200px] lg:max-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400/60" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="clay-input !pl-11 pr-4 py-2.5 text-xs font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Pills (Desktop) */}
                    <div className="hidden lg:flex items-center gap-2 flex-wrap">
                        {['All', ...(Array.isArray(allCategories) ? allCategories.map(c => c.name) : [])].map(cat => (
                            <motion.button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                whileTap={{ scale: 0.94 }}
                                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_4px_10px_rgba(244,63,94,0.3),inset_-3px_-3px_6px_rgba(0,0,0,0.15),inset_3px_3px_6px_rgba(255,255,255,0.2)]'
                                        : 'bg-white dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/5 hover:text-rose-500'
                                }`}
                            >
                                {cat === 'All' ? 'All Categories' : cat}
                            </motion.button>
                        ))}
                    </div>

                    {/* Category Select (Mobile) */}
                    <div className="flex-grow lg:hidden min-w-[150px]">
                        <select
                            className={selectClass + " w-full"}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb7185'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {Array.isArray(allCategories) && allCategories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* More Filters Toggle */}
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={clearAllFilters}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                            >
                                <X size={12} /> Clear
                            </motion.button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-2xl transition-all border ${showFilters ? 'bg-rose-500 text-white border-transparent' : 'bg-white/60 dark:bg-charcoal-700/60 text-gray-500 dark:text-gray-400 border-rose-100/40 dark:border-charcoal-600 hover:text-rose-500'}`}
                        >
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* Expandable Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="glass-card mt-3 p-4 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-4">
                                {/* Price Slider */}
                                <div className="flex items-center gap-3 px-4 py-2.5 clay-input rounded-[20px] min-w-[220px]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">Budget</span>
                                        <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 whitespace-nowrap">₹{minPrice} – ₹{maxPrice}</span>
                                    </div>
                                    <div className="flex-grow relative h-4 flex items-center">
                                        <input
                                            type="range" min="0" max="5000" step="100"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                                            className="absolute w-full h-1 bg-rose-100 dark:bg-charcoal-600 rounded-lg appearance-none cursor-pointer accent-rose-400"
                                        />
                                        <input
                                            type="range" min="0" max="5000" step="100"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                                            className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <select className={selectClass} value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
                                    <option value="">Gender</option>
                                    <option value="Boy">Boy</option>
                                    <option value="Girl">Girl</option>
                                    <option value="Unisex">Unisex</option>
                                </select>

                                {/* Age Group */}
                                <select className={selectClass} value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)}>
                                    <option value="">Age Group</option>
                                    <option value="0-3M">0-3M</option>
                                    <option value="3-6M">3-6M</option>
                                    <option value="6-9M">6-9M</option>
                                    <option value="9-12M">9-12M</option>
                                    <option value="12-18M">12-18M</option>
                                    <option value="1-2Y">1-2Y</option>
                                    <option value="2-3Y">2-3Y</option>
                                    <option value="3-4Y">3-4Y</option>
                                    <option value="4-5Y">4-5Y</option>
                                    <option value="5-6Y">5-6Y</option>
                                    <option value="7-8Y">7-8Y</option>
                                    <option value="9-10Y">9-10Y</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ─── Subcategory Filter Chips ─── */}
            {currentCategorySubCategories.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="section-container -mt-4 mb-6 relative z-10"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">Sub-category:</span>
                        {['', ...currentCategorySubCategories].map((sub) => (
                            <motion.button
                                key={sub || '__all__'}
                                onClick={() => setSelectedSubCategory(sub)}
                                whileTap={{ scale: 0.94 }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                                    selectedSubCategory === sub
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md shadow-rose-500/20'
                                        : 'bg-white/80 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 border-rose-100/40 dark:border-charcoal-600 hover:border-rose-300 dark:hover:border-rose-500/30 hover:text-rose-500'
                                }`}
                            >
                                {sub === '' ? 'All' : sub}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ─── Shop by Category ─── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="section-container mb-16 relative z-10"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-rose-400 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2 block">Top Categories</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Shop by Collections</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
                    {(Array.isArray(allCategories) && allCategories.length > 0 ? allCategories : [
                        { name: 'Regular wear', image: '/Images/Casuals/17.jpg' },
                        { name: 'Infant Clothings', image: '/Images/pampers/10.jpg' },
                        { name: 'New born Essentials', image: '/Images/pampers/16.jpg' },
                        { name: 'Night Wear', image: '/Images/nightdresses/11.jpg' },
                        { name: 'Towels', image: '/Images/pampers/17.jpg' }
                    ]).map((cat, idx) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                            onClick={() => handleCategoryChange(cat.name)}
                            whileHover={{ y: -6 }}
                            className={`group relative h-36 sm:h-44 md:h-48 clay-card p-2 cursor-pointer ${
                                selectedCategory === cat.name ? 'ring-3 ring-rose-400' : ''
                            }`}
                        >
                            <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                                <img
                                    src={getFullUrl(cat.image || cat.img)}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                                    <h3 className="text-sm sm:text-base font-bold leading-tight drop-shadow">{cat.name}</h3>
                                    <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">Shop Collection →</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ─── Product Grid ─── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="section-container pb-16 sm:pb-24 relative z-10"
            >
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-rose-400 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2 block flex items-center gap-1.5">
                            <Sparkles size={12} /> Handpicked
                        </span>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Featured Products</h2>
                            {!loading && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1 rounded-full"
                                >
                                    {filteredProducts.length} items
                                </motion.span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <motion.div
                        key={`${selectedCategory}-${selectedSubCategory}-${selectedAgeGroup}-${selectedGender}-${searchTerm}`}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                    >
                        <AnimatePresence>
                            {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
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

                {/* Empty State */}
                {!loading && (!Array.isArray(filteredProducts) || filteredProducts.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 sm:py-32 glass-card"
                    >
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft">
                            <Search className="text-rose-300 dark:text-rose-400" size={32} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
                        <p className="text-gray-400 dark:text-gray-500 mb-8 text-base">We couldn't find matches for your search.</p>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={clearAllFilters}
                            className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-base font-bold shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-shadow"
                        >
                            Clear All Filters
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default HomePage;
