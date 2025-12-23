import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Signup from './pages/Signup'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import Header from './components/Header'
import CartPage from './pages/CartPage'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Router>
  )
}

export default App
