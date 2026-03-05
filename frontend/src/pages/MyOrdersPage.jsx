import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Calendar, MapPin, Truck, ChevronRight, Clock, FileText, XCircle, X } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const toast = useToast();

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
        <div className="min-h-screen py-10 sm:py-16">
            <div className="section-container">
                <header className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">Your Orders.</h1>
                    <p className="text-gray-400 font-medium text-base">Keep track of your favorites on their way to you.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="text-center py-20 sm:py-32 bg-white/80 backdrop-blur-xl rounded-3xl sm:rounded-[32px] border border-rose-100/60 shadow-soft">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Clock className="text-rose-300" size={32} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">No orders yet.</h2>
                        <p className="text-gray-400 text-base">When you buy something, it will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[32px] shadow-card border border-rose-100/60 overflow-hidden group hover:shadow-soft transition-all">
                                <div className="p-5 sm:p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 sm:pb-10 border-b border-rose-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                                                <Package className="text-rose-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 mb-0.5">Order Number</p>
                                                <p className="text-sm sm:text-base font-mono font-bold text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10">
                                            <button
                                                onClick={() => {
                                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                    generateInvoice(order, userInfo?.name);
                                                }}
                                                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
                                            >
                                                <FileText size={16} /> INVOICE
                                            </button>

                                            {/* Cancel button — only for Processing orders */}
                                            {order.status === 'Processing' && (
                                                <button
                                                    onClick={() => openCancelModal(order._id)}
                                                    disabled={cancellingId === order._id}
                                                    className="flex items-center gap-2 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    <XCircle size={16} />
                                                    {cancellingId === order._id ? 'CANCELLING...' : 'CANCEL'}
                                                </button>
                                            )}

                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 mb-0.5">Date</p>
                                                <p className="text-sm sm:text-base font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 mb-0.5">Status</p>
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
                                                        <p className="text-xs sm:text-sm font-medium text-gray-400">Qty: {item.qty} • ₹{item.price}</p>
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
            </div>

            {/* Cancellation Reason Modal */}
            {showCancelModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={() => setShowCancelModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md p-6 sm:p-8 relative">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>

                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <XCircle className="text-red-400" size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Cancel Order</h3>
                            <p className="text-sm text-gray-400 text-center mb-6">Please tell us why you'd like to cancel this order.</p>

                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="e.g., Changed my mind, found a better option, ordered by mistake..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none text-sm text-gray-700 resize-none transition-all"
                                autoFocus
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={confirmCancelOrder}
                                    disabled={!cancelReason.trim()}
                                    className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
