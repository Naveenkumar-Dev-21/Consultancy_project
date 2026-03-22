import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, ChevronLeft, Package, MapPin, Phone, CheckCircle2, FileText, ArrowRight, Plus, Minus, Tag, X } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { generateInvoice } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { getFullUrl } from '../utils/urlUtils';

const CartPage = () => {
    const { cartItems, removeFromCart, cartTotal, clearCart, updateQty } = useCart();
    const navigate = useNavigate();
    const toast = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [shippingDetails, setShippingDetails] = useState(() => {
        const saved = localStorage.getItem('shippingAddress');
        return saved ? JSON.parse(saved) : {
            address: '', city: '', postalCode: '', country: 'India', phone: ''
        };
    });

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [id]: value }));
    };

    const useProfileAddress = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await api.get('/api/users/profile', config);
            
            if (data.address) {
                setShippingDetails({
                    address: data.address.street || '',
                    city: data.address.city || '',
                    postalCode: data.address.postalCode || '',
                    country: data.address.country || 'India',
                    phone: data.address.phone || ''
                });
                toast.success('Address loaded from profile!');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load address from profile');
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            toast.error('Please login to apply coupon');
            return;
        }

        setCouponLoading(true);
        setCouponError('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            const { data } = await api.post('/api/coupons/validate', {
                code: couponCode,
                cartTotal,
            }, config);

            setAppliedCoupon(data);
            toast.success(`Coupon applied! You save ₹${data.discount}`);
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid coupon';
            setCouponError(msg);
            setAppliedCoupon(null);
            toast.error(msg);
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = cartTotal - discountAmount;

    const checkoutHandler = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        localStorage.setItem('shippingAddress', JSON.stringify(shippingDetails));

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data: razorpayData } = await api.post(
                '/api/payment/create-order',
                {
                    amount: finalTotal,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                },
                config
            );

            const options = {
                key: razorpayData.key,
                amount: razorpayData.amount,
                currency: razorpayData.currency,
                name: 'Baby Products Store',
                description: 'Purchase baby products',
                order_id: razorpayData.orderId,
                handler: async function (response) {
                    try {
                        const orderData = {
                            orderItems: cartItems.map(item => ({
                                name: item.name,
                                qty: item.qty,
                                image: item.image,
                                price: item.price,
                                product: item.product,
                            })),
                            shippingAddress: shippingDetails,
                            paymentMethod: 'Razorpay',
                            itemsPrice: cartTotal,
                            taxPrice: 0,
                            shippingPrice: 0,
                            totalPrice: finalTotal,
                            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                            discountAmount: discountAmount,
                        };

                        const { data: order } = await api.post('/api/orders', orderData, config);

                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id,
                        };

                        await api.post('/api/payment/verify', verifyData, config);

                        setLastOrder(order);
                        setIsSuccess(true);
                        clearCart();
                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                        console.error(error);
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: shippingDetails.phone,
                },
                theme: {
                    color: '#f43f5e',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed. Please try again.');
                console.error(response.error);
            });
            rzp.open();
        } catch (error) {
            toast.error('Error initiating payment');
            console.error(error);
        }
    };

    if (isSuccess && lastOrder) {
        return (
            <div className="min-h-screen py-20 sm:py-32">
                <div className="section-container max-w-2xl">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl sm:rounded-[40px] p-8 sm:p-12 text-center shadow-soft border border-rose-100/60">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ordered!</h2>
                        <p className="text-gray-400 text-base sm:text-lg mb-10 sm:mb-12">Thank you for your purchase. Your order #{lastOrder._id.substring(0, 8).toUpperCase()} is being processed.</p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10 sm:mb-12">
                            <button
                                onClick={() => {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    generateInvoice(lastOrder, userInfo?.name);
                                }}
                                className="flex items-center justify-center gap-3 bg-rose-50 hover:bg-rose-100 py-4 sm:py-5 rounded-2xl font-bold text-rose-500 transition-all text-base border border-rose-200"
                            >
                                <FileText size={20} /> Download Invoice
                            </button>
                            <button
                                onClick={() => navigate('/myorders')}
                                className="flex items-center justify-center gap-3 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 py-4 sm:py-5 rounded-2xl font-bold text-white transition-all shadow-lg shadow-rose-500/20 text-base"
                            >
                                Track Order <ArrowRight size={20} />
                            </button>
                        </div>

                        <button onClick={() => navigate('/')} className="text-rose-500 font-bold hover:underline text-base">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="section-container min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6">
                    <Package className="text-rose-300" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your bag is empty.</h2>
                <p className="text-gray-400 mb-8 max-w-sm text-base">Every baby deserves something special. Start exploring our collections today.</p>
                <button onClick={() => navigate('/')} className="premium-btn btn-primary px-8 py-3.5">Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 sm:py-16">
            <div className="section-container">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 sm:mb-12 tracking-tight">Review your bag.</h1>

                <div className="grid lg:grid-cols-12 gap-8 sm:gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        {Array.isArray(cartItems) && cartItems.map((item) => (
                            <div key={item.product} className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-card border border-rose-100/60 flex gap-4 sm:gap-6 items-center group">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-50/50 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={getFullUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-rose-500 transition-all truncate">{item.name}</h3>
                                            {/* Quantity Selector */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQty(item.product, item.qty - 1)}
                                                    className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors active:scale-95 border border-rose-200"
                                                >
                                                    <Minus size={14} className="text-rose-500" />
                                                </button>
                                                <span className="text-sm font-bold text-gray-900 w-8 text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.product, item.qty + 1)}
                                                    disabled={item.qty >= item.stock}
                                                    className={`w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center transition-colors active:scale-95 border border-rose-200 ${item.qty >= item.stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-100'}`}
                                                >
                                                    <Plus size={14} className="text-rose-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 flex-shrink-0">₹{item.price * item.qty}</p>
                                    </div>
                                    <div className="mt-3">
                                        <button
                                            onClick={() => removeFromCart(item.product)}
                                            className="text-gray-400 hover:text-red-500 text-sm font-semibold flex items-center gap-1 transition-colors"
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
                        <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-soft border border-rose-100/60 sticky top-24">
                            <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-gray-900">Shipping Details</h2>

                            {/* Use Profile Address Button */}
                            <form onSubmit={(e) => { e.preventDefault(); checkoutHandler(); }} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-4 text-rose-300 group-focus-within:text-rose-500 transition-colors">
                                            <MapPin size={18} />
                                        </div>
                                        <textarea
                                            required id="address"
                                            value={shippingDetails.address}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400 resize-none"
                                            placeholder="Street Address" rows="2"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            required id="city" type="text" placeholder="City"
                                            value={shippingDetails.city} onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                        />
                                        <input
                                            required id="postalCode" type="text" placeholder="Zip Code"
                                            value={shippingDetails.postalCode} onChange={handleInputChange}
                                            className="w-full px-4 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                        />
                                    </div>

                                    <input
                                        required id="country" type="text" placeholder="Country"
                                        value={shippingDetails.country} onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                    />

                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-500 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            required id="phone" type="tel" placeholder="Phone Number"
                                            value={shippingDetails.phone} onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Coupon Code Section */}
                                <div className="mt-8 border-t border-rose-100 pt-6">
                                    <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                                        <Tag size={14} className="text-rose-400" /> Promo Code
                                    </label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-50/50 px-4 py-3 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Tag size={14} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-green-700 text-xs leading-none uppercase">{appliedCoupon.code}</p>
                                                    <p className="text-green-600 text-[10px] font-medium mt-1">Discount Applied</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-green-700 text-sm">-₹{appliedCoupon.discount}</span>
                                                <button type="button" onClick={removeCoupon} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-green-500 hover:text-red-500 hover:bg-red-50 transition-all border border-green-100 hover:border-red-100 shadow-sm">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative group flex items-center">
                                            <input
                                                type="text"
                                                placeholder="ENTER CODE"
                                                value={couponCode}
                                                onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                                className="w-full pl-4 pr-24 py-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-sm font-bold transition-all placeholder:text-gray-300 uppercase tracking-widest"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-rose-500 hover:to-pink-600 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-md shadow-rose-500/10 active:scale-95 z-10"
                                            >
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-red-500 text-[11px] mt-2.5 ml-1 font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                            <span className="w-1 h-1 bg-red-400 rounded-full"></span> {couponError}
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-rose-100 pt-6 mt-8 space-y-4">
                                    <div className="flex justify-between text-gray-500 text-sm sm:text-base font-medium">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600 text-sm sm:text-base font-bold bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                                            <span className="flex items-center gap-2">
                                                <Tag size={14} /> Discount
                                            </span>
                                            <span>-₹{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-500 text-sm sm:text-base font-medium">
                                        <span>Shipping</span>
                                        <span className="text-green-500 font-bold text-xs uppercase tracking-widest">Free</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-2xl sm:text-3xl text-gray-900 mt-2 tracking-tight">
                                        <span>Total</span>
                                        <span>₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-4.5 rounded-[22px] font-bold flex items-center justify-center gap-3 hover:from-rose-500 hover:to-pink-600 transition-all shadow-xl shadow-rose-500/25 active:scale-95 text-base sm:text-lg mt-4 group"
                                    >
                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <CreditCard size={18} />
                                        </div>
                                        Pay Securely
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
