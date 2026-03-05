import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const WishlistContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistIds, setWishlistIds] = useState([]);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAuthConfig = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo?.token) return null;
        return {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
    };

    const fetchWishlist = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) {
            setWishlistIds([]);
            setWishlistProducts([]);
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.get('/api/wishlist', config);
            setWishlistProducts(data.products);
            setWishlistIds(data.products.map(p => p._id));
        } catch (error) {
            console.error('Error fetching wishlist', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (productId) => {
        const config = getAuthConfig();
        if (!config) return;

        try {
            const { data } = await api.post(`/api/wishlist/${productId}`, {}, config);

            if (data.action === 'added') {
                setWishlistIds(prev => [...prev, productId]);
            } else {
                setWishlistIds(prev => prev.filter(id => id !== productId));
                setWishlistProducts(prev => prev.filter(p => p._id !== productId));
            }

            // Refresh full wishlist in background
            fetchWishlist();

            return data.action;
        } catch (error) {
            console.error('Error toggling wishlist', error);
        }
    };

    const isInWishlist = (productId) => wishlistIds.includes(productId);

    const wishlistCount = wishlistIds.length;

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            wishlistProducts,
            wishlistCount,
            loading,
            toggleWishlist,
            isInWishlist,
            fetchWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
