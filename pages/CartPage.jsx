import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, ChevronLeft, Package, MapPin, Phone, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { generateInvoice } from '../utils/pdfGenerator';

const CartPage = () => {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [shippingDetails, setShippingDetails] = useState(() => {
        const saved = localStorage.getItem('shippingAddress');
        return saved ? JSON.parse(saved) : {
            address: '', city: '', postalCode: '', country: 'India', phone: ''
        };
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [id]: value }));
    };

    const checkoutHandler = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        // Save for next time
        localStorage.setItem('shippingAddress', JSON.stringify(shippingDetails));

        const orderData = {
            orderItems: cartItems,
            shippingAddress: shippingDetails,
            totalPrice: cartTotal
        };

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post('/api/orders', orderData, config);
            setLastOrder(data);
            setIsSuccess(true);
            clearCart();
        } catch (error) {
            alert('Error placing order');
            console.error(error);
        }
    };

    if (isSuccess && lastOrder) {
        return (
            <div className="bg-[#f5f5f7] min-h-screen py-32">
                <div className="section-container max-w-2xl">
                    <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-black/5">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-4xl font-bold text-apple-text mb-4">Ordered!</h2>
                        <p className="text-apple-text/40 text-lg mb-12">Thank you for your purchase. Your order #{lastOrder._id.substring(0, 8).toUpperCase()} is being processed.</p>

                        <div className="grid md:grid-cols-2 gap-4 mb-12">
                            <button
                                onClick={() => {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    generateInvoice(lastOrder, userInfo?.name);
                                }}
                                className="flex items-center justify-center gap-3 bg-zinc-50 hover:bg-zinc-100 py-5 rounded-3xl font-bold text-apple-text transition-all"
                            >
                                <FileText size={20} /> Download Invoice
                            </button>
                            <button
                                onClick={() => navigate('/myorders')}
                                className="flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 py-5 rounded-3xl font-bold text-white transition-all shadow-xl shadow-zinc-900/10"
                            >
                                Track Order <ArrowRight size={20} />
                            </button>
                        </div>

                        <button onClick={() => navigate('/')} className="text-beelittle-coral font-bold hover:underline">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="section-container min-h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                    <Package className="text-zinc-300" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-apple-text mb-4">Your bag is empty.</h2>
                <p className="text-apple-text/40 mb-8 max-w-sm">Every baby deserves something special. Start exploring our collections today.</p>
                <button onClick={() => navigate('/')} className="premium-btn btn-primary px-8 py-3">Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="bg-[#f5f5f7] min-h-screen py-16">
            <div className="section-container">
                <h1 className="text-4xl md:text-5xl font-bold text-apple-text mb-12 tracking-tight">Review your bag.</h1>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.product} className="bg-white p-6 rounded-[24px] shadow-sm border border-black/5 flex gap-6 items-center group">
                                <div className="w-24 h-24 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-apple-text group-hover:text-beelittle-coral transition-all">{item.name}</h3>
                                            <p className="text-apple-text/40 text-sm font-medium">Qty: {item.qty}</p>
                                        </div>
                                        <p className="text-lg font-bold text-apple-text">₹{item.price * item.qty}</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => removeFromCart(item.product)}
                                            className="text-apple-text/30 hover:text-red-500 text-sm font-semibold flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary & Checkout */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-black/5 sticky top-24">
                            <h2 className="text-xl font-bold mb-8">Checkout Details</h2>

                            <form onSubmit={(e) => { e.preventDefault(); checkoutHandler(); }} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-apple-text/30" size={16} />
                                        <textarea
                                            required id="address"
                                            value={shippingDetails.address}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                            placeholder="Shipping Address" rows="2"
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            required id="city" type="text" placeholder="City"
                                            value={shippingDetails.city} onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                        />
                                        <input
                                            required id="postalCode" type="text" placeholder="Zip Code"
                                            value={shippingDetails.postalCode} onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <input
                                        required id="country" type="text" placeholder="Country"
                                        value={shippingDetails.country} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                    />
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text/30" size={16} />
                                        <input
                                            required id="phone" type="tel" placeholder="Phone Number"
                                            value={shippingDetails.phone} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-transparent rounded-xl focus:bg-white focus:border-beelittle-coral outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 pt-6 mt-8">
                                    <div className="flex justify-between text-apple-text/60 text-sm mb-2 font-medium">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-apple-text/60 text-sm mb-4 font-medium">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-bold uppercase text-[10px] tracking-wider">Free</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-2xl text-apple-text mb-8 tracking-tight">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-all"
                                    >
                                        <CreditCard size={20} /> Place Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
