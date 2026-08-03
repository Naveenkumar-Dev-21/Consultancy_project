import React from 'react';
import ScrollToTop from './components/common/ScrollToTop';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import OwnerDashboard from './pages/OwnerDashboard';
import CategoryPage from './pages/CategoryPage';
import CategoryProductDetailPage from './pages/CategoryProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner-dashboard');

  return (
    <ToastProvider>
    <CartProvider>
    <WishlistProvider>
      <div className="min-h-screen font-sans selection:bg-rose-500/20" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {!isAdminRoute && <Header />}
        <main className={!isAdminRoute ? "min-h-[calc(100vh-64px)]" : ""}>
          <Routes>
            {/* Public Store Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Category Routes — single dynamic route */}
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/category/product/:id" element={<CategoryProductDetailPage />} />

            {/* Auth Routes (Restricted for logged-in users) */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* User Routes (Protected) */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/myorders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

            {/* Admin Routes (Admin Only) */}
            <Route path="/admin" element={<AdminRoute><OwnerDashboard /></AdminRoute>} />
            <Route path="/owner-dashboard" element={<AdminRoute><OwnerDashboard /></AdminRoute>} />

            {/* Redirects */}
            <Route path="/myorder" element={<Navigate to="/myorders" replace />} />
            <Route path="/product/:id" element={<CategoryProductDetailPage />} />

            {/* Catch All - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <ScrollToTop />}
      </div>
    </WishlistProvider>
    </CartProvider>
    </ToastProvider>
  );
}

export default App;
