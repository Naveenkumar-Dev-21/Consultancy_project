import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/OwnerDashboard.css';
import { generateInvoice } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { getFullUrl } from '../utils/urlUtils';
import { compressImage } from '../utils/imageCompression';

// New Admin Components
import DashboardSidebar from '../components/admin/DashboardSidebar';
import DashboardHeader from '../components/admin/DashboardHeader';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('analytics');

    // Data States
    const [allOrders, setAllOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const [allCoupons, setAllCoupons] = useState([]);
    const [allCategories, setAllCategories] = useState([]);


    // Loading States
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Filter State
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    // Selection States
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);


    // Form States
    const [productForm, setProductForm] = useState({
        name: '', price: '', category: '', material: '', sizes: [], ageGroup: [],
        description: '', height: '', width: '', depth: '', unit: 'cm',
        weight: '', stock: 0, featured: false, imageUrl: '', isUrl: true, imageFile: null,
        gender: 'Unisex',
        descriptionImages: [], // existing URLs
        descriptionImageFiles: [], // new files to upload
        isCustomCategory: false,
        customCategory: ''
    });
    const [categoryForm, setCategoryForm] = useState({
        name: '', image: '', subtitle: '', gradient: 'from-rose-50 to-pink-50',
        isUrl: true, imageFile: null, subCategories: []
    });
    const [editingCategory, setEditingCategory] = useState(null);
    const [newSubCategory, setNewSubCategory] = useState('');
    const [uploading, setUploading] = useState(false);



    const [couponForm, setCouponForm] = useState({
        code: '', discountType: 'percentage', discountValue: '',
        minOrderAmount: '', maxDiscount: '', expiresAt: '', usageLimit: ''
    });
    const [showCouponForm, setShowCouponForm] = useState(false);

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
        } catch {
            navigate('/login');
        }
    }, [navigate]); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Refresh data when tab changes
    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'orders') {
            loadOrders();
        } else if (activeTab === 'products') {
            loadProducts();
        } else if (activeTab === 'verification') {
            loadInvoices();
        } else if (activeTab === 'coupons') {
            loadCoupons();
        } else if (activeTab === 'categories') {
            loadCategories();
        }
    }, [activeTab]); // eslint-disable-next-line react-hooks/exhaustive-deps

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
        loadUsers();

        loadCoupons();
        loadCategories();
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await api.get('/api/orders', config);
            // API returns array: [...]
            setAllOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadProducts = async () => {
        setProductsLoading(true);
        try {
            const { data } = await api.get('/api/products');
            // API returns array: [...]
            setAllProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setProductsLoading(false);
        }
    };

    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const { data } = await api.get('/api/categories');
            setAllCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const saveCategoryHandler = async (e) => {
        e.preventDefault();
        try {
            const config = getAuthConfig();
            let imagePath = categoryForm.image;

            if (!categoryForm.isUrl && categoryForm.imageFile) {
                setUploading(true);
                try {
                    const compressedFile = await compressImage(categoryForm.imageFile, { maxWidth: 800, maxHeight: 800, quality: 0.6 });
                    const formData = new FormData();
                    formData.append('image', compressedFile);
                    
                    const { data } = await api.post('/api/upload/category', formData, config);
                    imagePath = data;
                } catch (error) {
                    console.error(error);
                    setUploading(false);
                    toast.error('Image upload failed');
                    return;
                }
            } else if (editingCategory && !categoryForm.image && !categoryForm.imageFile) {
                // Keep old image if editing and no new image provided
                imagePath = editingCategory.image;
            }

            const payload = {
                name: categoryForm.name,
                image: imagePath,
                subtitle: categoryForm.subtitle,
                gradient: categoryForm.gradient,
                subCategories: categoryForm.subCategories
            };

            if (editingCategory) {
                await api.put(`/api/categories/${editingCategory._id}`, payload, config);
                toast.success('Category updated successfully');
            } else {
                await api.post('/api/categories', payload, config);
                toast.success('Category created successfully');
            }
            setCategoryForm({ name: '', image: '', subtitle: '', gradient: 'from-rose-50 to-pink-50', isUrl: true, imageFile: null, subCategories: [] });
            setEditingCategory(null);
            setUploading(false);
            loadCategories();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save category');
        }
    };

    const editCategoryHandler = (cat) => {
        setEditingCategory(cat);
        setCategoryForm({
            name: cat.name,
            image: cat.image || '',
            subtitle: cat.subtitle || '',
            gradient: cat.gradient || 'from-rose-50 to-pink-50',
            isUrl: true,
            imageFile: null,
            subCategories: cat.subCategories || []
        });
        setNewSubCategory('');
        // Scroll to the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', image: '', subtitle: '', gradient: 'from-rose-50 to-pink-50', isUrl: true, imageFile: null, subCategories: [] });
        setNewSubCategory('');
    };

    const deleteCategoryHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const config = getAuthConfig();
                await api.delete(`/api/categories/${id}`, config);
                toast.success('Category deleted');
                loadCategories();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete category');
            }
        }
    };

    const loadInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await api.get('/api/orders/invoices', config);
            setAllInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setInvoicesLoading(false);
        }
    };

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await api.get('/api/users', config);
            setAllUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading users:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error('Session invalid or unauthorized. Please log in as Admin again.');
                navigate('/login');
            } else {
                toast.error('Failed to load users.');
            }
        } finally {
            setUsersLoading(false);
        }
    };

    const deleteUser = async (id) => {
        const ok = await toast.confirm('Are you sure you want to delete this user?');
        if (!ok) return;
        try {
            const config = getAuthConfig();
            await api.delete(`/api/users/${id}`, config);
            toast.success('User deleted');
            loadUsers();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const addSubCategory = () => {
        if (!newSubCategory.trim()) return;
        if (categoryForm.subCategories.includes(newSubCategory.trim())) {
            toast.warn('Sub-category already added');
            return;
        }
        setCategoryForm({
            ...categoryForm,
            subCategories: [...categoryForm.subCategories, newSubCategory.trim()]
        });
        setNewSubCategory('');
    };

    const removeSubCategory = (sub) => {
        setCategoryForm({
            ...categoryForm,
            subCategories: categoryForm.subCategories.filter(s => s !== sub)
        });
    };



    // --- Coupon Functions ---
    const loadCoupons = async () => {
        setCouponsLoading(true);
        try {
            const config = getAuthConfig();
            const { data } = await api.get('/api/coupons', config);
            setAllCoupons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading coupons:', error);
        } finally {
            setCouponsLoading(false);
        }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            const config = getAuthConfig();
            const payload = {
                code: couponForm.code,
                discountType: couponForm.discountType,
                discountValue: Number(couponForm.discountValue),
                minOrderAmount: Number(couponForm.minOrderAmount) || 0,
                maxDiscount: Number(couponForm.maxDiscount) || null,
                expiresAt: couponForm.expiresAt,
                usageLimit: Number(couponForm.usageLimit) || null,
            };
            await api.post('/api/coupons', payload, config);
            toast.success('Coupon created!');
            setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', expiresAt: '', usageLimit: '' });
            setShowCouponForm(false);
            loadCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    const deleteCouponHandler = async (id) => {
        const ok = await toast.confirm('Delete this coupon?');
        if (!ok) return;
        try {
            const config = getAuthConfig();
            await api.delete(`/api/coupons/${id}`, config);
            toast.success('Coupon deleted');
            loadCoupons();
        } catch {
            toast.error('Failed to delete coupon');
        }
    };


    // --- Actions ---

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = getAuthConfig();
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
            toast.success(`Order status updated to ${newStatus}`);
            loadOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const deleteOrder = async (orderId) => {
        const ok = await toast.confirm('Are you sure you want to delete this order? Stock will be restored.');
        if (!ok) return;
        try {
            const config = getAuthConfig();
            await api.delete(`/api/orders/${orderId}`, config);
            toast.success('Order deleted successfully');
            loadOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete order');
        }
    };




    const deleteProduct = async (id) => {
        const ok = await toast.confirm('Are you sure you want to delete this product?');
        if (!ok) return;
        try {
            const config = getAuthConfig();
            await api.delete(`/api/products/${id}`, config);
            toast.success('Product deleted');
            loadProducts();
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const openProductModal = (product = null) => {
        const standardCategories = ['Regular wear', 'Infant Clothings', 'New born Essentials', 'Night Wear', 'Casual', 'Frock', 'Towels'];
        if (product) {
            const isCustom = !standardCategories.includes(product.category);
            setEditingProduct(product);
            setProductForm({
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || '',
                category: product.category,
                material: product.material || 'Cotton',
                sizes: product.sizes || (product.size ? [product.size] : []),
                ageGroup: Array.isArray(product.ageGroup) ? product.ageGroup : (product.ageGroup ? [product.ageGroup] : []),
                description: product.description,
                height: product.dimensions?.height || '',
                width: product.dimensions?.width || '',
                depth: product.dimensions?.depth || '',
                unit: product.dimensions?.unit || 'cm',
                weight: product.weight || '',
                stock: product.stock || 0,
                featured: product.featured || false,
                imageUrl: product.image || '',
                gender: product.gender || 'Unisex',
                subCategory: product.subCategory || '',
                descriptionImages: product.descriptionImages || [],
                descriptionImageFiles: [],
                isCustomCategory: isCustom,
                customCategory: ''
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: '', price: '', originalPrice: '', category: '', material: 'Cotton', sizes: [], ageGroup: [],
                description: '', height: '', width: '', depth: '', unit: 'cm',
                weight: '', stock: 0, featured: false, imageUrl: '', isUrl: true, imageFile: null,
                gender: 'Unisex', subCategory: '',
                descriptionImages: [], descriptionImageFiles: [],
                isCustomCategory: false,
                customCategory: ''
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

            // Upload cover image if file selected
            if (!productForm.isUrl && productForm.imageFile) {
                setUploading(true);
                try {
                    const compressedFile = await compressImage(productForm.imageFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.7 });
                    const formData = new FormData();
                    formData.append('image', compressedFile);
                    
                    const uploadConfig = {
                        headers: {
                            ...config.headers
                        }
                    };
                    const { data } = await api.post('/api/upload', formData, uploadConfig);
                    imagePath = data;
                } catch (error) {
                    console.error(error);
                    setUploading(false);
                    toast.error('Image upload failed');
                    return;
                }
            } else if (editingProduct && !productForm.imageUrl && !productForm.imageFile) {
                // Keep old image if editing and no new image/URL provided
                imagePath = editingProduct.image;
            }

            // Upload description images if new files selected
            let descImagePaths = [...(productForm.descriptionImages || [])];
            if (productForm.descriptionImageFiles && productForm.descriptionImageFiles.length > 0) {
                setUploading(true);
                try {
                    const formData = new FormData();
                    // Compress all description images
                    const compressedFiles = await Promise.all(
                        productForm.descriptionImageFiles.map(file => compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.7 }))
                    );
                    
                    compressedFiles.forEach(file => {
                        formData.append('images', file);
                    });
                    
                    const uploadConfig = {
                        headers: {
                            ...config.headers
                        }
                    };
                    const { data } = await api.post('/api/upload/multiple', formData, uploadConfig);
                    descImagePaths = [...descImagePaths, ...data].slice(0, 3); // Max 3
                } catch (error) {
                    console.error(error);
                    setUploading(false);
                    toast.error('Description images upload failed');
                    return;
                }
            }
            setUploading(false);

            const payload = {
                name: productForm.name,
                price: Number(productForm.price),
                originalPrice: Number(productForm.originalPrice) || 0,
                image: imagePath,
                descriptionImages: descImagePaths,
                description: productForm.description,
                category: productForm.category,
                stock: Number(productForm.stock),
                material: productForm.material,
                sizes: productForm.sizes || [],
                ageGroup: productForm.ageGroup,
                dimensions: {
                    height: Number(productForm.height),
                    width: Number(productForm.width),
                    depth: Number(productForm.depth),
                    unit: productForm.unit
                },
                featured: productForm.featured,
                gender: productForm.gender,
                subCategory: productForm.subCategory
            };

            if (editingProduct) {
                await api.put(`/api/products/${editingProduct._id}`, payload, config);
                toast.success('Product updated');
            } else {
                await api.post('/api/products', payload, config);
                toast.success('Product created');
            }
            setShowProductModal(false);
            loadProducts();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save product');
        }
    };

    // --- Render Helpers ---
    const filteredOrders = allOrders.filter(o => {
        const matchesStatus = statusFilter ? o.status === statusFilter : true;
        const matchesSearch = searchTerm 
            ? (o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
               o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
            : true;
        return matchesStatus && matchesSearch;
    });

    const filteredProducts = allProducts.filter(p => 
        searchTerm 
            ? (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               p.category.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
    );

    const filteredUsers = allUsers.filter(u => 
        searchTerm 
            ? (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               u.email.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
    );

    const filteredInvoices = allInvoices.filter(i => 
        searchTerm 
            ? (i._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
               i.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
    );

    const filteredCoupons = allCoupons.filter(c => 
        searchTerm 
            ? c.code.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    );

    const stats = {
        products: allProducts.length,
        orders: allOrders.length,
        // Match lowercase 'pending' from backend logic update
        pending: allOrders.filter(o => o.status === 'Processing').length,
        // Include delivered (COD likely) and paid orders
        revenue: allOrders
            .filter(o => o.isPaid || o.status === 'Delivered')
            .reduce((acc, o) => acc + (o.totalPrice || 0), 0)
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="admin-dashboard-layout">
            <DashboardSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout} 
                userName={user?.name} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="admin-main">
                <DashboardHeader 
                    title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                    userName={user?.name} 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <div className="admin-content">
                    {activeTab === 'analytics' && (
                        <AnalyticsDashboard 
                            stats={stats} 
                            allOrders={allOrders} 
                            allProducts={allProducts} 
                        />
                    )}

                    <div className="tab-content">
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between mb-3">
                                <h4>Customer Orders</h4>
                                <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">All Orders</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Packed">Packed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {ordersLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
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
                                            ) : (Array.isArray(filteredOrders) && filteredOrders.map(order => (
                                                <tr key={order._id} style={order.status === 'Cancelled' ? { backgroundColor: '#fef2f2' } : {}}>
                                                    <td><strong style={order.status === 'Cancelled' ? { color: '#dc3545', textDecoration: 'line-through' } : {}}>{order._id.substring(0, 8)}</strong></td>
                                                    <td style={order.status === 'Cancelled' ? { color: '#dc3545' } : {}}>
                                                        <div>{order.user?.name || 'Unknown'}</div>
                                                        <div className="small text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>
                                                            {order.orderItems?.map((item, idx) => (
                                                                <div key={idx} className="mb-1">
                                                                    • {item.name} 
                                                                    <span className="ms-1 fw-bold">
                                                                        [{item.size || item.selectedSize || '-'}] 
                                                                        [{typeof (item.ageGroup || item.selectedAgeGroup) === 'object' 
                                                                            ? (item.ageGroup || item.selectedAgeGroup).ageGroup 
                                                                            : (item.ageGroup || item.selectedAgeGroup || '-')}]
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={order.status === 'Cancelled' ? { color: '#dc3545', textDecoration: 'line-through' } : {}} className="fw-bold">₹{order.totalPrice?.toLocaleString()}</td>
                                                    <td><span className={`badge-status badge-${order.status?.toLowerCase()}`}>{order.status?.toUpperCase() || 'PENDING'}</span></td>
                                                    <td style={order.status === 'Cancelled' ? { color: '#dc3545' } : {}}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn btn-sm btn-outline-info" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowOrderModal(true); }}>
                                                                <i className="fas fa-eye me-1"></i>View
                                                            </button>
                                                            {order.status !== 'Cancelled' && (
                                                                <select
                                                                    className="form-select form-select-sm d-inline-block w-auto ms-2"
                                                                    value={order.status}
                                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                                    style={{ fontSize: '0.8rem' }}
                                                                >
                                                                    <option value="Processing">Processing</option>
                                                                    <option value="Confirmed">Confirmed</option>
                                                                    <option value="Packed">Packed</option>
                                                                    <option value="Shipped">Shipped</option>
                                                                    <option value="Delivered">Delivered</option>
                                                                </select>
                                                            )}
                                                            <button className="btn btn-sm btn-outline-danger ms-2" onClick={(e) => { e.stopPropagation(); deleteOrder(order._id); }} title="Delete order">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )))}
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
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Age Group</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-4">No products found</td></tr>
                                            ) : (Array.isArray(filteredProducts) && filteredProducts.map(product => (
                                                <tr key={product._id}>
                                                    <td>
                                                        <img
                                                            src={getFullUrl(product.image)}
                                                            alt=""
                                                            className="img-fluid rounded"
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                                                            onClick={() => setPreviewImage(getFullUrl(product.image))}
                                                        />
                                                    </td>
                                                    <td><strong>{product.name}</strong></td>
                                                    <td>{product.category}</td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {Array.isArray(product.ageGroup) ? (
                                                                product.ageGroup.length > 0 ? product.ageGroup.map((ag, i) => (
                                                                    <span key={i} className="badge bg-light text-dark border-1 border-secondary-subtle">
                                                                        {typeof ag === 'object' ? ag.ageGroup : ag}
                                                                    </span>
                                                                )) : '-'
                                                            ) : (typeof product.ageGroup === 'object' ? product.ageGroup.ageGroup : (product.ageGroup || '-'))}
                                                        </div>
                                                    </td>
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
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>User Management</h4>
                                <button className="btn btn-sm btn-outline-primary" onClick={loadUsers}>
                                    <i className="fas fa-sync-alt me-2"></i>Refresh List
                                </button>
                            </div>
                            {usersLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-4">No users found</td></tr>
                                            ) : (Array.isArray(filteredUsers) && filteredUsers.map(u => (
                                                <tr key={u._id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role}</span></td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-info me-2"
                                                            onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteUser(u._id)}
                                                            disabled={u._id === user._id}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )))}
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
                                    {Array.isArray(allOrders) && allOrders.slice(0, 10).map((order) => (
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
                                            {filteredInvoices.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-4">No invoices found</td></tr>
                                            ) : (Array.isArray(filteredInvoices) && filteredInvoices.map(invoice => (
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
                                                                    toast.warn('Order data missing for this invoice');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-download me-2"></i>Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Coupons Tab */}
                    {activeTab === 'coupons' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Coupon Management</h4>
                                <button className="btn btn-primary-custom" onClick={() => setShowCouponForm(!showCouponForm)}>
                                    <i className={`fas ${showCouponForm ? 'fa-times' : 'fa-plus'} me-2`}></i>{showCouponForm ? 'Cancel' : 'Create Coupon'}
                                </button>
                            </div>

                            {showCouponForm && (
                                <form onSubmit={createCoupon} className="mb-4 p-4 bg-light rounded">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Coupon Code</label>
                                            <input type="text" className="form-control" required placeholder="e.g. SAVE10"
                                                value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Discount Type</label>
                                            <select className="form-select" value={couponForm.discountType}
                                                onChange={e => setCouponForm({...couponForm, discountType: e.target.value})}>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Discount Value</label>
                                            <input type="number" className="form-control" required placeholder={couponForm.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
                                                value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Min Order (₹)</label>
                                            <input type="number" className="form-control" placeholder="0"
                                                value={couponForm.minOrderAmount} onChange={e => setCouponForm({...couponForm, minOrderAmount: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Max Discount (₹)</label>
                                            <input type="number" className="form-control" placeholder="No limit"
                                                value={couponForm.maxDiscount} onChange={e => setCouponForm({...couponForm, maxDiscount: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Expires At</label>
                                            <input type="datetime-local" className="form-control" required
                                                value={couponForm.expiresAt} onChange={e => setCouponForm({...couponForm, expiresAt: e.target.value})} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Usage Limit</label>
                                            <input type="number" className="form-control" placeholder="Unlimited"
                                                value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary-custom mt-3">
                                        <i className="fas fa-check me-2"></i>Create Coupon
                                    </button>
                                </form>
                            )}

                            {couponsLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Discount</th>
                                                <th>Min Order</th>
                                                <th>Max Discount</th>
                                                <th>Used</th>
                                                <th>Expires</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCoupons.length === 0 ? (
                                                <tr><td colSpan="8" className="text-center py-4">No coupons created yet</td></tr>
                                            ) : (Array.isArray(filteredCoupons) && filteredCoupons.map(coupon => (
                                                <tr key={coupon._id}>
                                                    <td><strong className="font-monospace">{coupon.code}</strong></td>
                                                    <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                                                    <td>{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : '-'}</td>
                                                    <td>{coupon.maxDiscount ? `₹${coupon.maxDiscount}` : '-'}</td>
                                                    <td>{coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</td>
                                                    <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge ${coupon.isActive && new Date(coupon.expiresAt) > new Date() ? 'bg-success' : 'bg-danger'}`}>
                                                            {coupon.isActive && new Date(coupon.expiresAt) > new Date() ? 'Active' : 'Expired'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-action bg-danger text-white" onClick={() => deleteCouponHandler(coupon._id)}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === 'categories' && (
                        <div className="dashboard-card fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4>Category Management</h4>
                                <span className="text-muted small">Home page collections list will refresh automatically</span>
                            </div>

                            <form onSubmit={saveCategoryHandler} className="mb-4 p-4 bg-light rounded shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">{editingCategory ? 'Edit Category' : 'Add New Category'}</h5>
                                    {editingCategory && (
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelEditCategory}>
                                            <i className="fas fa-times me-1"></i>Cancel Edit
                                        </button>
                                    )}
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Name</label>
                                        <input type="text" className="form-control" required placeholder="e.g. Traditional Wear"
                                            value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Subtitle</label>
                                        <input type="text" className="form-control" placeholder="e.g. Best for festivals"
                                            value={categoryForm.subtitle} onChange={e => setCategoryForm({...categoryForm, subtitle: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Gradient</label>
                                        <select className="form-select" value={categoryForm.gradient}
                                            onChange={e => setCategoryForm({...categoryForm, gradient: e.target.value})}>
                                            <option value="from-rose-50 to-pink-50">Rose/Pink (Soft)</option>
                                            <option value="from-blue-50 to-indigo-50">Blue/Indigo (Infant)</option>
                                            <option value="from-amber-50 to-orange-50">Amber/Orange (Casual)</option>
                                            <option value="from-purple-50 to-fuchsia-50">Purple/Fuchsia (Trendy)</option>
                                            <option value="from-emerald-50 to-teal-50">Emerald/Teal (Essentials)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">Image Source</label>
                                        <div className="d-flex mt-2">
                                            <div className="form-check me-3">
                                                <input className="form-check-input" type="radio" name="catImageSource"
                                                    checked={categoryForm.isUrl} onChange={() => setCategoryForm({ ...categoryForm, isUrl: true })} />
                                                <label className="form-check-label small">URL</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="catImageSource"
                                                    checked={!categoryForm.isUrl} onChange={() => setCategoryForm({ ...categoryForm, isUrl: false })} />
                                                <label className="form-check-label small">Upload</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">{categoryForm.isUrl ? 'Image URL' : 'Upload Image'}</label>
                                        {categoryForm.isUrl ? (
                                            <input type="text" className="form-control" placeholder="/Images/..."
                                                value={categoryForm.image} onChange={e => setCategoryForm({...categoryForm, image: e.target.value})} />
                                        ) : (
                                            <input type="file" className="form-control" accept="image/*"
                                                onChange={e => setCategoryForm({ ...categoryForm, imageFile: e.target.files[0] })} />
                                        )}
                                        {uploading && <div className="text-info small mt-1">Uploading...</div>}
                                        {editingCategory && categoryForm.isUrl && !categoryForm.image && (
                                            <small className="text-muted">Leave empty to keep existing image</small>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Sub-categories</label>
                                        <div className="input-group mb-2">
                                            <input type="text" className="form-control" placeholder="Add sub-category (e.g. Diapers)"
                                                value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSubCategory())} />
                                            <button className="btn btn-outline-primary" type="button" onClick={addSubCategory}>Add</button>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {categoryForm.subCategories.map((sub, idx) => (
                                                <span key={idx} className="badge bg-primary d-flex align-items-center gap-2">
                                                    {sub}
                                                    <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.5rem' }} 
                                                        onClick={() => removeSubCategory(sub)}></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary-custom mt-3">
                                    {editingCategory ? (
                                        <><i className="fas fa-save me-2"></i>Update Category</>
                                    ) : (
                                        <><i className="fas fa-plus me-2"></i>Create Category</>
                                    )}
                                </button>
                            </form>

                            {categoriesLoading ? <div className="loading"><i className="fas fa-spinner fa-spin fa-2x"></i></div> : (
                                <div className="table-responsive table-container">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Slug</th>
                                                <th>Sub-categories</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allCategories.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-4">No categories created yet</td></tr>
                                            ) : (Array.isArray(allCategories) && allCategories.map(cat => (
                                                <tr key={cat._id}>
                                                    <td>
                                                        <img src={getFullUrl(cat.image)} alt={cat.name} className="rounded" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                    </td>
                                                    <td><span className="fw-bold">{cat.name}</span></td>
                                                    <td><code>{cat.slug}</code></td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {cat.subCategories && cat.subCategories.length > 0 ? cat.subCategories.map((sub, i) => (
                                                                <span key={i} className="badge bg-light text-dark border">{sub}</span>
                                                            )) : <span className="text-muted small">None</span>}
                                                        </div>
                                                    </td>
                                                    <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn-action btn-view" onClick={() => editCategoryHandler(cat)} title="Edit category">
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn-action bg-danger text-white" onClick={() => deleteCategoryHandler(cat._id)} title="Delete category">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}


            {/* Modals overlay */}
            {(showProductModal || showOrderModal || previewImage || showUserModal) && (
                <div className="modal-backdrop fade show"></div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content modal-content-custom">
                            <div className="modal-header modal-header-custom">
                                <h5 className="modal-title">User Details</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-primary border-bottom pb-2">Profile Information</h6>
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Role:</strong> {selectedUser.role}</p>
                                        <p><strong>Join Date:</strong> {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-primary border-bottom pb-2">Address Details</h6>
                                        {selectedUser.address ? (
                                            <address>
                                                {selectedUser.address.street || 'N/A'}<br />
                                                {selectedUser.address.city}, {selectedUser.address.postalCode}<br />
                                                {selectedUser.address.country}<br />
                                                Phone: {selectedUser.address.phone || 'N/A'}
                                            </address>
                                        ) : <p className="text-muted">No address provided</p>}
                                    </div>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <h6 className="text-primary border-bottom pb-2">Baby Details</h6>
                                        {selectedUser.babyDetails ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered">
                                                    <tbody>
                                                        <tr><th width="30%">Name</th><td>{selectedUser.babyDetails.name || 'N/A'}</td></tr>
                                                        <tr><th>Gender</th><td>{selectedUser.babyDetails.gender || 'N/A'}</td></tr>
                                                        <tr><th>Age</th><td>{selectedUser.babyDetails.age || 'N/A'}</td></tr>
                                                        <tr><th>Weight</th><td>{selectedUser.babyDetails.weight || 'N/A'}</td></tr>
                                                        <tr><th>Size</th><td>{selectedUser.babyDetails.size || 'N/A'}</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p className="text-muted">No baby details provided</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="modal fade show d-block" tabIndex="-1" onClick={() => setPreviewImage(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-transparent border-0 shadow-none">
                            <div className="modal-body p-0 text-center position-relative">
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                                    onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                                    style={{ zIndex: 1056, backgroundColor: 'white', opacity: 1 }}
                                ></button>
                                <img src={previewImage} alt="Preview" className="img-fluid rounded shadow-lg" style={{ maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()} />
                            </div>
                        </div>
                    </div>
                </div>
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
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Original Price / MRP (₹)</label>
                                            <input type="number" className="form-control" required
                                                value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Selling Price (₹)</label>
                                            <input type="number" className="form-control" required
                                                value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Discount</label>
                                            <input type="text" className="form-control" disabled
                                                value={productForm.originalPrice && productForm.price ? `${Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100)}% off` : '—'} />
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
                                            <input type="url" className="form-control" placeholder="https://..." required={productForm.isUrl && !editingProduct}
                                                value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                                        ) : (
                                            <input type="file" className="form-control" onChange={uploadFileHandler} required={!productForm.isUrl && !editingProduct} />
                                        )}
                                        {editingProduct && <small className="text-muted">Leave empty to keep existing cover image</small>}
                                        {uploading && <div className="text-info mt-1">Uploading...</div>}
                                    </div>

                                    {/* Description Images */}
                                    <div className="mb-3">
                                        <label className="form-label">Description Images (Max 3)</label>
                                        <small className="text-muted d-block mb-2">These images will be shown in the product gallery</small>
                                        
                                        {/* Existing images preview */}
                                        {productForm.descriptionImages && productForm.descriptionImages.length > 0 && (
                                            <div className="d-flex gap-2 flex-wrap mb-2">
                                                {productForm.descriptionImages.map((img, idx) => (
                                                    <div key={idx} className="position-relative" style={{ width: '80px', height: '80px' }}>
                                                        <img src={getFullUrl(img)} alt={`Desc ${idx + 1}`} 
                                                            className="w-100 h-100 rounded border" style={{ objectFit: 'cover' }} />
                                                        <button type="button" 
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                                                            style={{ width: '20px', height: '20px', fontSize: '10px' }}
                                                            onClick={() => {
                                                                const updated = productForm.descriptionImages.filter((_, i) => i !== idx);
                                                                setProductForm({ ...productForm, descriptionImages: updated });
                                                            }}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload new description images */}
                                        {(productForm.descriptionImages?.length || 0) + (productForm.descriptionImageFiles?.length || 0) < 3 && (
                                            <input type="file" className="form-control" accept="image/*" multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    
                                                    // Check for file size (e.g., 100MB limit)
                                                    const oversized = files.find(f => f.size > 100 * 1024 * 1024);
                                                    if (oversized) {
                                                        toast.error(`File "${oversized.name}" is too large (Max 100MB)`);
                                                        return;
                                                    }

                                                    const remaining = 3 - (productForm.descriptionImages?.length || 0) - (productForm.descriptionImageFiles?.length || 0);
                                                    const toAdd = files.slice(0, remaining);
                                                    setProductForm({ 
                                                        ...productForm, 
                                                        descriptionImageFiles: [...(productForm.descriptionImageFiles || []), ...toAdd]
                                                    });
                                                }} />
                                        )}
                                        
                                        {/* New files preview */}
                                        {productForm.descriptionImageFiles && productForm.descriptionImageFiles.length > 0 && (
                                            <div className="d-flex gap-2 flex-wrap mt-2">
                                                {productForm.descriptionImageFiles.map((file, idx) => (
                                                    <div key={idx} className="position-relative border rounded p-1" style={{ width: '80px' }}>
                                                        <small className="text-truncate d-block" style={{ fontSize: '10px' }}>{file.name}</small>
                                                        <button type="button" 
                                                            className="btn btn-outline-danger btn-sm w-100 p-0" style={{ fontSize: '10px' }}
                                                            onClick={() => {
                                                                const updated = productForm.descriptionImageFiles.filter((_, i) => i !== idx);
                                                                setProductForm({ ...productForm, descriptionImageFiles: updated });
                                                            }}>Remove</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Gender</label>
                                            <select className="form-select" value={productForm.gender} onChange={e => setProductForm({ ...productForm, gender: e.target.value })}>
                                                <option value="Boy">Boy</option>
                                                <option value="Girl">Girl</option>
                                                <option value="Unisex">Unisex</option>
                                            </select>
                                        </div>
                                         <div className="col-md-3 mb-3">
                                             <label className="form-label">Category</label>
                                             {!productForm.isCustomCategory ? (
                                                 <select className="form-select" required value={productForm.category} 
                                                     onChange={e => {
                                                         if (e.target.value === 'NEW_CAT') {
                                                             setProductForm({ ...productForm, isCustomCategory: true, category: '', subCategory: '' });
                                                         } else {
                                                             setProductForm({ ...productForm, category: e.target.value, subCategory: '' });
                                                         }
                                                     }}>
                                                     <option value="">Select Category</option>
                                                     {Array.isArray(allCategories) && allCategories.map(cat => (
                                                         <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                     ))}
                                                     <option value="NEW_CAT">Add New Category +</option>
                                                 </select>
                                             ) : (
                                                 <div className="input-group">
                                                     <input type="text" className="form-control" placeholder="New category name" required
                                                         value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value, subCategory: '' })} />
                                                     <button className="btn btn-outline-secondary" type="button" onClick={() => setProductForm({ ...productForm, isCustomCategory: false, category: '', subCategory: '' })}>×</button>
                                                 </div>
                                             )}
                                         </div>
                                         <div className="col-md-3 mb-3">
                                             <label className="form-label">Sub Category</label>
                                             <select className="form-select" value={productForm.subCategory} 
                                                 onChange={e => setProductForm({ ...productForm, subCategory: e.target.value })}
                                                 disabled={!productForm.category || productForm.isCustomCategory}>
                                                 <option value="">No Sub Category</option>
                                                 {productForm.category && allCategories.find(c => c.name === productForm.category)?.subCategories?.map((sub, i) => (
                                                     <option key={i} value={sub}>{sub}</option>
                                                 ))}
                                             </select>
                                         </div>
                                        <div className="col-md-5 mb-3">
                                            <label className="form-label">Age Group</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {['0-3M','3-6M','6-9M','9-12M','12-18M','1-2Y','2-3Y','3-4Y','4-5Y','5-6Y','7-8Y','9-10Y'].map(ag => {
                                                    const isSelected = (productForm.ageGroup || []).some(a => (typeof a === 'object' ? a.ageGroup : a) === ag);
                                                    return (
                                                    <button
                                                        key={ag}
                                                        type="button"
                                                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                        onClick={() => {
                                                            const current = productForm.ageGroup || [];
                                                            const exists = current.some(a => (typeof a === 'object' ? a.ageGroup : a) === ag);
                                                            const updated = exists
                                                                ? current.filter(a => (typeof a === 'object' ? a.ageGroup : a) !== ag)
                                                                : [...current, { ageGroup: ag, price: productForm.price || 0 }];
                                                            setProductForm({ ...productForm, ageGroup: updated });
                                                        }}
                                                    >
                                                        {ag}
                                                    </button>
                                                )})}
                                            </div>
                                            {(productForm.ageGroup || []).length > 0 && (
                                                <div className="mt-3 bg-light p-2 rounded">
                                                    <label className="form-label text-muted small fw-bold mb-2">Age Group Pricing</label>
                                                    {productForm.ageGroup.map((a, idx) => {
                                                        const ageGroupName = typeof a === 'object' ? a.ageGroup : a;
                                                        const ageGroupPrice = typeof a === 'object' ? a.price : (productForm.price || 0);
                                                        return (
                                                            <div key={idx} className="d-flex align-items-center mb-2 gap-2">
                                                                <span className="badge bg-secondary" style={{ width: '70px' }}>{ageGroupName}</span>
                                                                <div className="input-group input-group-sm">
                                                                    <span className="input-group-text">₹</span>
                                                                    <input 
                                                                        type="number" 
                                                                        className="form-control" 
                                                                        value={ageGroupPrice}
                                                                        onChange={(e) => {
                                                                            const newAgeGroups = [...productForm.ageGroup];
                                                                            newAgeGroups[idx] = { ageGroup: ageGroupName, price: Number(e.target.value) };
                                                                            setProductForm({ ...productForm, ageGroup: newAgeGroups });
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">Available Sizes</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {['XS','S','M','L','XL','1-2','2-3','3-4','4-5','5-6','7-8','9-10','Small','Medium','Large'].map(sz => (
                                                    <button
                                                        key={sz}
                                                        type="button"
                                                        className={`btn btn-sm ${(productForm.sizes || []).includes(sz) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                        onClick={() => {
                                                            const current = productForm.sizes || [];
                                                            const updated = current.includes(sz)
                                                                ? current.filter(s => s !== sz)
                                                                : [...current, sz];
                                                            setProductForm({ ...productForm, sizes: updated });
                                                        }}
                                                    >
                                                        {sz}
                                                    </button>
                                                ))}
                                            </div>
                                            {(productForm.sizes || []).length > 0 && (
                                                <small className="text-muted mt-1 d-block">
                                                    Selected: {(productForm.sizes || []).join(', ')}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Stock Count</label>
                                            <input type="number" className="form-control" min="0" required
                                                value={productForm.stock}
                                                onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                                                placeholder="Enter available stock quantity" />
                                            <small className="text-muted">Set to 0 if out of stock</small>
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
                                                <tr><td><strong>Payment:</strong></td><td>{selectedOrder.isPaid ? <span className="badge bg-success">Paid Online</span> : <span className="badge bg-warning">COD / Unpaid</span>}</td></tr>
                                            </tbody>
                                        </table>

                                        {selectedOrder.status === 'Cancelled' && (
                                            <div className="alert alert-danger mt-3 mb-3">
                                                <h6 className="alert-heading mb-1"><i className="fas fa-ban me-2"></i>Cancellation Details</h6>
                                                <p className="mb-1"><strong>Reason:</strong> {selectedOrder.cancellationReason || 'No reason provided'}</p>

                                            </div>
                                        )}

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
                                                        {(item.size || item.selectedSize) && (
                                                            <span className="badge bg-info text-dark mt-1 me-1">Size: {item.size || item.selectedSize}</span>
                                                        )}
                                                        {(item.ageGroup || item.selectedAgeGroup) && (
                                                        <span className="badge bg-primary text-white mt-1">
                                                            Age: {typeof (item.ageGroup || item.selectedAgeGroup) === 'object' 
                                                                ? (item.ageGroup || item.selectedAgeGroup).ageGroup 
                                                                : (item.ageGroup || item.selectedAgeGroup)}
                                                        </span>
                                                        )}
                                                    </div>
                                                    <span>₹{item.qty * item.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-close-red" onClick={() => setShowOrderModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;
