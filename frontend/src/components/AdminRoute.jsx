import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const location = useLocation();

    if (!userInfo) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userInfo.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
