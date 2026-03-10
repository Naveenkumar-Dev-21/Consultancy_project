import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Star, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroCarousel from '../components/common/HeroCarousel';

import ProductCard from '../components/common/ProductCard';

const HomePage = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [addedToCartId, setAddedToCartId] = useState(null);


    const [searchParams, setSearchParams] = useSearchParams();

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('');

    // Sync state with URL
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory('All');
    }, [searchParams]);

    // Update URL when category changes
    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        if (cat === 'All') searchParams.delete('category');
        else searchParams.set('category', cat);
        setSearchParams(searchParams);
    };

    // Fetch Data
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/products');
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;

        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }
        // Filter by price range
        result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
        // Filter by size
        if (selectedSize) {
            result = result.filter(p => p.size === selectedSize);
        }
        // Filter by age group
        if (selectedAgeGroup) {
            result = result.filter(p => p.ageGroup === selectedAgeGroup);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, selectedSize, selectedAgeGroup, products]);

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    return (
        <div className="min-h-screen font-sans">
            <HeroCarousel />

            {/* Filter Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="section-container mt-8 sm:mt-10 mb-8"
            >
                <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-card border border-rose-100/60 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Desktop Category Dropdown */}
                    <div className="hidden md:block">
                        <select
                            className="bg-rose-50 px-5 py-3 rounded-xl border border-rose-200 text-base font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Night Wear">Night Wear</option>
                            <option value="Mixed">Mixed Fabric</option>
                            <option value="Infant Clothings">Infant Clothings</option>
                            <option value="Toddler">Frock</option>
                            <option value="Casual">Casual</option>
                        </select>
                    </div>

                    {/* Mobile horizontal category list */}
                    <div className="flex md:hidden w-full overflow-x-auto gap-2 hide-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                                    : 'bg-rose-50 text-rose-500 border border-rose-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for baby clothes, toys..."
                            className="w-full pl-12 pr-4 py-3 bg-rose-50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none text-base font-medium transition-all placeholder:text-rose-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Price Range Slider */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-sm font-bold text-gray-600 px-1">Price: ₹{minPrice} – ₹{maxPrice}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                                className="w-28 sm:w-32"
                            />
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                                className="w-28 sm:w-32"
                            />
                        </div>
                    </div>

                    {/* Size Filter */}
                    <select
                        className="bg-rose-50 px-4 py-3 rounded-xl border border-rose-200 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                    >
                        <option value="">All Sizes</option>
                        <option value="0-1 Year">0-1 Year</option>
                        <option value="1-2 Years">1-2 Years</option>
                        <option value="2-3 Years">2-3 Years</option>
                        <option value="3-4 Years">3-4 Years</option>
                        <option value="4-5 Years">4-5 Years</option>
                        <option value="5-6 Years">5-6 Years</option>
                        <option value="6-7 Years">6-7 Years</option>
                    </select>

                    {/* Age Group Filter */}
                    <select
                        className="bg-rose-50 px-4 py-3 rounded-xl border border-rose-200 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                        value={selectedAgeGroup}
                        onChange={(e) => setSelectedAgeGroup(e.target.value)}
                    >
                        <option value="">All Ages</option>
                        <option value="Newborn">Newborn</option>
                        <option value="Infant">Infant</option>
                        <option value="Toddler">Toddler</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>
            </motion.div>

            {/* Shop by Category Visuals */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="section-container mb-12"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Collections</h2>
                    <span className="text-sm font-medium text-rose-400 md:hidden">Swipe &rarr;</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    {[
                        { name: 'Night Wear', img: '/Images/nightdresses /11.jpg' },
                        { name: 'Casual', img: '/Images/Casuals/07.jpg' },
                        { name: 'Frock', img: '/Images/frocks/01.jpg' },
                        { name: 'Mixed', img: '/Images/pampers/01.jpg' },
                        { name: 'Infant Clothings', img: '/Images/pampers/10.jpg' }
                    ].map((cat) => (
                        <div
                            key={cat.name}
                            onClick={() => handleCategoryChange(cat.name)}
                            className={`relative h-32 sm:h-36 md:h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-card transition-all hover:-translate-y-1 hover:shadow-glow ${selectedCategory === cat.name ? 'ring-4 ring-rose-400 ring-offset-2' : ''}`}
                        >
                            {cat.img ? (
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-colors" />
                            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                                <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">{cat.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>


            {/* Product Grid */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="section-container pb-16 sm:pb-24"
            >
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 sm:h-80 bg-rose-100/50 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                addToCartHandler={addToCartHandler}
                                addedToCartId={addedToCartId}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 sm:py-32 bg-white rounded-3xl border border-dashed border-rose-200">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-rose-300" size={32} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-400 mb-8 text-base">We couldn't find matches for your search.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setMinPrice(0); setMaxPrice(5000); setSelectedSize(''); setSelectedAgeGroup(''); }}
                            className="px-8 py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-base font-bold shadow-lg shadow-rose-500/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default HomePage;
