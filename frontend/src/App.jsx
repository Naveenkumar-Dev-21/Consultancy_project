import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import OwnerDashboard from './pages/OwnerDashboard';
import CottonPage from './pages/CottonPage';
import NightWearPage from './pages/NightWearPage';
import CasualPage from './pages/CasualPage';
import FrockPage from './pages/FrockPage';
import MixedPage from './pages/MixedPage';
import InfantClothingsPage from './pages/InfantClothingsPage';
import CategoryProductDetailPage from './pages/CategoryProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner-dashboard');

  return (
    <ToastProvider>
    <CartProvider>
    <WishlistProvider>
      <div className="min-h-screen text-apple-text font-sans selection:bg-beelittle-coral/20 bg-[#f5f5f7]">
        {!isAdminRoute && <Header />}
        <main className={!isAdminRoute ? "min-h-[calc(100vh-64px)]" : ""}>
          <Routes>
            {/* Public Store Routes */}
            <Route path="/" element={<HomePage />} />

            {/* Category Routes */}
            <Route path="/category/cotton" element={<CottonPage />} />
            <Route path="/category/nightwear" element={<NightWearPage />} />
            <Route path="/category/casual" element={<CasualPage />} />
            <Route path="/category/frock" element={<FrockPage />} />
            <Route path="/category/mixed" element={<MixedPage />} />
            <Route path="/category/infant-clothings" element={<InfantClothingsPage />} />
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
      </div>
    </WishlistProvider>
    </CartProvider>
    </ToastProvider>
  );
}

export default App;
