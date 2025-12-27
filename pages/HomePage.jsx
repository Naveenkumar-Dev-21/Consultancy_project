import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Star, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroCarousel from '../components/HeroCarousel';

import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const navigate = useNavigate();
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
                const { data } = await axios.get('/api/products');
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

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, minPrice, maxPrice, products]);

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    return (
        <div className="bg-[#f5f5f7] min-h-screen font-sans">
            <HeroCarousel />

            {/* Filter Bar - Properly Aligned */}
            <div className="section-container mt-8 mb-8">
                <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-md border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Desktop Category Dropdown */}
                    <div className="hidden md:block">
                        <select
                            className="bg-pink-50 px-5 py-2.5 rounded-2xl border border-pink-100 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-pink-300"
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Cotton">Cotton Wear</option>
                            <option value="Muslin">Muslin Clothes</option>
                            <option value="Mixed">Mixed Fabric</option>
                            <option value="Winter">Winter Wear</option>
                            <option value="Baby Products">Baby Products</option>
                            <option value="Newborn">Newborn Essentials</option>
                            <option value="Toddler">Toddler Collection</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Toys">Toys & Play</option>
                            <option value="Feeding">Feeding Supplies</option>
                        </select>
                    </div>

                    {/* Mobile horizontal category list */}
                    <div className="flex md:hidden w-full overflow-x-auto gap-2 hide-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-pink-400 text-white shadow-md'
                                    : 'bg-pink-50 text-pink-600 border border-pink-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for baby clothes, toys..."
                            className="w-full pl-12 pr-4 py-2.5 bg-pink-50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none text-sm font-medium transition-all placeholder:text-pink-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Price Range Slider */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <label className="text-xs font-bold text-gray-600 px-1">Price Range: ₹{minPrice} - ₹{maxPrice}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                                className="w-24 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-400"
                            />
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                                className="w-24 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop by Category Visuals */}
            <div className="section-container mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900">Shop by Category</h2>
                    {/* Horizontal Scroll Helper Text */}
                    <span className="text-sm font-medium text-zinc-400 md:hidden">Swipe to see more &rarr;</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { name: 'Cotton', img: 'https://images.unsplash.com/photo-1519238263530-99bdd1123a43?auto=format&fit=crop&q=80&w=300' },
                        { name: 'Muslin', img: 'https://images.unsplash.com/photo-1522771753035-4a5046306063?auto=format&fit=crop&q=80&w=300' },
                        { name: 'Mixed', img: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=300' },
                        { name: 'Winter', img: 'https://images.unsplash.com/photo-1544126566-475a8971d86e?auto=format&fit=crop&q=80&w=300' },
                        // Changed last static category to 'Newborn' for variety or keep as is
                        { name: 'Baby Products', img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df4?auto=format&fit=crop&q=80&w=300' }
                    ].map((cat) => (
                        <div
                            key={cat.name}
                            onClick={() => handleCategoryChange(cat.name)}
                            className={`relative h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-md transition-all hover:-translate-y-1 ${selectedCategory === cat.name ? 'ring-4 ring-pink-400 ring-offset-2' : ''}`}
                        >
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-3 left-3">
                                <span className="text-white font-bold text-base">{cat.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Product Grid */}
            <div className="section-container pb-24">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-zinc-200 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
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
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-zinc-300" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 mb-2">No items found</h3>
                        <p className="text-zinc-400 mb-8">We couldn't find matches for your search.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setPriceRange('All'); }}
                            className="px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
