import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Calendar, MapPin, Truck, ChevronRight, Clock, FileText, XCircle, X, Sparkles } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [addedToCartId, setAddedToCartId] = useState(null);
    const toast = useToast();
    const { addToCart } = useCart();

    const getAuthConfig = () => {
        const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
        if (!userInfo?.token) return null;
        return {
            userInfo,
            config: { headers: { Authorization: `Bearer ${userInfo.token}` } }
        };
    };

    useEffect(() => {
        const fetchOrders = async () => {
            const auth = getAuthConfig();
            if (!auth) {
                navigate('/login?redirect=myorders');
                return;
            }

            try {
                const { data } = await api.get('/api/orders/myorders', auth.config);
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching orders", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('userInfo');
                    navigate('/login?redirect=myorders');
                } else {
                    setError(error.response?.data?.message || 'Failed to load orders');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    // Personalised picks from the user's own order history. Non-critical, so a
    // failure here is swallowed — the row simply doesn't render.
    useEffect(() => {
        const fetchRecommendations = async () => {
            const auth = getAuthConfig();
            if (!auth) return;
            try {
                const { data } = await api.get('/api/products/recommendations', auth.config);
                setRecommendations(Array.isArray(data) ? data.slice(0, 5) : []);
            } catch {
                setRecommendations([]);
            }
        };
        fetchRecommendations();
    }, []);

    const addToCartHandler = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedToCartId(product._id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const openCancelModal = (orderId) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please enter a reason for cancellation');
            return;
        }

        const auth = getAuthConfig();
        if (!auth) return;

        setCancellingId(cancelOrderId);
        setShowCancelModal(false);
        try {
            const { data } = await api.put(
                `/api/orders/${cancelOrderId}/cancel`,
                { cancellationReason: cancelReason.trim() },
                auth.config
            );
            setOrders(prev => prev.map(order =>
                order._id === cancelOrderId
                    ? { ...order, status: data.status, cancellationReason: data.cancellationReason }
                    : order
            ));
            toast.success('Order cancelled successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingId(null);
            setCancelOrderId(null);
            setCancelReason('');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Shipped':
                return 'bg-blue-50 text-blue-600 border border-blue-200';
            case 'Delivered':
                return 'bg-green-50 text-green-600 border border-green-200';
            case 'Cancelled':
                return 'bg-red-50 text-red-600 border border-red-200';
            case 'Confirmed':
            case 'Packed':
                return 'bg-purple-50 text-purple-600 border border-purple-200';
            default:
                return 'bg-orange-50 text-orange-600 border border-orange-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-400 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-screen">
                <p className="text-red-500 font-bold mb-4 text-base">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg shadow-rose-500/20"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 sm:py-16" style={{ background: 'var(--bg-primary)' }}>
            <div className="section-container">
                <header className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3 sm:mb-4">Your Orders.</h1>
                    <p className="text-gray-400 dark:text-gray-500 font-medium text-base">Keep track of your favorites on their way to you.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="text-center py-20 sm:py-32 glass-card">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50">
                            <Clock className="text-rose-300 dark:text-rose-400 animate-bounce-soft" size={32} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">No orders yet.</h2>
                        <p className="text-gray-400 dark:text-gray-500 text-base">When you buy something, it will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {Array.isArray(orders) && orders.map((order) => (
                            <div key={order._id} className="clay-card overflow-hidden group">
                                <div className="p-5 sm:p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 sm:pb-10 border-b border-rose-100 dark:border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50 transition-transform group-hover:scale-110">
                                                <Package className="text-rose-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-gray-400 mb-0.5">Order Number</p>
                                                <p className="text-sm sm:text-base font-mono font-bold text-gray-900 dark:text-white">{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10">
                                            <button
                                                onClick={() => {
                                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                    generateInvoice(order, userInfo?.name);
                                                }}
                                                className="flex items-center gap-2 text-xs sm:text-sm font-black text-rose-500 bg-white dark:bg-charcoal-700 px-4 py-2 rounded-full border border-white/50 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)]"
                                            >
                                                <FileText size={16} /> INVOICE
                                            </button>

                                            {/* Cancel button — only for Processing orders */}
                                            {order.status === 'Processing' && (
                                                <button
                                                    onClick={() => openCancelModal(order._id)}
                                                    disabled={cancellingId === order._id}
                                                    className="flex items-center gap-2 text-xs sm:text-sm font-black text-red-500 bg-white dark:bg-charcoal-700 px-4 py-2 rounded-full border border-white/50 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] disabled:opacity-50"
                                                >
                                                    <XCircle size={16} />
                                                    {cancellingId === order._id ? 'CANCELLING...' : 'CANCEL'}
                                                </button>
                                            )}

                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-gray-400 mb-0.5">Date</p>
                                                <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-gray-400 mb-0.5">Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                                    {order.status || 'Processing'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Show cancellation reason if order is cancelled */}
                                    {order.status === 'Cancelled' && order.cancellationReason && (
                                        <div className="mb-6 sm:mb-8 p-4 bg-red-50/80 rounded-2xl border border-red-100">
                                            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-red-400 mb-1">Cancellation Reason</p>
                                            <p className="text-sm sm:text-base text-red-600 font-medium">{order.cancellationReason}</p>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                                        <div className="space-y-4 sm:space-y-6">
                                            {order.orderItems?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 sm:gap-6 group/item">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50/50 rounded-2xl overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 leading-tight mb-1 text-sm sm:text-base">{item.name}</h4>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-400">Qty: {item.qty} • ₹{item.price}{item.size ? ` • Size: ${item.size}` : ''}{item.ageGroup ? ` • Age: ${item.ageGroup}` : ''}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-rose-50/50 rounded-2xl sm:rounded-[24px] p-5 sm:p-8 space-y-5 sm:space-y-6 border border-rose-100/60">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <MapPin size={14} className="text-rose-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Shipping To</p>
                                                    <p className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
                                                        {order.shippingAddress?.address || 'No Address'}<br />
                                                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                                        {order.shippingAddress?.country}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-rose-200/60">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">₹{order.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Recommended for you ─── */}
                {recommendations.length > 0 && (
                    <section className="mt-16 sm:mt-20">
                        <div className="mb-8">
                            <span className="text-rose-400 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-2 flex items-center gap-1.5">
                                <Sparkles size={14} /> Just for you
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Recommended for You
                            </h2>
                            <p className="text-gray-400 dark:text-gray-500 font-medium text-sm mt-1">
                                Picked based on what you've ordered before.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                            {recommendations.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    addToCartHandler={addToCartHandler}
                                    addedToCartId={addedToCartId}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Cancellation Reason Modal */}
            {showCancelModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 animate-fade-in"
                        onClick={() => setShowCancelModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="clay-card w-full max-w-md p-6 sm:p-8 relative">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>

                            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)]">
                                <XCircle className="text-red-400" size={28} />
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2">Cancel Order</h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-6">Please tell us why you'd like to cancel this order.</p>

                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="e.g., Changed my mind, ordered by mistake..."
                                rows={4}
                                className="clay-input resize-none w-full px-4 py-3"
                                autoFocus
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-5 py-3 rounded-full text-sm font-black text-gray-600 bg-white dark:bg-charcoal-700 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/5"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={confirmCancelOrder}
                                    disabled={!cancelReason.trim()}
                                    className="flex-1 px-5 py-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-black shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyOrdersPage;
