import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { getFullUrl } from '../utils/urlUtils';

/**
 * Category configuration map.
 * Each key is the URL slug, mapping to display name, filter value(s), and subtitle.
 */
// Fallback categories for initial load or errors
const FALLBACK_CATEGORIES = {
    'regular-wear': { name: 'Regular wear', subtitle: 'Everyday comfort', gradient: 'from-blue-50 to-indigo-50' },
    'infant-clothings': { name: 'Infant Clothings', subtitle: 'Gentle and soft', gradient: 'from-pink-50 to-rose-50' },
    'new-born-essentials': { name: 'New born Essentials', subtitle: 'Essential care', gradient: 'from-emerald-50 to-teal-50' },
    'towels': { name: 'Towels', subtitle: 'Soft and absorbent', gradient: 'from-amber-50 to-yellow-50' },
    'nightwear': { name: 'Night Wear', subtitle: 'Cozy sleepwear', gradient: 'from-pink-50 to-rose-50' },
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

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            setCategoryLoading(true);
            try {
                // 1. Fetch category details
                const { data: categories } = await api.get('/api/categories');
                const matchedCategory = categories.find(c => c.slug === slug);
                
                if (matchedCategory) {
                    setCategory(matchedCategory);
                } else if (FALLBACK_CATEGORIES[slug]) {
                    setCategory(FALLBACK_CATEGORIES[slug]);
                } else {
                    // Search products to see if category name exists even without a dedicated category object
                    setCategory({ name: slug.replace(/-/g, ' '), subtitle: 'Browse our collection', gradient: 'from-gray-50 to-slate-50' });
                }

                // 2. Fetch products for this category
                setLoading(true);
                const { data: productsData } = await api.get('/api/products');
                const categoryName = matchedCategory ? matchedCategory.name : (FALLBACK_CATEGORIES[slug]?.name || slug.replace(/-/g, ' '));
                
                // Allow some fuzzy matching if needed, but primary is exact match
                const filtered = productsData.filter(p => 
                    p.category === categoryName || 
                    (slug === 'nightwear' && ['Night Wear', 'Night Dress'].includes(p.category))
                );
                setProducts(filtered);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
                setCategoryLoading(false);
            }
        };

        fetchCategoryAndProducts();
    }, [slug]);

    // If loading category, show spinner
    if (categoryLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent"></div>
            </div>
        );
    }

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-1 -top-20 -left-20 opacity-40" />
            <div className="blob-2 bottom-0 right-0 opacity-20" />

            <div className={`relative bg-gradient-to-r ${category.gradient} py-12 sm:py-16 md:py-20 overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                {(category.image || category.Image) && (
                    <div className="absolute inset-0 opacity-10">
                        <img 
                            src={getFullUrl(category.image || category.Image)} 
                            alt="" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="section-container relative z-10 animate-scale-in">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-rose-500 mb-6 md:mb-8 transition-colors font-bold text-sm uppercase tracking-widest">
                        <ArrowLeft size={18} />
                        <span>Back to Home</span>
                    </button>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 mb-3 md:mb-4 tracking-tight">
                        {(category.name || category.displayName || '').split(' ')[0]} <span className="gradient-text-pink">{(category.name || category.displayName || '').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">{category.subtitle}</p>
                </div>
            </div>

            <div className="section-container py-12 sm:py-16 md:py-20 relative z-10 animate-fade-in">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg font-medium">No products found in this category yet.</p>
                        <button onClick={() => navigate('/')} className="mt-4 text-rose-500 hover:underline font-bold text-base">Browse all products</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} addToCartHandler={addToCartHandler} addedToCartId={addedToCartId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
