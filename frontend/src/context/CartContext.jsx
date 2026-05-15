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
            const incomingSize = product.selectedSize || null;
            const incomingAgeGroup = product.selectedAgeGroup || null;
            // Match by product ID, size, and ageGroup so different variations are separated
            const existing = prev.find(item => item.product === product._id && item.selectedSize === incomingSize && item.selectedAgeGroup === incomingAgeGroup);
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
                    (item.product === product._id && item.selectedSize === incomingSize && item.selectedAgeGroup === incomingAgeGroup) ? { ...item, qty: item.qty + 1 } : item
                );
            }

            Swal.fire({
                title: 'Added!',
                text: `${product.name}${incomingSize ? ` (${incomingSize})` : ''}${incomingAgeGroup ? ` [${incomingAgeGroup}]` : ''} added to cart`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            return [...prev, {
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                qty: product.quantity || product.qty || 1,
                stock: product.stock,
                selectedSize: incomingSize,
                selectedAgeGroup: incomingAgeGroup,
                category: product.category || 'Other'
            }];
        });
    };

    const removeFromCart = (id, size = null, ageGroup = null) => {
        setCartItems(prev => prev.filter(item => !(item.product === id && item.selectedSize === size && item.selectedAgeGroup === ageGroup)));
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

    const updateQty = (id, newQty, size = null, ageGroup = null) => {
        if (newQty < 1) return;
        
        setCartItems(prev => {
           const item = prev.find(i => i.product === id && i.selectedSize === size && i.selectedAgeGroup === ageGroup);
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

           return prev.map(i => (i.product === id && i.selectedSize === size && i.selectedAgeGroup === ageGroup) ? { ...i, qty: newQty } : i);
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
