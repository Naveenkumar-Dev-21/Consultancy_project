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
    const [priceRange, setPriceRange] = useState('All');

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
        if (priceRange !== 'All') {
            if (priceRange === 'Under 500') result = result.filter(p => p.price < 500);
            else if (priceRange === '500-1000') result = result.filter(p => p.price >= 500 && p.price <= 1000);
            else if (priceRange === '1000+') result = result.filter(p => p.price > 1000);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, priceRange, products]);

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

            {/* Shop by Category Visuals */}
            <div className="section-container mb-16 mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-zinc-900">Shop by Category</h2>
                    {/* Horizontal Scroll Helper Text */}
                    <span className="text-sm font-medium text-zinc-400 md:hidden">Swipe to see more &rarr;</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                            className={`relative h-44 rounded-3xl overflow-hidden cursor-pointer group shadow-lg transition-all hover:-translate-y-1 ${selectedCategory === cat.name ? 'ring-4 ring-beelittle-coral ring-offset-2' : ''}`}
                        >
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-4 left-4">
                                <span className="text-white font-bold text-lg">{cat.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="section-container mb-12 sticky top-20 z-30">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-white/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Mobile horizontal category list */}
                    <div className="flex md:hidden w-full overflow-x-auto gap-2 hide-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-zinc-100 text-zinc-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for clothes, toys..."
                            className="w-full pl-12 pr-4 py-3 bg-zinc-100/50 border-none rounded-2xl focus:ring-2 focus:ring-beelittle-coral/50 outline-none text-sm font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            className="bg-zinc-100/50 px-6 py-3 rounded-2xl border-none text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full md:w-auto"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                        >
                            <option value="All">All Prices</option>
                            <option value="Under 500">Under ₹500</option>
                            <option value="500-1000">₹500 - ₹1000</option>
                            <option value="1000+">Above ₹1000</option>
                        </select>
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
