/**
 * Centralized constants for the application.
 * Eliminates magic strings scattered across controllers and models.
 */

// ─── Order Statuses ────────────────────────────────────────────
export const ORDER_STATUSES = [
  'Processing',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const CANCELLABLE_STATUSES = ['Processing'];

// ─── Refund Statuses ───────────────────────────────────────────
export const REFUND_STATUSES = ['none', 'initiated', 'completed', 'failed'];

// ─── Product Categories ────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Regular wear',
  'Infant Clothings',
  'New born Essentials',
  'Night Wear',
  'Casual',
  'Frock',
  'Towels',
];

// ─── User Roles ────────────────────────────────────────────────
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// ─── Payment Methods ──────────────────────────────────────────
export const PAYMENT_METHODS = ['Razorpay', 'COD'];

// ─── File Upload ──────────────────────────────────────────────
export const MAX_DESCRIPTION_IMAGES = 3;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ─── Pagination Defaults ──────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Error Messages ───────────────────────────────────────────
export const ERROR_MESSAGES = {
  NOT_FOUND: (resource) => `${resource} not found`,
  UNAUTHORIZED: 'Not authorized, no token',
  FORBIDDEN: 'Not authorized as an admin',
  INVALID_CREDENTIALS: 'Invalid email or password',
  NO_ORDER_ITEMS: 'No order items',
  INSUFFICIENT_STOCK: (name, stock) =>
    `Insufficient stock for ${name}. Only ${stock} available.`,
  INVALID_STATUS: (validStatuses) =>
    `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
  CANNOT_CANCEL: (status) => `Cannot cancel order with status '${status}'`,
  NOT_OWNER: 'Not authorized to perform this action',
};
