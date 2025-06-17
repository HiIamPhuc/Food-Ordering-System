const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const menuController = require('../controllers/menuController');
const auth = require('../middleware/auth');

// Validation rules
const menuValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('status')
    .optional()
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

// Public routes (no authentication required)
router.get('/', menuController.getAllMenuItems);
router.get('/available', menuController.getAvailableMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Protected routes (authentication required)
router.post('/', menuValidation, menuController.createMenuItem);
router.put('/:id', auth, menuValidation, menuController.updateMenuItem);
router.patch('/:id/status', auth, menuController.toggleMenuItemStatus);
router.delete('/:id', auth, menuController.deleteMenuItem);

// Bulk operations
router.post('/bulk', auth, menuController.createBulkMenuItems);
router.patch('/bulk/status', auth, menuController.bulkUpdateStatus);

// Search and filter
router.get('/search/:query', menuController.searchMenuItems);
router.get('/filter/price', menuController.filterByPriceRange);

module.exports = router;