import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
            if (!token) return;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
        };
        fetchOrders();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Orders</h1>
            {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-sm text-gray-400">Order ID</span>
                                    <p className="font-mono font-medium text-gray-700">{order._id}</p>
                                </div>
                                <div className="mt-2 md:mt-0 text-right">
                                    <span className="text-sm text-gray-400">Placed On</span>
                                    <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                            {/* Access image safely if populated or keep simple */}
                                            <img src="/placeholder.jpg" alt={item.name} className="w-full h-full object-cover opacity-50" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.qty} x ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">${order.totalPrice}</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold 
                                        ${order.delivery === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                                            order.delivery === 'Delivered' ? 'bg-green-100 text-green-600' :
                                                'bg-yellow-100 text-yellow-600'}`}>
                                        {order.delivery || 'Processing'}
                                    </span>

                                    {order.deliveryDate && (
                                        <div className="mt-2 text-sm text-green-600">
                                            <p>Expected Delivery: <strong>{new Date(order.deliveryDate).toLocaleDateString()}</strong></p>
                                        </div>
                                    )}
                                    {order.deliveryPerson && (
                                        <div className="text-sm text-gray-600">
                                            <p>Delivery Person: {order.deliveryPerson}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
