import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';

/**
 * Category configuration map.
 * Each key is the URL slug, mapping to display name, filter value(s), and subtitle.
 */
const CATEGORIES = {
    cotton: {
        displayName: 'Cotton Collection',
        filter: ['Cotton'],
        subtitle: 'Soft, breathable, and gentle on delicate skin',
        gradient: 'from-pink-50 to-rose-50',
    },
    nightwear: {
        displayName: 'Night Wear Collection',
        filter: ['Night Wear', 'NightWear'],
        subtitle: 'Cozy sleepwear for peaceful nights',
        gradient: 'from-pink-50 to-rose-50',
    },
    casual: {
        displayName: 'Casual Collection',
        filter: ['Casual'],
        subtitle: 'Everyday comfortable wear for your little one',
        gradient: 'from-rose-50 to-pink-50',
    },
    frock: {
        displayName: 'Frock Collection',
        filter: ['Frock'],
        subtitle: 'Adorable frocks and dresses for your princess',
        gradient: 'from-rose-50 to-pink-50',
    },
    mixed: {
        displayName: 'Mixed Collection',
        filter: ['Mixed'],
        subtitle: 'A variety of styles and materials for every occasion',
        gradient: 'from-rose-50 to-pink-50',
    },
    'infant-clothings': {
        displayName: 'Infant Clothings',
        filter: ['Infant Clothings'],
        subtitle: 'Gentle and soft clothing for newborns and infants',
        gradient: 'from-pink-50 to-rose-50',
    },
};

const CategoryPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [addedToCartId, setAddedToCartId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const category = CATEGORIES[slug];

    useEffect(() => {
        if (!category) return;

        setLoading(true);
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/api/products');
                const filtered = data.filter(p => category.filter.includes(p.category));
                setProducts(filtered);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [slug, category]);

    // Redirect to home if slug doesn't match any known category
    if (!category) {
        return <Navigate to="/" replace />;
    }

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    return (
        <div className="min-h-screen">
            <div className={`bg-gradient-to-r ${category.gradient} py-8 sm:py-10 md:py-12`}>
                <div className="section-container">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-rose-500 mb-4 md:mb-6 transition-colors font-medium text-base">
                        <ArrowLeft size={20} />
                        <span className="font-semibold">Back to Home</span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-3">{category.displayName}</h1>
                    <p className="text-base sm:text-lg text-gray-500">{category.subtitle}</p>
                </div>
            </div>

            <div className="section-container py-8 sm:py-10 md:py-12">
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
