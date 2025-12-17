import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Signup from './components/Signup'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  )
}

export default App
