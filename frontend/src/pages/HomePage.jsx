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
    const [selectedGender, setSelectedGender] = useState('');

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
            result = result.filter(p => {
                if (selectedCategory === 'Night Wear') {
                    return p.category === 'Night Wear' || p.category === 'Night Dress' || p.category === 'NightWear';
                }
                return p.category === selectedCategory;
            });
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
        // Filter by gender
        if (selectedGender) {
            result = result.filter(p => p.gender === selectedGender);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, selectedSize, selectedAgeGroup, selectedGender, products]);

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    return (
        <div className="min-h-screen font-sans relative overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-1 top-0 right-0 opacity-50" />
            <div className="blob-2 bottom-0 left-0 opacity-30" />
            
            <HeroCarousel />

            {/* Filter Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="section-container mt-8 sm:mt-10 mb-8 relative z-10"
            >
                <div className="bg-white/80 backdrop-blur-3xl p-4 sm:p-5 rounded-[2rem] shadow-glow border border-rose-100/50 flex flex-wrap items-center justify-center lg:justify-between gap-3 lg:gap-4">
                    {/* Search Input */}
                    <div className="relative flex-grow lg:flex-grow-0 min-w-[200px] lg:w-[260px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400/70" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-11 pr-4 py-2.5 bg-rose-50/50 border border-rose-100 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Selector */}
                    <div className="flex-grow lg:flex-grow-0 min-w-[180px]">
                        <select
                            className="w-full bg-rose-50/50 px-4 py-2.5 rounded-xl border border-rose-100 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-rose-200 transition-all appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb7185'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Regular wear">Regular wear</option>
                            <option value="Infant Clothings">Infant Clothings</option>
                            <option value="New born Essentials">New born Essentials</option>
                            <option value="Towels">Towels</option>
                            <option value="Night Wear">Night Wear</option>
                            <option value="Casual">Casual</option>
                            <option value="Frock">Frock</option>
                        </select>
                    </div>

                    {/* Price Slider Section - More Compact */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-rose-50/30 rounded-xl border border-rose-50 min-w-[220px]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">Budget</span>
                            <span className="text-xs font-extrabold text-gray-700 whitespace-nowrap">₹{minPrice}-{maxPrice}</span>
                        </div>
                        <div className="flex-grow relative h-4 flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                                className="absolute w-full h-1 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-400"
                            />
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                                className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                    </div>

                    {/* Filter Selects Wrapper - Single Row on Large */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 flex-grow lg:flex-grow-0">
                        <select
                            className="flex-grow lg:w-[100px] bg-white px-3 py-2.5 rounded-xl border border-rose-100 text-xs font-bold text-gray-700 shadow-sm outline-none cursor-pointer"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                        >
                            <option value="">Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="1-2">1-2</option>
                            <option value="2-3">2-3</option>
                            <option value="3-4">3-4</option>
                        </select>

                        <select
                            className="flex-grow lg:w-[100px] bg-white px-3 py-2.5 rounded-xl border border-rose-100 text-xs font-bold text-gray-700 shadow-sm outline-none cursor-pointer"
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                        >
                            <option value="">Gender</option>
                            <option value="Boy">Boy</option>
                            <option value="Girl">Girl</option>
                            <option value="Unisex">Unisex</option>
                        </select>

                        <select
                            className="flex-grow lg:w-[110px] bg-white px-3 py-2.5 rounded-xl border border-rose-100 text-xs font-bold text-gray-700 shadow-sm outline-none cursor-pointer"
                            value={selectedAgeGroup}
                            onChange={(e) => setSelectedAgeGroup(e.target.value)}
                        >
                            <option value="">Age Group</option>
                            <option value="0-6 Months">0-6M</option>
                            <option value="6-12 Months">6-12M</option>
                            <option value="1-2 Years">1-2Y</option>
                            <option value="2-3 Years">2-3Y</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Shop by Category Visuals */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="section-container mb-16 relative z-10"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-2 block">Top Categories</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Shop by Collections</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                    {[
                        { name: 'Regular wear', img: '' },
                        { name: 'Infant Clothings', img: '/Images/pampers/10.jpg' },
                        { name: 'New born Essentials', img: '' },
                        { name: 'Night Wear', img: '/Images/nightdresses/11.jpg' },
                        { name: 'Towels', img: '' }
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
                transition={{ duration: 0.6, delay: 0.2 }}
                className="section-container pb-16 sm:pb-24 relative z-10"
            >
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-2 block">Handpicked</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Featured Products</h2>
                    </div>
                </div>
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
                            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setMinPrice(0); setMaxPrice(5000); setSelectedSize(''); setSelectedAgeGroup(''); setSelectedGender(''); }}
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
