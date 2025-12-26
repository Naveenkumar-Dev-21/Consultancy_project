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
import ProductDetailPage from './pages/ProductDetailPage';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner-dashboard');

  return (
    <CartProvider>
      <div className="min-h-screen text-apple-text font-sans selection:bg-beelittle-coral/20 bg-[#f5f5f7]">
        {!isAdminRoute && <Header />}
        <main className={!isAdminRoute ? "min-h-[calc(100vh-64px)]" : ""}>
          <Routes>
            {/* Public Store Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Auth Routes (Restricted for logged-in users) */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* User Routes (Protected) */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/myorders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes (Admin Only) */}
            <Route path="/admin" element={<AdminRoute><OwnerDashboard /></AdminRoute>} />
            <Route path="/owner-dashboard" element={<AdminRoute><OwnerDashboard /></AdminRoute>} />

            {/* Redirects */}
            <Route path="/myorder" element={<Navigate to="/myorders" replace />} />

            {/* Catch All - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </CartProvider>
  );
}

export default App;
