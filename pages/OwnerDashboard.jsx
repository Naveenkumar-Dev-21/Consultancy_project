import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OwnerDashboard.css';
import { generateInvoice } from '../utils/pdfGenerator';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');

    // Data States
    const [allOrders, setAllOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]); // New Invoice State
    const [notifications, setNotifications] = useState([]); // Mocked for now

    // Loading States
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [invoicesLoading, setInvoicesLoading] = useState(false);

    // Filter State
    const [statusFilter, setStatusFilter] = useState('');

    // Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);

    // Form States
    const [deliveryForm, setDeliveryForm] = useState({
        deliveryPerson: '',
        deliveryDate: ''
    });

    // Selection States
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form States
    const [productForm, setProductForm] = useState({
        name: '', price: '', category: '', material: '', size: '', ageGroup: '',
        description: '', height: '', width: '', depth: '', unit: 'cm',
        weight: '', inStock: true, featured: false, imageUrl: '', isUrl: true, imageFile: null
    });
    const [uploading, setUploading] = useState(false);

    const [shippingForm, setShippingForm] = useState({
        deliveryName: '', deliveryPhone: '', deliveryVehicle: '', estimatedDelivery: ''
    });

    // Auth Check & Initial Load
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userInfo);
            if (parsedUser.role !== 'admin') { // Assuming 'admin' role in DB maps to 'owner' concept
                navigate('/');
                return;
            }
            setUser(parsedUser);
            loadDashboardData(parsedUser.token);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const getAuthConfig = () => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return { headers: {} };
        const parsed = JSON.parse(userInfo);
        return {
            headers: { Authorization: `Bearer ${parsed.token}` }
        };
    };

    const loadDashboardData = async () => {
        loadOrders();
        loadProducts();
        loadInvoices();
        // loadNotifications(); // Skipped as backend doesn't exist
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await axios.get('/api/orders', config);
            // API returns array: [...]
            setAllOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            alert('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadProducts = async () => {
        setProductsLoading(true);
        try {
            const { data } = await axios.get('/api/products');
            // API returns array: [...]
            setAllProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Failed to load products');
        } finally {
            setProductsLoading(false);
        }
    };

    const loadInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await axios.get('/api/orders/invoices', config);
            setAllInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setInvoicesLoading(false);
        }
    };

    // --- Actions ---

    const confirmOrder = async (orderId) => {
        try {
            const config = getAuthConfig();
            await axios.put(`/api/orders/${orderId}/confirm`, {}, config);
            alert('Order confirmed successfully');
            loadOrders();
        } catch (error) {
            alert('Failed to confirm order');
        }
    };

    const packOrder = async (orderId) => {
        try {
            const config = getAuthConfig();
            await axios.put(`/api/orders/${orderId}/pack`, {}, config);
            alert('Order marked as packed');
            loadOrders();
        } catch (error) {
            alert('Failed to pack order');
        }
    };

    const initiateShipping = (order) => {
        setSelectedOrder(order);
        // Set default time 3 days from now
        const estimatedTime = new Date();
        estimatedTime.setDate(estimatedTime.getDate() + 3);
        setShippingForm({
            deliveryName: '',
            deliveryPhone: '',
            deliveryVehicle: '',
            estimatedDelivery: estimatedTime.toISOString().slice(0, 16)
        });
        setShowShippingModal(true);
    };

    const submitShipping = async () => {
        try {
            const config = getAuthConfig();
            const payload = {
                deliveryMan: {
                    name: shippingForm.deliveryName,
                    phone: shippingForm.deliveryPhone,
                    vehicleNumber: shippingForm.deliveryVehicle
                },
                estimatedDeliveryTime: shippingForm.estimatedDelivery
            };

            const { data } = await axios.put(`/api/orders/${selectedOrder._id}/ship`, payload, config);
            setShowShippingModal(false);
            alert(`Order shipped! OTP: ${data.deliveryDetails?.otp || 'N/A'}`);
            loadOrders();
        } catch (error) {
            alert('Failed to ship order');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const config = getAuthConfig();
            await axios.delete(`/api/products/${id}`, config);
            alert('Product deleted');
            loadProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const openProductModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name,
                price: product.price,
                category: product.category,
                material: product.material || 'Cotton',
                size: product.size || 'Medium',
                ageGroup: product.ageGroup || '0-6 Months',
                description: product.description,
                height: product.dimensions?.height || '',
                width: product.dimensions?.width || '',
                depth: product.dimensions?.depth || '',
                unit: product.dimensions?.unit || 'cm',
                weight: product.weight || '',
                inStock: product.stock > 0, // Mapping stock number to boolean for check
                featured: product.featured || false,
                imageUrl: product.image || ''
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: '', price: '', category: '', material: 'Cotton', size: 'Medium', ageGroup: '0-6 Months',
                description: '', height: '', width: '', depth: '', unit: 'cm',
                weight: '', inStock: true, featured: false, imageUrl: '', isUrl: true, imageFile: null
            });
        }
        setShowProductModal(true);
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        setProductForm({ ...productForm, imageFile: file });
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        try {
            const config = getAuthConfig();
            let imagePath = productForm.imageUrl;

            if (!productForm.isUrl && productForm.imageFile) {
                const formData = new FormData();
                formData.append('image', productForm.imageFile);
                setUploading(true);
                try {
                    const uploadConfig = {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            ...config.headers
                        }
                    };
                    const { data } = await axios.post('/api/upload', formData, uploadConfig);
                    imagePath = data;
                    setUploading(false);
                } catch (error) {
                    console.error(error);
                    setUploading(false);
                    alert('Image upload failed');
                    return;
                }
            }

            const payload = {
                name: productForm.name,
                price: Number(productForm.price),
                image: imagePath,
                description: productForm.description,
                category: productForm.category,
                countInStock: productForm.inStock ? 10 : 0, // Simple mapping
                stock: productForm.inStock ? 10 : 0, // Backend uses stock
                // Add extra fields if backend supports them strictly or ignores them
                material: productForm.material,
                size: productForm.size,
                ageGroup: productForm.ageGroup,
                dimensions: {
                    height: Number(productForm.height),
                    width: Number(productForm.width),
                    depth: Number(productForm.depth),
                    unit: productForm.unit
                },
                featured: productForm.featured
            };

            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct._id}`, payload, config);
                alert('Product updated');
            } else {
                await axios.post('/api/products', payload, config);
                alert('Product created');
            }
            setShowProductModal(false);
            loadProducts();
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        }
    };

    const openDeliveryModalHandler = (order) => {
        setSelectedOrder(order);
        setDeliveryForm({
            deliveryPerson: order.deliveryPerson || '',
            deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().substr(0, 10) : ''
        });
        setShowDeliveryModal(true);
    };

    const assignDeliveryHandler = async (e) => {
        e.preventDefault();
        try {
            const config = getAuthConfig();
            await axios.put(`/api/orders/${selectedOrder._id}/assign`, deliveryForm, config);
            setShowDeliveryModal(false);
            loadOrders();
            alert('Delivery Assigned Successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to assign delivery');
        }
    };

    // --- Render Helpers ---

    const filteredOrders = statusFilter
        ? allOrders.filter(o => o.status === statusFilter)
        : allOrders;

    const stats = {
        products: allProducts.length,
        orders: allOrders.length,
        // Match lowercase 'pending' from backend logic update
        pending: allOrders.filter(o => o.status === 'pending').length,
        // Include delivered (COD likely) and paid orders
        revenue: allOrders
            .filter(o => o.isPaid || o.status === 'delivered')
            .reduce((acc, o) => acc + (o.totalPrice || 0), 0)
    };

    return (
        <div className="dashboard-body min-h-screen">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark dashboard-navbar px-4">
                <div className="container-fluid">
                    <span className="navbar-brand"><i className="fas fa-crown me-2"></i>Owner Dashboard</span>
                    <div className="d-flex align-items-center text-white">
                        <span className="me-3">Welcome, {user?.name}</span>
                        <button className="btn btn-outline-light btn-sm" onClick={() => {
                            localStorage.removeItem('userInfo');
                            navigate('/login');
                        }}>
                            <i className="fas fa-sign-out-alt me-1"></i>Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <div className="page-header container mt-4">
                <div className="row align-items-center px-4">
                    <div className="col-md-8">
                        <h1 className="mb-2"><i className="fas fa-baby-carriage me-2"></i>Store Management Dashboard</h1>
                        <p className="lead mb-0">Manage your baby product inventory and process customer orders</p>
                    </div>
                    <div className="col-md-4 text-end">
                        <button className="btn btn-primary-custom" onClick={() => openProductModal()}>
                            <i className="fas fa-plus me-2"></i>Add Baby Product
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="container mb-4">
                <div className="row">
                    {[
                        { icon: 'fa-chess-rook', color: 'text-primary', val: stats.products, label: 'Total Products' },
                        { icon: 'fa-shopping-bag', color: 'text-success', val: stats.orders, label: 'Total Orders' },
                        { icon: 'fa-clock', color: 'text-warning', val: stats.pending, label: 'Pending Orders' },
                        { icon: 'fa-rupee-sign', color: 'text-info', val: `₹${stats.revenue.toLocaleString()}`, label: 'Total Revenue' }
                    ].map((stat, idx) => (
                        <div key={idx} className="col-lg-3 col-md-6 mb-4">
                            <div className="dashboard-card stats-card">
                                <i className={`fas ${stat.icon} stats-icon ${stat.color}`}></i>
                                <div className="stats-number">{stat.val}</div>
                                <div className="stats-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <i className="fas fa-shopping-bag me-2"></i>Orders
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                            <i className="fas fa-chess-rook me-2"></i>Products
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                            <i className="fas fa-bell me-2"></i>Notifications
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
                            <i className="fas fa-file-invoice me-2"></i>Verification
                        </button>
                    </li>
                </ul>

                <div className="tab-content">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between mb-3">
                                <h4>Customer Orders</h4>
                                <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">All Orders</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="packed">Packed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {ordersLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-4">No orders found</td></tr>
                                            ) : filteredOrders.map(order => (
                                                <tr key={order._id}>
                                                    <td><strong>{order._id.substring(0, 8)}...</strong></td>
                                                    <td>{order.user?.name || 'Unknown'}</td>
                                                    <td>₹{order.totalPrice?.toLocaleString()}</td>
                                                    <td><span className={`badge-status badge-${order.status}`}>{order.status?.toUpperCase() || 'PENDING'}</span></td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={(e) => { e.stopPropagation(); openDeliveryModalHandler(order); }}>
                                                                Assign Delivery
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-info" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowOrderModal(true); }}>
                                                                View Details
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary ms-2" onClick={(e) => {
                                                                e.stopPropagation();
                                                                generateInvoice(order, order.user?.name || 'Customer');
                                                            }}>
                                                                <i className="fas fa-file-download"></i>
                                                            </button>
                                                            {(!order.status || order.status === 'pending') && (
                                                                <button className="btn-action btn-confirm" onClick={() => confirmOrder(order._id)}>Confirm</button>
                                                            )}
                                                            {order.status === 'confirmed' && (
                                                                <button className="btn-action btn-pack" onClick={() => packOrder(order._id)}>Pack</button>
                                                            )}
                                                            {order.status === 'packed' && (
                                                                <button className="btn-action btn-ship" onClick={() => initiateShipping(order)}>Ship</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Product Inventory</h4>
                                <button className="btn btn-primary-custom" onClick={() => openProductModal()}>
                                    <i className="fas fa-plus me-2"></i>Add Product
                                </button>
                            </div>

                            {productsLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Age Group</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allProducts.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-4">No products found</td></tr>
                                            ) : allProducts.map(product => (
                                                <tr key={product._id}>
                                                    <td><strong>{product.name}</strong></td>
                                                    <td>{product.category}</td>
                                                    <td>{product.ageGroup || '-'}</td>
                                                    <td>₹{product.price.toLocaleString()}</td>
                                                    <td>
                                                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn-action btn-view" onClick={() => openProductModal(product)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn-action bg-danger text-white" onClick={() => deleteProduct(product._id)}>
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="dashboard-card fade-in">
                            <h4 className="mb-3">Recent Activities</h4>
                            {allOrders.length === 0 ? (
                                <p className="text-muted text-center py-5">No recent activities</p>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {allOrders.slice(0, 10).map((order) => (
                                        <div key={order._id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">New Order Received</div>
                                                <div className="small text-muted">Order #{order._id.substring(0, 8)} placed by {order.user?.name || 'Customer'}</div>
                                            </div>
                                            <span className="badge bg-primary rounded-pill">Just now</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Verification Tab */}
                    {activeTab === 'verification' && (
                        <div className="dashboard-card fade-in">
                            <h4 className="mb-3">Invoice Verification</h4>
                            {invoicesLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Invoice ID</th>
                                                <th>Associated Order</th>
                                                <th>Customer</th>
                                                <th>Amount</th>
                                                <th>Generated At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allInvoices.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-4">No invoices found</td></tr>
                                            ) : allInvoices.map(invoice => (
                                                <tr key={invoice._id}>
                                                    <td><strong>{invoice._id.substring(0, 8)}...</strong></td>
                                                    <td>
                                                        {invoice.order ? (
                                                            <span className="badge bg-light text-dark">{invoice.order._id?.substring(0, 8)}</span>
                                                        ) : 'N/A'}
                                                    </td>
                                                    <td>{invoice.user?.name || 'Unknown'}</td>
                                                    <td>₹{invoice.amount?.toLocaleString()}</td>
                                                    <td>{new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString()}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => {
                                                                if (invoice.order) {
                                                                    generateInvoice(invoice.order, invoice.user?.name);
                                                                } else {
                                                                    alert('Order data missing for this invoice');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-download me-2"></i>Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals overlay */}
            {(showProductModal || showOrderModal || showShippingModal) && (
                <div className="modal-backdrop fade show"></div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content modal-content-custom">
                            <div className="modal-header modal-header-custom">
                                <h5 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProductModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={saveProduct}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Product Name</label>
                                            <input type="text" className="form-control" required
                                                value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Price (₹)</label>
                                            <input type="number" className="form-control" required
                                                value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows="3" required
                                            value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Product Image</label>
                                        <div className="d-flex mb-2">
                                            <div className="form-check me-3">
                                                <input className="form-check-input" type="radio"
                                                    checked={productForm.isUrl} onChange={() => setProductForm({ ...productForm, isUrl: true })} />
                                                <label className="form-check-label">Image URL</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio"
                                                    checked={!productForm.isUrl} onChange={() => setProductForm({ ...productForm, isUrl: false })} />
                                                <label className="form-check-label">Upload Image</label>
                                            </div>
                                        </div>

                                        {productForm.isUrl ? (
                                            <input type="url" className="form-control" placeholder="https://..." required={productForm.isUrl}
                                                value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                                        ) : (
                                            <input type="file" className="form-control" onChange={uploadFileHandler} required={!productForm.isUrl} />
                                        )}
                                        {uploading && <div className="text-info mt-1">Uploading...</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Category</label>
                                            <input type="text" className="form-control" required
                                                value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Age Group</label>
                                            <select className="form-select" value={productForm.ageGroup} onChange={e => setProductForm({ ...productForm, ageGroup: e.target.value })}>
                                                <option value="0-6 Months">0-6 Months</option>
                                                <option value="6-12 Months">6-12 Months</option>
                                                <option value="1-2 Years">1-2 Years</option>
                                                <option value="2-4 Years">2-4 Years</option>
                                                <option value="4+ Years">4+ Years</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Size</label>
                                            <select className="form-select" value={productForm.size} onChange={e => setProductForm({ ...productForm, size: e.target.value })}>
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Large">Large</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <div className="form-check mt-4">
                                                <input className="form-check-input" type="checkbox"
                                                    checked={productForm.inStock} onChange={e => setProductForm({ ...productForm, inStock: e.target.checked })} />
                                                <label className="form-check-label">In Stock</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer px-0 pb-0">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary-custom">Save Product</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content modal-content-custom">
                            <div className="modal-header modal-header-custom">
                                <h5 className="modal-title">Order Details</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6>Order Information</h6>
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr><td><strong>ID:</strong></td><td>{selectedOrder._id}</td></tr>
                                                <tr><td><strong>Status:</strong></td><td>{selectedOrder.status}</td></tr>
                                                <tr><td><strong>Total:</strong></td><td>₹{selectedOrder.totalPrice?.toLocaleString()}</td></tr>
                                            </tbody>
                                        </table>

                                        <h6 className="mt-4">Shipping Address</h6>
                                        <address className="text-muted">
                                            {selectedOrder.shippingAddress?.address}<br />
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}<br />
                                            {selectedOrder.shippingAddress?.country}
                                        </address>
                                    </div>
                                    <div className="col-md-6">
                                        <h6>Items</h6>
                                        <ul className="list-group">
                                            {selectedOrder.orderItems?.map((item, i) => (
                                                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{item.name}</strong>
                                                        <div className="small text-muted">{item.qty} x ₹{item.price}</div>
                                                    </div>
                                                    <span>₹{item.qty * item.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shipping Modal */}
            {showShippingModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content modal-content-custom">
                            <div className="modal-header modal-header-custom">
                                <h5 className="modal-title">Ship Order</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowShippingModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Delivery Person Name</label>
                                    <input type="text" className="form-control"
                                        value={shippingForm.deliveryName} onChange={e => setShippingForm({ ...shippingForm, deliveryName: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone</label>
                                    <input type="text" className="form-control"
                                        value={shippingForm.deliveryPhone} onChange={e => setShippingForm({ ...shippingForm, deliveryPhone: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Vehicle</label>
                                    <input type="text" className="form-control"
                                        value={shippingForm.deliveryVehicle} onChange={e => setShippingForm({ ...shippingForm, deliveryVehicle: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Estimated Delivery</label>
                                    <input type="datetime-local" className="form-control"
                                        value={shippingForm.estimatedDelivery} onChange={e => setShippingForm({ ...shippingForm, estimatedDelivery: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowShippingModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary-custom" onClick={submitShipping}>Confirm Shipment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delivery Assignment Modal */}
            {showDeliveryModal && selectedOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Delivery for Order #{selectedOrder._id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeliveryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={assignDeliveryHandler}>
                                    <div className="mb-3">
                                        <label className="form-label">Delivery Person Name</label>
                                        <select className="form-select" required
                                            value={deliveryForm.deliveryPerson}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPerson: e.target.value })}
                                        >
                                            <option value="">Select Delivery Person</option>
                                            <option value="Arun">Arun</option>
                                            <option value="Arjun">Arjun</option>
                                            <option value="Aditya">Aditya</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Expected Delivery Date</label>
                                        <input type="date" className="form-control" required
                                            value={deliveryForm.deliveryDate}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Assign & Ship</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
