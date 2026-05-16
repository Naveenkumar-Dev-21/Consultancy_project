// Global error handling middleware

// 404 handler — catch requests to undefined routes
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Centralized error handler — formats all errors consistently
export const errorHandler = (err, req, res, next) => {
    // CORS is handled by Nginx

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
