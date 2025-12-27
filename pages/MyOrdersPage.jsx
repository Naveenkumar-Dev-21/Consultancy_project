import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Calendar, MapPin, Truck, ChevronRight, Clock, FileText } from 'lucide-react';
import { generateInvoice } from '../utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
            const token = userInfo?.token;

            if (!token) {
                navigate('/login?redirect=myorders');
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get('/api/orders/myorders', config);
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

    if (loading) {
        return (
            <div className="flex justify-center py-20 bg-[#f5f5f7] min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-beelittle-coral border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#f5f5f7] min-h-screen">
                <p className="text-red-500 font-bold mb-4">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#f5f5f7] min-h-screen py-16">
            <div className="section-container">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-apple-text tracking-tight mb-4">Your Orders.</h1>
                    <p className="text-apple-text/40 font-medium">Keep track of your favorites on their way to you.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[32px] border border-black/5 shadow-sm">
                        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Clock className="text-zinc-300" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-apple-text mb-2">No orders yet.</h2>
                        <p className="text-apple-text/40 text-sm">When you buy something, it will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden group">
                                <div className="p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                                                <Package className="text-apple-text/20" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-apple-text/30 mb-0.5">Order Number</p>
                                                <p className="text-sm font-mono font-bold text-apple-text">{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 md:gap-10">
                                            <button
                                                onClick={() => {
                                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                                    generateInvoice(order, userInfo?.name);
                                                }}
                                                className="flex items-center gap-2 text-[11px] font-bold text-beelittle-coral hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all"
                                            >
                                                <FileText size={16} /> DOWNLOAD INVOICE
                                            </button>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-apple-text/30 mb-0.5">Date Placed</p>
                                                <p className="text-sm font-bold text-apple-text">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-apple-text/30 mb-0.5">Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                                                        order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                                            'bg-orange-50 text-orange-600'}`}>
                                                    {order.status || 'Processing'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-6">
                                            {order.orderItems?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 group/item">
                                                    <div className="w-20 h-20 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-apple-text leading-tight mb-1">{item.name}</h4>
                                                        <p className="text-xs font-medium text-apple-text/40">Qty: {item.qty} • ₹{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-zinc-50/50 rounded-[24px] p-8 space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <MapPin size={14} className="text-apple-text/40" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-apple-text/30 mb-1">Shipping To</p>
                                                    <p className="text-sm font-bold text-apple-text leading-relaxed">
                                                        {order.shippingAddress?.address || 'No Address'}<br />
                                                        {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                                        {order.shippingAddress?.country}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-zinc-200/60">
                                                <p className="text-sm font-bold text-apple-text/40 uppercase tracking-widest">Total Amount</p>
                                                <p className="text-3xl font-bold text-apple-text tracking-tight">₹{order.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
