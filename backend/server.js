import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

dotenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Vercel/Render)

// CORS is now handled by Nginx
// app.use(cors(...));


// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 for better admin experience
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Specifically limit auth routes more strictly
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Increased from 20 to 50
  message: 'Too many login/signup attempts, please try again after an hour'
});
app.use('/api/auth', authLimiter);

// Extra tight limiter specifically for signup & OTP routes (prevent bulk registration)
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 signup attempts per 15 minutes per IP
  message: 'Too many registration attempts, please try again after 15 minutes'
});
app.use('/api/auth/signup', signupLimiter);
app.use('/api/auth/resend-otp', signupLimiter);

// Rate limit contact form to prevent spam
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 contact submissions per 15 minutes per IP
  message: 'Too many messages sent, please try again later'
});
app.use('/api/contact', contactLimiter);

app.use(express.json({ limit: '10mb' })); // Body limit (file uploads use multer, not body parser)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Prevent parameter pollution
app.use(hpp());

// Request logger — development only
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[DEV] ${req.method} ${req.url}`);
    next();
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/sitemap", sitemapRoutes);

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

// Export for Vercel serverless
export default app;
