import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
];

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { addToCart } = useCart();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedToCartId, setAddedToCartId] = useState(null);

    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [category, setCategory] = useState('');
    const [gender, setGender] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [allCategories, setAllCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setAllCategories(Array.isArray(data) ? data : []);
            } catch {
                setAllCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Server-side search. The backend already supports these filters via
    // GET /api/products/search, so they're passed as query params rather than
    // filtering a full product list on the client.
    const runSearch = useCallback(async () => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = { q: query.trim() };
            if (category) params.category = category;
            if (gender) params.gender = gender;
            if (maxPrice) params.maxPrice = maxPrice;

            const { data } = await api.get('/api/products/search', { params });
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Search failed. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, category, gender, maxPrice]);

    useEffect(() => { runSearch(); }, [runSearch]);

    const sortedResults = useMemo(() => {
        const list = [...results];
        switch (sortBy) {
            case 'price-asc':
                return list.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return list.sort((a, b) => b.price - a.price);
            case 'rating':
                return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'newest':
                return list.sort(
                    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
            default:
                return list;
        }
    }, [results, sortBy]);

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const hasActiveFilters = category || gender || maxPrice || sortBy !== 'relevance';

    const clearFilters = () => {
        setCategory('');
        setGender('');
        setMaxPrice('');
        setSortBy('relevance');
    };

    const selectClass =
        'clay-input px-4 py-2.5 rounded-full text-xs font-black text-gray-700 dark:text-gray-300 cursor-pointer appearance-none';

    const SkeletonCard = () => (
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-charcoal-800 border border-rose-100/40 dark:border-charcoal-700 shadow-card">
            <div className="aspect-[3/4] bg-gradient-to-br from-rose-50 to-pink-50 dark:from-charcoal-700 dark:to-charcoal-800 relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="p-4 space-y-2.5">
                <div className="h-3 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-1/4" />
                <div className="h-4 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-3/4" />
                <div className="h-5 bg-rose-50 dark:bg-charcoal-700 rounded-lg w-1/3 mt-2" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans">
            <Helmet>
                <title>{query ? `Search: ${query}` : 'Search'} | Aadhiran Kids Collections</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="section-container pt-8 pb-16">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors mb-6"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="mb-8">
                    <span className="text-rose-400 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2 block">
                        Search Results
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {query ? `“${query}”` : 'Search products'}
                        </h1>
                        {!loading && query && (
                            <span className="text-xs sm:text-sm font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-1.5 rounded-full">
                                {sortedResults.length} {sortedResults.length === 1 ? 'item' : 'items'}
                            </span>
                        )}
                    </div>
                </div>

                {/* ─── Filter / sort bar ─── */}
                {query && (
                    <div className="glass-card p-4 sm:p-5 mb-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                className={selectClass}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort results"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-2xl transition-all border ${
                                    showFilters
                                        ? 'bg-rose-500 text-white border-transparent'
                                        : 'bg-white/60 dark:bg-charcoal-700/60 text-gray-500 dark:text-gray-400 border-rose-100/40 dark:border-charcoal-600 hover:text-rose-500'
                                }`}
                                aria-label="Toggle filters"
                            >
                                <SlidersHorizontal size={18} />
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                                >
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-rose-100/40 dark:border-white/10">
                                <select
                                    className={selectClass}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    aria-label="Filter by category"
                                >
                                    <option value="">All Categories</option>
                                    {allCategories.map((c) => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>

                                <select
                                    className={selectClass}
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    aria-label="Filter by gender"
                                >
                                    <option value="">Any Gender</option>
                                    <option value="Boy">Boy</option>
                                    <option value="Girl">Girl</option>
                                    <option value="Unisex">Unisex</option>
                                </select>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Max price ₹"
                                    className="clay-input px-4 py-2.5 rounded-full text-xs font-black w-[150px]"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    aria-label="Maximum price"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Results ─── */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 glass-card">
                        <p className="text-red-500 font-bold mb-4">{error}</p>
                        <button
                            onClick={runSearch}
                            className="px-6 py-2.5 bg-rose-500 text-white rounded-full text-sm font-bold hover:bg-rose-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : sortedResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {sortedResults.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                addToCartHandler={addToCartHandler}
                                addedToCartId={addedToCartId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 sm:py-28 glass-card">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-rose-300 dark:text-rose-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {query ? 'No products found' : 'Start typing to search'}
                        </h3>
                        <p className="text-gray-400 dark:text-gray-500 mb-8 text-base">
                            {query
                                ? hasActiveFilters
                                    ? 'Try removing some filters or searching for something else.'
                                    : `We couldn't find anything matching “${query}”.`
                                : 'Use the search bar above to find products.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 rounded-full text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                            <Link
                                to="/"
                                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg shadow-rose-500/20 hover:shadow-xl transition-shadow"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
