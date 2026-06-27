/**
 * Product request validators.
 * Extracts validation logic from controllers for cleaner separation of concerns.
 */
import { MAX_DESCRIPTION_IMAGES } from '../constants/index.js';

/**
 * Validates the request body for creating a new product.
 * @param {Object} body - req.body
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateCreateProduct = (body) => {
  const { name, price, image, category, description } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, message: 'Product name is required' };
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    return { valid: false, message: 'Valid product price is required' };
  }

  if (!image) {
    return { valid: false, message: 'Product image is required' };
  }

  if (!category || typeof category !== 'string') {
    return { valid: false, message: 'Product category is required' };
  }

  if (!description || typeof description !== 'string') {
    return { valid: false, message: 'Product description is required' };
  }

  if (body.descriptionImages && body.descriptionImages.length > MAX_DESCRIPTION_IMAGES) {
    return { valid: false, message: `Maximum ${MAX_DESCRIPTION_IMAGES} description images allowed` };
  }

  return { valid: true };
};

/**
 * Validates the request body for updating a product.
 * Partial updates are allowed, so only checks fields that are provided.
 * @param {Object} body - req.body
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateUpdateProduct = (body) => {
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return { valid: false, message: 'Invalid product price' };
  }

  if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) {
    return { valid: false, message: 'Invalid stock value' };
  }

  if (body.descriptionImages && body.descriptionImages.length > MAX_DESCRIPTION_IMAGES) {
    return { valid: false, message: `Maximum ${MAX_DESCRIPTION_IMAGES} description images allowed` };
  }

  return { valid: true };
};
