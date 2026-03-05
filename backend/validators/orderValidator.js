/**
 * Order request validators.
 * Extracts validation logic from controllers for cleaner separation of concerns.
 */
import { ORDER_STATUSES, CANCELLABLE_STATUSES, ERROR_MESSAGES } from '../constants/index.js';

/**
 * Validates the request body for creating a new order.
 * @param {Object} body - req.body
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateCreateOrder = (body) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = body;

  if (!orderItems || orderItems.length === 0) {
    return { valid: false, message: ERROR_MESSAGES.NO_ORDER_ITEMS };
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city ||
      !shippingAddress.postalCode || !shippingAddress.country) {
    return { valid: false, message: 'Shipping address is incomplete' };
  }

  if (!paymentMethod) {
    return { valid: false, message: 'Payment method is required' };
  }

  if (totalPrice === undefined || totalPrice < 0) {
    return { valid: false, message: 'Invalid total price' };
  }

  return { valid: true };
};

/**
 * Validates order status update.
 * @param {string} status - New status value
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateOrderStatus = (status) => {
  if (!status || !ORDER_STATUSES.includes(status)) {
    return { valid: false, message: ERROR_MESSAGES.INVALID_STATUS(ORDER_STATUSES) };
  }
  return { valid: true };
};

/**
 * Checks if an order can be cancelled based on current status.
 * @param {string} currentStatus - Current order status
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateCancellation = (currentStatus) => {
  if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
    return { valid: false, message: ERROR_MESSAGES.CANNOT_CANCEL(currentStatus) };
  }
  return { valid: true };
};
