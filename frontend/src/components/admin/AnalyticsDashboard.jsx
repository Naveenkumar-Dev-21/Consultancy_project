import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import StatCard from './StatCard';
import { getFullUrl } from '../../utils/urlUtils';

const AnalyticsDashboard = ({ stats, allOrders, allProducts }) => {
    // Process REAL data for Revenue Chart (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d.toLocaleDateString(),
            revenue: 0
        };
    });

    allOrders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const dayMatch = last7Days.find(d => d.fullDate === orderDate);
        if (dayMatch && (order.isPaid || order.status === 'Delivered')) {
            dayMatch.revenue += (order.totalPrice || 0);
        }
    });

    const revenueData = last7Days.map(d => ({
        name: d.date,
        revenue: Math.round(d.revenue)
    }));

    // Process Category Data
    const categoryCounts = allProducts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        value: categoryCounts[cat]
    }));

    const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

    // Process Gender Data
    const genderCounts = allProducts.reduce((acc, p) => {
        const g = p.gender || 'Unisex';
        acc[g] = (acc[g] || 0) + 1;
        return acc;
    }, {});

    const genderData = Object.keys(genderCounts).map(g => ({
        name: g,
        value: genderCounts[g]
    }));

    const GENDER_COLORS = ['#3b82f6', '#f43f5e', '#a855f7'];

    // Calculate AOV
    const paidOrders = allOrders.filter(o => o.isPaid || o.status === 'Delivered');
    const aov = paidOrders.length > 0 ? Math.round(stats.revenue / paidOrders.length) : 0;

    // Stock alerts
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStockProducts = allProducts.filter(p => p.stock <= 0);

    // --- Realtime Percentage Calculations ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // Stats for current month
    const curMonthOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const curMonthRevenue = curMonthOrders
        .filter(o => o.isPaid || o.status === 'Delivered')
        .reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    
    const curMonthPending = curMonthOrders.filter(o => o.status === 'Processing').length;

    // Stats for last month
    const prevMonthOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const prevMonthRevenue = prevMonthOrders
        .filter(o => o.isPaid || o.status === 'Delivered')
        .reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    
    const prevMonthPending = prevMonthOrders.filter(o => o.status === 'Processing').length;

    // Calculate Percentages
    const calcTrend = (cur, prev) => {
        if (prev === 0) return cur > 0 ? { value: 100, positive: true } : null;
        const diff = ((cur - prev) / prev) * 100;
        return {
            value: Math.abs(Math.round(diff * 10) / 10), // Round to 1 decimal
            positive: diff >= 0
        };
    };

    const revenueTrend = calcTrend(curMonthRevenue, prevMonthRevenue);
    const ordersTrend = calcTrend(curMonthOrders.length, prevMonthOrders.length);
    const pendingTrend = calcTrend(curMonthPending, prevMonthPending);

    // Order Status Data (Real)
    const statusCounts = allOrders.reduce((acc, o) => {
        const s = o.status || 'Processing';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const statusColors = {
        'Delivered': '#10b981',
        'Shipped': '#6366f1',
        'Processing': '#f59e0b',
        'Confirmed': '#3b82f6',
        'Packed': '#8b5cf6',
        'Cancelled': '#ef4444'
    };

    const statusData = Object.keys(statusCounts).map(status => ({
        status,
        count: statusCounts[status],
        fill: statusColors[status] || '#94a3b8'
    }));

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">Realtime Analytics Dashboard</h2>
                    <div className="live-indicator">
                        <span className="live-dot"></span>
                        Live
                    </div>
                </div>
                <div className="last-updated">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="stat-grid">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${stats.revenue.toLocaleString()}`} 
                    icon="IndianRupee" 
                    color="success"
                    trend={revenueTrend}
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats.orders} 
                    icon="ShoppingBag" 
                    color="primary"
                    trend={ordersTrend}
                />
                <StatCard 
                    title="Avg Order Value" 
                    value={`₹${aov.toLocaleString()}`} 
                    icon="TrendingUp" 
                    color="info"
                />
                <StatCard 
                    title="Total Products" 
                    value={stats.products} 
                    icon="Box" 
                    color="primary"
                />
                <StatCard 
                    title="Pending Orders" 
                    value={stats.pending} 
                    icon="Clock" 
                    color="warning"
                    trend={pendingTrend}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Revenue Overview</h3>
                    </div>
                    <div className="p-6 h-[300px] min-w-0" style={{ minHeight: '300px' }}>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#6366f1" 
                                        strokeWidth={3} 
                                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No revenue data available</div>
                        )}
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Order Status Distribution</h3>
                    </div>
                    <div className="p-6 h-[300px] min-w-0" style={{ minHeight: '300px' }}>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No status data available</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Product Categories</h3>
                    </div>
                    <div className="p-6 h-[300px] min-w-0" style={{ minHeight: '300px' }}>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No category data available</div>
                        )}
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Audience Segment (Genders)</h3>
                    </div>
                    <div className="p-6 h-[300px] min-w-0" style={{ minHeight: '300px' }}>
                        {genderData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No audience data available</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Low Stock Alerts (Restock Soon)
                        </h3>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[350px]">
                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-4">
                                {lowStockProducts.map(p => (
                                    <div key={p._id} className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-100/50 dark:border-amber-500/10">
                                        <div className="flex items-center gap-3">
                                            <img src={getFullUrl(p.image)} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-white" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[180px]">{p.name}</p>
                                                <p className="text-[10px] text-gray-400">{p.category}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200">
                                            {p.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                                <span>All products are well stocked! 🎉</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            Out of Stock
                        </h3>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[350px]">
                        {outOfStockProducts.length > 0 ? (
                            <div className="space-y-4">
                                {outOfStockProducts.map(p => (
                                    <div key={p._id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-500/5 rounded-xl border border-red-100/50 dark:border-red-500/10">
                                        <div className="flex items-center gap-3">
                                            <img src={getFullUrl(p.image)} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-white" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[180px]">{p.name}</p>
                                                <p className="text-[10px] text-gray-400">{p.category}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full border border-red-200">
                                            Out of Stock
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                                <span>No out-of-stock items! Good job.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
