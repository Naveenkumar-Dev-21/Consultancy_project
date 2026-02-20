import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cartItems');
        if (!saved) return [];
        try {
            const parsed = JSON.parse(saved);
            // Filter out items with invalid MongoDB IDs (must be 24-char hex strings)
            const validItems = parsed.filter(item =>
                /^[0-9a-fA-F]{24}$/.test(item.product)
            );
            return validItems;
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product === product._id);
            const currentQty = existing ? existing.qty : 0;
            const requestedQty = currentQty + 1;
            const availableStock = product.stock;

            if (requestedQty > availableStock) {
                Swal.fire({
                    title: 'Stock Limit Reached',
                    text: `Only ${availableStock} items available in stock`,
                    icon: 'warning',
                    timer: 2000,
                    showConfirmButton: false
                });
                return prev;
            }

            if (existing) {
                Swal.fire({
                    title: 'Updated!',
                    text: 'Product quantity updated in cart',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                return prev.map(item =>
                    item.product === product._id ? { ...item, qty: item.qty + 1 } : item
                );
            }

            Swal.fire({
                title: 'Added!',
                text: `${product.name} added to cart`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            return [...prev, {
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: product.quantity || product.qty || 1, // Handle qty from product if passed
                stock: product.stock, // Store stock info
                selectedSize: product.selectedSize || null,
                category: product.category || 'Other'
            }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.product !== id));
        Swal.fire({
            title: 'Removed!',
            text: 'Item removed from cart',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    const updateQty = (id, newQty) => {
        if (newQty < 1) return;
        
        setCartItems(prev => {
           const item = prev.find(i => i.product === id);
           if (!item) return prev;

           if (newQty > item.stock) {
               Swal.fire({
                   title: 'Stock Limit Reached',
                   text: `Only ${item.stock} items available in stock`,
                   icon: 'warning',
                   timer: 2000,
                   showConfirmButton: false
               });
               return prev;
           }

           return prev.map(i => i.product === id ? { ...i, qty: newQty } : i);
        });
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
