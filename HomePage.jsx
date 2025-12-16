import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Filter, X, ChevronRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState('All');
    const [selectedAge, setSelectedAge] = useState('All');

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Cart Animation
    const [addedIds, setAddedIds] = useState({});

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
        if (selectedAge !== 'All') {
            result = result.filter(p => p.ageGroup === selectedAge);
        }
        if (priceRange !== 'All') {
            if (priceRange === 'Under 500') result = result.filter(p => p.price < 500);
            else if (priceRange === '500-1000') result = result.filter(p => p.price >= 500 && p.price <= 1000);
            else if (priceRange === '1000+') result = result.filter(p => p.price > 1000);
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, priceRange, selectedAge, products]);

    // Derived Lists for Dropdowns
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const ageGroups = ['All', '0-6 Months', '6-12 Months', '1-2 Years', '2-4 Years', '4+ Years'];

    const addToCartHandler = (product, e) => {
        e.stopPropagation(); // Prevent modal opening
        setAddedIds(prev => ({ ...prev, [product._id]: true }));
        setTimeout(() => {
            setAddedIds(prev => ({ ...prev, [product._id]: false }));
        }, 2000);

        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const existingItem = cartItems.find(x => x.product === product._id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cartItems.push({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: 1
            });
        }
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    };

    return (
        <div className="min-h-screen pb-20 font-sans" style={{ background: 'linear-gradient(to bottom, #fff1f2, #fff)' }}>
            {/* Hero Section */}
            <div className="relative bg-[#fefce8] overflow-hidden mb-12">
                <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 text-center md:text-left">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#fde047] text-[#854d0e] font-bold text-sm mb-6 tracking-wide shadow-sm">
                            NEW ARRIVALS
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
                            Wrap them in <br /><span className="text-[#fca5a5]">Love & Comfort</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                            Discover the softest, safest, and most adorable essentials for your little bundle of joy.
                        </p>
                        <button className="px-8 py-4 bg-[#fca5a5] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#f87171] transition-all transform hover:-translate-y-1">
                            Shop Now
                        </button>
                    </div>
                    <div className="md:w-1/2 mt-12 md:mt-0 relative">
                        {/* Decorative background blobs */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fecaca] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fde68a] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                        <img
                            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800"
                            alt="Happy Baby"
                            className="relative rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 w-full max-w-md mx-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="container mx-auto px-4 mb-12">
                <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-4 border border-gray-100">
                    <div className="relative w-full md:w-96 flex-grow">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Find something cute..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#fca5a5] focus:bg-white transition-all outline-none font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                        {[
                            { value: selectedCategory, setter: setSelectedCategory, options: categories, prefix: 'Category' },
                            { value: selectedAge, setter: setSelectedAge, options: ageGroups, prefix: 'Age' },
                        ].map((filter, idx) => (
                            <select
                                key={idx}
                                className="px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#fca5a5] transition-colors cursor-pointer"
                                value={filter.value} onChange={(e) => filter.setter(e.target.value)}
                            >
                                {filter.options.map(o => <option key={o} value={o}>{filter.prefix}: {o}</option>)}
                            </select>
                        ))}
                        <select
                            className="px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#fca5a5] transition-colors cursor-pointer"
                            value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                        >
                            <option value="All">Price: All</option>
                            <option value="Under 500">Under ₹500</option>
                            <option value="500-1000">₹500 - ₹1000</option>
                            <option value="1000+">Above ₹1000</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-800 mb-3">Treasures for You</h2>
                    <div className="w-24 h-1.5 bg-[#fca5a5] mx-auto rounded-full"></div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#fca5a5] border-t-transparent"></div></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="group bg-white rounded-[2rem] border-2 border-transparent hover:border-[#fca5a5] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 relative"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                    <img
                                        src={product.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500"}
                                        alt={product.name}
                                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {product.ageGroup && (
                                        <span className="absolute top-4 right-4 bg-white/95 backdrop-blur font-bold text-gray-800 text-xs px-3 py-1.5 rounded-full shadow-sm">
                                            {product.ageGroup}
                                        </span>
                                    )}
                                    <div className="absolute top-4 left-4 bg-[#fde047] text-[#854d0e] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                                        {product.category || 'New'}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-[#fca5a5] transition-colors">{product.name}</h3>
                                    </div>

                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className="fill-[#fde047] text-[#fde047]" />
                                        ))}
                                        <span className="text-xs text-gray-400 font-bold ml-1">5.0</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                                        <button
                                            onClick={(e) => addToCartHandler(product, e)}
                                            className={`
                                                h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg transform active:scale-95
                                                ${addedIds[product._id]
                                                    ? 'bg-green-500 text-white rotate-12'
                                                    : 'bg-[#fca5a5] text-white hover:bg-[#f87171] hover:-translate-y-1'}
                                            `}
                                        >
                                            {addedIds[product._id] ? <Heart fill="currentColor" size={20} /> : <ShoppingCart size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
                            <X size={24} className="text-gray-500" />
                        </button>

                        <div className="grid md:grid-cols-2 h-full md:h-[600px]">
                            <div className="bg-gray-50 h-64 md:h-full">
                                <img
                                    src={selectedProduct.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500"}
                                    className="w-full h-full object-cover"
                                    alt={selectedProduct.name}
                                />
                            </div>
                            <div className="p-8 md:p-12 flex flex-col h-full overflow-y-auto">
                                <div>
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#fae8ff] text-[#a21caf] text-xs font-bold uppercase tracking-wider mb-4">
                                        {selectedProduct.category}
                                    </span>
                                    <h2 className="text-4xl font-black text-gray-800 mb-4">{selectedProduct.name}</h2>

                                    <div className="flex flex-wrap gap-3 mb-8">
                                        {selectedProduct.ageGroup && (
                                            <span className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-600">
                                                Age: {selectedProduct.ageGroup}
                                            </span>
                                        )}
                                        {selectedProduct.size && (
                                            <span className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-600">
                                                Size: {selectedProduct.size}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                        {selectedProduct.description || "Designed with extra love and care. This premium quality product ensures maximum comfort for your little one, making it a perfect addition to their daily essentials."}
                                    </p>
                                </div>

                                <div className="mt-auto pt-8 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-sm font-bold text-gray-400">Total Price</p>
                                            <p className="text-4xl font-black text-gray-900">₹{selectedProduct.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-400">Status</p>
                                            <p className={`font-bold ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedProduct.stock > 0 ? 'In Stock' : 'Sold Out'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addToCartHandler(selectedProduct, { stopPropagation: () => { } })}
                                        className="w-full bg-[#fca5a5] text-white py-4 rounded-2xl font-bold text-xl hover:bg-[#f87171] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart size={24} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
