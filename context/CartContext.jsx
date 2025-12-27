import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cartItems');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product === product._id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, {
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: 1
            }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.product !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    const updateQty = (id, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev => prev.map(item =>
            item.product === id ? { ...item, qty: newQty } : item
        ));
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            updateQty,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
