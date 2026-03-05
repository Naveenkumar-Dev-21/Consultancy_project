import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Phone, CheckCircle2, FileText, ArrowRight, ChevronLeft, ShieldCheck, Truck, Tag, X } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { generateInvoice } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
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

    useEffect(() => {
        if (cartItems.length === 0 && !isSuccess) {
            navigate('/cart');
        }
    }, [cartItems, isSuccess, navigate]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [id]: value }));
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;

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

        const orderData = {
            orderItems: cartItems,
            shippingAddress: shippingDetails,
            totalPrice: finalTotal,
            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            discountAmount: discountAmount,
        };

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await api.post('/api/orders', orderData, config);
            setLastOrder(data);
            setIsSuccess(true);
            clearCart();
        } catch (error) {
            toast.error('Error placing order');
            console.error(error);
        }
    };

    if (isSuccess && lastOrder) {
        return (
            <div className="min-h-screen py-20 sm:py-32 font-sans">
                <div className="section-container max-w-2xl">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl sm:rounded-[40px] p-8 sm:p-12 text-center shadow-soft border border-rose-100/60">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
                            <CheckCircle2 className="text-green-500" size={48} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Order Confirmed!</h2>
                        <p className="text-gray-400 text-base sm:text-lg mb-10 sm:mb-12">Thank you for your purchase. Your order <span className="font-mono text-gray-900 font-bold">#{lastOrder._id.substring(0, 8).toUpperCase()}</span> is being processed.</p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-10 sm:mb-12">
                            <button
                                onClick={() => {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    generateInvoice(lastOrder, userInfo?.name);
                                }}
                                className="flex items-center justify-center gap-3 bg-rose-50 hover:bg-rose-100 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-rose-500 transition-all border border-rose-200 text-base"
                            >
                                <FileText size={20} /> Download Invoice
                            </button>
                            <button
                                onClick={() => navigate('/myorders')}
                                className="flex items-center justify-center gap-3 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-white transition-all shadow-lg shadow-rose-500/20 text-base"
                            >
                                Track Order <ArrowRight size={20} />
                            </button>
                        </div>

                        <button onClick={() => navigate('/')} className="text-rose-500 font-bold hover:underline transition-all text-base">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-5 py-4 bg-rose-50/50 border border-rose-200 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400";

    return (
        <div className="min-h-screen py-12 sm:py-20 font-sans">
            <div className="section-container max-w-5xl">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-6 sm:mb-8 transition-colors font-medium text-base"
                >
                    <ChevronLeft size={20} /> Back to Bag
                </button>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 sm:mb-12 tracking-tight">Checkout.</h1>

                <div className="grid lg:grid-cols-12 gap-8 sm:gap-12">
                    {/* Shipping Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-soft border border-rose-100/60">
                            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                                    <Truck className="text-rose-400" size={24} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping Address</h2>
                            </div>

                            <form id="checkout-form" onSubmit={(e) => { e.preventDefault(); checkoutHandler(); }} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-4 text-gray-400 group-focus-within:text-rose-400 transition-colors">
                                            <MapPin size={18} />
                                        </div>
                                        <textarea
                                            required id="address"
                                            value={shippingDetails.address}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-5 py-4 bg-rose-50/50 border border-rose-200 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base resize-none transition-all placeholder:text-gray-400"
                                            placeholder="Street Address, Area" rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <input required id="city" type="text" placeholder="City" value={shippingDetails.city} onChange={handleInputChange} className={inputClass} />
                                        <input required id="postalCode" type="text" placeholder="Zip Code" value={shippingDetails.postalCode} onChange={handleInputChange} className={inputClass} />
                                    </div>

                                    <input required id="country" type="text" placeholder="Country" value={shippingDetails.country} onChange={handleInputChange} className={inputClass} />

                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-400 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            required id="phone" type="tel" placeholder="Phone Number"
                                            value={shippingDetails.phone} onChange={handleInputChange}
                                            className="w-full pl-12 pr-5 py-4 bg-rose-50/50 border border-rose-200 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-base transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-soft border border-rose-100/60 sticky top-24">
                            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900 tracking-tight">Order Summary</h2>

                            <div className="space-y-4 mb-6 sm:mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50/50 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">{item.name}</h4>
                                            <p className="text-xs sm:text-sm text-gray-400">Qty: {item.qty} × ₹{item.price}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm sm:text-base">₹{item.price * item.qty}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="mb-6 border-t border-rose-100 pt-5">
                                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                                    <Tag size={14} className="text-rose-400" /> Promo Code
                                </label>
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                                        <div>
                                            <span className="font-bold text-green-700 text-sm">{appliedCoupon.code}</span>
                                            <span className="text-green-600 text-xs ml-2">-₹{appliedCoupon.discount}</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-green-500 hover:text-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={couponCode}
                                            onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                            className="flex-1 px-4 py-3 bg-rose-50/50 border border-rose-200 rounded-xl focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all placeholder:text-gray-400 uppercase"
                                        />
                                        <button
                                            onClick={applyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="px-5 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-rose-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>
                                )}
                            </div>

                            <div className="border-t border-rose-100 pt-6 space-y-4">
                                <div className="flex justify-between text-gray-500 text-base font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 text-base font-medium">
                                        <span>Discount</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500 text-base font-medium">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-bold bg-green-50 px-2 py-1 rounded text-xs tracking-wider uppercase">Free</span>
                                </div>
                                <div className="flex justify-between font-bold text-2xl sm:text-3xl text-gray-900 pt-2 tracking-tight">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>

                                <button
                                    form="checkout-form"
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-4 sm:py-5 rounded-2xl sm:rounded-[20px] font-bold text-base sm:text-lg flex items-center justify-center gap-3 hover:from-rose-500 hover:to-pink-600 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                                >
                                    <CreditCard size={22} /> <span className="mt-0.5">Pay Securely</span>
                                </button>

                                <p className="text-center text-xs sm:text-sm text-gray-400 font-medium flex items-center justify-center gap-2">
                                    <ShieldCheck size={14} /> Secure SSL Encrypted Transaction
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
