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
    'regular-wear': {
        displayName: 'Regular wear',
        filter: ['Regular wear'],
        subtitle: 'Everyday comfort for your little ones',
        gradient: 'from-blue-50 to-indigo-50',
    },
    'infant-clothings': {
        displayName: 'Infant Clothings',
        filter: ['Infant Clothings'],
        subtitle: 'Gentle and soft clothing for newborns and infants',
        gradient: 'from-pink-50 to-rose-50',
        Image: '/Images/pampers/10.jpg'
    },
    'new-born-essentials': {
        displayName: 'New born Essentials',
        filter: ['New born Essentials'],
        subtitle: 'Essential care for your newborn',
        gradient: 'from-emerald-50 to-teal-50',
    },
    towels: {
        displayName: 'Towels',
        filter: ['Towels'],
        subtitle: 'Soft and absorbent towels for your baby',
        gradient: 'from-amber-50 to-yellow-50',
    },
    nightwear: {
        displayName: 'Night Wear Collection',
        filter: ['Night Wear', 'NightWear', 'Night Dress'],
        subtitle: 'Cozy sleepwear for peaceful nights',
        gradient: 'from-pink-50 to-rose-50',
        Image: '/Images/nightdresses/11.jpg'
    },
    casual: {
        displayName: 'Casual Collection',
        filter: ['Casual'],
        subtitle: 'Everyday comfortable wear for your little one',
        gradient: 'from-rose-50 to-pink-50',
        Image: '/Images/Casuals/07.jpg'
    },
    frock: {
        displayName: 'Frock Collection',
        filter: ['Frock'],
        subtitle: 'Adorable frocks and dresses for your princess',
        gradient: 'from-rose-50 to-pink-50',
        Image: '/Images/frocks/01.jpg'
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
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-1 -top-20 -left-20 opacity-40" />
            <div className="blob-2 bottom-0 right-0 opacity-20" />

            <div className={`relative bg-gradient-to-r ${category.gradient} py-12 sm:py-16 md:py-20 overflow-hidden`}>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                {category.Image && (
                    <div className="absolute inset-0 opacity-10">
                        <img 
                            src={category.Image} 
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
                        {category.displayName.split(' ')[0]} <span className="gradient-text-pink">{category.displayName.split(' ').slice(1).join(' ')}</span>
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
