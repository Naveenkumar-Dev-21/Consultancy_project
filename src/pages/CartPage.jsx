import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard } from 'lucide-react';
import axios from 'axios';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(items);
    }, []);

    const removeFromCart = (id) => {
        const updatedItems = cartItems.filter(item => item.product !== id);
        setCartItems(updatedItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    };

    const checkoutHandler = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const shippingAddress = {
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phone').value
        };

        const orderData = {
            orderItems: cartItems,
            shippingAddress,
            totalPrice: cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
        };

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post('/api/orders', orderData, config);
            alert('Order Placed Successfully!');
            localStorage.removeItem('cartItems');
            setCartItems([]);
            navigate('/');
        } catch (error) {
            alert('Error placing order');
            console.error(error);
        }
    };

    const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Cart is Empty</h2>
                <button onClick={() => navigate('/')} className="bg-primary-500 text-white px-6 py-2 rounded-lg">Go Shopping</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.product} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                <p className="text-gray-500">${item.price}</p>
                            </div>
                            <div className="text-gray-600">Qty: {item.qty}</div>
                            <button onClick={() => removeFromCart(item.product)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-96">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold mb-4">Checkout Details</h3>
                        <form onSubmit={(e) => { e.preventDefault(); checkoutHandler(); }} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                <textarea required id="address" className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-gray-900" placeholder="123 Baby St, ..." rows="2"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input required id="city" type="text" className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input required id="postalCode" type="text" className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input required id="country" type="text" className="w-full mt-1 p-2 border rounded-lg" defaultValue="India" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input required id="phone" type="tel" className="w-full mt-1 p-2 border rounded-lg" placeholder="+91..." />
                            </div>

                            <div className="border-t border-gray-100 my-4"></div>
                            <div className="flex justify-between mb-6 font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
                            >
                                <CreditCard size={20} /> Place Order
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
