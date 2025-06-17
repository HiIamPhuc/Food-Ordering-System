const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Validation rules
const orderValidation = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required'),
  body('menu_item_id')
    .notEmpty()
    .withMessage('Menu item ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('total_price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status value')
];

const quantityValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('total_price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number')
];

// Protected routes (authentication required)
router.post('/', auth, orderValidation, orderController.createOrder);
router.get('/', auth, orderController.getAllOrders);
router.get('/user/:userId', auth, orderController.getOrdersByUser);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/status', auth, statusValidation, orderController.updateOrderStatus);
router.patch('/:id', auth, quantityValidation, orderController.updateOrderQuantity); // Thêm mới
router.delete('/:id', auth, orderController.deleteOrder);

// Admin routes for order management
router.get('/status/:status', auth, orderController.getOrdersByStatus);
router.patch('/bulk/status', auth, orderController.bulkUpdateOrderStatus);

// Statistics endpoints
router.get('/stats/summary', auth, orderController.getOrderStats);
router.get('/stats/user/:userId', auth, orderController.getUserOrderStats);

module.exports = router;